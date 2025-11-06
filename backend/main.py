from fastapi import FastAPI
import os
import time
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from clients.riotAPIClient import RiotAPIClient
from clients.awsBedrock import (
    generate_player_wrapped_json,
    get_wrapped_from_dynamodb,
    store_wrapped_in_dynamodb
)
from helpers.match_parser import parse_match_for_player
from helpers.match_aggregator import MatchStatsAggregator

load_dotenv(verbose=True)

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


# API endpoint to get match data for a player using their name, tag and region
@app.get("/api/matchData")
def matchData(name: str, tag: str, region: str):
    # Create unique identifier to check in DynamoDB
    unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"
    
    # Check if wrapped data exists in DynamoDB
    existing_data = get_wrapped_from_dynamodb(unique_id)
    if existing_data:
        print(f"Found existing wrapped data for {unique_id}")
        return {"message": existing_data}
    
    # If not found in DynamoDB, generate new wrapped data
    riot_api_client = RiotAPIClient(default_region=region)
    puuid = riot_api_client.get_puuid_from_name_and_tag(name, tag, region=region)
    print(f"PUUID for {name}#{tag}:", puuid)

    recent_match_ids = riot_api_client.get_match_ids_by_puuid(puuid=puuid, region=region)
    recent_match_ids2 = recent_match_ids[:5]

    match_stats_aggregator = MatchStatsAggregator()

    # Process matches in smaller batches with delays
    batch_size = 5  # Process 5 matches at a time
    delay_between_batches = 10  # Wait 10 seconds between batches

    for i in range(0, len(recent_match_ids), batch_size):
        batch = recent_match_ids[i:i + batch_size]
        
        for match_id in batch:
            try:
                match_data = riot_api_client.get_match_metadata_by_match_id(match_id=match_id, region=region)
                if match_data:
                    flattened_match_data = parse_match_for_player(
                        match_data=match_data, target_puuid=puuid
                    )
                    match_stats_aggregator.add_match(flattened_match_data)
            except Exception as e:
                print(f"Error processing match {match_id}: {str(e)}")
                continue
        
        # Wait before processing the next batch (but not after the last batch)
        if i + batch_size < len(recent_match_ids):
            print(f"Waiting {delay_between_batches} seconds before next batch...")
            time.sleep(delay_between_batches)

    result = generate_player_wrapped_json(
        player_data=match_stats_aggregator.get_summary(),
        name=name,
        tag=tag,
        region=region
    )
    
    # Store the new wrapped data in DynamoDB
    if result:
        store_wrapped_in_dynamodb(result)
    
    return {"message": result}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
