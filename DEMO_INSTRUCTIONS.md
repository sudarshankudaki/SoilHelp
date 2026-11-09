# SoilHelp - Demo Instructions

## Quick Start (For Tomorrow's Presentation)

### Option 1: Use the Startup Script
1. **Double-click `START_PROJECT.bat`**
2. Wait 10-15 seconds for both windows to open
3. In the "SoilHelp Frontend" window, **press `w`** when you see the QR code
4. Browser will open at http://localhost:8081

### Option 2: Manual Start
1. **Start Backend:**
   ```
   cd backend
   python main.py
   ```
   ✅ Wait until you see: "Application startup complete"

2. **Start Frontend** (in a new terminal):
   ```
   npm start
   ```
   ✅ Wait for the QR code, then press `w`

---

## Demo Flow

### 1. Home Page
- Shows app overview
- Explains features

### 2. Upload Tab (Main Feature)
- Click "Select from Gallery" or "Capture Soil Photo"
- Choose a soil image (use images from `backend/data/soil_images/`)
- Click **"Analyse Soil Sample"**
- Wait 15-30 seconds (first request loads ML models)
- Results page shows:
  - ✅ Soil type detected (Black/Red/Sandy/Loam)
  - ✅ NPK values (Nitrogen, Phosphorus, Potassium)
  - ✅ pH level
  - ✅ Recommended crops
  - ✅ Fertilizer advice
  - ✅ AI-generated insights

### 3. Collection Tab
- Register new soil samples
- Enter field location and observations
- Link to uploaded analysis

### 4. Tracking Tab
- View all collected samples
- Track soil health over time
- Export data

### 5. Profile Tab
- Server settings (defaults to localhost)
- Language selection (English/Kannada)
- Connection test

---

## Test Images

Use these soil images for demo:
- **Black Soil**: `backend/data/soil_images/Black/synth_0000.jpg`
- **Red Soil**: `backend/data/soil_images/Red/synth_0000.jpg`
- **Sandy Soil**: `backend/data/soil_images/Sandy/synth_0000.jpg`
- **Loam Soil**: `backend/data/soil_images/Loam/synth_0000.jpg`

---

## Troubleshooting

### Backend not starting?
- Check if port 8000 is free: `netstat -ano | findstr :8000`
- Make sure you're in the `backend` folder
- Check `.env` file exists with GEMINI_API_KEY

### Frontend not loading?
- Press `Ctrl+C` and restart with `npm start -- --clear`
- Make sure port 8081 is free

### Analysis fails?
- Go to Profile > Server Settings
- Test connection - should show "Connected successfully"
- Make sure backend is running (check http://localhost:8000/health)

---

## URLs

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## Features to Highlight

1. **AI-Powered Analysis**: Uses TensorFlow CNN + Gemini AI
2. **Instant Results**: Soil type + NPK values in ~15 seconds
3. **Farmer-Friendly**: Simple interface, works offline after first load
4. **Karnataka-Specific**: Crop recommendations for local region
5. **Multilingual**: English + Kannada support
6. **Data Collection**: Track soil health over time
7. **Free & Open Source**: No subscription needed

---

Good luck with your presentation! 🎉🚜
