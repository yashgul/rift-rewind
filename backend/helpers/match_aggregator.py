from typing import Dict, Any, Optional
from collections import defaultdict
from datetime import datetime
from constants import IGNORE_KEYS, CHAMPION_STATS_KEYS, ROLE_STATS_KEYS
import logging

logger = logging.getLogger(__name__)


class MatchStatsAggregator:
    """
    Aggregates match statistics across multiple games for a player.
    Tracks stats by champion, by role, and overall.
    """

    def __init__(self):
        self.overall_stats = {"games_played": 0}
        self.champion_stats = defaultdict(lambda: {"games_played": 0})
        self.role_stats = defaultdict(lambda: {"games_played": 0})
        self.hourly_stats = defaultdict(lambda: {"games": 0})

        # Track only current month stats and best month
        self.current_month_stats = {}  # {month_key: {wins, losses, games}}
        self.best_month = None  # Stores the best month info

    def add_match(self, match_data: Dict[str, Any]) -> None:
        """
        Adds a parsed match to the aggregated statistics.

        Args:
            match_data: The flattened match data for a single player from parse_match_for_player
        """
        try:
            if not match_data:
                logger.warning("Received None or empty match_data — skipping.")
                return

            champion = match_data.get("championName", "Unknown")
            role = match_data.get("teamPosition")

            # Aggregate to all three views
            self._aggregate_stats(self.overall_stats, match_data)
            self._aggregate_stats(self.champion_stats[champion], match_data)
            self._aggregate_stats(self.role_stats[role], match_data)

            # Track time-based stats
            self._aggregate_time_stats(match_data)

        except Exception as e:
            champion = (
                match_data.get("championName", "Unknown")
                if isinstance(match_data, dict)
                else "Unknown"
            )
            logger.error(f"Error aggregating match for champion={champion}: {e}")

    def _aggregate_time_stats(self, match_data: Dict[str, Any]) -> None:
        """
        Aggregates time-based statistics (best month and hourly play patterns).
        Only keeps track of the best performing month.
        """
        timestamp = match_data.get("gameStartTimestamp")
        if not timestamp:
            return

        try:
            # Convert milliseconds to seconds if needed
            if timestamp > 10**12:  # Likely in milliseconds
                timestamp = timestamp / 1000

            # Convert to ET (America/New_York) - most popular US timezone
            from datetime import timezone

            try:
                import pytz

                utc_dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                et_tz = pytz.timezone("America/New_York")
                et_dt = utc_dt.astimezone(et_tz)
            except ImportError:
                # Fallback if pytz not available - approximate ET as UTC-5
                from datetime import timedelta

                utc_dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                et_dt = utc_dt - timedelta(hours=5)

            # Track monthly stats
            month_key = et_dt.strftime("%Y-%m")
            is_win = match_data.get("win", False)

            # Initialize month if not seen before
            if month_key not in self.current_month_stats:
                self.current_month_stats[month_key] = {"wins": 0, "losses": 0, "games": 0}

            # Update current month
            self.current_month_stats[month_key]["games"] += 1
            if is_win:
                self.current_month_stats[month_key]["wins"] += 1
            else:
                self.current_month_stats[month_key]["losses"] += 1

            # Check if this month is now the best
            self._update_best_month(month_key)

            # Track hourly stats (0-23 hour in ET)
            hour = et_dt.hour
            self.hourly_stats[hour]["games"] += 1

        except Exception as e:
            logger.error(f"Error processing timestamp {timestamp}: {e}")

    def _update_best_month(self, month_key: str) -> None:
        """
        Updates the best month if the current month has better performance.
        """
        current = self.current_month_stats[month_key]
        current_diff = current["wins"] - current["losses"]

        if self.best_month is None:
            # First month seen
            self.best_month = {
                "month_key": month_key,
                "wins": current["wins"],
                "losses": current["losses"],
                "games": current["games"],
                "win_loss_difference": current_diff,
            }
        else:
            # Compare with best
            best_diff = self.best_month["win_loss_difference"]

            # Update if current month is better, or same but with more games (more significant)
            if current_diff > best_diff or (
                current_diff == best_diff and current["games"] > self.best_month["games"]
            ):
                self.best_month = {
                    "month_key": month_key,
                    "wins": current["wins"],
                    "losses": current["losses"],
                    "games": current["games"],
                    "win_loss_difference": current_diff,
                }

    def _aggregate_stats(self, stats_dict: Dict, match_data: Dict[str, Any]) -> None:
        """
        Aggregates match data into a stats dictionary.
        Sums integers and booleans (converted to ints) for later averaging.
        """
        stats_dict["games_played"] += 1

        for key, value in match_data.items():
            # Skip ignored keys
            if key in IGNORE_KEYS:
                continue

            # Handle different data types
            if isinstance(value, bool):
                stats_dict[key] = stats_dict.get(key, 0) + int(value)
            elif isinstance(value, (int, float)):
                stats_dict[key] = stats_dict.get(key, 0) + value
            elif isinstance(value, str):
                continue
            elif isinstance(value, (list, dict)):
                continue

    def _compute_averages(self, stats_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts summed stats to averages per game.
        Keys are renamed to include _avg_per_game suffix.
        Special handling for win rate.
        """
        games_played = stats_dict.get("games_played", 0)
        if games_played == 0:
            return {"games_played": 0}

        total_wins = stats_dict.get("win", 0)

        averaged_stats = {
            "games_played": games_played,
            "wins": total_wins,
            "losses": games_played - total_wins,
            "win_rate_percent": round(total_wins / games_played * 100, 2),
        }

        for key, value in stats_dict.items():
            if key in ["games_played", "win"]:
                continue

            if isinstance(value, (int, float)):
                avg_value = round(value / games_played, 2)
                averaged_stats[f"{key}_avg_per_game"] = avg_value

        return averaged_stats

    def get_overall_stats(self) -> Dict[str, Any]:
        """Returns aggregated stats across all games with averages."""
        return self._compute_averages(self.overall_stats)

    def get_champion_stats(self) -> Dict[str, Dict[str, Any]]:
        """Returns aggregated stats by champion with averages."""
        return {
            champ: {**self._compute_averages(stats), "champion": champ}
            for champ, stats in self.champion_stats.items()
        }

    def get_role_stats(self) -> Dict[str, Dict[str, Any]]:
        """Returns aggregated stats by role/position with averages."""
        return {
            role: {**self._compute_averages(stats), "role": role}
            for role, stats in self.role_stats.items()
        }

    def _get_best_month(self) -> Dict[str, Any]:
        """
        Returns the month with the best performance (most wins - losses).
        """
        if not self.best_month:
            return {}

        # Format month name for readability
        try:
            dt = datetime.strptime(self.best_month["month_key"], "%Y-%m")
            month_name = dt.strftime("%B %Y")  # e.g., "January 2024"
        except:
            month_name = self.best_month["month_key"]

        return {
            "month": month_name,
            "month_key": self.best_month["month_key"],
            "wins": self.best_month["wins"],
            "losses": self.best_month["losses"],
            "win_loss_difference": self.best_month["win_loss_difference"],
            "total_games": self.best_month["games"],
            "winrate": (
                round(self.best_month["wins"] / self.best_month["games"] * 100, 2)
                if self.best_month["games"] > 0
                else 0
            ),
        }

    def _get_peak_play_time(self) -> Dict[str, Any]:
        """
        Returns the hour (in ET) when the player plays most frequently.
        """
        if not self.hourly_stats:
            return {}

        peak_hour = max(self.hourly_stats.items(), key=lambda x: x[1]["games"])
        hour, stats = peak_hour

        # Format hour for readability
        time_str = f"{hour % 12 or 12}:00 {'PM' if hour >= 12 else 'AM'} ET"

        # Categorize the time
        if 6 <= hour < 12:
            period = "Morning"
        elif 12 <= hour < 17:
            period = "Afternoon"
        elif 17 <= hour < 21:
            period = "Evening"
        else:
            period = "Late Night"

        return {
            "hour": hour,
            "time_formatted": time_str,
            "period": period,
            "games_played": stats["games"],
        }

    def get_summary(self) -> Dict[str, Any]:
        """
        Returns a summary of key statistics for LLM-friendly yearly recap generation.
        All stats are averages per game.
        """
        overall = self.get_overall_stats()
        games_played = overall.get("games_played", 0)

        if games_played == 0:
            return {"error": "No games played"}

        wins = self.overall_stats.get("win", 0)

        summary = {
            "total_games": games_played,
            "wins": wins,
            "losses": games_played - wins,
            "win_rate_percent": round(wins / games_played * 100, 2) if games_played > 0 else 0,
            "avg_kills_per_game": overall.get("kills_avg_per_game", 0),
            "avg_deaths_per_game": overall.get("deaths_avg_per_game", 0),
            "avg_assists_per_game": overall.get("assists_avg_per_game", 0),
            "avg_kda": self._calculate_kda(
                overall.get("kills_avg_per_game", 0),
                overall.get("deaths_avg_per_game", 1),
                overall.get("assists_avg_per_game", 0),
            ),
            "avg_damage_to_champions_per_game": overall.get(
                "totalDamageDealtToChampions_avg_per_game", 0
            ),
            "avg_cs_per_game": overall.get("totalMinionsKilled_avg_per_game", 0),
            "avg_vision_score_per_game": overall.get("visionScore_avg_per_game", 0),
            "avg_multikills_per_game": overall.get("multikills_avg_per_game", 0),
            "total_pentakills": self.overall_stats.get("pentaKills", 0),
            "most_played_champion": self._get_most_played_champion(),
            "best_champion_by_winrate": self._get_best_champion_by_winrate(),
            "favorite_role": self._get_favorite_role(),
            "best_month": self._get_best_month(),
            "peak_play_time": self._get_peak_play_time(),
            "all_stats_avg_per_game": overall,
            "champion_stats": self.get_champion_stats(),
            "role_stats": self.get_role_stats(),
        }

        return self._filter_irrelevant_data(summary)

    def _calculate_kda(self, avg_kills: float, avg_deaths: float, avg_assists: float) -> float:
        """Calculates KDA ratio from averages."""
        avg_deaths = max(avg_deaths, 1)
        return round((avg_kills + avg_assists) / avg_deaths, 2)

    def _get_most_played_champion(self) -> Dict[str, Any]:
        """Returns the most played champion with stats."""
        if not self.champion_stats:
            return {}

        most_played = max(self.champion_stats.items(), key=lambda x: x[1]["games_played"])
        return {
            "name": most_played[0],
            "games": most_played[1]["games_played"],
            "wins": most_played[1].get("win", 0),
        }

    def _get_best_champion_by_winrate(self, min_games: int = 5) -> Dict[str, Any]:
        """Returns the champion with the best winrate (minimum games filter)."""
        if not self.champion_stats:
            return {}

        qualified_champs = {
            champ: stats
            for champ, stats in self.champion_stats.items()
            if stats["games_played"] >= min_games
        }

        if not qualified_champs:
            return {}

        best_champ = max(
            qualified_champs.items(), key=lambda x: x[1].get("win", 0) / x[1]["games_played"]
        )

        games = best_champ[1]["games_played"]
        wins = best_champ[1].get("win", 0)

        return {
            "name": best_champ[0],
            "games": games,
            "wins": wins,
            "winrate": round(wins / games * 100, 2) if games > 0 else 0,
        }

    def _get_favorite_role(self) -> Dict[str, Any]:
        """Returns the most played role with stats."""
        if not self.role_stats:
            return {}

        most_played = max(self.role_stats.items(), key=lambda x: x[1]["games_played"])
        games = most_played[1]["games_played"]

        return {
            "name": most_played[0],
            "games": games,
            "wins": most_played[1].get("win", 0),
            "winrate": round(most_played[1].get("win", 0) / games * 100, 2) if games > 0 else 0,
        }

    def _filter_irrelevant_data(self, data, min_games=5, top_n=10):
        """
        Filters the JSON data:
        - Keeps top N champions by games played.
        - Removes champions with fewer than `min_games`.
        - Keeps only selected keys for both role and champion data.
        - Preserves champion and role names as dictionary keys.
        """
        champions_dict = data.get("champion_stats", {})
        roles_dict = data.get("role_stats", {})

        qualified_champions = {
            champ: stats
            for champ, stats in champions_dict.items()
            if stats.get("games_played", 0) >= min_games
        }

        top_champions = dict(
            sorted(
                qualified_champions.items(),
                key=lambda x: x[1].get("games_played", 0),
                reverse=True,
            )[:top_n]
        )

        filtered_champions = {
            champ: {k: v for k, v in stats.items() if k in CHAMPION_STATS_KEYS}
            for champ, stats in top_champions.items()
        }

        filtered_roles = {
            role: {k: v for k, v in stats.items() if k in ROLE_STATS_KEYS}
            for role, stats in roles_dict.items()
        }
        filtered_roles.pop("", None)

        return {
            "all_stats_avg_per_game": data.get("all_stats_avg_per_game", {}),
            "champion_stats": filtered_champions,
            "role_stats": filtered_roles,
            "best_month": data.get("best_month", {}),
            "peak_play_time": data.get("peak_play_time", {}),
        }
