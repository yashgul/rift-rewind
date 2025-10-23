import requests
import os


class RiotAPIClient:
    """
    A simple Python wrapper class for the Riot Games API.
    """

    def __init__(self, default_region="asia"):
        """
        Initializes the API client.

        Args:
            default_region (str): The default regional routing value
                                  (e.g., 'asia', 'americas', 'europe').
        """
        self.default_region = default_region

        riot_api_key = os.getenv("RIOT_API_KEY")
        self.headers = {"X-Riot-Token": riot_api_key}

    def _get_base_url(self, region):
        """Constructs the base URL for a given region."""
        if region is None:
            region = self.default_region
        return f"https://{region}.api.riotgames.com"

    def _request(self, region, endpoint_path, params=None):
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

        try:
            # Make the GET request with headers and query parameters
            response = requests.get(url, headers=self.headers, params=params)

            # Raise an exception for bad status codes (4xx or 5xx)
            response.raise_for_status()

            # Return the JSON response if successful
            return response.json()

        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err} - {response.text}")
        except requests.exceptions.RequestException as req_err:
            print(f"An error occurred: {req_err}")

        return None

    def get_puuid_from_name_and_tag(
        self,
        game_name,
        game_tag,
        region=None,
    ):
        # Construct the endpoint path
        endpoint = f"riot/account/v1/accounts/by-riot-id/{game_name}/{game_tag}"

        # Call the internal request method
        return self._request(region, endpoint)["puuid"]

    def get_match_ids_by_puuid(self, puuid, region=None, match_type=None, start=0, count=100):
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
        # Construct the endpoint path
        endpoint = f"lol/match/v5/matches/by-puuid/{puuid}/ids"

        query_params = {"start": start, "count": count}
        if match_type is not None:
            query_params["type"] = match_type

        # Call the internal request method
        return self._request(region, endpoint, params=query_params)

    def get_match_metadata_by_match_id(
        self,
        region=None,
        match_id="KR_7858254806",
    ):
        """
        Gets meta data for a given match id.

        Corresponds to the endpoint:
        /lol/match/v5/matches/by-puuid/{puuid}/ids

        Args:
            match_id (str): The match_id (Required)
            region (str, optional): The region to query. Defaults to the client's default region.
        """
        # Construct the endpoint path
        endpoint = f"lol/match/v5/matches/{match_id}"

        # Call the internal request method
        return self._request(region, endpoint)
