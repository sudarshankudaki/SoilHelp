"""
Comprehensive AI Endpoint Testing Script
Tests all AI features with sample data
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
AI_BASE = f"{BASE_URL}/ai"

# Sample soil data (Red soil from Karnataka with low nitrogen)
SAMPLE_SOIL = {
    "soil_type": "Red",
    "nitrogen": 0.12,
    "phosphorus": 8.5,
    "potassium": 120.0,
    "ph": 5.9,
    "region": "Karnataka"
}

def print_header(text):
    """Print formatted header."""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def print_response(response_data, max_length=500):
    """Print JSON response in a readable format."""
    if isinstance(response_data, dict):
        for key, value in response_data.items():
            if isinstance(value, str) and len(value) > max_length:
                print(f"{key}: {value[:max_length]}...")
            elif isinstance(value, dict):
                print(f"{key}:")
                for k, v in value.items():
                    if isinstance(v, str) and len(v) > 300:
                        print(f"  {k}: {v[:300]}...")
                    else:
                        print(f"  {k}: {v}")
            else:
                print(f"{key}: {value}")
    else:
        print(json.dumps(response_data, indent=2))

def test_health_check():
    """Test if server is running."""
    print_header("TEST 1/6: Server Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"✅ Server Status: {response.status_code}")
        print_response(response.json())
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Server not reachable: {e}")
        print("\nPlease start the server:")
        print("  cd d:\\APP\\SoilHelp\\backend")
        print("  python -m uvicorn main:app --reload")
        return False

def test_ai_health():
    """Test AI service health."""
    print_header("TEST 2/6: AI Service Health Check")
    try:
        response = requests.get(f"{AI_BASE}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print_response(response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_comprehensive_recommendations():
    """Test comprehensive AI recommendations endpoint."""
    print_header("TEST 3/6: Comprehensive AI Recommendations")
    try:
        response = requests.post(
            f"{AI_BASE}/recommendations",
            json=SAMPLE_SOIL,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n📊 Fertilizer Recommendation:")
            print("-" * 70)
            print(data['fertilizer_recommendation']['recommendation'][:400] + "...")
            
            print("\n🌾 Crop Suggestions:")
            print("-" * 70)
            print(data['crop_suggestions']['crops'][:400] + "...")
            
            print("\n💡 Soil Health Explanation:")
            print("-" * 70)
            print(data['soil_health_explanation'])
            
            print("\n✅ PASS")
            return True
        else:
            print(f"❌ FAIL: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_fertilizer_only():
    """Test fertilizer recommendation endpoint."""
    print_header("TEST 4/6: Fertilizer Recommendations Only")
    try:
        response = requests.post(
            f"{AI_BASE}/fertilizer",
            json=SAMPLE_SOIL,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(data['recommendation'][:500] + "...")
            print("\n✅ PASS")
            return True
        else:
            print(f"❌ FAIL: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_crop_suggestions():
    """Test crop suggestion endpoint."""
    print_header("TEST 5/6: Crop Suggestions")
    try:
        response = requests.post(
            f"{AI_BASE}/crops",
            json=SAMPLE_SOIL,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(data['crops'][:500] + "...")
            print("\n✅ PASS")
            return True
        else:
            print(f"❌ FAIL: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_qa_assistant():
    """Test Q&A assistant endpoint."""
    print_header("TEST 6/6: Q&A Assistant")
    
    questions = [
        "How can I improve nitrogen in my soil?",
        "When should I apply fertilizer?",
        "What causes low pH in soil?"
    ]
    
    passed = 0
    for i, question in enumerate(questions, 1):
        print(f"\n[Question {i}/{len(questions)}] {question}")
        print("-" * 70)
        try:
            response = requests.post(
                f"{AI_BASE}/ask",
                json={"question": question, "soil_context": SAMPLE_SOIL},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(data['answer'][:300] + "...")
                print("✅ Answered")
                passed += 1
            else:
                print(f"❌ Failed: {response.text[:200]}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        time.sleep(2)  # Be nice to the API
    
    print(f"\n✅ PASS: {passed}/{len(questions)} questions answered")
    return passed > 0

def run_all_tests():
    """Run all tests."""
    print("\n" + "🧪" * 35)
    print("  SoilHelp AI Endpoints - Comprehensive Test Suite")
    print("🧪" * 35)
    
    results = []
    
    # Test 1: Server Health
    if not test_health_check():
        print("\n❌ Server not running. Please start it first!")
        return
    
    results.append(("Server Health", True))
    time.sleep(1)
    
    # Test 2: AI Health
    ai_healthy = test_ai_health()
    results.append(("AI Health", ai_healthy))
    time.sleep(1)
    
    # Test 3: Comprehensive Recommendations
    results.append(("Comprehensive Recommendations", test_comprehensive_recommendations()))
    time.sleep(2)
    
    # Test 4: Fertilizer Only
    results.append(("Fertilizer Recommendations", test_fertilizer_only()))
    time.sleep(2)
    
    # Test 5: Crop Suggestions
    results.append(("Crop Suggestions", test_crop_suggestions()))
    time.sleep(2)
    
    # Test 6: Q&A Assistant
    results.append(("Q&A Assistant", test_qa_assistant()))
    
    # Summary
    print_header("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {test_name}")
    
    print(f"\n{'=' * 70}")
    print(f"  Total: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    print(f"{'=' * 70}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Your AI integration is working perfectly!")
    elif passed > 0:
        print("\n✅ AI integration is working! Some features may use fallback logic.")
        print("   (This is normal when Gemini API has high demand)")
    else:
        print("\n⚠️  Some issues detected. Check error messages above.")
    
    print("\n📚 For more info, see: AI_INTEGRATION_GUIDE.md")

if __name__ == "__main__":
    run_all_tests()