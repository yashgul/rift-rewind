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

        enriched_timeline = find_and_generate_descriptions_of_interesting_matches(timeline_data)

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


if __name__ == "__main__":
    PORT = int(os.getenv("BACKEND_PORT", 9000))
    logger.info(f"Starting server on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
