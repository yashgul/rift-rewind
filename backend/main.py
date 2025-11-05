from fastapi import FastAPI
import os
import uvicorn
import logging
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from clients.riotAPIClient import RiotAPIClient
from clients.awsBedrock import (
    generate_player_wrapped_json,
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
    """Main API endpoint to fetch and generate player wrapped data."""
    unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"

    # --- Check if data exists in DynamoDB ---

    # while testing never fetch fakers data
    if tag != "KR1":
        existing_data = get_wrapped_from_dynamodb(unique_id)
        if existing_data:
            logger.info(f"Found existing wrapped data for {unique_id}")
            return {"message": existing_data}

    # --- Fetch data from Riot API ---
    riot_api_client = RiotAPIClient(default_region=region)
    puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)
    logger.info(f"PUUID for {name}#{tag}: {puuid}")

    recent_match_ids = riot_api_client.get_match_ids_by_puuid(puuid=puuid, region=region)
    recent_match_ids = recent_match_ids[:5]  # only fetch 5 matches for faster testing

    match_stats_aggregator = MatchStatsAggregator()

    # Process matches in small batches with delay
    batch_size = 5
    delay_between_batches = 10

    for i in range(0, len(recent_match_ids), batch_size):
        batch = recent_match_ids[i : i + batch_size]

        for match_id in batch:
            try:
                match_data = riot_api_client.get_match_metadata_by_match_id(
                    match_id=match_id, region=region
                )
                if match_data:
                    flattened_match_data = parse_match_for_player(
                        match_data=match_data, target_puuid=puuid
                    )
                    match_stats_aggregator.add_match(flattened_match_data)
            except Exception as e:
                logger.error(f"Error processing match {match_id}: {e}")
                continue

        # Wait before next batch if not last
        if i + batch_size < len(recent_match_ids):
            logger.info(f"Waiting {delay_between_batches} seconds before next batch...")
            time.sleep(delay_between_batches)

    # --- Generate player wrapped summary using Bedrock ---
    result = generate_player_wrapped_json(
        player_data=match_stats_aggregator.get_summary(), name=name, tag=tag, region=region
    )

    # --- Store in DynamoDB if generated ---
    if result:
        store_wrapped_in_dynamodb(result)
        logger.info(f"Stored wrapped data for {unique_id}")

    return {"message": match_stats_aggregator.get_summary()}


if __name__ == "__main__":
    logger.info("Starting Rift Rewind FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
