# SoilHelp Project Workflow and Six-Member Team Report

**Project:** SoilHelp - AI-assisted soil analysis and crop recommendation
**Application type:** Expo/React Native mobile app with a Python FastAPI and machine-learning backend
**Primary regional focus in the code:** Karnataka, India

## 1. Project in One Minute

SoilHelp helps a field worker or farmer move from a soil sample to an understandable recommendation:

1. Register a farmer and capture basic farm details.
2. Collect and identify a soil sample.
3. Upload or photograph the soil image.
4. Send the image and soil metadata to the backend.
5. Classify the soil into one of five classes: Sandy, Clay, Loam, Black, or Red.
6. Estimate nitrogen (N), phosphorus (P), potassium (K), and pH.
7. Compare the values with target ranges.
8. Recommend suitable crops and fertilizer actions.
9. Display charts and allow the result to be shared.

The system is an **AI-assisted decision-support prototype**. Image and ML predictions are estimates; a laboratory soil test is still the authoritative source for fertilizer dosage.

## Essential Project Facts

These are the repository facts the team can safely quote:

| Item | Current project fact |
|---|---|
| Mobile framework | Expo + React Native + TypeScript |
| Backend | Python FastAPI on port 8000 |
| Soil classes | Sandy, Clay, Loam, Black, Red |
| Soil-image dataset | 750 images total: 150 per class |
| NPK dataset | 5,413 rows with `N`, `P`, `K`, `pH`, `soil_type`, and `source` |
| NPK data provenance | 3,000 synthetic ICAR rows, 127 Karnataka ICAR rows, and 2,286 Karnataka-augmented rows |
| Saved models present | `soil_classifier.h5`, `npk_regressor.pkl`, and `npk_scaler.pkl` |
| NPK model | 60% Random Forest + 40% Gradient Boosting ensemble |
| Image input | JPG/PNG, maximum 20 MB |
| Backend endpoints | `GET /health` and `POST /analyze` |
| Final output | Soil type, confidence, N/P/K/pH estimates, crops, fertilizer advice, pH advice, and image-validation status |

### The one-minute answer to memorize

> SoilHelp is a mobile AI-assisted soil screening system for Karnataka. It accepts a soil image and field metadata, validates the image, classifies soil into five types, estimates N/P/K/pH, and converts those estimates into crop and fertilizer guidance. The result is advisory and should be confirmed by laboratory testing.

### Claims the team must phrase carefully

- Say **"5,413 training rows containing synthetic, augmented, and Karnataka reference data"**, not "5,413 independent lab samples".
- Say **"estimated nutrient values"**, not "laboratory-grade measurements".
- Say **"prototype collection and tracking workflow"**, because the current QR flow and tracking records are not database-backed.
- Say **"Google Vision is optional"** and confirm whether the demo uses live Vision or the built-in fallback.

## 2. End-to-End Architecture

```text
Farmer / field worker
        |
        v
Expo mobile app (React Native + TypeScript)
  Dashboard | Registration | Collection | Tracking | Upload | Analysis
        |
        | multipart/form-data: image + soil metadata
        v
FastAPI backend: POST /analyze
        |
        +--> Validate file with Pillow and enforce 20 MB limit
        +--> Optional Google Cloud Vision: image labels and color hint
        +--> MobileNetV2 CNN: soil class and confidence
        +--> Color histogram + metadata features
        |       -> RF/Gradient Boosting ensemble: N, P, K, pH estimates
        +--> Recommendation engine: crops, fertilizer, pH advice
        v
JSON analysis response
        |
        v
Mobile analysis screen: gauges, charts, ranges, advice, crops, sharing
```

### Main technology choices

| Layer | Technology | Responsibility |
|---|---|---|
| Mobile UI | Expo, React Native, TypeScript | Screens, navigation, camera/gallery, result display |
| Navigation | Expo Router | File-based routes and tab navigation |
| API client | `constants/ApiService.ts` | Multipart upload, health check, response types, error handling |
| API server | FastAPI + Uvicorn | HTTP endpoints and orchestration |
| Image processing | Pillow + OpenCV | File validation, resize, color features |
| Soil classifier | TensorFlow/Keras MobileNetV2 | Five-class soil image classification |
| Nutrient estimator | scikit-learn Random Forest + Gradient Boosting | N/P/K/pH regression |
| External service | Google Cloud Vision, optional | Image labels, validation signal, dominant color hint |
| Recommendations | Python rule engine | Crop database, fertilizer thresholds, pH advice |
| Data/model files | CSV, H5, PKL | Training data and saved models |

## 3. Team Allocation for Six Members

The boundaries below give every member a meaningful subsystem and a clear handoff. One member should be the final integration owner, but every member must understand the complete flow in Section 4.

### Member 1 - Product, farmer workflow, and documentation lead

**Owns:** user problem, requirements, demo narrative, farmer-facing workflow, and final report.

**Files to study:**
- `app/(tabs)/index.tsx` - dashboard and project overview
- `app/(tabs)/registration.tsx` - farmer registration form
- `app/farmers.tsx` - registered farmer list
- `constants/FarmerData.ts` - current in-memory farmer data
- `constants/i18n.ts` and `context/LanguageContext.tsx` - language support

**Must understand:**
- Who uses the system: farmers, field workers, collection staff, and lab/agriculture staff.
- What problem is solved: making soil information easier to access and interpret.
- Registration currently validates fields locally and stores records in an in-memory array.
- The current app does not persist farmer data to a database after restart.

**Input:** farmer name, phone, farm size, village.
**Output:** farmer record and a user journey that leads toward sample analysis.
**Handoff:** gives Member 2 the required collection and farmer data fields; gives Member 6 the demo story and limitations.

**Presentation responsibility:** explain the problem, target users, impact, and why the system is useful.

### Member 2 - Sample collection and tracking module

**Owns:** sample identification, collection workflow, sample status, and traceability UI.

**Files to study:**
- `app/(tabs)/collection.tsx` - collection steps and QR scan prototype
- `app/(tabs)/tracking.tsx` - sample timeline and status cards
- `app/(tabs)/_layout.tsx` - tab navigation

**Must understand:**
- Collection presents a three-step process and opens a scanner overlay.
- The present QR scanner is simulated: after three seconds it reports a fixed sample and farmer.
- Tracking cards are currently static demonstration data; the search field is visual and not connected to a data store.
- This module represents the chain from farmer to laboratory, even though persistent tracking is future work.

**Input:** farmer/sample identity and collection status.
**Output:** sample ID, collection state, dispatch state, and lab-analysis state in the UI.
**Handoff:** supplies the sample context that should eventually be linked to Member 3's uploaded image and Member 5's result.

**Presentation responsibility:** explain traceability, QR/sample identity, and what would be connected to a real database in production.

### Member 3 - Mobile upload and API integration

**Owns:** image capture, gallery selection, permissions, network health check, multipart request, and error states.

**Files to study:**
- `app/(tabs)/upload.tsx` - capture, preview, upload, and navigation
- `constants/ApiService.ts` - API URL, request construction, interfaces, errors
- `app/analysis.tsx` - result parsing and display handoff

**Must understand:**
- The app requests camera or gallery permission and accepts JPG/PNG images.
- The image is sent as multipart field `file`.
- Soil metadata fields are also sent: texture, moisture, organic carbon, EC, temperature, rainfall, pH, slope, and water logging.
- The app checks `GET /health` before calling `POST /analyze`.
- Web uses a browser `File`; native platforms use a React Native `{ uri, name, type }` object.
- Native devices must use the computer's LAN IP, not `localhost`.
- The response is passed to the analysis route as serialized JSON.

**Input:** soil image plus optional metadata.
**Output:** typed `SoilAnalysisResult` or a user-readable error.
**Handoff:** sends request to Member 4's backend and passes response to Member 5's visual result screen.

**Presentation responsibility:** demonstrate the complete upload request and explain why the health check and platform-specific file handling exist.

### Member 4 - FastAPI backend and integration lead

**Owns:** server startup, API contract, request validation, orchestration, and integration testing.

**Files to study:**
- `backend/main.py` - `/health`, `/analyze`, validation, orchestration, response
- `backend/requirements.txt` - Python dependencies
- `backend/start_server.bat` and `backend/README.md` - setup/run instructions
- `metro.config.js`, `babel.config.js`, `tsconfig.json` - app build support when integration issues occur

**Must understand:**
- Models are loaded during FastAPI startup through the lifespan hook.
- `/health` confirms the service is reachable.
- `/analyze` accepts an image and form fields, verifies the image with Pillow, and rejects images over 20 MB or invalid files.
- The endpoint calls Vision, then ML prediction, then recommendations, and returns one JSON object.
- CORS is open to all origins for the current development setup.
- The response contains soil type/confidence, all class probabilities, nutrient values and optimal ranges, crop recommendations, fertilizer advice, pH advice, summary, and image validation.

**Input:** multipart image and soil metadata.
**Output:** stable JSON API response and HTTP errors.
**Handoff:** coordinates the exact request/response contract between Members 3, 5, and 6.

**Presentation responsibility:** draw the architecture and explain why the backend is separated from the mobile app.

### Member 5 - Computer vision and ML engineer

**Owns:** soil classifier, feature extraction, NPK/pH regression, model training, and evaluation.

**Files to study:**
- `backend/model/predict.py` - model architecture, features, training, inference
- `backend/train_models.py` - training entry point
- `backend/prepare_dataset.py` - image organization and validation
- `backend/saved_models/` - generated model artifacts

**Must understand:**

**Soil classification:**
- Uses MobileNetV2 transfer learning with ImageNet weights.
- Input images are resized to 224 x 224 and normalized to [0, 1].
- The base is initially frozen; the top 30 layers are later fine-tuned.
- Data augmentation includes flips, rotation, zoom, and brightness changes.
- Output is a softmax distribution over Sandy, Clay, Loam, Black, and Red.

**Nutrient estimation:**
- Extracts a 192-dimensional color histogram: 64 bins for each RGB channel.
- Appends a one-hot predicted soil type, a one-hot metadata texture, and eight structured values: moisture, organic carbon, EC, temperature, rainfall, pH, slope, and water logging.
- The implementation therefore uses 210 values in the final vector: 192 + 5 + 5 + 8. Some older docstrings say 197, which is outdated and should not be quoted as the current dimension.
- The model blends a Random Forest prediction at 60% with a Gradient Boosting prediction at 40%.
- Predictions are clipped to plausible output bounds; pH is additionally constrained by soil-type windows.

**Training data:**
- The collector can normalize multiple Kaggle CSV formats.
- Karnataka data is loaded and augmented with calibrated noise.
- If fewer than 100 CSV rows are available, the code falls back to ICAR-calibrated synthetic data.
- Image training expects five folders with at least about 100 images per class.

**Input:** resized image, predicted soil type, and metadata.
**Output:** soil class, confidence, N/P/K/pH values, and class probabilities.
**Handoff:** sends estimates to Member 6's recommendation logic; sends final response values to Member 4.

**Presentation responsibility:** explain training versus inference, features, model choice, confidence, and why predictions need validation.

### Member 6 - Agronomy, recommendation engine, QA, and release owner

**Owns:** agronomic rules, crop/fertilizer content, validation, test scenarios, and final release readiness.

**Files to study:**
- `backend/utils/recommendations.py` - crop databases, fertilizer rules, pH rules
- `backend/utils/vision_api.py` - external validation and fallback behavior
- `backend/data/karnataka_soil_npk.csv` and `backend/data/npk_training_data.csv` - data review
- `backend/check_accuracy.py`, `backend/retrain_and_eval.py` - evaluation utilities
- all screen files for end-to-end QA

**Must understand:**
- Crop selection uses soil type and state, preferring a Karnataka-specific crop database.
- Fertilizer advice is threshold-based for N, P, and K, with soil-specific micronutrient tips.
- pH advice maps acidity/alkalinity to lime, gypsum/sulfur, or suitability guidance.
- Vision labels are used to validate whether an image resembles soil and to derive a color hint.
- When no Google API key exists, a deterministic mock response lets the rest of the demo work offline.
- Vision validation warns but does not block analysis.

**Input:** soil type, N/P/K/pH, state, image-validation result.
**Output:** crop list, fertilizer advice, pH advice, summary, and QA report.
**Handoff:** final recommendation content goes to Member 4 and is rendered by Member 3/5's result flow.

**Presentation responsibility:** explain how raw model numbers become practical recommendations and state safety/validation limits.

## 4. Exact Runtime Workflow

### A. App startup

1. Expo starts the React Native application.
2. Expo Router reads the files under `app/` and creates routes.
3. The tab layout exposes Dashboard, Register, Collect, Track, Upload, and Profile.
4. The Python server starts separately with `python main.py`.
5. FastAPI loads the saved CNN and NPK models during startup. If the NPK files are missing, it trains them; if the CNN is missing, it uses a fallback soil hint.

### B. Farmer/sample preparation

1. A user registers a farmer in the registration screen.
2. `addFarmer()` inserts the record into the in-memory `MOCK_FARMERS` array.
3. Collection describes the process and simulates a QR scan.
4. Tracking displays sample timelines using current mock/static data.

### C. Image analysis

1. User chooses a gallery image or captures a photo.
2. The app previews the image and lets the user remove it.
3. The app calls `/health`.
4. The app sends the image and metadata to `/analyze` as multipart form data.
5. The backend checks size and image validity.
6. Vision optionally returns labels, confidence, dominant color, and a soil color hint.
7. The CNN predicts one of five soil classes and a probability distribution.
8. OpenCV creates the image color histogram.
9. The histogram, class encodings, texture encoding, and structured metadata are scaled and sent to the RF/GB ensemble.
10. N/P/K/pH predictions are clipped and rounded.
11. The recommendation engine selects crops and creates fertilizer and pH advice.
12. FastAPI returns the complete JSON response.
13. The app navigates to `/analysis` with the response serialized in route parameters.
14. The analysis screen renders gauges, radar/pie/bar charts, pH scale, probabilities, advice, crops, validation status, and sharing.

## 5. Important Data Dictionary

| Field | Meaning | Expected unit or values |
|---|---|---|
| `file` | Uploaded soil image | JPG/PNG, maximum 20 MB |
| `texture` | Soil texture supplied as metadata | Sandy, Clay, Loam, Black, Red; default Loam |
| `moisture_pct` | Soil moisture | percent |
| `organic_carbon_pct` | Organic carbon | percent |
| `ec_ds_m` | Electrical conductivity | dS/m |
| `temperature_c` | Local temperature | degrees Celsius |
| `rainfall_mm` | Rainfall context | millimeters |
| `ph` | Acidity/alkalinity | pH scale |
| `slope` | Field slope | numeric value used by model |
| `water_logging` | Water logging indicator | numeric value, normally 0 or low fraction |
| `soil_type` | Predicted category | Sandy, Clay, Loam, Black, Red |
| `soil_confidence` | Highest CNN probability | percentage |
| `nitrogen` | N estimate | percent |
| `phosphorus` | P estimate | ppm |
| `potassium` | K estimate | ppm |
| `optimal_min/max` | UI comparison range | N: 0.20-0.50%, P: 15-30 ppm, K: 140-250 ppm, pH: 6.0-7.5 |
| `recommended_crops` | Suitable crops | name, season, water requirement |
| `fertilizer_advice` | Rule-based action text | list of messages |
| `image_validation` | Vision soil-image signal | boolean, confidence, labels |

## 6. What Each Member Must Be Able to Explain

Every member should know this short answer:

> SoilHelp is a mobile decision-support application. It accepts a soil image and optional field metadata, uses computer vision to classify soil, uses a regression ensemble to estimate N/P/K/pH, and applies Karnataka-aware agronomic rules to recommend crops and fertilizer actions. The backend returns one structured result that the mobile app visualizes.

Each member should also be able to identify:

- The input: an image plus metadata.
- The processing: validation, vision, classification, regression, recommendation.
- The output: understandable values, confidence, recommendations, and warnings.
- The limitation: estimates depend on image quality and training data and must be confirmed by laboratory testing.

## 7. Judge Questions and Suggested Answers

### Product and purpose

**Q: What problem does SoilHelp solve?**

A: It reduces the difficulty of interpreting soil information. A field worker can capture a sample image and receive soil category, estimated nutrient values, pH guidance, suitable crops, and fertilizer advice in one workflow.

**Q: Who is the target user?**

A: Farmers and field workers who need a quick first assessment, especially in Karnataka. Agriculture or laboratory staff can use the tracking workflow to organize samples and reports.

**Q: Is this a replacement for a soil test laboratory?**

A: No. It is a screening and decision-support tool. The predictions should guide initial discussion and sampling, while final fertilizer decisions should use a certified laboratory result.

### Technical architecture

**Q: Why did you separate the app and backend?**

A: The mobile app handles interaction and device capabilities, while the backend centralizes Python ML libraries, model loading, image processing, and recommendation logic. This also makes model updates possible without rebuilding the mobile interface.

**Q: What happens if the backend is unavailable?**

A: The app checks `/health`, shows a clear error, and does not pretend that analysis completed. The user can retry after starting the server or correcting the network address.

**Q: Why does a physical phone need a LAN IP?**

A: `localhost` on a phone refers to the phone itself. The phone must reach the computer running FastAPI through the computer's local network IP.

**Q: What does `/analyze` do?**

A: It validates the upload, obtains optional Vision metadata, runs soil classification and nutrient regression, applies recommendations, and returns one JSON response.

### Machine learning

**Q: Why MobileNetV2?**

A: It is a pretrained, relatively lightweight CNN suitable for transfer learning. Freezing most base layers reduces training cost when the project has a smaller soil-image dataset.

**Q: What are the five classes?**

A: Sandy, Clay, Loam, Black, and Red. These are the class folders, classifier outputs, and recommendation keys used throughout the project.

**Q: How are N/P/K/pH predicted from an image?**

A: The image contributes RGB color histogram features. The system also appends predicted/entered soil texture and structured soil measurements. A scaled Random Forest and Gradient Boosting ensemble estimates the four values.

**Q: Why include metadata if there is an image model?**

A: Nutrients cannot be reliably inferred from appearance alone. Moisture, organic carbon, electrical conductivity, rainfall, temperature, pH, slope, and water logging provide structured context and help separate visually similar samples.

**Q: How do you measure model quality?**

A: Use held-out validation data and report classification accuracy/confusion matrix for soil classes plus MAE or RMSE for N/P/K/pH. Do not report a score unless it was actually measured on a held-out test set.

**Q: Does confidence mean nutrient accuracy?**

A: No. `soil_confidence` is the classifier's probability for the selected soil class. It is not a guarantee that N/P/K/pH estimates are accurate.

### Recommendations and safety

**Q: How are crops selected?**

A: The engine selects a state-specific database when available, keyed mainly by predicted soil type, then returns crops with season and water requirement. Karnataka entries are prioritized over the general database.

**Q: How is fertilizer advice generated?**

A: N, P, and K estimates are compared with threshold ranges. The engine emits low, adequate, or high advice and adds soil-specific Karnataka tips. pH advice is generated from acidity/alkalinity bands.

**Q: Can the system recommend too much fertilizer?**

A: It can be wrong if the input, model, or assumptions are wrong. That is why the result is advisory, includes ranges and warnings, and should be confirmed with laboratory testing and local agricultural guidance.

### Current implementation and future work

**Q: Is the QR scanner connected to real sample records?**

A: In the current prototype, the scanner flow is simulated and shows a fixed sample after a delay. A production version would connect it to a real QR reader and database.

**Q: Is farmer data stored permanently?**

A: Not currently. Registration uses an in-memory TypeScript array. Database persistence, authentication, and multi-device synchronization are future implementation work.

**Q: What happens without Google Cloud Vision?**

A: The backend uses a fallback response so the main demo still runs. The custom classifier and nutrient model can continue, but external image validation is then simulated rather than live.

**Q: What are the next improvements?**

A: Add a real database and authentication, connect QR scanning and tracking, collect more verified soil-image/lab pairs, evaluate on a separate Karnataka test set, expose uncertainty for nutrient estimates, fix/verify the live Vision integration, and deploy the API securely.

## 8. Demo Script for the Team

1. Member 1 states the farmer problem and introduces the six-step workflow.
2. Member 2 opens Register, Collection, and Tracking and explains sample identity and current prototype scope.
3. Member 3 opens Upload, captures/selects a clear soil image, and explains the health check.
4. Member 4 starts the backend and opens `/docs` or explains the `/analyze` contract.
5. Member 5 explains the classifier, histogram features, regression ensemble, and confidence.
6. Member 6 interprets the result, explains the crop/fertilizer rules, and states validation limits.
7. The team shows the final analysis screen and shares the report.

**Recommended live test:** use a clear soil image, run `GET /health`, then upload through the app. Keep one previously generated result or screenshot available in case the network, model load, or optional Vision service is unavailable.

## 9. Setup and Verification Checklist

### Backend

```powershell
cd d:\APP\SoilHelp\backend
pip install -r requirements.txt
python train_models.py
python main.py
```

Server: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Mobile app

```powershell
cd d:\APP\SoilHelp
npm install
npm start
```

For a physical phone, set the native API URL in `constants/ApiService.ts` to the computer's LAN IP and ensure the firewall allows port 8000.

### Before presentation

- Confirm `GET /health` returns status `ok`.
- Confirm the NPK model files exist under `backend/saved_models/`.
- Confirm the CNN file exists if live soil classification is being claimed.
- Confirm the five image class folders and dataset counts.
- Test one valid image and one invalid/non-image file.
- Record actual classification and regression evaluation metrics.
- Verify whether Google Vision is configured; state clearly whether the demo uses live Vision or fallback mode.
- Check that the API URL works on the presentation device.
- Prepare a screenshot/offline result as a backup.

## 10. Known Gaps to Fix or Explain Before Judges

1. **Registration persistence:** farmer records are in memory only.
2. **Tracking persistence:** sample cards and statuses are static demonstration data.
3. **QR scanning:** the current collection flow simulates scanning rather than decoding a camera QR code.
4. **Vision URL verification:** `backend/utils/vision_api.py` should be tested because the request URL is constructed as `...images:annotate-key=...`; the Google REST query normally uses `?key=...`. Do not claim live Vision is working until this is verified.
5. **Feature-count documentation:** current feature construction is 210 values, while older comments mention 197. Update comments and presentation material to 210.
6. **Training-data provenance:** distinguish verified laboratory rows from generated/augmented rows. Do not call all training samples real lab measurements.
7. **Model metrics:** save and present held-out metrics rather than relying only on confidence values.
8. **Security for deployment:** CORS is open and the API has no authentication. This is acceptable for local development but not a production deployment.
9. **Medical/agricultural safety wording:** recommendations should remain advisory and include a lab-test disclaimer.

## 11. Final Team Handoff

The strongest team presentation is not six isolated feature descriptions. It is one continuous story:

**farmer registration -> sample collection -> sample tracking -> image upload -> backend validation -> soil classification -> nutrient estimation -> agronomic recommendation -> understandable report.**

Every member owns one part, but every member should be able to name the input, output, next handoff, model/rule involved, and limitation of every part. That is what makes the workflow defensible when judges ask follow-up questions.
