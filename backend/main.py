from fastapi import FastAPI, HTTPException
import uvicorn
import logging
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import traceback
from pydantic import BaseModel

from clients.riotAPIClient import RiotAPIClient, RiotAPIError
from clients.awsBedrock import (
    generate_player_wrapped_json,
    find_and_generate_descriptions_of_interesting_matches,
    get_wrapped_from_dynamodb,
    store_wrapped_in_dynamodb,
    generate_player_comparison,
)
from clients.chatBot import get_chatbot_response
from helpers.match_parser import parse_match_for_player
from helpers.match_aggregator import MatchStatsAggregator
from helpers.item_data import get_item_name

# --- Load environment variables ---
load_dotenv(verbose=True)

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(asctime)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# --- FastAPI App Setup ---
app = FastAPI()

# Configure CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello World from Rift Rewind Backend!"}


def get_platform_from_region(region: str) -> str:
    """Maps regional routing to platform routing for summoner-v4 API."""
    region_to_platform = {
        "americas": "na1",
        "asia": "kr",
        "europe": "euw1",
        "sea": "oc1",
    }
    return region_to_platform.get(region.lower(), "na1")


def get_alternative_platforms(region: str) -> list:
    """Returns alternative platforms to try if the primary platform fails."""
    alternatives = {
        "americas": ["br1", "la1", "la2"],
        "asia": ["jp1"],
        "europe": ["eun1", "tr1", "ru"],
        "sea": ["ph2", "sg2", "th2", "tw2", "vn2"],
    }
    return alternatives.get(region.lower(), [])


@app.get("/api/summonerIcon")
def get_summoner_icon(name: str, tag: str, region: str):
    """
    Fetches the summoner's profile icon ID and returns the icon URL.
    """
    try:
        riot_api_client = RiotAPIClient(default_region=region)
        
        # Get PUUID first
        puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)
        
        if not puuid:
            raise HTTPException(
                status_code=404, 
                detail=f"Could not find player {name}#{tag} in region {region}"
            )
        
        # Map region to platform and get summoner info
        platform = get_platform_from_region(region)
        summoner_data = riot_api_client.get_summoner_by_puuid(puuid, platform=platform)
        
        # Try alternative platforms if first attempt fails
        if not summoner_data or "profileIconId" not in summoner_data:
            for alt_platform in get_alternative_platforms(region):
                if alt_platform == platform:
                    continue
                summoner_data = riot_api_client.get_summoner_by_puuid(puuid, platform=alt_platform)
                if summoner_data and "profileIconId" in summoner_data:
                    break
            
            if not summoner_data or "profileIconId" not in summoner_data:
                raise HTTPException(
                    status_code=404, 
                    detail="Could not retrieve summoner icon"
                )
        
        profile_icon_id = summoner_data["profileIconId"]
        icon_url = f"https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/{profile_icon_id}.png"
        
        return {
            "profileIconId": profile_icon_id,
            "iconUrl": icon_url,
            "summonerLevel": summoner_data.get("summonerLevel", 0)
        }
        
    except HTTPException:
        raise
    except RiotAPIError as e:
        logger.error(f"Riot API error in summonerIcon endpoint: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Riot API is currently unavailable. Please try again later."
        ) from e
    except Exception as e:
        logger.error(f"Error in summonerIcon endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching summoner icon: {str(e)}"
        ) from e


@app.get("/api/matchData")
def matchData(name: str, tag: str, region: str):
    try:
        # Create unique identifier to check in DynamoDB
        unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"

        # Check if wrapped data exists in DynamoDB
        existing_data = get_wrapped_from_dynamodb(unique_id)
        if existing_data:
            logger.info(f"Found existing wrapped data for {unique_id}")
            # existing_data has: {"unique_id": "...", "wrapped_data": {...}, "timeline": [...], "parsed_stats": {...}}
            # We need to return: {"message": {"wrapped": {"unique_id": ..., "wrapped_data": ...}, "timeline": [...], "player_data": {...}}}
            wrapped_obj = {
                "unique_id": existing_data.get("unique_id"),
                "wrapped_data": existing_data.get("wrapped_data"),
            }
            result = {
                "wrapped": wrapped_obj,
                "timeline": existing_data.get("timeline", []),
                "player_data": existing_data.get("parsed_stats", {}),
            }
            return {"message": result}

        # If not found in DynamoDB, generate new wrapped data
        riot_api_client = RiotAPIClient(default_region=region)
        puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)

        if not puuid:
            raise HTTPException(
                status_code=404, detail=f"Could not find player {name}#{tag} in region {region}"
            )

        logger.info(f"PUUID for {name}#{tag}: {puuid}")

        recent_match_ids = riot_api_client.get_match_ids_by_puuid(puuid=puuid, region=region)
        
        # TEMPORARY: Limit to 90 matches for faster processing during development
        # TODO: Remove this limit when ready for full production use
        recent_match_ids = recent_match_ids[:70]

        if not recent_match_ids:
            raise HTTPException(
                status_code=404, detail=f"No match history found for player {name}#{tag}"
            )

        match_stats_aggregator = MatchStatsAggregator()
        timeline_data = []
        match_data_cache = {}  # Cache match data to avoid re-fetching

        for match_id in recent_match_ids:
            match_data = riot_api_client.get_match_metadata_by_match_id(
                match_id=match_id, region=region
            )
            if match_data:
                flattened_match_data = parse_match_for_player(
                    match_data=match_data, target_puuid=puuid
                )

                required_keys = {"kda", "championName", "win"}
                if required_keys.issubset(flattened_match_data):
                    match_stats_aggregator.add_match(flattened_match_data)

                    # Store match data for later enrichment
                    match_data_cache[match_id] = {
                        "match_data": match_data,
                        "flattened_data": flattened_match_data,
                    }

                    timeline_data.append(
                        {
                            "id": match_id,
                            "kda": flattened_match_data["kda"],
                            "champ": flattened_match_data["championName"],
                            "win": flattened_match_data["win"],
                        }
                    )
                else:
                    logger.warning(
                        "Skipping match: missing necessary keys (likely due to match abort)"
                    )

        logger.info(f"Timeline data generated: {timeline_data}")

        # First, let LLM identify interesting matches
        interesting_matches = find_and_generate_descriptions_of_interesting_matches(timeline_data)

        # Then enrich those matches with additional details from cache
        enriched_timeline = []
        for match in interesting_matches:
            match_id = match["id"]

            # Get cached match data (no additional API calls needed)
            if match_id in match_data_cache:
                cached = match_data_cache[match_id]
                match_data = cached["match_data"]
                flattened_match_data = cached["flattened_data"]

                # Add additional details to the match
                enriched_match = {
                    **match,  # Keep id, kda, champ, win, description from LLM
                    "date": match_data.get("info", {}).get("gameCreation"),
                    "gameDuration": flattened_match_data.get("gameDuration"),
                    "gameMode": match_data.get("info", {}).get("gameMode"),
                    "kills": flattened_match_data.get("kills"),
                    "deaths": flattened_match_data.get("deaths"),
                    "assists": flattened_match_data.get("assists"),
                    "totalDamageDealtToChampions": flattened_match_data.get(
                        "totalDamageDealtToChampions"
                    ),
                    "goldEarned": flattened_match_data.get("goldEarned"),
                    "visionScore": flattened_match_data.get("visionScore"),
                    "pentaKills": flattened_match_data.get("pentaKills"),
                    "quadraKills": flattened_match_data.get("quadraKills"),
                    "tripleKills": flattened_match_data.get("tripleKills"),
                    "doubleKills": flattened_match_data.get("doubleKills"),
                    "killParticipation": flattened_match_data.get("killParticipation"),
                    "teamPosition": flattened_match_data.get("teamPosition"),
                    # Add item fields (IDs and names)
                    "item0": flattened_match_data.get("item0"),
                    "item1": flattened_match_data.get("item1"),
                    "item2": flattened_match_data.get("item2"),
                    "item3": flattened_match_data.get("item3"),
                    "item4": flattened_match_data.get("item4"),
                    "item5": flattened_match_data.get("item5"),
                    "item6": flattened_match_data.get("item6"),
                    "item0_name": get_item_name(flattened_match_data.get("item0", 0)),
                    "item1_name": get_item_name(flattened_match_data.get("item1", 0)),
                    "item2_name": get_item_name(flattened_match_data.get("item2", 0)),
                    "item3_name": get_item_name(flattened_match_data.get("item3", 0)),
                    "item4_name": get_item_name(flattened_match_data.get("item4", 0)),
                    "item5_name": get_item_name(flattened_match_data.get("item5", 0)),
                    "item6_name": get_item_name(flattened_match_data.get("item6", 0)),
                }
                enriched_timeline.append(enriched_match)

        logger.info(f"Enriched {len(enriched_timeline)} interesting matches with details")

        parsed_stats = match_stats_aggregator.get_summary()
        player_wrapped = generate_player_wrapped_json(
            player_data=parsed_stats, name=name, tag=tag, region=region
        )

        result = {
            "wrapped": player_wrapped,
            "timeline": enriched_timeline,
            "player_data": parsed_stats,
        }

        # Store the complete data in DynamoDB (merge player_wrapped with timeline and parsed_stats)
        # player_wrapped = {"unique_id": "...", "wrapped_data": {...}}
        # We need to store: {"unique_id": "...", "wrapped_data": {...}, "timeline": [...], "parsed_stats": {...}}
        if player_wrapped:
            db_data = {
                **player_wrapped,  # Spreads unique_id and wrapped_data
                "timeline": enriched_timeline,
                "parsed_stats": parsed_stats,
            }
            store_wrapped_in_dynamodb(db_data)
            logger.info(f"Stored new wrapped data for {unique_id}")

        return {"message": result}

    except HTTPException:
        # Re-raise HTTPExceptions so they're not caught by the generic handler
        raise

    except RiotAPIError as e:
        # Handle Riot API failure threshold exceeded
        logger.error(f"Riot API failure threshold exceeded: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Riot API is currently unavailable. This could be due to an invalid API key, service outage, or access restrictions. Please try again later.",
        ) from e

    except Exception as e:
        error_message = traceback.format_exc()

        # Check for API key configuration errors
        if "RIOT_API_KEY" in error_message:
            logger.critical("Server configuration error: API key not configured")
            raise HTTPException(
                status_code=500, detail="Server configuration error: API key not configured"
            ) from e

        # Generic error handler
        logger.error(f"Error in matchData endpoint: {error_message}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing your request: {error_message}",
        ) from e


@app.get("/api/compareData")
def compareData(
    name1: str,
    tag1: str,
    region1: str,
    name2: str,
    tag2: str,
    region2: str,
    test_mode: bool = False,
):
    """
    Compare two players' wrapped data and generate AI comparison.
    test_mode: If True, limits to 30 matches per player for faster testing
    """
    test_mode = True
    try:
        logger.info(f"Comparison request: {name1}#{tag1} vs {name2}#{tag2}")

        # Helper function to fetch player data
        def fetch_player_data(name: str, tag: str, region: str):
            unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"

            # ALWAYS check if wrapped data exists in DynamoDB first (no exceptions)
            existing_data = get_wrapped_from_dynamodb(unique_id)
            if existing_data:
                logger.info(f"Found existing wrapped data for {unique_id} in compare mode")
                # Return the complete cached data
                return existing_data

            # If not found, generate new wrapped data
            logger.info(f"No cache found for {unique_id}, generating new data")
            riot_api_client = RiotAPIClient(default_region=region)
            puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)

            if not puuid:
                raise HTTPException(
                    status_code=404, detail=f"Could not find player {name}#{tag} in region {region}"
                )

            logger.info(f"PUUID for {name}#{tag}: {puuid}")

            # Get match IDs - respect test_mode for match count
            match_count = 30 if test_mode else 100
            recent_match_ids = riot_api_client.get_match_ids_by_puuid(
                puuid=puuid, region=region, count=match_count
            )
            
            # TEMPORARY: Limit to 90 matches for faster processing during development
            # TODO: Remove this limit when ready for full production use
            recent_match_ids = recent_match_ids[:70]

            if not recent_match_ids:
                raise HTTPException(
                    status_code=404, detail=f"No match history found for player {name}#{tag}"
                )

            # Limit to 30 matches in test mode
            if test_mode:
                recent_match_ids = recent_match_ids[:30]
                logger.info(f"Test mode: Limited to {len(recent_match_ids)} matches")

            match_stats_aggregator = MatchStatsAggregator()
            timeline_data = []
            match_data_cache = {}

            # Process all matches
            for match_id in recent_match_ids:
                match_data = riot_api_client.get_match_metadata_by_match_id(
                    match_id=match_id, region=region
                )
                if match_data:
                    flattened_match_data = parse_match_for_player(
                        match_data=match_data, target_puuid=puuid
                    )

                    required_keys = {"kda", "championName", "win"}
                    if required_keys.issubset(flattened_match_data):
                        match_stats_aggregator.add_match(flattened_match_data)

                        # Store match data for later enrichment
                        match_data_cache[match_id] = {
                            "match_data": match_data,
                            "flattened_data": flattened_match_data,
                        }

                        timeline_data.append(
                            {
                                "id": match_id,
                                "kda": flattened_match_data["kda"],
                                "champ": flattened_match_data["championName"],
                                "win": flattened_match_data["win"],
                            }
                        )

            # Generate interesting matches with LLM
            interesting_matches = find_and_generate_descriptions_of_interesting_matches(
                timeline_data
            )

            # Enrich timeline matches with additional details
            enriched_timeline = []
            for match in interesting_matches:
                match_id = match["id"]
                if match_id in match_data_cache:
                    cached = match_data_cache[match_id]
                    match_data = cached["match_data"]
                    flattened_match_data = cached["flattened_data"]

                    enriched_match = {
                        **match,
                        "date": match_data.get("info", {}).get("gameCreation"),
                        "gameDuration": flattened_match_data.get("gameDuration"),
                        "gameMode": match_data.get("info", {}).get("gameMode"),
                        "kills": flattened_match_data.get("kills"),
                        "deaths": flattened_match_data.get("deaths"),
                        "assists": flattened_match_data.get("assists"),
                        "totalDamageDealtToChampions": flattened_match_data.get(
                            "totalDamageDealtToChampions"
                        ),
                        "goldEarned": flattened_match_data.get("goldEarned"),
                        "visionScore": flattened_match_data.get("visionScore"),
                        "pentaKills": flattened_match_data.get("pentaKills"),
                        "quadraKills": flattened_match_data.get("quadraKills"),
                        "tripleKills": flattened_match_data.get("tripleKills"),
                        "doubleKills": flattened_match_data.get("doubleKills"),
                        "killParticipation": flattened_match_data.get("killParticipation"),
                        "teamPosition": flattened_match_data.get("teamPosition"),
                        # Add item fields (IDs and names)
                        "item0": flattened_match_data.get("item0"),
                        "item1": flattened_match_data.get("item1"),
                        "item2": flattened_match_data.get("item2"),
                        "item3": flattened_match_data.get("item3"),
                        "item4": flattened_match_data.get("item4"),
                        "item5": flattened_match_data.get("item5"),
                        "item6": flattened_match_data.get("item6"),
                        "item0_name": get_item_name(flattened_match_data.get("item0", 0)),
                        "item1_name": get_item_name(flattened_match_data.get("item1", 0)),
                        "item2_name": get_item_name(flattened_match_data.get("item2", 0)),
                        "item3_name": get_item_name(flattened_match_data.get("item3", 0)),
                        "item4_name": get_item_name(flattened_match_data.get("item4", 0)),
                        "item5_name": get_item_name(flattened_match_data.get("item5", 0)),
                        "item6_name": get_item_name(flattened_match_data.get("item6", 0)),
                    }
                    enriched_timeline.append(enriched_match)

            # Get parsed stats and generate wrapped data
            parsed_stats = match_stats_aggregator.get_summary()
            player_wrapped = generate_player_wrapped_json(
                player_data=parsed_stats, name=name, tag=tag, region=region
            )

            if not player_wrapped:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate wrapped data for {name}#{tag}"
                )

            # Create complete data structure
            db_data = {
                **player_wrapped,  # Spreads unique_id and wrapped_data
                "timeline": enriched_timeline,
                "parsed_stats": parsed_stats,
            }

            # ALWAYS store complete data in DynamoDB
            store_wrapped_in_dynamodb(db_data)
            logger.info(f"Stored new wrapped data for {unique_id} from compare endpoint")

            # Return the complete data structure (same as what we store)
            return db_data

        # Fetch both players' data
        logger.info("Fetching data for player 1...")
        player1_result = fetch_player_data(name1, tag1, region1)

        logger.info("Fetching data for player 2...")
        player2_result = fetch_player_data(name2, tag2, region2)

        # Validate results exist
        if not player1_result or not player2_result:
            raise HTTPException(
                status_code=500, detail="Failed to fetch data for one or both players"
            )

        # Extract the full wrapped objects (these have unique_id and wrapped_data)

        # Generate AI comparison - pass the full wrapped objects
        logger.info("Generating AI comparison...")
        player1_display = f"{name1}#{tag1}"
        player2_display = f"{name2}#{tag2}"

        comparison_data = generate_player_comparison(
            player1_data=player1_result,
            player2_data=player2_result,
            player1_name=player1_display,
            player2_name=player2_display,
        )

        if not comparison_data:
            raise HTTPException(status_code=500, detail="Failed to generate comparison analysis")

        # Format response to match frontend expectations
        # player1_result has: {unique_id, wrapped_data, timeline, parsed_stats}
        # Frontend expects: {wrapped: {unique_id, wrapped_data}, timeline, player_data}
        player1_formatted = {
            "wrapped": {
                "unique_id": player1_result.get("unique_id"),
                "wrapped_data": player1_result.get("wrapped_data"),
            },
            "timeline": player1_result.get("timeline", []),
            "player_data": player1_result.get("parsed_stats", {}),
        }

        player2_formatted = {
            "wrapped": {
                "unique_id": player2_result.get("unique_id"),
                "wrapped_data": player2_result.get("wrapped_data"),
            },
            "timeline": player2_result.get("timeline", []),
            "player_data": player2_result.get("parsed_stats", {}),
        }

        # Return complete comparison result
        result = {
            "player1": {
                "name": player1_display,
                "region": region1,
                "wrapped": player1_formatted,
            },
            "player2": {
                "name": player2_display,
                "region": region2,
                "wrapped": player2_formatted,
            },
            "comparison": comparison_data,
        }

        return {"message": result}

    except HTTPException:
        raise

    except RiotAPIError as e:
        logger.error(f"Riot API failure: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Riot API is currently unavailable. Please try again later.",
        ) from e

    except Exception as e:
        error_message = traceback.format_exc()
        logger.error(f"Error in compareData endpoint: {error_message}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing comparison: {str(e)}",
        ) from e


class ChatbotRequest(BaseModel):
    stats: dict
    conversation: list


@app.post("/api/chatbot/sendMessage")
def chatbot_send_message(request: ChatbotRequest):
    try:
        stats = request.stats
        conversation = request.conversation

        # Validate that there's at least one message
        if len(conversation) == 0:
            logger.warning("Empty conversation provided")
            raise HTTPException(status_code=400, detail="Conversation cannot be empty")

        # Call the chatbot function
        logger.info(f"Processing chatbot request with {len(conversation)} messages")
        result = get_chatbot_response(stats, conversation)

        if result["success"]:
            logger.info("Chatbot response generated successfully")
            return {
                "success": True,
                "response": result["response_text"],
                "conversation": result["conversation"],
                "token_usage": result["token_usage"],
            }
        else:
            logger.error(f"Chatbot response failed: {result.get('error')}")
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Unknown error occurred"),
            )

    except HTTPException:
        # Re-raise HTTPExceptions
        raise

    except Exception as e:
        error_msg = f"Unexpected error in chatbot_sendMessage endpoint: {str(e)}"
        logger.exception(error_msg)
        raise HTTPException(status_code=500, detail="Internal server error") from e


if __name__ == "__main__":
    PORT = int(os.getenv("BACKEND_PORT", 9000))
    logger.info(f"Starting server on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
