"""
Gemini API Integration for SoilHelp
Using google-genai SDK (2026)
"""
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def get_gemini_api_key() -> str:
    """Get Gemini API key from environment variables."""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key or api_key == 'your_gemini_api_key_here':
        raise ValueError(
            "Gemini API key not configured! "
            "Please set GEMINI_API_KEY in backend/.env file."
        )
    
    return api_key

def get_gemini_client():
    """Get configured Gemini client."""
    from google import genai
    
    api_key = get_gemini_api_key()
    return genai.Client(api_key=api_key)

# Recommended models (in order of preference)
GEMINI_MODELS = [
    'gemini-3.5-flash',      # Fast and efficient
    'gemini-3.6-flash',      # Good balance
    'gemini-2.5-flash',      # Fallback
]

def generate_content(prompt: str, model: str = None):
    """
    Generate content using Gemini API.
    
    Args:
        prompt: The text prompt
        model: Model name (uses default if None)
    
    Returns:
        Generated text response
    """
    client = get_gemini_client()
    model_name = model or GEMINI_MODELS[0]
    
    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    
    return response.text