"""
SoilHelp - FastAPI Backend
Main server: receives soil image, runs ML analysis, returns JSON results
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import time

from model.predict import predict, load_models
from utils.vision_api import analyze_with_vision_api
from utils.recommendations import get_recommendations


# -- Startup: load models once -------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("- SoilHelp Backend starting...")
    load_models()
    print("- Models loaded. Server ready!")
    yield
    print("- Shutting down...")


app = FastAPI(
    title="SoilHelp API",
    description="AI-powered soil analysis for Indian farmers",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow requests from React Native / Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# GET /health  - Health check
# -----------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "service": "SoilHelp API", "version": "1.0.0"}


# -----------------------------------------------------------------------------
# POST /analyze  - Main soil analysis endpoint
# -----------------------------------------------------------------------------
@app.post("/analyze")
async def analyze_soil(
    file: UploadFile = File(...),
    state: str = Form("Karnataka"),
    texture: str = Form("Loam"),
    moisture_pct: float = Form(28.0),
    organic_carbon_pct: float = Form(1.2),
    ec_ds_m: float = Form(1.5),
    temperature_c: float = Form(28.0),
    rainfall_mm: float = Form(750.0),
    ph: float = Form(6.5),
    slope: float = Form(0.5),
    water_logging: float = Form(0.0),
):
    """
    Accepts a soil image (JPG/PNG), runs:
      1. Google Cloud Vision API - image validation + dominant color
      2. Custom CNN - soil type classification
      3. NPK Regressor - nutrient + pH prediction
      4. Recommendation Engine - crops + fertilizer advice

    Returns full analysis as JSON.
    """
    start = time.time()

    # Read image bytes
    image_bytes = await file.read()
    if len(image_bytes) > 20 * 1024 * 1024:  # 20 MB limit
        raise HTTPException(status_code=400, detail="Image too large. Max 20MB.")

    # Validate that image bytes can be opened by PIL
    try:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Please upload a valid JPG or PNG image."
        )

    soil_features = {
        "texture": texture,
        "moisture_pct": moisture_pct,
        "organic_carbon_pct": organic_carbon_pct,
        "ec_ds_m": ec_ds_m,
        "temperature_c": temperature_c,
        "rainfall_mm": rainfall_mm,
        "ph": ph,
        "slope": slope,
        "water_logging": water_logging,
    }

    # -- Step 1: Google Cloud Vision API --------------------------------------
    vision_result = await analyze_with_vision_api(image_bytes)

    # Warn if image doesn't look like soil (but don't block)
    if not vision_result["is_valid_soil_image"]:
        print(f"[--] Vision API: image may not be soil. Labels: {vision_result['labels']}")

    # -- Step 2 & 3: ML Model Inference ---------------------------------------
    ml_result = predict(
        image_bytes,
        vision_hint=vision_result["soil_color_hint"],
        soil_features=soil_features,
    )

    # Blend soil type: if vision confidence is high, weight its hint
    soil_type = ml_result["soil_type"]
    soil_confidence = ml_result["soil_confidence"]

    nutrients = ml_result["nutrients"]
    N  = nutrients["nitrogen"]["value"]
    P  = nutrients["phosphorus"]["value"]
    K  = nutrients["potassium"]["value"]
    pH = nutrients["ph"]["value"]

    # -- Step 4: Crop Recommendations -----------------------------------------
    recs = get_recommendations(soil_type, N, P, K, pH, state)

    elapsed = round(time.time() - start, 2)

    # -- Final Response --------------------------------------------------------
    return JSONResponse({
        "success": True,
        "analysis_time_seconds": elapsed,

        # Soil Classification
        "soil_type": soil_type,
        "soil_confidence": soil_confidence,
        "all_probabilities": ml_result["all_probabilities"],

        # Nutrients
        "nutrients": {
            "nitrogen":   {"value": N,  "unit": "%",   "label": "Nitrogen (N)",   "optimal_min": 0.20, "optimal_max": 0.50},
            "phosphorus": {"value": P,  "unit": "ppm", "label": "Phosphorus (P)", "optimal_min": 15.0, "optimal_max": 30.0},
            "potassium":  {"value": K,  "unit": "ppm", "label": "Potassium (K)",  "optimal_min": 140.0,"optimal_max": 250.0},
            "ph":         {"value": pH, "unit": "",    "label": "Soil pH",         "optimal_min": 6.0,  "optimal_max": 7.5},
        },

        # Recommendations
        "recommended_crops": recs["crops"],
        "fertilizer_advice": recs["fertilizer_advice"],
        "ph_advice": recs["ph_advice"],
        "summary": recs["summary"],

        # Vision API metadata
        "image_validation": {
            "is_valid": vision_result["is_valid_soil_image"],
            "confidence": vision_result["confidence"],
            "labels": vision_result["labels"],
        },
    })


# -----------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
