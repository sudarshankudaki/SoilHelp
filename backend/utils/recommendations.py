"""
SoilHelp - Crop Recommendation Engine
Maps soil type + NPK + pH - recommended crops + fertilizer advice
"""

from typing import List, Dict, Any

# General National Crop Database
CROP_DB: Dict[str, List[Dict[str, Any]]] = {
    "Sandy": [
        {"name": "Peanut",     "icon": "🥜", "season": "Kharif",  "water": "Low"},
        {"name": "Watermelon", "icon": "🍉", "season": "Summer",  "water": "Medium"},
        {"name": "Cashew",     "icon": "🥜", "season": "Annual",  "water": "Low"},
        {"name": "Sweet Potato","icon": "🍠","season": "Rabi",    "water": "Low"},
        {"name": "Carrot",     "icon": "🥕", "season": "Winter",  "water": "Medium"},
    ],
    "Clay": [
        {"name": "Rice",       "icon": "🌾", "season": "Kharif",  "water": "High"},
        {"name": "Wheat",      "icon": "🌾", "season": "Rabi",    "water": "Medium"},
        {"name": "Sugarcane",  "icon": "🌱", "season": "Annual",  "water": "High"},
        {"name": "Mustard",    "icon": "🌱", "season": "Rabi",    "water": "Low"},
    ],
    "Loam": [
        {"name": "Cotton",     "icon": "☁️", "season": "Kharif",  "water": "Medium"},
        {"name": "Maize",      "icon": "🌽", "season": "Kharif",  "water": "Medium"},
        {"name": "Tomato",     "icon": "🍅", "season": "Annual",  "water": "Medium"},
        {"name": "Soybean",    "icon": "🌱", "season": "Kharif",  "water": "Medium"},
        {"name": "Onion",      "icon": "🧅", "season": "Rabi",    "water": "Low"},
    ],
    "Black": [
        {"name": "Soybean",    "icon": "🌱", "season": "Kharif",  "water": "Medium"},
        {"name": "Sorghum",    "icon": "🌾", "season": "Kharif",  "water": "Low"},
        {"name": "Cotton",     "icon": "☁️", "season": "Kharif",  "water": "Medium"},
        {"name": "Chickpea",   "icon": "🌱", "season": "Rabi",    "water": "Low"},
    ],
    "Red": [
        {"name": "Groundnut",  "icon": "🥜", "season": "Kharif",  "water": "Low"},
        {"name": "Pearl Millet","icon": "🌾","season": "Kharif",  "water": "Low"},
        {"name": "Finger Millet","icon": "🌾","season": "Kharif", "water": "Low"},
        {"name": "Tobacco",    "icon": "🍂", "season": "Annual",  "water": "Low"},
    ],
}

# State-Specific Crop Databases (for regional accuracy)
STATE_CROP_DBS: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "Karnataka": {
        "Sandy": [
            {"name": "Coconut / Tengu (ತೆಂಗು)", "icon": "🥥", "season": "Annual", "water": "Medium"},
            {"name": "Cashew / Geru (ಗೇರು)", "icon": "🥜", "season": "Annual", "water": "Low"},
            {"name": "Groundnut / Shenga (ಶೇಂಗಾ)", "icon": "🥜", "season": "Kharif", "water": "Low"},
            {"name": "Sweet Potato / Genasu (ಗೆಣಸು)", "icon": "🍠", "season": "Rabi", "water": "Low"},
        ],
        "Clay": [
            {"name": "Paddy / Rice (ಭತ್ತ)", "icon": "🌾", "season": "Kharif", "water": "High"},
            {"name": "Sugarcane / Kabbu (ಕಬ್ಬು)", "icon": "🌱", "season": "Annual", "water": "High"},
            {"name": "Arecanut / Adike (ಅಡಿಕೆ)", "icon": "🌴", "season": "Annual", "water": "High"},
            {"name": "Banana / Baale (ಬಾಳೆ)", "icon": "🍌", "season": "Annual", "water": "High"},
        ],
        "Loam": [
            {"name": "Maize / Mekke Jola (ಮೆಕ್ಕೆಜೋಳ)", "icon": "🌽", "season": "Kharif", "water": "Medium"},
            {"name": "Ginger / Shunti (ಶುಂಠಿ)", "icon": "🌱", "season": "Kharif", "water": "Medium"},
            {"name": "Tomato / Tomato (ಟೊಮೆಟೊ)", "icon": "🍅", "season": "Annual", "water": "Medium"},
            {"name": "Arecanut / Adike (ಅಡಿಕೆ)", "icon": "🌴", "season": "Annual", "water": "High"},
        ],
        "Black": [
            {"name": "Cotton / Hatti (ಹತ್ತಿ)", "icon": "☁️", "season": "Kharif", "water": "Medium"},
            {"name": "Sorghum / Jowar (ಜೋಳ)", "icon": "🌾", "season": "Kharif", "water": "Low"},
            {"name": "Chickpea / Kadale (ಕಡಲೆ)", "icon": "🌱", "season": "Rabi", "water": "Low"},
            {"name": "Sunflower / Suryakanthi (ಸೂರ್ಯಕಾಂತಿ)", "icon": "🌻", "season": "Kharif", "water": "Medium"},
        ],
        "Red": [
            {"name": "Finger Millet / Ragi (ರಾಗಿ)", "icon": "🌾", "season": "Kharif", "water": "Low"},
            {"name": "Groundnut / Shenga (ಶೇಂಗಾ)", "icon": "🥜", "season": "Kharif", "water": "Low"},
            {"name": "Red Gram / Togari (ತೊಗರಿ)", "icon": "🌱", "season": "Kharif", "water": "Low"},
            {"name": "Tobacco / Tambaku (ತಂಬಾಕು)", "icon": "🍂", "season": "Kharif", "water": "Low"},
        ]
    }
}

# Fertilizer advice based on NPK deficiency
# Thresholds updated to match Karnataka ICAR district survey data
def get_fertilizer_advice(n: float, p: float, k: float, soil_type: str = None) -> list:
    advice = []

    # ── Nitrogen ──────────────────────────────────────────────────────────────
    if n < 0.15:
        advice.append("❗ Very Low Nitrogen — Apply Urea (46-0-0) at 100 kg/ha or DAP as basal dose")
    elif n < 0.20:
        advice.append("⚠️ Low Nitrogen — Apply Urea (46-0-0) at 50–75 kg/ha; split into 2 doses")
    elif n <= 0.40:
        advice.append("✅ Nitrogen is adequate for most Karnataka crops")
    else:
        advice.append("🔺 High Nitrogen — Reduce N fertilizer; risk of lodging and leaching")

    # ── Phosphorus ────────────────────────────────────────────────────────────
    if p < 10:
        advice.append("❗ Very Low Phosphorus — Apply DAP or SSP at 100–150 kg/ha as basal")
    elif p < 15:
        advice.append("⚠️ Low Phosphorus — Apply SSP (Single Super Phosphate) at 75 kg/ha")
    elif p <= 28:
        advice.append("✅ Phosphorus is adequate")
    else:
        advice.append("🔺 High Phosphorus — Skip P fertilizer this season to avoid fixation")

    # ── Potassium ─────────────────────────────────────────────────────────────
    if k < 100:
        advice.append("❗ Very Low Potassium — Apply MOP (Muriate of Potash) at 75–100 kg/ha")
    elif k < 140:
        advice.append("⚠️ Low Potassium — Apply MOP at 50 kg/ha; critical for boll/pod development")
    elif k <= 250:
        advice.append("✅ Potassium level is good")
    else:
        advice.append("🔺 Excess Potassium — Withhold K; excess K can antagonise Mg and Ca uptake")

    # ── Karnataka-specific micronutrient advisory by soil type ─────────────────
    ka_micro = {
        "Black":  "💡 Black soil tip: Apply Zinc Sulphate 25 kg/ha — Zn deficiency common in Vertisols of North Karnataka",
        "Red":    "💡 Red soil tip: Apply Borax 10 kg/ha + FeSO₄ — Fe and B deficiency common in laterite soils of South Karnataka",
        "Sandy":  "💡 Sandy soil tip: Use slow-release urea + split K doses — high leaching in Tumkur/Chitradurga sandy tracts",
        "Clay":   "💡 Clay soil tip: Apply Gypsum 200 kg/ha for Ca and S; improves structure in coastal/Malnad soils",
        "Loam":   "💡 Loam soil tip: Balanced NPK with organic matter (FYM 5 t/ha) maintains the fertile Hassan-Mysuru alluvial belt",
    }
    if soil_type and soil_type in ka_micro:
        advice.append(ka_micro[soil_type])

    if len(advice) == 0:
        advice.append("✅ NPK levels are well balanced — minimal fertilizer needed this season")

    return advice


def get_ph_advice(ph: float) -> str:
    if ph < 5.5:
        return "- Highly acidic - Add agricultural lime to raise pH"
    elif ph < 6.5:
        return "- Slightly acidic - Suitable for most crops"
    elif ph <= 7.5:
        return "- Neutral pH - Ideal for most Indian crops"
    elif ph <= 8.5:
        return "- Slightly alkaline - Add gypsum or sulfur to lower pH"
    else:
        return "- Highly alkaline - Requires soil amendment before cultivation"


def get_recommendations(soil_type: str, n: float, p: float, k: float, ph: float, state: str = "Karnataka") -> Dict[str, Any]:
    # Select state-specific database if available, fallback to general CROP_DB
    state_db = STATE_CROP_DBS.get(state, CROP_DB)
    crops = state_db.get(soil_type, state_db.get("Loam", CROP_DB["Loam"]))

    # Pass soil_type for Karnataka-specific micronutrient tips
    fertilizer = get_fertilizer_advice(n, p, k, soil_type=soil_type)
    ph_advice = get_ph_advice(ph)

    # Pick clean names for summary text (remove Kannada script from summary for better read-flow)
    crop_names = []
    for c in crops[:3]:
        name_clean = c["name"].split("/")[0].strip()
        crop_names.append(name_clean)

    return {
        "crops": crops,
        "fertilizer_advice": fertilizer,
        "ph_advice": ph_advice,
        "summary": f"Your {soil_type} soil in {state} is best suited for {', '.join(crop_names)}.",
    }

