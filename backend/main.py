from fastapi import FastAPI, HTTPException
import uvicorn
import logging
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import traceback

from clients.riotAPIClient import RiotAPIClient, RiotAPIError
from clients.awsBedrock import (
    generate_player_wrapped_json,
    find_and_generate_descriptions_of_interesting_matches,
    get_wrapped_from_dynamodb,
    store_wrapped_in_dynamodb,
    generate_player_comparison,
)
from helpers.match_parser import parse_match_for_player
from helpers.match_aggregator import MatchStatsAggregator

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


@app.get("/api/matchData")
def matchData(name: str, tag: str, region: str):
    try:
        # Create unique identifier to check in DynamoDB
        unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"

        # Check if wrapped data exists in DynamoDB
        # Skip for Faker for testing
        if tag != "KR1":
            existing_data = get_wrapped_from_dynamodb(unique_id)
            if existing_data:
                logger.info(f"Found existing wrapped data for {unique_id}")
                return {"message": existing_data}

        # If not found in DynamoDB, generate new wrapped data
        riot_api_client = RiotAPIClient(default_region=region)
        puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)

        if not puuid:
            raise HTTPException(
                status_code=404, detail=f"Could not find player {name}#{tag} in region {region}"
            )

        logger.info(f"PUUID for {name}#{tag}: {puuid}")

        recent_match_ids = riot_api_client.get_match_ids_by_puuid(puuid=puuid, region=region)

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
                        "flattened_data": flattened_match_data
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
                    "totalDamageDealtToChampions": flattened_match_data.get("totalDamageDealtToChampions"),
                    "goldEarned": flattened_match_data.get("goldEarned"),
                    "visionScore": flattened_match_data.get("visionScore"),
                    "pentaKills": flattened_match_data.get("pentaKills"),
                    "quadraKills": flattened_match_data.get("quadraKills"),
                    "tripleKills": flattened_match_data.get("tripleKills"),
                    "doubleKills": flattened_match_data.get("doubleKills"),
                    "killParticipation": flattened_match_data.get("killParticipation"),
                    "teamPosition": flattened_match_data.get("teamPosition"),
                }
                enriched_timeline.append(enriched_match)
        
        logger.info(f"Enriched {len(enriched_timeline)} interesting matches with details")

        player_wrapped = generate_player_wrapped_json(
            player_data=match_stats_aggregator.get_summary(), name=name, tag=tag, region=region
        )

        result = {
            "wrapped": player_wrapped,
            "timeline": enriched_timeline,
        }

        # Store the new wrapped data in DynamoDB
        if result:
            store_wrapped_in_dynamodb(result)
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
    name1: str, tag1: str, region1: str,
    name2: str, tag2: str, region2: str,
    test_mode: bool = False
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
            
            # Check if wrapped data exists in DynamoDB (skip for test accounts)
            if tag not in ["KR1"] and not test_mode:
                existing_data = get_wrapped_from_dynamodb(unique_id)
                if existing_data:
                    logger.info(f"Found existing wrapped data for {unique_id}")
                    return existing_data
            
            # If not found, generate new wrapped data
            riot_api_client = RiotAPIClient(default_region=region)
            puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)
            
            if not puuid:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Could not find player {name}#{tag} in region {region}"
                )
            
            logger.info(f"PUUID for {name}#{tag}: {puuid}")
            
            # Get match IDs
            match_count = 30 if test_mode else 100
            recent_match_ids = riot_api_client.get_match_ids_by_puuid(
                puuid=puuid, region=region, count=match_count
            )
            
            if not recent_match_ids:
                raise HTTPException(
                    status_code=404, 
                    detail=f"No match history found for player {name}#{tag}"
                )
            
            # Limit to 30 matches in test mode
            if test_mode:
                recent_match_ids = recent_match_ids[:30]
                logger.info(f"Test mode: Limited to {len(recent_match_ids)} matches")
            
            match_stats_aggregator = MatchStatsAggregator()
            
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
            
            player_wrapped = generate_player_wrapped_json(
                player_data=match_stats_aggregator.get_summary(), 
                name=name, tag=tag, region=region
            )
            
            result = {"wrapped": player_wrapped}
            
            # Store in DynamoDB (only if not in test mode)
            if not test_mode and result:
                store_wrapped_in_dynamodb(result)
                logger.info(f"Stored new wrapped data for {unique_id}")
            
            return result
        
        # Fetch both players' data
        logger.info("Fetching data for player 1...")
        player1_result = fetch_player_data(name1, tag1, region1)
        
        logger.info("Fetching data for player 2...")
        player2_result = fetch_player_data(name2, tag2, region2)
        
        # Validate results exist
        if not player1_result or not player2_result:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch data for one or both players"
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
            player2_name=player2_display
        )
        
        if not comparison_data:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate comparison analysis"
            )
        
        # Return complete comparison result
        result = {
            "player1": {
                "name": player1_display,
                "region": region1,
                "wrapped": player1_result
            },
            "player2": {
                "name": player2_display,
                "region": region2,
                "wrapped": player2_result
            },
            "comparison": comparison_data
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


if __name__ == "__main__":
    PORT = int(os.getenv("BACKEND_PORT", 9000))
    logger.info(f"Starting server on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
