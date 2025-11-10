"""
Helper module for fetching and caching Riot Data Dragon item data.
"""
import requests
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Cache for item data to avoid repeated API calls
_item_cache: Optional[Dict] = None
_current_version = "14.23.1"  # Update this periodically or fetch dynamically


def get_latest_version() -> str:
    """Fetch the latest Data Dragon version."""
    try:
        response = requests.get("https://ddragon.leagueoflegends.com/api/versions.json", timeout=5)
        response.raise_for_status()
        versions = response.json()
        return versions[0] if versions else _current_version
    except Exception as e:
        logger.warning(f"Failed to fetch latest version, using {_current_version}: {e}")
        return _current_version


def load_item_data(version: Optional[str] = None) -> Dict:
    """
    Load item data from Data Dragon CDN.
    Returns a dictionary mapping item IDs to item details.
    """
    global _item_cache
    
    if _item_cache is not None:
        return _item_cache
    
    if version is None:
        version = _current_version
    
    try:
        url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/item.json"
        logger.info(f"Fetching item data from: {url}")
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        _item_cache = data.get("data", {})
        
        logger.info(f"Loaded {len(_item_cache)} items from Data Dragon")
        return _item_cache
        
    except Exception as e:
        logger.error(f"Failed to load item data: {e}")
        return {}


def get_item_name(item_id: int) -> Optional[str]:
    """
    Get item name from item ID.
    Returns None if item ID is 0 (no item) or not found.
    """
    if item_id == 0 or item_id is None:
        return None
    
    item_data = load_item_data()
    item_str = str(item_id)
    
    if item_str in item_data:
        return item_data[item_str].get("name")
    
    logger.warning(f"Item ID {item_id} not found in Data Dragon")
    return None


def get_item_image_url(item_id: int, version: Optional[str] = None) -> Optional[str]:
    """
    Get item image URL from item ID.
    Returns None if item ID is 0 or not found.
    """
    if item_id == 0 or item_id is None:
        return None
    
    if version is None:
        version = _current_version
    
    return f"https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{item_id}.png"
