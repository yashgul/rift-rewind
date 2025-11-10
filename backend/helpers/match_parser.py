from typing import Optional
import logging

logger = logging.getLogger(__name__)


def parse_match_for_player(match_data: dict, target_puuid: str) -> Optional[dict]:
    """
    Parses a single match JSON response to extract stats for a specific player.
    Only includes the player's team data and flattens team objectives.

    Args:
        match_data: The full match data as a Python dictionary.
        target_puuid: The puuid of the player to find.

    Returns:
        A dictionary containing the player's stats with game info, challenges,
        and team objectives flattened. Excludes perks, missions, legendaryItemUsed,
        and opposing team data. Returns None if the player was not found or if parsing fails.
    """
    try:
        game_info = match_data["info"]

        # Find the target player
        participant_data = _find_participant(game_info["participants"], target_puuid)
        if not participant_data:
            return None

        # Flatten data structures
        return _flatten_player_stats(game_info, participant_data)

    except (KeyError, TypeError) as e:
        logger.error(f"Error parsing match data: {e}")
        return None


def _find_participant(participants: list, target_puuid: str) -> Optional[dict]:
    """Finds a participant by their puuid."""
    for participant in participants:
        if participant["puuid"] == target_puuid:
            return participant
    return None


def _flatten_player_stats(game_info: dict, participant_data: dict) -> dict:
    """
    Flattens game info, participant data, and challenges into a single dictionary.
    Removes opposing team, perks, missions, legendaryItemUsed, objectives.
    """
    result = game_info.copy()
    result.pop("participants")

    # Get player's team ID
    player_team_id = participant_data["teamId"]

    # Find and keep only player's team
    player_team = None
    for team in result["teams"]:
        if team["teamId"] == player_team_id:
            player_team = team
            break

    # Replace teams with only player's team
    if player_team:
        result["teams"] = [player_team]

    # Update with participant data
    result.update(participant_data)
    result["enemySurrendered"] = result["win"] and result["gameEndedInSurrender"]
    result["surrendered"] = not result["win"] and result["gameEndedInSurrender"]

    result["gameDuration"] = game_info.get("gameDuration", 0)
    result["cs_per_min"] = (result["totalMinionsKilled"] + result["neutralMinionsKilled"]) / (
        result["gameDuration"] / 60
    )

    # Remove unneeded components from participant data, especially nested data
    result.pop("perks", None)
    result.pop("missions", None)
    result.pop("legendaryItemUsed", None)
    result.pop("objectives", None)
    result.pop("teams", None)

    # Flatten challenges
    challenges = result.pop("challenges", {})
    result.update(challenges)

    return result
