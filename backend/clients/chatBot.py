import boto3
from botocore.exceptions import ClientError
from constants import CHATBOT_SYSTEM_PROMPT
import os
import logging
import json

# Configure logging
logger = logging.getLogger(__name__)

# Configuration
MAX_TOKENS = 512
MODEL_ID = "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
MAX_CONTEXT_TOKENS = 3000
CHARS_PER_TOKEN = 4


def estimate_tokens(messages):
    """
    Estimate the number of tokens in the conversation.
    This is a rough approximation: ~4 characters per token for English.
    """
    total_chars = 0
    for msg in messages:
        total_chars += len(msg["content"][0]["text"])
    return total_chars // CHARS_PER_TOKEN


def trim_conversation(messages, max_tokens):
    """
    Trim the conversation to stay within token limits.
    Removes oldest messages first, but always keeps at least the last message.
    """
    while len(messages) > 1 and estimate_tokens(messages) > max_tokens:
        messages.pop(0)
        logger.info("Trimmed old message to stay within token limit")
    return messages


def get_chatbot_response(stats, conversation, system_prompt=CHATBOT_SYSTEM_PROMPT):
    """
    Send conversation and player stats to the chatbot and get a response.

    Args:
        stats (dict): Dictionary containing player statistics
        conversation (list): List of message dictionaries with 'role' and 'content'
        system_prompt (str): System prompt for the chatbot (optional)

    Returns:
        dict: Response containing 'success', 'response_text', 'conversation', and optional 'error'
        Example success: {
            'success': True,
            'response_text': 'The bot response',
            'conversation': [...updated conversation...],
            'token_usage': {'input': 123, 'output': 45, 'total': 168}
        }
        Example error: {
            'success': False,
            'error': 'Error message',
            'conversation': [...original conversation...]
        }
    """
    try:
        # Trim conversation if it exceeds token limit
        trimmed_conversation = trim_conversation(conversation.copy(), MAX_CONTEXT_TOKENS)

        # Append stats to system prompt
        stats_json = json.dumps(stats, indent=2)
        enhanced_system_prompt = f"{system_prompt}\n\nCurrent player statistics:\n{stats_json}"

        # Display current token usage
        current_tokens = estimate_tokens(trimmed_conversation)
        logger.info(f"Context: ~{current_tokens} tokens")

        # Initialize AWS client
        aws_region = os.getenv("AWS_REGION", "eu-north-1")
        client = boto3.client("bedrock-runtime", region_name=aws_region)

        # Send the message to the model
        response = client.converse(
            modelId=MODEL_ID,
            messages=trimmed_conversation,
            system=[{"text": enhanced_system_prompt}],
            inferenceConfig={"maxTokens": MAX_TOKENS, "temperature": 0.5},
            additionalModelRequestFields={},
        )

        # Extract response text
        response_text = response["output"]["message"]["content"][0]["text"]

        # Add assistant response to conversation
        trimmed_conversation.append({"role": "assistant", "content": [{"text": response_text}]})

        # Get token usage info
        usage = response.get("usage", {})
        token_usage = {
            "input": usage.get("inputTokens", 0),
            "output": usage.get("outputTokens", 0),
            "total": usage.get("totalTokens", 0),
        }

        logger.info(
            f"Token usage - Input: {token_usage['input']}, Output: {token_usage['output']}, Total: {token_usage['total']}"
        )

        return {
            "success": True,
            "response_text": response_text,
            "conversation": trimmed_conversation,
            "token_usage": token_usage,
        }

    except ClientError as e:
        error_msg = f"AWS ClientError: {e}"
        logger.error(error_msg)
        return {"success": False, "error": error_msg, "conversation": conversation}

    except Exception as e:
        error_msg = f"Unexpected error: {e}"
        logger.exception(error_msg)
        return {"success": False, "error": error_msg, "conversation": conversation}
