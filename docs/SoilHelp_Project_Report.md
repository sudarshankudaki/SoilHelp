# SOILHELP - COMPLETE PROJECT ANALYSIS REPORT
### Team Reference Document | Judge Preparation Guide

| Field | Details |
|---|---|
| Project | SoilHelp - AI-Powered Soil Analysis App |
| Platform | React Native (Expo) + Python FastAPI |
| Region | Karnataka, India |
| Team Size | 6 Members |

---

## SECTION 1 - PROJECT OVERVIEW

**What is SoilHelp?**
SoilHelp is an AI-powered mobile app for Indian farmers. A farmer photographs soil with a smartphone and gets soil type, NPK nutrients, pH, crop recommendations, and fertilizer advice in under 10 seconds.

**Problem Solved:**
Traditional soil lab testing takes 3-7 days and costs money. SoilHelp delivers instant analysis free of charge, directly in the field.

**Who Uses It:**
- Soil Extension Officers / Field Workers (operate the app)
- Farmers (receive report via WhatsApp/SMS)

---

## SECTION 2 - SYSTEM ARCHITECTURE

MOBILE APP (React Native + Expo + TypeScript)
  Screens: Dashboard | Register | Collect | Track | Upload | Profile | Analysis
  Charts:  DonutGauge | RadarChart | PieChart | PHScale | SoilProbabilityGraph
  Context: LanguageContext (English/Hindi/Kannada/Tamil/Telugu)

           HTTP POST /analyze (image + soil metadata)

PYTHON BACKEND (FastAPI)
  Step 1: Google Cloud Vision API -> validate image + get color hint
  Step 2: MobileNetV2 CNN -> Soil Type (Sandy/Clay/Loam/Black/Red) + confidence
  Step 3: RandomForest + GradientBoosting -> N(%), P(ppm), K(ppm), pH
  Step 4: Recommendation Engine -> crops + fertilizer + pH advice

           JSON response

RESULTS: 5 SVG Charts + Crop Cards + Fertilizer Tips + Share Button

DATA LAYER
  Crop_recommendation.csv | Karnataka_Crop_Fertilizer_Reference.csv
  karnataka_soil_npk.csv  | npk_training_data.csv
  soil_images/ (Kaggle dataset - 750 images, 5 classes x 150 each)

---

## SECTION 3 - TECHNOLOGY STACK

| Layer | Technology | Why Used |
|---|---|---|
| Mobile App | React Native + Expo | One codebase for Android + iOS + Web |
| Navigation | Expo Router | Folder structure = screen routing automatically |
| Language | TypeScript | Type safety, compile-time bug detection |
| Charts | react-native-svg | Custom Radar, Donut, Pie, pH charts |
| Backend | FastAPI (Python) | Async, fast, auto API docs at /docs |
| AI Vision | TensorFlow + MobileNetV2 | Transfer learning for soil classification |
| AI Nutrients | scikit-learn (RF + GB) | Predict N/P/K/pH from image + metadata |
| Image Check | Google Cloud Vision API | Verify photo is actually soil |
| Training Data | ICAR + Kaggle CSVs | Real Karnataka soil data |
| Multi-language | Custom React Context | English, Hindi, Kannada, Tamil, Telugu |
| Image Picker | expo-image-picker | Camera capture and gallery selection |

---

## SECTION 4 - COMPLETE USER WORKFLOW

**Phase 1: Farmer Registration**
1. Open app -> Register tab
2. Fill: Farmer Name, Mobile Number, Farm Size (acres), Village
3. Validate: all fields required, phone min 10 digits
4. Farmer saved locally; appears in Farmers List with search

**Phase 2: Soil Sample Collection**
1. Collect tab -> 3-step guide for proper sampling technique
2. Tap Scan QR Code -> scan the labeled sample bag
3. Sample ID (e.g. #SH-2026-892) linked to farmer profile

**Phase 3: Sample Tracking**
1. Track tab shows timeline per sample:
   Collected -> Dispatched to Lab -> Lab Analysis -> Report Ready
2. Status badges: In Transit (yellow) | Completed (green)

**Phase 4: AI Soil Analysis - CORE FEATURE**
1. Upload tab -> Take photo (camera) OR Select from Gallery
2. Preview image shown with Remove option
3. Tap Analyse Soil Sample
4. App calls GET /health (5 sec timeout) to verify backend is up
5. Sends image via POST /analyze as multipart/form-data
6. Shows "Analysing with AI..." spinner (2-5 seconds)
7. Navigates to Analysis Results screen

**Phase 5: Results**
- Hero card: Soil type + emoji + summary + DonutGauge (confidence %)
- Radar chart: N / P / K / pH / Confidence (pentagon)
- Nutrient Pie: health distribution donut chart
- Nutrient bars: N, P, K with Optimal / Low / High badges
- pH Scale: gradient strip + needle at current value
- Soil Probability: bar chart for all 5 soil types
- Fertilizer Advice: ICAR-calibrated for Karnataka
- Recommended Crops: Kannada names, season, water need
- Share Button: plain text report via WhatsApp/SMS/Email

---

## SECTION 5 - TEAM MEMBER ROLES

---

### MEMBER 1 - Dashboard, Profile and Language System

**Files:**
- app/(tabs)/index.tsx          Dashboard screen
- app/(tabs)/profile.tsx        Settings and language selector
- app/_layout.tsx               Root layout wrapping entire app
- context/LanguageContext.tsx   Multi-language state management
- constants/i18n.ts             Translation strings for all 5 languages

**Key Concepts:**

Expo Router: Folder structure IS the navigation. app/(tabs)/index.tsx = Dashboard tab
automatically. No manual route registration. (tabs) folder = tab bar.

LanguageContext: Wraps entire app via LanguageProvider. t('key') returns correct
translation. Changing language in Profile -> context updates -> every screen re-renders.

Theme system: constants/Colors.ts has light and dark color sets. useColorScheme()
detects device setting. All components use theme.primary, theme.background etc.

Dashboard widgets: 4 Widget components (Farmers, Collections, Tracking, Results).
Each shows a count and navigates to its screen on tap.

**Judge Questions:**

Q: How does multi-language work?
A: React Context stores active language. All text uses t('key') from constants/i18n.ts.
   Changing language re-renders all screens instantly.

Q: How many languages?
A: 5 - English, Hindi, Kannada, Tamil, Telugu.

Q: Why language support?
A: Rural Karnataka farmers/officers may not know English. Local language makes the app
   usable in the field, not just technically working.

Q: How does dark mode work?
A: useColorScheme() reads device system setting. Colors constant provides different hex
   values for light/dark. Components use theme variables and switch automatically.

---

### MEMBER 2 - Farmer Registration and Farmer List

**Files:**
- app/(tabs)/registration.tsx   Registration form
- app/farmers.tsx               Farmers list with search
- constants/FarmerData.ts       Local farmer data store

**Key Concepts:**

Form validation: Checks all 4 fields filled + phone min 10 digits.
Error via Alert.alert(). Runs in handleRegister().

FarmerData module: addFarmer() saves a farmer. getFarmers() retrieves list.
In-memory storage (MVP). Each farmer gets auto-generated unique ID.

FlatList: Optimized list using virtualization - only renders visible items.
More efficient than ScrollView for long lists.

Search filter: .filter() on farmers array, matches name OR village, case-insensitive.
Updates real-time as user types via setSearch state.

FAB: Green + button at bottom-right (position: absolute).
Navigates to registration via router.push('/registration').

**Judge Questions:**

Q: Is farmer data on a server?
A: Stored locally (in-app memory). MVP version. Production uses secure cloud database
   with authentication.

Q: What validation is done?
A: All 4 fields required. Phone min 10 digits. Both checked before saving.
   If fail, alert shows specific error.

Q: Duplicate farmers?
A: No duplicate check yet - planned for v2. Unique ID is auto-generated.

Q: How does search work?
A: Real-time .filter() on farmers array. Matches name OR village, case-insensitive.
   No server call - instant on device.

---

### MEMBER 3 - Sample Collection and Sample Tracking

**Files:**
- app/(tabs)/collection.tsx     Collection guide + QR scanner
- app/(tabs)/tracking.tsx       Sample tracking timeline

**Key Concepts:**

Collection steps: Use t('step1Title') etc. - automatically in chosen language.

QR Scanner (simulated): Modal overlay + 3-second timer simulates scanning.
Real QR = replace timer with expo-barcode-scanner camera + QR decode.

Modal: Full-screen overlay. visible={isScanning} controls show/hide.
animationType='fade'. transparent lets background show through.

Sample ID: #SH-YEAR-NUMBER format. In production: server-generated unique IDs.

Timeline icons:
  check-circle (green)  = completed stage
  truck (blue)           = in transit
  circle-o (grey)        = pending / not started

Status badges: color + '20' = 20% opacity background. Full color for text.

**Judge Questions:**

Q: Is the QR scanner real?
A: Designed UI simulation. Real camera QR uses expo-barcode-scanner.
   UI, modal, and data linking are complete - only camera decode needs connecting.

Q: How is sample linked to farmer?
A: QR scan -> sample bag ID linked to farmer profile. Tracking shows all samples
   with farmer name and timeline.

Q: What are the 4 tracking stages?
A: (1) Collected  (2) Dispatched to Lab  (3) Lab Analysis  (4) Report Ready

Q: What does the QR code represent?
A: Each bag has a unique printed QR code. Scanning links physical bag to digital
   record - prevents mix-ups between farmer samples.

---

### MEMBER 4 - Image Upload and Backend Communication

**Files:**
- app/(tabs)/upload.tsx         Image selection and upload UI
- constants/ApiService.ts       All backend API communication

**Key Concepts:**

expo-image-picker: Camera + gallery. Requests permission first.
Returns URI (local file path). Images cropped 4:3 at 85% quality.

Upload states:
  idle      -> no image (upload box + camera button)
  picked    -> image selected (preview + analyse button)
  uploading -> waiting for AI (spinner, button disabled)
  done      -> analysis complete (navigates to results)

Health check: GET /health before upload. 5-second AbortSignal.timeout.
If no response -> shows error. Does not wait for full HTTP timeout.

multipart/form-data: Standard HTTP format for sending files + text together.
Image = binary file field. Soil metadata = text form fields.
FastAPI reads with File(...) and Form(...).

Web vs Native URL:
  Web browser:  localhost:8000 works (browser + server on same machine)
  Android/iOS:  localhost = the PHONE itself. Must use PC LAN IP e.g. 192.168.0.9:8000
  ApiService.ts checks Platform.OS === 'web' and handles automatically.

Error handling:
  1. Backend unreachable -> Cannot reach the SoilHelp server
  2. Server HTTP error   -> shows response.detail from FastAPI
  3. Network failure     -> shows netErr.message
  All show red error box. App never crashes.

**Judge Questions:**

Q: What if the server is slow?
A: Spinner shows with "Analysing with AI" text. 20MB image limit prevents timeouts.
   Health check fails fast in 5 seconds with a clear message.

Q: How does image get sent?
A: multipart/form-data POST. Image = binary file field. Soil metadata = form text fields.
   All sent in one request. FastAPI unpacks with File() and Form().

Q: Why health check first?
A: Better UX. Without it, user waits 30+ second HTTP timeout before seeing error.
   Health check fails fast in 5 seconds.

Q: Why different IP for mobile vs web?
A: On mobile, localhost = the phone itself, not developer PC. Server runs on PC,
   so app must connect via PC LAN IP (run ipconfig on Windows to find it).

---

### MEMBER 5 - Machine Learning Backend and Model Training

**Files:**
- backend/main.py               FastAPI server, endpoints, startup
- backend/model/predict.py      CNN + NPK models + inference pipeline
- backend/train_models.py       Model training script
- backend/utils/vision_api.py   Google Cloud Vision integration
- backend/data/                 Training datasets (CSVs + soil images)

**Key Concepts:**

FastAPI Server (main.py):
  Runs at http://localhost:8000
  GET /health = server status check
  POST /analyze = main AI pipeline
  CORS middleware = allows requests from any origin (required for Expo web)
  lifespan = loads ML models ONCE at startup, not per-request (critical for performance)
  Auto API docs at http://localhost:8000/docs

Google Cloud Vision API (vision_api.py):
  Sends image (base64) to Google cloud
  Gets back: image labels + dominant colors
  Validates: looks for keywords (soil, earth, dirt, clay, sand)
  If no API key -> mock fallback used, app fully works
  _color_to_soil_hint(): dark(r<60)=Black | reddish(r>150)=Red | light=Sandy

CNN Soil Classifier (predict.py Part 1):
  Base: MobileNetV2 pre-trained on ImageNet (1.4M images)
  base.trainable = False (freeze base layers first)
  Head added:
    GlobalAvgPooling2D -> BatchNorm -> Dense(256,ReLU) -> Dropout(0.4)
    -> Dense(128,ReLU) -> Dropout(0.3) -> Dense(5,Softmax)
  Phase 2 fine-tuning: unfreeze top 30 MobileNetV2 layers at 100x lower lr
  Input: 224x224 RGB normalized to [0,1]
  Output: 5 probabilities summing to 1.0 (Sandy, Clay, Loam, Black, Red)
  Saved as: saved_models/soil_classifier.h5

NPK + pH Regressor (predict.py Part 2):
  Feature vector = 210 dimensions:
    192 = color histogram (64 bins x 3 RGB channels, OpenCV)
    5   = soil type one-hot
    5   = texture one-hot
    8   = measurements (moisture, organic carbon, EC, temperature,
          rainfall, pH, slope, waterlogging)

  Ensemble:
    RandomForest:       500 trees, max_depth=22
    GradientBoosting:   300 estimators, max_depth=6, lr=0.05
    Blend at inference: 60% RF + 40% GB

  4 outputs: Nitrogen(%), Phosphorus(ppm), Potassium(ppm), pH
  pH post-processing: 75% raw + 25% soil-type midpoint (reduces outliers)
  Saved as: saved_models/npk_regressor.pkl + npk_scaler.pkl

Training data:
  1. Real Karnataka soil CSV (npk_training_data.csv) - ICAR + Kaggle
  2. ICAR synthetic: 3000 samples using Beta distribution
  3. Karnataka sub-range: extra 150 samples per class from district surveys

Training commands:
  python train_models.py                                   # NPK only (~30 sec)
  python train_models.py --soil-data ./data/soil_images    # CNN too (~10-30 min)

**Judge Questions:**

Q: Why MobileNetV2 instead of custom CNN?
A: Transfer learning. Pre-trained on 1.4M images - already knows edges, textures,
   colors relevant to soil. Only retrain final layers. Fewer images needed, trains faster.

Q: How accurate is NPK prediction?
A: Trained on ICAR-calibrated Karnataka data. Accuracy improves when optional measurements
   (moisture, EC, temperature) are provided. Ensemble reduces variance vs a single model.

Q: What if no soil image dataset?
A: NPK regressor trains from ICAR synthetic data in ~30 seconds (no images needed).
   CNN falls back to Vision API color hints. App fully functional.

Q: What is ICAR?
A: Indian Council of Agricultural Research - apex government body for agricultural
   standards. All NPK thresholds in SoilHelp are ICAR-calibrated for Karnataka.

Q: What is Transfer Learning?
A: Take a model trained on millions of images (MobileNetV2 on ImageNet) and retrain
   only final layers on small dataset (soil photos). Pre-trained layers detect
   edges/textures; we train the head to classify them as soil types.

Q: What is an Ensemble Model?
A: Combine two ML models and blend predictions. RF(60%) + GB(40%) = more accurate
   and stable than either alone.

---

### MEMBER 6 - Recommendation Engine and Results Visualization

**Files:**
- backend/utils/recommendations.py   Crop + fertilizer logic
- app/analysis.tsx                   Full AI results display screen
- components/charts/                 All 5 custom SVG chart components

**Key Concepts:**

Recommendation Engine (recommendations.py):

Two-level crop database:
  National (CROP_DB): General crops per soil type
  Karnataka (STATE_CROP_DBS): Karnataka crops with Kannada names
  Example: Finger Millet / Ragi | Cotton / Hatti

Fertilizer rules - ICAR thresholds for Karnataka:

  Nitrogen (N):
    < 0.15%     = Very Low  -> Urea 100 kg/ha as basal dose
    0.15-0.20%  = Low       -> Urea 50-75 kg/ha, 2 split doses
    0.20-0.40%  = Adequate  -> No action
    > 0.40%     = High      -> Reduce N (lodging + leaching risk)

  Phosphorus (P):
    < 10 ppm    = Very Low  -> DAP/SSP at 100-150 kg/ha basal
    10-15 ppm   = Low       -> SSP at 75 kg/ha
    15-28 ppm   = Adequate  -> No action
    > 28 ppm    = High      -> Skip P this season

  Potassium (K):
    < 100 ppm   = Very Low  -> MOP at 75-100 kg/ha
    100-140 ppm = Low       -> MOP at 50 kg/ha
    140-250 ppm = Adequate  -> No action
    > 250 ppm   = High      -> Withhold K (antagonizes Mg and Ca)

Karnataka micronutrient tips by soil type:
  Black soil -> Zinc Sulphate 25 kg/ha (Zn deficiency, North Karnataka Vertisols)
  Red soil   -> Borax + FeSO4 (Fe/B deficiency, South Karnataka laterite)
  Sandy      -> Slow-release urea + split K doses (leaching in Tumkur/Chitradurga)
  Clay       -> Gypsum 200 kg/ha (Ca+S for coastal/Malnad soils)
  Loam       -> Balanced NPK + FYM 5 t/ha (Hassan-Mysuru alluvial belt)

pH advice:
  pH < 5.5  -> Highly acidic -> Add agricultural lime
  5.5-6.5   -> Slightly acidic -> OK for most crops
  6.5-7.5   -> Neutral -> IDEAL for most Indian crops
  7.5-8.5   -> Slightly alkaline -> Add gypsum or sulfur
  > 8.5     -> Highly alkaline -> Full soil amendment needed

The 5 Custom Charts (all built with react-native-svg):

| Chart Component       | What It Shows                                  |
|-----------------------|------------------------------------------------|
| DonutGauge            | Confidence % arc in the hero card              |
| NutrientRadarChart    | Pentagon radar: N/P/K/pH/Confidence            |
| NutrientPieChart      | Donut: relative NPK + pH health share          |
| SoilProbabilityGraph  | Bar chart: probability % for all 5 soil types  |
| PHScale               | Gradient strip + triangle needle at pH value   |

NutrientBar logic:
  Fill % = value / (max x 1.5). Two green markers show optimal range bounds.
  Badge: Green = Optimal | Yellow = Low | Red = High

Share: React Native Share.share() with formatted plain-text.
Device shows native share sheet (WhatsApp, SMS, Email, etc.)

**Judge Questions:**

Q: How are crop recommendations made?
A: Rule-based lookup. Takes soil type + state, finds crops in knowledge database
   (curated from ICAR and Karnataka KVK). No extra ML - reliable knowledge base.

Q: Why Kannada crop names?
A: Target users are Karnataka farmers/officers. Ragi alongside Finger Millet is
   immediately recognizable in the field without translation.

Q: How does pH scale chart work?
A: Custom SVG gradient rectangle (red=acidic, green=neutral, blue=alkaline).
   Triangle needle at: (pH / 14) x chartWidth pixels from left.
   Optimal zone 6.0-7.5 highlighted.

Q: What does the radar chart show?
A: 5 axes: N, P, K, pH, Confidence. Each normalized to optimal max.
   Filled polygon connects points. Small/irregular shape = nutrient deficiencies.

Q: How does share work?
A: React Native Share.share() with formatted text. Device shows native share sheet.
   User picks WhatsApp, SMS, Email, or any installed app.

---

## SECTION 6 - DATA FLOW (END TO END)

[1] Farmer photo taken on phone
    |
    v
[2] expo-image-picker returns image URI (local file path)
    |
    v
[3] ApiService.ts builds multipart/form-data:
    - image file (binary)
    - texture, moisture_pct, organic_carbon_pct, ec_ds_m,
      temperature_c, rainfall_mm, ph, slope, water_logging
    |
    v
[4] HTTP POST to http://[server-ip]:8000/analyze
    |
    +---> Google Cloud Vision   -> labels + color hint
    +---> MobileNetV2 CNN       -> soil_type + confidence %
    +---> OpenCV histogram      -> 192-dim feature vector
    +---> RF + GB Ensemble      -> N(%), P(ppm), K(ppm), pH
    +---> Recommendation Engine -> crops + fertilizer + pH advice
    |
    v
[5] JSON response returned to app
    |
    v
[6] router.push('/analysis', { result: JSON.stringify(result) })
    |
    v
[7] 5 SVG charts + crop cards + fertilizer advice rendered
    |
    v
[8] Share button -> native share sheet -> WhatsApp/SMS to farmer

---

## SECTION 7 - KEY AGRICULTURAL AND TECHNICAL CONCEPTS

**N - Nitrogen**
Promotes leaf and stem growth. Too low: stunted plants, yellow leaves.
Too high: weak stems, disease risk.
Optimal: 0.20-0.50% | Fertilizer: Urea (46-0-0) or DAP

**P - Phosphorus**
Root development, flowering, seed formation.
Deficiency: purple leaf undersides, poor roots.
Optimal: 15-30 ppm | Fertilizer: DAP (Di-Ammonium Phosphate) or SSP

**K - Potassium**
Disease resistance, water efficiency, fruit/grain quality.
Deficiency: brown leaf edges, weak stalks.
Optimal: 140-250 ppm | Fertilizer: MOP (Muriate of Potash)

**pH - Soil Acidity/Alkalinity**
Scale 0-14. Below 7 = acidic. Above 7 = alkaline. 7 = neutral.
Optimal for most Indian crops: 6.0-7.5
Fix acidic: Agricultural lime | Fix alkaline: Gypsum or Sulfur

**ICAR** - Indian Council of Agricultural Research
Apex government body for agricultural standards.
All NPK thresholds in SoilHelp are ICAR-calibrated for Karnataka.

**Transfer Learning**
Take a model trained on millions of images (MobileNetV2 on ImageNet) and retrain
only final layers on new smaller data (soil photos). Gets high accuracy without
needing millions of training images.

**Ensemble Model**
Combine two ML models and blend predictions.
RF(60%) + GB(40%) = more accurate and stable than either alone.

**Crop Seasons:**
  Kharif: June-November (monsoon) - Rice, Cotton, Ragi, Soybean, Maize
  Rabi: November-April (winter) - Wheat, Chickpea, Mustard, Onion
  Annual: Year-round - Sugarcane, Arecanut, Banana, Coconut

**Karnataka Soil Types:**

  Red Laterite: South KA (Bengaluru Rural, Kolar, Tumkur)
  Acidic, iron-rich, low organic matter.
  Best crops: Ragi, Groundnut, Red Gram, Tobacco

  Black Vertisol: North KA (Dharwad, Gadag, Vijayapura)
  High clay, moisture-retentive, swells when wet.
  Best crops: Cotton, Sorghum (Jowar), Chickpea, Sunflower

  Alluvial/Loam: Hassan, Mysuru river valleys
  Most fertile soil in Karnataka.
  Best crops: Maize, Tomato, Ginger, Arecanut

  Sandy: Chitradurga, Tumkur dry tracts
  Low water retention, leaching-prone.
  Best crops: Groundnut, Coconut, Cashew

  Clay: Coastal/Malnad (Dakshina Kannada, Udupi, Shivamogga)
  High water retention, waterlogging risk.
  Best crops: Paddy, Sugarcane, Arecanut, Banana

---

## SECTION 8 - JUDGE Q&A (ALL MEMBERS MUST KNOW)

**Q1: What problem does SoilHelp solve?**
Traditional soil lab testing takes 3-7 days and is expensive. SoilHelp provides
instant AI-powered soil analysis from a phone camera - crop and fertilizer recommendations
in under 10 seconds, free of charge, in the field.

**Q2: What is the main technical innovation?**
MobileNetV2 transfer learning (visual soil classification) + RF+GB ensemble (NPK prediction),
both calibrated to ICAR Karnataka district-level soil survey data. Region-specific,
agronomically grounded - not generic global data.

**Q3: How accurate is the AI analysis?**
CNN uses MobileNetV2 with data augmentation (flip, rotate, brightness changes). NPK ensemble
uses ICAR-calibrated Karnataka data. Accuracy improves when optional soil measurements
(moisture, EC, temperature) are provided alongside the image.

**Q4: Is this offline capable?**
UI screens work offline. AI analysis needs the Python backend server. Current demo: server
on local PC, same WiFi network. Production: deploy to cloud (AWS/GCP/Azure).

**Q5: Why FastAPI not Django or Flask?**
FastAPI is fully async - 2-3x faster than Flask for I/O operations. Auto-generates API
docs at /docs. Handles concurrent image uploads efficiently.

**Q6: How is farmer data privacy handled?**
Farmer data stored locally on device (MVP). Images processed server-side but not
permanently stored. Production adds end-to-end encryption, JWT auth, GDPR compliance.

**Q7: Why focus on Karnataka?**
Detailed ICAR district soil surveys available. Diverse soil types (Red, Black, Sandy,
Clay, Loam). Kannada names make results useful for local farmers. Ideal regional proving ground.

**Q8: What if the photo is not soil?**
Google Vision labels image first. If no soil keywords found, backend logs warning.
Analysis still runs (does not block farmer). Results show yellow badge:
"Image may not be a soil sample - results may vary."

**Q9: How does multi-language work?**
React Context stores active language. All text uses t('key') from constants/i18n.ts.
User selects language in Profile -> context updates -> every screen re-renders instantly.
Supports: English, Hindi, Kannada, Tamil, Telugu.

**Q10: What are the current limitations?**
1. QR scanner is simulated (not real camera barcode reading)
2. Farmer data is in-memory (no cloud database)
3. CNN accuracy depends on image quality and training dataset size
4. Backend on same local network (no cloud hosting yet)
5. No user authentication or login system

**Q11: How was the model trained? What data?**
(1) Kaggle Soil Image Dataset by Jayaprakash Pondy - 750 images, 5 classes x 150.
(2) ICAR Karnataka + Kaggle NPK CSVs for the regressor.
Plus: 3000 ICAR-calibrated synthetic samples + 150 Karnataka sub-range per soil class.

**Q12: Why ensemble model for NPK?**
Single RF overfits to color histogram features. Single GB is brittle on small datasets.
Blending 60% RF + 40% GB gives better, more stable predictions across all 5 soil types.

**Q13: How long does analysis take?**
Typically 2-5 seconds. API response includes analysis_time_seconds field.
Models loaded once at startup - inference is fast.

**Q14: Can the app work without Google Vision API?**
Yes. Without API key, system uses mock fallback (assumes valid soil, Loam hint, 78% confidence).
CNN and NPK models run fully independently.

**Q15: What is the tech stack in one sentence?**
React Native + Expo (TypeScript) mobile app connecting to a Python FastAPI server that runs
MobileNetV2 CNN for soil classification and a Random Forest + Gradient Boosting ensemble
for NPK prediction, all calibrated to ICAR Karnataka soil data.

---

## SECTION 9 - PROJECT FOLDER MAP

SoilHelp/
|
+-- app/                              All mobile screens (Expo Router)
|   +-- (tabs)/                       Tab navigation
|   |   +-- _layout.tsx               Tab bar config + icons
|   |   +-- index.tsx                 Dashboard (Member 1)
|   |   +-- registration.tsx          Farmer Registration (Member 2)
|   |   +-- collection.tsx            Sample Collection + QR (Member 3)
|   |   +-- tracking.tsx              Sample Tracking Timeline (Member 3)
|   |   +-- upload.tsx                Image Upload + Analysis trigger (Member 4)
|   |   +-- profile.tsx               Settings, Language (Member 1)
|   +-- _layout.tsx                   Root layout (fonts, theme, language wrap)
|   +-- analysis.tsx                  AI Results Screen + Charts (Member 6)
|   +-- farmers.tsx                   Farmers List Screen (Member 2)
|
+-- components/
|   +-- charts/
|   |   +-- DonutGauge.tsx            Confidence arc (Member 6)
|   |   +-- NutrientRadarChart.tsx    Pentagon radar (Member 6)
|   |   +-- NutrientPieChart.tsx      NPK donut pie (Member 6)
|   |   +-- SoilProbabilityGraph.tsx  Soil type bars (Member 6)
|   |   +-- PHScale.tsx               pH gradient scale (Member 6)
|   +-- Widget.tsx                    Dashboard stat widget (Member 1)
|   +-- Themed.tsx                    Themed Text/View wrappers
|
+-- constants/
|   +-- ApiService.ts                 Backend API calls (Member 4)
|   +-- Colors.ts                     Light/dark theme colors
|   +-- FarmerData.ts                 Local farmer data store (Member 2)
|   +-- i18n.ts                       Translation strings (Member 1)
|
+-- context/
|   +-- LanguageContext.tsx           Multi-language React Context (Member 1)
|
+-- backend/                          Python FastAPI Backend
|   +-- main.py                       Server + /analyze endpoint (Member 5)
|   +-- requirements.txt              Python packages to install
|   +-- train_models.py               Run once to train models (Member 5)
|   +-- start_server.bat              Double-click to start server (Windows)
|   +-- .env                          Google API key (NOT committed to git)
|   +-- model/
|   |   +-- predict.py                CNN + NPK + inference (Member 5)
|   +-- utils/
|   |   +-- vision_api.py             Google Cloud Vision (Member 5)
|   |   +-- recommendations.py        Crops + fertilizer logic (Member 6)
|   +-- data/
|   |   +-- Crop_recommendation.csv
|   |   +-- Karnataka_Crop_Fertilizer_Reference.csv
|   |   +-- karnataka_soil_npk.csv
|   |   +-- npk_training_data.csv
|   |   +-- soil_images/              Kaggle (Sandy/Clay/Loam/Black/Red)
|   +-- saved_models/                 Auto-created after training
|       +-- soil_classifier.h5        CNN model (Keras)
|       +-- npk_regressor.pkl         RF+GB ensemble (scikit-learn)
|       +-- npk_scaler.pkl            Feature scaler
|
+-- docs/
|   +-- SoilHelp_Project_Report.md    THIS DOCUMENT
|
+-- package.json                      Node.js dependencies
+-- tsconfig.json                     TypeScript configuration
+-- babel.config.js                   Babel module resolver config

---

## SECTION 10 - QUICK CHEAT SHEET FOR DEMO DAY

| If asked about...         | Direct Answer                                                   |
|---------------------------|------------------------------------------------------------------|
| What does the app do?     | AI soil analysis from phone photo: NPK + type + crops in <10s  |
| What AI is used?          | MobileNetV2 CNN + RandomForest + GradientBoosting ensemble      |
| What data was used?       | ICAR Karnataka surveys + Kaggle soil images + NPK CSVs          |
| Why Karnataka?            | ICAR data available; diverse soils; Kannada language support    |
| Backend tech?             | Python FastAPI - deployable to cloud                            |
| App tech?                 | React Native + Expo TypeScript - Android, iOS, Web              |
| Languages supported?      | English, Hindi, Kannada, Tamil, Telugu                          |
| Is QR scanner real?       | Simulated UI - real scanning ready via expo-barcode-scanner     |
| Offline capable?          | UI works offline; AI analysis needs server                      |
| Limitations?              | MVP - no cloud hosting, no auth, QR simulated, data in-memory  |
| Analysis time?            | 2-5 seconds end to end                                          |
| Without Google Vision?    | Yes - uses mock fallback, CNN and NPK work independently        |
| How many soil types?      | 5: Sandy, Clay, Loam, Black, Red                                |
| Nutrients predicted?      | Nitrogen (N%), Phosphorus (ppm), Potassium (ppm), pH            |

---

Document prepared for SoilHelp Team - All 6 Members
Version 1.0 | Project Analysis and Judge Preparation Guide
SoilHelp - AI-Powered Soil Analysis for Indian Farmers