def parse_match_for_player(match_data: dict, target_puuid: str) -> dict | None:
    """
    Parses a single match JSON response to extract stats for a specific player.

    Args:
        match_data: The full match data as a Python dictionary (from json.loads()).
        target_puuid: The puuid of the player to find.

    Returns:
        A dictionary containing the player's stats, or None if the player
        was not found in the match.
    """

    # --- 1. Get Game-level Info ---
    try:
        game_info = match_data.get("info", {})
        game_duration_seconds = game_info.get("gameDuration", 0)
        # Convert duration to minutes for "per-minute" stats
        game_duration_minutes = game_duration_seconds / 60.0
        game_mode = game_info.get("gameMode", "UNKNOWN")
        match_id = match_data.get("metadata", {}).get("matchId", "UNKNOWN")

    except Exception as e:
        print(f"Error parsing game-level data: {e}")
        return None

    # --- 2. Find the Target Player ---
    participant_data = None
    for p in game_info.get("participants", []):
        if p.get("puuid") == target_puuid:
            participant_data = p
            break

    if not participant_data:
        # Player not found in this match
        return None

    # --- 3. Extract and Calculate Stats ---
    try:
        kills = participant_data.get("kills", 0)
        deaths = participant_data.get("deaths", 0)
        assists = participant_data.get("assists", 0)

        # Calculate KDA Ratio (handle division by zero if deaths = 0)
        if deaths == 0:
            kda_ratio = kills + assists
        else:
            kda_ratio = (kills + assists) / deaths

        # Calculate total CS and CS/min
        total_cs = participant_data.get("totalMinionsKilled", 0) + participant_data.get(
            "neutralMinionsKilled", 0
        )

        cs_per_min = (total_cs / game_duration_minutes) if game_duration_minutes > 0 else 0

        # Get data from the 'challenges' sub-object (using .get() for safety)
        challenges = participant_data.get("challenges", {})
        mejais_full_stack_time = challenges.get("mejaisFullStackInTime", 0)
        solo_kills = challenges.get("soloKills", 0)

        # Collect all data into a structured dictionary
        extracted_stats = {
            "matchId": match_id,
            "gameMode": game_mode,
            "gameDurationMin": round(game_duration_minutes, 2),
            "win": participant_data.get("win", False),
            "championName": participant_data.get("championName", "Unknown"),
            "teamPosition": participant_data.get(
                "teamPosition", "UNKNOWN"
            ),  # e.g., 'TOP', 'JUNGLE'
            "kills": kills,
            "deaths": deaths,
            "assists": assists,
            "kdaRatio": round(kda_ratio, 2),
            "totalCS": total_cs,
            "csPerMin": round(cs_per_min, 2),
            "goldEarned": participant_data.get("goldEarned", 0),
            "visionScore": participant_data.get("visionScore", 0),
            "controlWardsPlaced": participant_data.get("detectorWardsPlaced", 0),
            "totalDamageToChamps": participant_data.get("totalDamageDealtToChampions", 0),
            "pentaKills": participant_data.get("pentaKills", 0),
            "quadraKills": participant_data.get("quadraKills", 0),
            "doubleKills": participant_data.get("doubleKills", 0),
            "soloKills": solo_kills,
            "mejaisFullStackInTime": mejais_full_stack_time,
            # Add any other stats you want here
        }

        return extracted_stats

    except Exception as e:
        print(f"Error parsing participant data for {target_puuid}: {e}")
        return None
