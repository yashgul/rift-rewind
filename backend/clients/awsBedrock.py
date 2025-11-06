import json
import boto3
from botocore.exceptions import ClientError
from constants import PLAYER_WRAPPED_SCHEMA, SYSTEM_PROMPT


# --- 3. DynamoDB Operations ---
import decimal
import json
import os
import boto3


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
        # Get AWS credentials from environment variables
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        aws_region = os.getenv("AWS_REGION", "eu-north-1")

        if not all([aws_access_key_id, aws_secret_access_key]):
            raise Exception("AWS credentials not found in environment variables")

        # Create a new session with our credentials
        session = boto3.Session(
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
        )

        # Use the session to create the DynamoDB resource
        dynamodb = session.resource("dynamodb")
        table = dynamodb.Table("rift-rewind-jay")

        response = table.get_item(Key={"unique_id": unique_id})

        item = response.get("Item")
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
        # Get AWS credentials from environment variables
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        aws_region = os.getenv("AWS_REGION", "eu-north-1")

        if not all([aws_access_key_id, aws_secret_access_key]):
            raise Exception("AWS credentials not found in environment variables")

        # Create a new session with our credentials
        session = boto3.Session(
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
        )

        # Use the session to create the DynamoDB resource
        dynamodb = session.resource("dynamodb")
        table = dynamodb.Table("rift-rewind-jay")

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
    player_data,
    name: str,
    tag: str,
    region: str,
    system_prompt=SYSTEM_PROMPT,
    tool_config=PLAYER_WRAPPED_SCHEMA,
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
        # Get AWS credentials from environment variables
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        aws_region = os.getenv("AWS_REGION", "eu-north-1")

        if not all([aws_access_key_id, aws_secret_access_key]):
            raise Exception("AWS credentials not found in environment variables")

        # Create a new session with our credentials
        session = boto3.Session(
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
        )

        # Use the session to create the Bedrock client
        bedrock_client = session.client("bedrock-runtime")

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
                        # print(json.dumps(wrapped_data, indent=2))
                        print("------------------------------------------")

                        # Create unique identifier by concatenating name, tag, and region
                        unique_id = f"{name.lower()}_{tag.lower()}_{region.lower()}"

                        # Create the final structure for DB storage
                        json_for_db = {"unique_id": unique_id, "wrapped_data": wrapped_data}
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
