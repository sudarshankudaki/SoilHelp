# SoilHelp — ML Backend Setup Guide

## 🗂️ Project Structure
```
backend/
├── main.py                  # FastAPI server
├── train_models.py          # Run this once to train models
├── start_server.bat         # Double-click to start server (Windows)
├── requirements.txt         # Python dependencies
├── .env                     # API keys (edit this)
├── model/
│   ├── predict.py           # CNN + NPK model definitions & inference
│   └── __init__.py
├── utils/
│   ├── vision_api.py        # Google Cloud Vision integration
│   ├── recommendations.py   # Crop & fertilizer logic
│   └── __init__.py
└── saved_models/            # Auto-created after training
    ├── soil_classifier.h5   # CNN model (requires dataset)
    ├── npk_regressor.pkl    # Random Forest NPK model
    └── npk_scaler.pkl
```

---

## ⚡ Quick Start (3 Steps)

### Step 1 — Install Dependencies
```powershell
cd d:\APP\SoilHelp\backend
pip install -r requirements.txt
```

### Step 2 — Train the NPK Model
```powershell
python train_models.py
```
> This takes ~30 seconds. Generates `saved_models/npk_regressor.pkl`

### Step 3 — Start the Server
```powershell
python main.py
# OR double-click start_server.bat
```
> Server runs at: **http://localhost:8000**  
> API docs at: **http://localhost:8000/docs**

---

## 📱 Connect React Native App

Find your PC's local IP address:
```powershell
ipconfig
# Look for: IPv4 Address . . . . . : 192.168.x.x
```

Then update `constants/ApiService.ts`:
```typescript
export const API_BASE_URL = "http://192.168.x.x:8000";
//                                    ^^^^^^^^^^^^
//                          Replace with your actual IP
```

> ⚠️ Use your **local network IP** (not `localhost`) when testing on a physical Android device.

---

## 🧠 Training the CNN Soil Classifier (Optional)

The NPK model works without images. But for accurate **soil type** detection, you need the CNN trained on real soil images.

### Get Dataset
Download from Kaggle:  
👉 https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset

Extract and organize as:
```
backend/data/soil_images/
    Sandy/   (≥100 images)
    Clay/    (≥100 images)
    Loam/    (≥100 images)
    Black/   (≥100 images)
    Red/     (≥100 images)
```

### Train
```powershell
python train_models.py --soil-data ./data/soil_images
```
> Training takes 10–30 minutes depending on GPU/CPU.

---

## ☁️ Google Cloud Vision API (Optional)

Adds image validation — checks if the uploaded image is actually soil.

1. Go to https://console.cloud.google.com/
2. Create a project → Enable **Cloud Vision API**
3. Generate an **API Key**
4. Add to `.env`:
```
GOOGLE_CLOUD_API_KEY=AIza...your-key-here
```

> ✅ Without a key, the app still works — it uses a fallback response.

---

## 🔬 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server status |
| POST | `/analyze` | Analyse soil image |

### Example `/analyze` Response
```json
{
  "soil_type": "Loam",
  "soil_confidence": 87.4,
  "nutrients": {
    "nitrogen":   { "value": 0.38, "unit": "%" },
    "phosphorus": { "value": 22.1, "unit": "ppm" },
    "potassium":  { "value": 195.0, "unit": "ppm" },
    "ph":         { "value": 6.8, "unit": "" }
  },
  "recommended_crops": [
    { "name": "Cotton", "icon": "🌿", "season": "Kharif", "water": "Medium" }
  ],
  "fertilizer_advice": ["✅ NPK levels are balanced"],
  "ph_advice": "🟢 Neutral pH — Ideal for most Indian crops"
}
```
