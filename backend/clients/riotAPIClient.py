import requests
import os
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime


class RiotAPIClient:
    """
    A simple Python wrapper class for the Riot Games API with comprehensive logging.
    """

    def __init__(self, default_region="asia", log_level=logging.INFO):
        """
        Initializes the API client.

        Args:
            default_region (str): The default regional routing value
                                  (e.g., 'asia', 'americas', 'europe').
            log_level: The logging level (default: logging.INFO)
        """
        self.default_region = default_region

        # Setup logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(log_level)

        # Create console handler if no handlers exist
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setLevel(log_level)
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

        # Initialize API key
        riot_api_key = os.getenv("RIOT_API_KEY")
        if not riot_api_key:
            self.logger.error("RIOT_API_KEY environment variable not set!")
            raise ValueError("RIOT_API_KEY environment variable is required")

        self.headers = {"X-Riot-Token": riot_api_key}
        self.logger.info(f"RiotAPIClient initialized with default region: {default_region}")

    def _get_base_url(self, region: Optional[str]) -> str:
        """Constructs the base URL for a given region."""
        if region is None:
            region = self.default_region
        base_url = f"https://{region}.api.riotgames.com"
        self.logger.debug(f"Using base URL: {base_url}")
        return base_url

    def _request(
        self, region: str, endpoint_path: str, params: Optional[Dict] = None
    ) -> Optional[Any]:
        """
        Internal method to make a GET request to the Riot API.

        Args:
            region (str): The regional routing value.
            endpoint_path (str): The API endpoint path (e.g., '/lol/match/v5/matches/...')
            params (dict, optional): A dictionary of query parameters.

        Returns:
            dict or list: The JSON response from the API, or None if an error occurred.
        """
        base_url = self._get_base_url(region)
        url = f"{base_url}/{endpoint_path}"

        self.logger.info(f"Making request to: {endpoint_path}")
        self.logger.debug(f"Full URL: {url}")
        if params:
            self.logger.debug(f"Query parameters: {params}")

        try:
            start_time = datetime.now()
            response = requests.get(url, headers=self.headers, params=params)
            elapsed_time = (datetime.now() - start_time).total_seconds()

            # Log response status
            self.logger.info(f"Response status: {response.status_code} | Time: {elapsed_time:.2f}s")

            # Log rate limit headers if present
            if "X-App-Rate-Limit" in response.headers:
                self.logger.debug(f"Rate limit: {response.headers.get('X-App-Rate-Limit')}")
            if "X-App-Rate-Limit-Count" in response.headers:
                self.logger.debug(
                    f"Rate limit count: {response.headers.get('X-App-Rate-Limit-Count')}"
                )

            # Raise an exception for bad status codes (4xx or 5xx)
            response.raise_for_status()

            # Return the JSON response if successful
            json_response = response.json()
            self.logger.info(f"✓ Request successful for {endpoint_path}")

            # Log response size info
            if isinstance(json_response, list):
                self.logger.debug(f"Response contains {len(json_response)} items")
            elif isinstance(json_response, dict):
                self.logger.debug(f"Response contains {len(json_response)} keys")

            return json_response

        except requests.exceptions.HTTPError as http_err:
            status_code = response.status_code

            # Provide detailed error messages based on status code
            if status_code == 400:
                self.logger.error(f"✗ Bad Request (400): {response.text}")
            elif status_code == 401:
                self.logger.error(f"✗ Unauthorized (401): Invalid API key")
            elif status_code == 403:
                self.logger.error(f"✗ Forbidden (403): API key may not have access")
            elif status_code == 404:
                self.logger.error(f"✗ Not Found (404): Resource not found - {endpoint_path}")
            elif status_code == 429:
                self.logger.error(f"✗ Rate Limit Exceeded (429): Too many requests")
                retry_after = response.headers.get("Retry-After")
                if retry_after:
                    self.logger.error(f"Retry after: {retry_after} seconds")
            elif status_code >= 500:
                self.logger.error(
                    f"✗ Server Error ({status_code}): Riot API is experiencing issues"
                )
            else:
                self.logger.error(f"✗ HTTP error occurred: {http_err} - {response.text}")

        except requests.exceptions.ConnectionError as conn_err:
            self.logger.error(f"✗ Connection error: {conn_err}")
        except requests.exceptions.Timeout as timeout_err:
            self.logger.error(f"✗ Request timeout: {timeout_err}")
        except requests.exceptions.RequestException as req_err:
            self.logger.error(f"✗ An error occurred: {req_err}")

        return None

    def get_puuid_from_name_and_tag(
        self,
        game_name: str,
        game_tag: str,
        region: Optional[str] = None,
    ) -> Optional[str]:
        """
        Gets the PUUID for a given game name and tag.

        Args:
            game_name (str): The player's game name
            game_tag (str): The player's tag (without #)
            region (str, optional): The region to query

        Returns:
            str: The player's PUUID, or None if not found
        """
        self.logger.info(f"Looking up PUUID for player: {game_name}#{game_tag}")

        # Construct the endpoint path
        endpoint = f"riot/account/v1/accounts/by-riot-id/{game_name}/{game_tag}"

        # Call the internal request method
        response = self._request(region, endpoint)

        if response and "puuid" in response:
            puuid = response["puuid"]
            self.logger.info(f"✓ Found PUUID: {puuid[:8]}...{puuid[-8:]}")
            return puuid
        else:
            self.logger.warning(f"✗ Could not find PUUID for {game_name}#{game_tag}")
            return None

    def get_match_ids_by_puuid(
        self,
        puuid: str,
        region: Optional[str] = None,
        match_type: Optional[str] = None,
        start: int = 0,
        count: int = 100,
    ) -> Optional[List[str]]:
        """
        Gets a list of match IDs for a given PUUID.

        Corresponds to the endpoint:
        /lol/match/v5/matches/by-puuid/{puuid}/ids

        Args:
            puuid (str): The player's PUUID. (Required)
            region (str, optional): The region to query. Defaults to the client's default region.
            match_type (str, optional): The type of match to filter for (e.g., 'ranked', 'normal').
            start (int, optional): The start index (for pagination).
            count (int, optional): The number of match IDs to return (for pagination).

        Returns:
            list: A list of match IDs, or None if the request failed.
        """
        self.logger.info(f"Fetching match IDs for PUUID: {puuid[:8]}...{puuid[-8:]}")
        self.logger.debug(f"Parameters: type={match_type}, start={start}, count={count}")

        # Construct the endpoint path
        endpoint = f"lol/match/v5/matches/by-puuid/{puuid}/ids"

        query_params = {"start": start, "count": count}
        if match_type is not None:
            query_params["type"] = match_type

        # Call the internal request method
        match_ids = self._request(region, endpoint, params=query_params)

        if match_ids:
            self.logger.info(f"✓ Retrieved {len(match_ids)} match IDs")
            if match_ids:
                self.logger.debug(f"First match ID: {match_ids[0]}")
        else:
            self.logger.warning("✗ No match IDs retrieved")

        return match_ids

    def get_match_metadata_by_match_id(
        self,
        match_id: str,
        region: Optional[str] = None,
    ) -> Optional[Dict]:
        """
        Gets metadata for a given match id.

        Corresponds to the endpoint:
        /lol/match/v5/matches/{matchId}

        Args:
            match_id (str): The match_id (Required)
            region (str, optional): The region to query. Defaults to the client's default region.

        Returns:
            dict: The match metadata, or None if the request failed
        """
        self.logger.info(f"Fetching match metadata for: {match_id}")

        # Construct the endpoint path
        endpoint = f"lol/match/v5/matches/{match_id}"

        # Call the internal request method
        match_data = self._request(region, endpoint)

        if match_data:
            # Log some interesting match info
            metadata = match_data.get("metadata", {})
            info = match_data.get("info", {})

            self.logger.info(f"✓ Match data retrieved")
            self.logger.debug(f"Game mode: {info.get('gameMode', 'Unknown')}")
            self.logger.debug(f"Game duration: {info.get('gameDuration', 0)}s")
            self.logger.debug(f"Participants: {len(metadata.get('participants', []))}")
        else:
            self.logger.warning(f"✗ Could not retrieve match data for {match_id}")

        return match_data
