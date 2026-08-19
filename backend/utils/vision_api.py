"""
SoilHelp - Google Cloud Vision API Integration
Uses Vision API to:
  1. Validate that the image is soil (not random objects)
  2. Extract dominant colors for soil type hints
  3. Check image quality
"""

import os
import base64
from typing import Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY", "")
VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"


async def analyze_with_vision_api(image_bytes: bytes) -> Dict[str, Any]:
    """
    Send image to Google Cloud Vision API and return:
    - dominant colors (for soil type cross-check)
    - image labels (to validate it's soil)
    - confidence score
    """
    if not GOOGLE_API_KEY:
        # Return mock data if no API key configured
        return _mock_vision_response()

    # Encode image to base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "requests": [
            {
                "image": {"content": image_b64},
                "features": [
                    {"type": "LABEL_DETECTION", "maxResults": 10},
                    {"type": "IMAGE_PROPERTIES"},
                    {"type": "SAFE_SEARCH_DETECTION"},
                ],
            }
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{VISION_API_URL}-key={GOOGLE_API_KEY}",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return _parse_vision_response(data)
    except Exception as e:
        print(f"[Vision API] Error: {e}")
        return _mock_vision_response()


def _parse_vision_response(data: Dict) -> Dict[str, Any]:
    result = data.get("responses", [{}])[0]

    # Extract labels
    labels = [
        label["description"].lower()
        for label in result.get("labelAnnotations", [])
    ]

    # Check if it looks like soil/earth
    soil_keywords = {"soil", "earth", "dirt", "ground", "mud", "clay", "sand", "land"}
    is_soil = any(kw in labels for kw in soil_keywords)
    confidence = 0.85 if is_soil else 0.45

    # Extract dominant color
    colors = result.get("imagePropertiesAnnotation", {}).get("dominantColors", {}).get("colors", [])
    dominant_color = None
    if colors:
        top = colors[0]["color"]
        dominant_color = {
            "r": int(top.get("red", 0)),
            "g": int(top.get("green", 0)),
            "b": int(top.get("blue", 0)),
        }

    # Infer soil hint from color
    soil_color_hint = _color_to_soil_hint(dominant_color)

    return {
        "is_valid_soil_image": is_soil,
        "confidence": confidence,
        "labels": labels[:5],
        "dominant_color": dominant_color,
        "soil_color_hint": soil_color_hint,
    }


def _color_to_soil_hint(color: Optional[Dict]) -> str:
    """Estimate soil type from dominant RGB color."""
    if not color:
        return "Loam"

    r, g, b = color["r"], color["g"], color["b"]

    # Dark/black soil
    if r < 60 and g < 60 and b < 60:
        return "Black"
    # Reddish soil
    if r > 150 and g < 100 and b < 80:
        return "Red"
    # Sandy / light brown
    if r > 180 and g > 150 and b < 120:
        return "Sandy"
    # Greyish clay
    if abs(r - g) < 20 and abs(g - b) < 20 and r < 150:
        return "Clay"
    # Default loam
    return "Loam"


def _mock_vision_response() -> Dict[str, Any]:
    """Fallback mock when API key is not set."""
    return {
        "is_valid_soil_image": True,
        "confidence": 0.78,
        "labels": ["soil", "earth", "ground", "agriculture", "land"],
        "dominant_color": {"r": 120, "g": 85, "b": 55},
        "soil_color_hint": "Loam",
    }
