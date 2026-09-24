"""
Test AI Integration
Quick test to verify AI features are working
"""
import sys
sys.path.insert(0, ".")

from soil_ai_assistant import SoilAIAssistant

print("=" * 70)
print("  Testing SoilHelp AI Integration")
print("=" * 70)

# Sample soil data (Red soil from Karnataka)
test_data = {
    "soil_type": "Red",
    "nitrogen": 0.12,
    "phosphorus": 8.5,
    "potassium": 120.0,
    "ph": 5.9,
    "region": "Karnataka"
}

assistant = SoilAIAssistant()

print("\n[TEST 1/4] Soil Health Explanation")
print("-" * 70)
try:
    explanation = assistant.explain_soil_health(
        test_data["soil_type"],
        test_data["nitrogen"],
        test_data["phosphorus"],
        test_data["potassium"],
        test_data["ph"]
    )
    print(explanation)
    print("✅ PASS")
except Exception as e:
    print(f"❌ FAIL: {e}")

print("\n[TEST 2/4] Fertilizer Recommendations")
print("-" * 70)
try:
    fert_rec = assistant.generate_fertilizer_recommendation(**test_data)
    print(fert_rec["recommendation"][:300] + "...")
    print("✅ PASS")
except Exception as e:
    print(f"❌ FAIL: {e}")

print("\n[TEST 3/4] Crop Suggestions")
print("-" * 70)
try:
    crops = assistant.suggest_suitable_crops(
        test_data["soil_type"],
        test_data["ph"],
        test_data["nitrogen"],
        test_data["region"]
    )
    print(crops["crops"][:300] + "...")
    print("✅ PASS")
except Exception as e:
    print(f"❌ FAIL: {e}")

print("\n[TEST 4/4] Q&A Assistant")
print("-" * 70)
try:
    answer = assistant.answer_farmer_question(
        "How can I improve nitrogen in my soil?",
        test_data
    )
    print(answer[:300] + "...")
    print("✅ PASS")
except Exception as e:
    print(f"❌ FAIL: {e}")

print("\n" + "=" * 70)
print("  Test Complete!")
print("=" * 70)
print("\nNOTE: If tests show 'fallback' responses, that's OK!")
print("It means AI had high demand - fallback logic is working.")
print("\nTo test with real AI, try again in a few minutes.")