from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from clients.riotAPIClient import RiotAPIClient
from helpers.parsers import parse_match_for_player

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


# dummy req showing how we can use the RiotAPIClient and parser
@app.get("/api/hello")
def hello():
    riot_api_client = RiotAPIClient()
    faker_puuid = riot_api_client.get_puuid_from_name_and_tag("Hide on bush", "KR1")
    print("Fakers PUUID:", faker_puuid)

    recent_match_ids = riot_api_client.get_match_ids_by_puuid(puuid=faker_puuid)
    print("Recent Match IDs:", recent_match_ids)

    match_data = riot_api_client.get_match_metadata_by_match_id(match_id=recent_match_ids[0])

    relevant_match_data = parse_match_for_player(match_data=match_data, target_puuid=faker_puuid)
    print("Relevant Match Data:", relevant_match_data)

    return {"message": relevant_match_data}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
