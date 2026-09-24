"""
Quick test to verify Gemini API key is configured correctly
Run this after adding your key to .env file
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from gemini_config import get_gemini_api_key, test_gemini_connection
    
    print("\n" + "=" * 70)
    print("  Testing Gemini API Configuration")
    print("=" * 70 + "\n")
    
    # Test 1: Check if key is configured
    print("[1/2] Checking if API key is configured...")
    try:
        api_key = get_gemini_api_key()
        print(f"✅ API key found: {api_key[:10]}...{api_key[-4:]}")
    except ValueError as e:
        print(f"❌ {e}")
        print("\nPlease:")
        print("1. Go to https://aistudio.google.com/apikey")
        print("2. Create a new API key")
        print("3. Add it to backend/.env file")
        sys.exit(1)
    
    # Test 2: Test API connection
    print("\n[2/2] Testing API connection...")
    success = test_gemini_connection()
    
    if success:
        print("\n" + "=" * 70)
        print("  ✅ ALL TESTS PASSED - Gemini API Ready!")
        print("=" * 70)
    else:
        print("\n" + "=" * 70)
        print("  ❌ API Connection Failed")
        print("=" * 70)
        sys.exit(1)
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nMake sure google-generativeai is installed:")
    print("  pip install google-generativeai")
    sys.exit(1)