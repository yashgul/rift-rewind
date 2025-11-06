# Keys to ignore during aggregation (identifiers, timestamps, non-aggregatable data)
IGNORE_KEYS = {
    "gameCreation",
    "gameDuration",
    "gameEndTimestamp",
    "gameId",
    "gameName",
    # "gameStartTimestamp",
    "gameType",
    "gameVersion",
    "mapId",
    "platformId",
    "queueId",
    "tournamentCode",
    "participantId",
    "profileIcon",
    "puuid",
    "riotIdGameName",
    "riotIdTagline",
    "summonerId",
    "summonerName",
    "summonerLevel",
    "championId",
    "championName",
    "championTransform",
    "summoner1Id",
    "summoner2Id",
    "teamId",
    "placement",
    "subteamPlacement",
    "playerSubteamId",
    "item0",
    "item1",
    "item2",
    "item3",
    "item4",
    "item5",
    "item6",
    "endOfGameResult",
    "gameMode",
    "teams",
    "PlayerScore0",
    "PlayerScore1",
    "PlayerScore2",
    "PlayerScore3",
    "PlayerScore4",
    "PlayerScore5",
    "PlayerScore6",
    "PlayerScore7",
    "PlayerScore8",
    "PlayerScore9",
    "PlayerScore10",
    "PlayerScore11",
    # SWARM game mode stats (not relevant for regular games)
    "SWARM_DefeatAatrox",
    "SWARM_DefeatBriar",
    "SWARM_DefeatMiniBosses",
    "SWARM_EvolveWeapon",
    "SWARM_Have3Passives",
    "SWARM_KillEnemy",
    "SWARM_PickupGold",
    "SWARM_ReachLevel50",
    "SWARM_Survive15Min",
    "SWARM_WinWith5EvolvedWeapons",
    # Other irrelevant stats
    "12AssistStreakCount",
    "HealFromMapSources",
    "playerAugment1",
    "playerAugment2",
    "playerAugment3",
    "playerAugment4",
    "playerAugment5",
    "playerAugment6",
    # Low-value noise
    "playerScore0",
    "playerScore1",
    "playerScore2",
    "playerScore3",
    "playerScore4",
    "playerScore5",
    "playerScore6",
    "playerScore7",
    "playerScore8",
    "playerScore9",
    "playerScore10",
    "playerScore11",
    # "teamEarlySurrendered",
    # "gameEndedInEarlySurrender",
    # "gameEndedInSurrender",
    "poroExplosions",
    "wardsGuarded",
    "unseenRecalls",
    "twoWardsOneSweeperCount",
    "twentyMinionsIn3SecondsCount",
    "turretsTakenWithRiftHerald",
    "takedownsInEnemyFountain",
    "takedownsInAlcove",
    "takedownOnFirstTurret",
    "survivedThreeImmobilizesInFight",
    "soloBaronKills",
    "snowballsHit",
    "skillshotsHit",
    "scuttleCrabKills",
    "quickFirstTurret",
    # maybe?
    "quickCleanse",
    "saveAllyFromDeath",
    "playedChampSelectPosition",
    "perfectGame",
    "perfectDragonSoulsTaken",
    "outnumberedNexusKill",
    "outerTurretExecutesBefore10Minutes",
    "multiTurretRiftHeraldCount",
    "multiKillOneSpell",
    "moreEnemyJungleThanOpponent",
    "lostAnInhibitor",
    "legendaryCount",
    "landSkillShotsEarlyGame",
    "killsOnRecentlyHealedByAramPack",
    "killedChampTookFullTeamDamageSurvived",
    "kTurretsDestroyedBeforePlatesFall",
    "initialCrabCount",
    "initialBuffCount",
    "fullTeamTakedown",
    "flawlessAces",
    "fistBumpParticipation",
    "doubleAces",
    "deathsByEnemyChamps",
    "dancedWithRiftHerald",
    "controlWardTimeCoverageInRiverOrEnemyHalf"  # maybe useful?
    "acesBefore15Minutes",
    "InfernalScalePickup",
    "unrealKills",
    "turretKills",
    "totalUnitsHealed",
    "totalMinionsKilled",
    "totalHealsOnTeammates",
    "summoner2Casts",
    "summoner1Casts",
    "spell1Casts",
    "spell2Casts",
    "spell3Casts",
    "spell4Casts",
    "sightWardsBoughtInGame",
    "dangerPings",
    "allInPings_avg_per_game",
    "assistMePings_avg_per_game",
    "basicPings_avg_per_game",
    "commandPings_avg_per_game",
    "consumablesPurchased_avg_per_game",
    "visionClearedPings",
    "retreatPings",
    "pushPings",
    "onMyWayPings",
    "needVisionPings",
    "holdPings",
    "getBackPings",
    "enemyVisionPings",
    "enemyMissingPings",
    "eligibleForProgression",
    "detectorWardsPlaced",
    "objectivesStolenAssists",
    "nexusLost",
    "nexusKills",
    "largestKillingSpree",
    "largestCriticalStrike",
    "killingSprees",
    "itemsPurchased" "inhibitorsLost",
    "inhibitorTakedowns",
    "inhibitorKills",
}


CHAMPION_STATS_KEYS = {
    "games_played",
    "wins",
    "losses",
    "win_rate_percent",
    "kda_avg_per_game",
    "killParticipation_avg_per_game",
    "totalDamageDealtToChampions_avg_per_game",
    "damagePerMinute_avg_per_game",
    "totalDamageTaken_avg_per_game",
    "teamDamagePercentage_avg_per_game",
    "goldPerMinute_avg_per_game",
    "visionScorePerMinute_avg_per_game",
    "multikills_avg_per_game",
    "quadraKills_avg_per_game",
    "pentaKills_avg_per_game",
    "turretTakedowns_avg_per_game",
    "damageDealtToTurrets_avg_per_game",
    "totalMinionsKilled_avg_per_game",
    "neutralMinionsKilled_avg_per_game",
    "champion",
}

ROLE_STATS_KEYS = {
    "games_played",
    "wins",
    "losses",
    "win_rate_percent",
    "kda_avg_per_game",
    "killParticipation_avg_per_game",
    "totalDamageDealtToChampions_avg_per_game",
    "goldPerMinute_avg_per_game",
    "damagePerMinute_avg_per_game",
    "visionScore_avg_per_game",
    "teamDamagePercentage_avg_per_game",
    "role",
}

PLAYER_WRAPPED_SCHEMA = {
    "tools": [
        {
            "toolSpec": {
                "name": "generate_player_wrapped",
                "description": "Generates the League of Legends player wrapped JSON summary.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "wrapped": {
                                "type": "object",
                                "properties": {
                                    "tagline": {
                                        "type": "string",
                                        "description": "3-5 words, creative title for their playstyle",
                                    },
                                    "summary": {
                                        "type": "string",
                                        "description": "2 sentences about player personality",
                                    },
                                    "archetype": {
                                        "type": "string",
                                        "description": "Their playstyle archetype",
                                    },
                                },
                                "required": ["tagline", "summary", "archetype"],
                            },
                            "stats": {
                                "type": "object",
                                "properties": {
                                    "games": {
                                        "type": "integer",
                                        "description": "Total number of games played",
                                    },
                                    "winrate": {
                                        "type": "number",
                                        "description": "Win rate percentage",
                                    },
                                    "hours": {
                                        "type": "integer",
                                        "description": "Total hours played",
                                    },
                                    "peakTime": {
                                        "type": "string",
                                        "description": "Peak playing time, 10PM ET, etc.",
                                    },
                                    "bestMonth": {
                                        "type": "string",
                                        "description": "Month with best performance eg: October",
                                    },
                                },
                                "required": ["games", "winrate", "hours", "peakTime", "bestMonth"],
                            },
                            "highlights": {
                                "type": "array",
                                "description": "Exactly 5 most interesting highlights",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {
                                            "type": "string",
                                            "description": "Catchy title for the highlight",
                                        },
                                        "description": {
                                            "type": "string",
                                            "description": "What the player did",
                                        },
                                        "flavor": {
                                            "type": "string",
                                            "description": "Wrapped-style comment, interesting, entertaining",
                                        },
                                        "label": {
                                            "type": "string",
                                            "description": "What the number represents in a cool engrossing way",
                                        },
                                        "percentile": {
                                            "type": "string",
                                            "description": "Percentile ranking like 'Top 5% of players'",
                                        },
                                        "icon": {
                                            "type": "string",
                                            "description": "Optional champion name or icon identifier",
                                        },
                                    },
                                    "required": ["title", "description", "flavor", "label"],
                                },
                                "minItems": 5,
                                "maxItems": 5,
                            },
                            "champions": {
                                "type": "object",
                                "properties": {
                                    "main": {
                                        "type": "object",
                                        "properties": {
                                            "name": {
                                                "type": "string",
                                                "description": "Champion name",
                                            },
                                            "games": {
                                                "type": "integer",
                                                "description": "Number of games played with this champion",
                                            },
                                            "winrate": {
                                                "type": "number",
                                                "description": "Win rate percentage with this champion",
                                            },
                                            "kda": {
                                                "type": "number",
                                                "description": "Kill/Death/Assist ratio",
                                            },
                                            "insight": {
                                                "type": "string",
                                                "description": "Interesting fact about playing this champion",
                                            },
                                        },
                                        "required": ["name", "games", "winrate", "kda", "insight"],
                                    },
                                    "top3": {
                                        "type": "array",
                                        "description": "Exactly 3 top champions",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {
                                                    "type": "string",
                                                    "description": "Champion name",
                                                },
                                                "games": {
                                                    "type": "integer",
                                                    "description": "Number of games played",
                                                },
                                                "wr": {
                                                    "type": "number",
                                                    "description": "Win rate percentage",
                                                },
                                            },
                                            "required": ["name", "games", "wr"],
                                        },
                                        "minItems": 3,
                                        "maxItems": 3,
                                    },
                                    "hiddenGem": {
                                        "type": "object",
                                        "description": "A champion with <20 games and >70% WR, or null if none exists",
                                        "properties": {
                                            "name": {
                                                "type": "string",
                                                "description": "Champion name",
                                            },
                                            "games": {
                                                "type": "integer",
                                                "description": "Number of games played",
                                            },
                                            "winrate": {
                                                "type": "number",
                                                "description": "Win rate percentage",
                                            },
                                            "insight": {
                                                "type": "string",
                                                "description": "Interesting observation about this hidden gem",
                                            },
                                        },
                                    },
                                },
                                "required": ["main", "top3"],
                            },
                            "playstyle": {
                                "type": "object",
                                "properties": {
                                    "traits": {
                                        "type": "object",
                                        "description": "Player playstyle traits with scores from 0-100",
                                        "properties": {
                                            "aggression": {
                                                "type": "integer",
                                                "description": "Aggression score from 0-100",
                                                "minimum": 0,
                                                "maximum": 100,
                                            },
                                            "teamwork": {
                                                "type": "integer",
                                                "description": "Teamwork score from 0-100",
                                                "minimum": 0,
                                                "maximum": 100,
                                            },
                                            "mechanics": {
                                                "type": "integer",
                                                "description": "Mechanics score from 0-100",
                                                "minimum": 0,
                                                "maximum": 100,
                                            },
                                            "strategy": {
                                                "type": "integer",
                                                "description": "Strategy score from 0-100",
                                                "minimum": 0,
                                                "maximum": 100,
                                            },
                                            "consistency": {
                                                "type": "integer",
                                                "description": "Consistency score from 0-100",
                                                "minimum": 0,
                                                "maximum": 100,
                                            },
                                        },
                                        "required": [
                                            "aggression",
                                            "teamwork",
                                            "mechanics",
                                            "strategy",
                                            "consistency",
                                        ],
                                    },
                                    "summary": {
                                        "type": "string",
                                        "description": "One sentence summary of playstyle",
                                    },
                                },
                                "required": ["traits", "summary"],
                            },
                            "memorable": {
                                "type": "object",
                                "properties": {
                                    "bestStreak": {
                                        "type": "integer",
                                        "description": "Longest winning streak",
                                    },
                                    "clutchestComeback": {
                                        "type": "string",
                                        "description": "Description of biggest comeback",
                                    },
                                    "bestMonth": {
                                        "type": "string",
                                        "description": "Month with best performance",
                                    },
                                },
                                "required": ["bestStreak", "clutchestComeback", "bestMonth"],
                            },
                            "funFacts": {
                                "type": "array",
                                "description": "Exactly 4 fun facts",
                                "items": {"type": "string"},
                                "minItems": 4,
                                "maxItems": 4,
                            },
                            "closing": {
                                "type": "object",
                                "properties": {
                                    "message": {
                                        "type": "string",
                                        "description": "2 sentences hyping up the player",
                                    },
                                    "year": {
                                        "type": "string",
                                        "description": "Year of the wrapped summary",
                                    },
                                },
                                "required": ["message", "year"],
                            },
                        },
                        "required": [
                            "wrapped",
                            "stats",
                            "highlights",
                            "champions",
                            "playstyle",
                            "memorable",
                            "funFacts",
                            "closing",
                        ],
                    }
                },
            }
        }
    ]
}

WRAPPED_SYSTEM_PROMPT = [
    {
        "text": """You are generating a League of Legends "Wrapped" summary (like Spotify Wrapped) for a player.

You will be given player data, which is an aggregate of player stats over a number of matches.
You must analyze it to create an engaging, personalized summary using the generate_player_wrapped tool.

INSTRUCTIONS:
1. Choose the 5 MOST INTERESTING highlights from the yearly aggregated data
2. Prioritize: rare achievements (baron steals, pentakills, comeback wins), extreme stats (very high/low), personality quirks (play time patterns)
3. For percentiles: Use "Top X%" for impressive stats. Only include if the stat is genuinely notable.
4. Tone: Positive and celebratory like Spotify Wrapped. Acknowledge quirks warmly, not harshly.
5. hiddenGem should be null or omitted if no champion has <20 games AND >50% WR
6. For traits, score based on the data: high CS/min = high "Farming", baron steals = high "Objective Control", etc.
7. funFacts should be surprising or amusing observations from the data

CRITICAL RULES:
- ALL array lengths must match exactly (5 highlights, 3 top3, 4 traits, 4 funFacts)
- All numbers must be actual numbers, not strings (except percentiles and year)
- If a player has no baron steals, pentakills, etc., focus on other interesting patterns
- DO NOT make up stats - only use provided data
- Be creative and engaging while staying truthful to the data"""
    }
]

INTERESTING_MATCHES_SYSTEM_PROMPT = [
    {
        "text": """You are analyzing League of Legends matches to identify the most interesting ones.

You will be given a list of matches with basic stats (KDA, champion, win/loss).
Your task is to select ONLY the truly interesting matches and explain why each is notable.

WHAT MAKES A MATCH INTERESTING:
- Exceptional performance: Very high KDA (>5.0), pentakills, or carrying performances
- Dramatic moments: Clutch comebacks, close victories, or intense defeats
- Unusual patterns: Off-meta champions, unexpected wins, or rare achievements
- Learning moments: Significant improvement or surprising champion mastery
- Entertainment value: Memorable plays or funny situations

INSTRUCTIONS:
1. Analyze each match critically - only 20-40% of matches should be "interesting"
2. For each interesting match, write a 1-2 sentence description explaining WHY it's notable
3. Be specific: Reference the actual stats (KDA, champion, outcome) in your description
4. Use an engaging, celebratory tone like Spotify Wrapped
5. Focus on achievements and memorable moments, not failures

CRITICAL RULES:
- DO NOT include every match - be selective
- Descriptions must reference the actual match data provided
- Use the match ID as the key in your response object
- Be truthful - don't invent stats or events not in the data"""
    }
]

INTERESTING_MATCHES_SCHEMA = {
    "tools": [
        {
            "toolSpec": {
                "name": "find_players_interesting_matches",
                "description": "Find interesting matches that protray the users journey, how their year went, what they learnt etc.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "interesting_matches": {
                                "type": "array",
                                "description": "List of interesting matches with their descriptions",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "match_id": {
                                            "type": "string",
                                            "description": "The match ID from the input data",
                                        },
                                        "description": {
                                            "type": "string",
                                            "description": "Fun description reminfding the player why this match was interesting and evoking a sense of nostalgia",
                                        },
                                    },
                                    "required": ["match_id", "description"],
                                },
                            }
                        },
                        "required": ["interesting_matches"],
                    }
                },
            }
        }
    ]
}
