import json
import boto3
from botocore.exceptions import ClientError

# --- 1. Define the Desired Output Schema as a Tool ---
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
                                        "description": "Peak playing time description",
                                    },
                                    "bestMonth": {
                                        "type": "string",
                                        "description": "Month with best performance",
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
                                        "type": "array",
                                        "description": "Exactly 4 traits",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {
                                                    "type": "string",
                                                    "description": "Name of the playstyle trait",
                                                },
                                                "score": {
                                                    "type": "integer",
                                                    "description": "Score from 0-100 for this trait",
                                                },
                                            },
                                            "required": ["name", "score"],
                                        },
                                        "minItems": 4,
                                        "maxItems": 4,
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

# --- 2. Sample Player Data ---
PLAYER_DATA = {
    "total": {
        "games": 580,
        "wins": 305,
        "losses": 275,
        "winrate": 52.59,
        "total_minutes": 14500,
        "peak_hour_of_day": 20,
        "peak_day_of_week": "Friday",
        "best_month": "March",
        "avg_vision_score_per_game": 78.5,
        "avg_wards_placed_per_min": 1.25,
        "avg_roam_distance_per_game": 7500,
        "avg_cs_per_min": 2.1,
        "avg_kill_participation": 65.5,
        "avg_kda": 3.8,
    },
    "champions_data": [
        {
            "name": "Thresh",
            "games": 155,
            "wins": 85,
            "winrate": 54.84,
            "kda": 4.1,
            "baron_steals": 1,
        },
        {"name": "Bard", "games": 98, "wins": 57, "winrate": 58.16, "kda": 4.5, "pentakills": 0},
        {"name": "Leona", "games": 72, "wins": 34, "winrate": 47.22, "kda": 3.2, "pentakills": 0},
        {"name": "Morgana", "games": 55, "wins": 31, "winrate": 56.36, "kda": 3.9, "pentakills": 0},
        {"name": "Soraka", "games": 8, "wins": 6, "winrate": 75.00, "kda": 5.8, "pentakills": 0},
        {"name": "Ashe", "games": 5, "wins": 4, "winrate": 80.00, "kda": 6.0, "pentakills": 0},
    ],
    "extremes": {
        "max_best_streak": 9,
        "max_comeback_gold_diff": 18000,
        "baron_steals": 1,
        "pentakills": 0,
        "top_5_percent_vision_score": 70.0,
    },
}

SYSTEM_PROMPT = [
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


# --- 3. DynamoDB Operations ---
import decimal
import json

def convert_floats_to_decimals(obj):
    """
    Recursively converts all float values in a dictionary/list to Decimal
    """
    if isinstance(obj, dict):
        return {key: convert_floats_to_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimals(element) for element in obj]
    elif isinstance(obj, float):
        return decimal.Decimal(str(obj))
    return obj
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_wrapped_from_dynamodb(unique_id: str):
    """
    Check if player's wrapped data exists in DynamoDB
    """
    try:
        dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        table = dynamodb.Table('rift-rewind-jay')
        
        response = table.get_item(
            Key={
                'unique_id': unique_id
            }
        )
        
        item = response.get('Item')
        if item:
            # Convert the item to JSON and back to handle Decimal conversion
            return json.loads(json.dumps(item, cls=DecimalEncoder))
        return None
    except Exception as e:
        print(f"Error retrieving from DynamoDB: {e}")
        return None

def store_wrapped_in_dynamodb(json_for_db: dict):
    """
    Store player's wrapped data in DynamoDB
    """
    try:
        dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
        table = dynamodb.Table('rift-rewind-jay')
        
        # Convert all float values to Decimal
        converted_data = convert_floats_to_decimals(json_for_db)
        
        table.put_item(Item=converted_data)
        print(f"Successfully stored data for {json_for_db['unique_id']}")
        return True
    except Exception as e:
        print(f"Error storing in DynamoDB: {e}")
        return False

# --- 4. Bedrock API Call Setup using Converse API ---
def generate_player_wrapped_json(
    player_data, name: str, tag: str, region: str, system_prompt=SYSTEM_PROMPT, tool_config=PLAYER_WRAPPED_SCHEMA
):
    """
    Invokes the Bedrock Claude model using Converse API with tool-use to enforce
    the JSON schema for the player wrapped data.

    Args:
        player_data: The raw player data to analyze
        name: Player's game name
        tag: Player's tag (e.g., NA1, KR1)
        region: Player's region (e.g., americas, asia)
        system_prompt: The system-level instructions for the model
        tool_config: The tool configuration with schema

    Returns:
        dict: A dictionary containing unique_id and wrapped_data
    """
    try:
        # Initialize Bedrock client with US region
        bedrock_client = boto3.client(service_name="bedrock-runtime", region_name="eu-north-1")

        # to use while testing
        model_id = "eu.anthropic.claude-haiku-4-5-20251001-v1:0"

        # good model =>
        # model_id = "eu.anthropic.claude-sonnet-4-5-20250929-v1:0"

        # Create the initial message from user with player data
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "text": f"""Please analyze this player data and generate a League of Legends Wrapped summary using the generate_player_wrapped tool.

Player Data:
{json.dumps(player_data, indent=2)}"""
                    }
                ],
            }
        ]

        print(f"Invoking Bedrock Model: {model_id}...")
        print(f"Region: eu-north-1")
        print(f"Using Converse API with tool configuration")

        # First call to the model
        response = bedrock_client.converse(
            modelId=model_id, messages=messages, system=system_prompt, toolConfig=tool_config
        )

        output_message = response["output"]["message"]
        messages.append(output_message)
        stop_reason = response["stopReason"]

        print(f"Stop reason: {stop_reason}")

        if stop_reason == "tool_use":
            # Tool use requested - extract the tool result
            tool_requests = response["output"]["message"]["content"]

            for tool_request in tool_requests:
                if "toolUse" in tool_request:
                    tool = tool_request["toolUse"]
                    print(f"Tool used: {tool['name']}")
                    print(f"Tool use ID: {tool['toolUseId']}")

                    if tool["name"] == "generate_player_wrapped":
                        # Extract the generated wrapped data
                        wrapped_data = tool["input"]

                        print("\n--- Bedrock Output (Tool Call Result) ---")
                        #print(json.dumps(wrapped_data, indent=2))
                        print("------------------------------------------")

                        # Create unique identifier by concatenating name, tag, and region
                        unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"
                        
                        # Create the final structure for DB storage
                        json_for_db = {
                            "unique_id": unique_id,
                            "wrapped_data": wrapped_data
                        }
                        print(json.dumps(json_for_db, indent=2))
                        return json_for_db

        elif stop_reason == "end_turn":
            # Model responded without using tool
            print("Model did not use the tool. Response:")
            for content in output_message["content"]:
                print(json.dumps(content, indent=2))
            return None

        else:
            print(f"Unexpected stop reason: {stop_reason}")
            print("Response:", json.dumps(response, indent=2))
            return None

    except ClientError as err:
        message = err.response["Error"]["Message"]
        print(f"A client error occurred: {message}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback

        traceback.print_exc()
        return None


# --- 4. Pre-flight Check ---
def check_aws_setup():
    """Verify AWS credentials and Bedrock access"""
    try:
        bedrock = boto3.client("bedrock-runtime", region_name="eu-north-1")
        print("✅ AWS credentials found")
        print("✅ Bedrock client initialized")
        return True
    except Exception as e:
        print(f"❌ AWS setup issue: {e}")
        print("\nPlease ensure:")
        print("1. AWS credentials are configured (AWS CLI or environment variables)")
        print("2. You have access to Amazon Bedrock")
        print("3. Claude 3 Haiku model is enabled in eu-north-1 region")
        return False
