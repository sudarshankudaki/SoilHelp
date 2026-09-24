# SoilHelp Project Topics Guide

## Purpose of This Document

This guide explains every important topic displayed in the SoilHelp project. It is written for team study, project demonstration, viva preparation, and judge questions.

The project has two connected parts:

- **Mobile application:** displays forms, sample workflow, upload controls, and analysis charts.
- **Python backend:** validates the image, runs machine-learning models, and creates recommendations.

## 1. Project Topic: Smart Soil Analysis

### Meaning

SoilHelp is an AI-assisted soil screening application. It uses a soil image and optional field information to estimate the soil type and nutrient condition.

### User inputs

- Soil image from camera or gallery
- Soil texture
- Moisture percentage
- Organic carbon percentage
- Electrical conductivity
- Temperature
- Rainfall
- pH
- Field slope
- Water logging value

### System outputs

- Soil type
- Soil classification confidence
- Nitrogen estimate
- Phosphorus estimate
- Potassium estimate
- pH estimate
- Nutrient status
- Crop recommendations
- Fertilizer advice
- pH advice
- Image validation result

### Simple explanation for judges

> SoilHelp converts a difficult soil-analysis process into a mobile workflow. It gives a quick preliminary interpretation, but laboratory testing remains necessary for final fertilizer decisions.

### Current status

The upload and analysis workflow is connected to the FastAPI backend. Registration, QR collection, and tracking are currently prototype features.

## 2. Project Topic: Dashboard

**Screen:** `app/(tabs)/index.tsx`

### What is displayed

- Welcome message
- Smart Farming banner
- Farmers count
- Collections count
- Tracking count
- Results count
- Recent activity list

### Purpose

The Dashboard is the starting screen for an operator. It gives a quick overview of farmer registration, sample collection, sample movement, and reports.

### User actions

- Open the registered farmer list
- Open sample collection
- Open sample tracking
- Open upload/analysis
- View recent activities

### Important explanation

The dashboard is an operational summary screen. The displayed counts and activity records are currently demonstration values, not live database totals.

### Team owner

Member 1: product workflow and user experience.

## 3. Project Topic: Farmer Registration

**Screen:** `app/(tabs)/registration.tsx`

### What is displayed

- Full name field
- Mobile number field
- Farm size field
- Village field
- Register button
- Link to registered farmer list

### Validation

- All fields must be filled.
- Phone number must contain at least 10 characters.
- A successful form creates a farmer record.

### Data structure

A farmer record contains:

| Field | Meaning |
|---|---|
| `id` | Unique local identifier |
| `name` | Farmer's name |
| `phone` | Mobile number |
| `farmSize` | Farm area |
| `village` | Farmer's village |
| `date` | Registration date |

### Important implementation detail

The record is added to the in-memory `MOCK_FARMERS` array in `constants/FarmerData.ts`. It is not stored in a permanent database, so it can disappear when the app restarts.

### Judge answer

> Registration is implemented locally for the prototype. In production, this module would send the farmer record to a secure backend database with authentication and validation.

### Team owner

Member 1.

## 4. Project Topic: Registered Farmers List

**Screen:** `app/farmers.tsx`

### What is displayed

- Search field
- Farmer initials/avatar
- Farmer name
- Village
- Farm size
- Phone number
- Empty search result state
- Add farmer button

### Search behavior

The list filters records by farmer name or village using case-insensitive text matching.

### Purpose

The list lets an operator find a registered farmer before connecting that farmer to a soil sample.

### Current limitation

The list reads the same in-memory data as registration. It is not synchronized across multiple devices or users.

### Team owner

Member 1, with Member 2 responsible for sample linkage.

## 5. Project Topic: Sample Collection

**Screen:** `app/(tabs)/collection.tsx`

### What is displayed

- Collection heading
- Three collection steps
- QR scan button
- Scanner overlay
- Viewfinder area
- Scanning indicator
- Cancel button

### Intended workflow

1. Identify the farmer.
2. Collect and label a soil sample.
3. Link the sample to the farmer and send it toward laboratory analysis.

### Current behavior

The QR workflow is simulated. After a three-second delay, it displays a fixed sample ID and farmer name, then links to the tracking screen.

### Judge answer

> The current version demonstrates the collection workflow and UI. A production version would use a real QR/barcode scanner and store the sample ID, farmer ID, collector, timestamp, and location in a database.

### Team owner

Member 2.

## 6. Project Topic: Sample Tracking

**Screen:** `app/(tabs)/tracking.tsx`

### What is displayed

- Search field
- Sample ID
- Farmer name
- Farm size
- Current status badge
- Collection event
- Dispatch-to-lab event
- Lab analysis event
- Completed report status

### Status meanings

| Status | Meaning |
|---|---|
| In Transit | Sample has been collected and sent toward the laboratory |
| Completed | Analysis/report process has finished |
| Lab Analysis | Sample is waiting for or undergoing laboratory analysis |

### Purpose

Tracking provides traceability. It helps the team answer where a sample is in the journey from collection to report.

### Current limitation

The displayed sample cards are static demonstration records. The search field is currently visual and does not query a backend.

### Team owner

Member 2.

## 7. Project Topic: Soil Image Upload

**Screen:** `app/(tabs)/upload.tsx`

### What is displayed

- Upload Soil Image heading
- Gallery selection
- Camera capture
- Image preview
- Remove image control
- Analyze Soil Sample button
- Upload progress indicator
- Error message area
- Photo tips

### Photo requirements

- JPG or PNG
- Maximum 20 MB
- Natural daylight is preferred.
- Soil should fill the frame.
- Avoid shadows and blur.
- Spread the sample on a flat surface.

### Runtime sequence

1. Request gallery or camera permission.
2. Select or capture the image.
3. Preview the selected image.
4. Check backend reachability through `/health`.
5. Send the image to `/analyze`.
6. Navigate to the analysis result screen.

### Team owner

Member 3.

## 8. Project Topic: API Communication

**File:** `constants/ApiService.ts`

### API base URL behavior

- Web uses the current computer hostname on port 8000.
- Native Android/iOS uses the configured LAN IP address.
- A physical phone cannot use the computer's `localhost` address.

### Request format

The client sends `multipart/form-data` containing:

- `file`: image file
- `texture`
- `moisture_pct`
- `organic_carbon_pct`
- `ec_ds_m`
- `temperature_c`
- `rainfall_mm`
- `ph`
- `slope`
- `water_logging`

### Error handling

The API client handles:

- Network failure
- Server error status
- FastAPI validation details
- Backend unavailable state

### Response object

The typed `SoilAnalysisResult` contains the complete analysis needed by the result screen.

### Team owner

Member 3 for the client and Member 4 for the server contract.

## 9. Project Topic: Backend API

**File:** `backend/main.py`

### Endpoint: `GET /health`

Returns service status, service name, and version. The mobile app uses it before analysis.

### Endpoint: `POST /analyze`

Receives the image and soil metadata, then runs the complete analysis pipeline.

### Backend processing order

1. Read uploaded image bytes.
2. Reject files larger than 20 MB.
3. Verify that the file is a valid image with Pillow.
4. Call optional Google Vision validation.
5. Run the custom soil model and NPK model.
6. Generate crop and fertilizer recommendations.
7. Return a JSON response.

### Team owner

Member 4.

## 10. Project Topic: Image Validation

**File:** `backend/utils/vision_api.py`

### Purpose

Google Cloud Vision is intended to:

- Check whether the image appears to contain soil.
- Return labels such as soil, earth, ground, clay, or sand.
- Find a dominant color.
- Convert the color into a basic soil hint.

### Soil color hints

- Very dark color -> Black
- Red-dominant color -> Red
- Light brown/yellow color -> Sandy
- Balanced grey color -> Clay
- Otherwise -> Loam

### Fallback behavior

If no Google API key is configured, the backend returns a mock validation response. This keeps the demo operational, but it is not live external validation.

### Important verification item

The Vision request URL must be tested before claiming live Vision integration. The current code constructs the URL using `images:annotate-key=...`; the normal Google REST form uses a `?key=...` query parameter.

### Team owner

Member 5 for vision behavior and Member 4 for integration.

## 11. Project Topic: Soil Classification

**File:** `backend/model/predict.py`

### Classes

The classifier recognizes five classes:

1. Sandy
2. Clay
3. Loam
4. Black
5. Red

### Model

The project uses MobileNetV2 transfer learning:

- Input size: 224 x 224 pixels
- Image values normalized to 0-1
- ImageNet-pretrained base model
- Initially frozen base layers
- Custom dense layers for five-class output
- Softmax output probabilities
- Later fine-tuning of the top 30 base layers

### Meaning of confidence

The confidence is the probability assigned to the selected soil class. It does not mean that the NPK values are equally accurate.

### Output example

```text
Predicted soil: Loam
Confidence: 87.4%
Other probabilities: Sandy, Clay, Black, Red
```

### Team owner

Member 5.

## 12. Project Topic: Image Preprocessing

Before inference, the backend:

1. Opens the image with Pillow.
2. Converts it to RGB.
3. Resizes it to 224 x 224.
4. Normalizes a tensor for the CNN.
5. Converts a copy to OpenCV BGR format.
6. Extracts color histogram features for nutrient regression.

### Why preprocessing is needed

Models require images with consistent dimensions, color representation, and numeric ranges. The same preprocessing rules must be used during training and prediction.

### Team owner

Member 5.

## 13. Project Topic: NPK and pH Estimation

### Nutrients displayed

| Nutrient | Unit | Meaning |
|---|---|---|
| Nitrogen (N) | Percent | Supports leaf and vegetative growth |
| Phosphorus (P) | ppm | Supports roots, flowering, and energy transfer |
| Potassium (K) | ppm | Supports plant strength, water regulation, and disease tolerance |
| pH | No unit | Measures soil acidity or alkalinity |

### Model features

The current final feature vector contains:

- 192 color histogram values: 64 bins for each RGB channel
- 5 predicted-soil one-hot values
- 5 texture one-hot values
- 8 structured metadata values

Total: **210 feature values**.

### Regression model

Two models are combined:

- Random Forest Regressor: 60% weight
- Gradient Boosting Regressor: 40% weight

The outputs are N, P, K, and pH estimates.

### Safety processing

- Nitrogen is clipped to 0-1 percent.
- Phosphorus is clipped to 0-50 ppm.
- Potassium is clipped to 0-400 ppm.
- pH is constrained using soil-type windows.

### Important limitation

The model estimates nutrients from image color, soil type, and metadata. Nutrient chemistry cannot be observed perfectly from a photograph, so results require field or laboratory confirmation.

### Team owner

Member 5.

## 14. Project Topic: Nutrient Status and Optimal Ranges

The result screen compares values with these displayed ranges:

| Measurement | Displayed optimal range |
|---|---|
| Nitrogen | 0.20-0.50% |
| Phosphorus | 15-30 ppm |
| Potassium | 140-250 ppm |
| pH | 6.0-7.5 |

### Status labels

- **Low:** value is below the minimum.
- **Optimal:** value is within the range.
- **High:** value is above the maximum.

These are interpretation ranges for the application. They should be reviewed against the crop, district, soil test method, and agricultural authority before production use.

### Team owner

Member 5 for values and Member 6 for agronomic review.

## 15. Project Topic: Crop Recommendations

**File:** `backend/utils/recommendations.py`

### How recommendations work

1. Read predicted soil type.
2. Select a state-specific crop database when available.
3. Use the Karnataka database for the default Karnataka state.
4. Return crop name, season, and water requirement.
5. Fall back to the general crop database when a state database is unavailable.

### Example Karnataka recommendations

| Soil type | Example crops |
|---|---|
| Sandy | Coconut, cashew, groundnut, sweet potato |
| Clay | Paddy, sugarcane, arecanut, banana |
| Loam | Maize, ginger, tomato, arecanut |
| Black | Cotton, sorghum, chickpea, sunflower |
| Red | Finger millet, groundnut, red gram, tobacco |

### Important limitation

Crop suitability also depends on season, water availability, seed access, market price, pests, and local climate. Soil type alone should not be treated as the only decision factor.

### Team owner

Member 6.

## 16. Project Topic: Fertilizer Advice

### How it works

The rules compare estimated N, P, and K with thresholds.

Examples:

- Very low nitrogen -> urea or DAP advice
- Low phosphorus -> SSP advice
- Low potassium -> MOP advice
- High nutrient value -> reduce or skip that fertilizer
- Soil-specific tip -> zinc, borax, gypsum, slow-release urea, or organic matter guidance

### Why rules are used

Rules make the recommendation explainable. A user can see why the application says a nutrient is low or high instead of receiving an unexplained model output.

### Safety statement

Fertilizer quantity must be confirmed using a soil laboratory report, crop requirement, field area, and local agricultural expert guidance.

### Team owner

Member 6.

## 17. Project Topic: pH Advice

### Displayed advice logic

| pH condition | General advice |
|---|---|
| Below 5.5 | Highly acidic; consider agricultural lime |
| 5.5 to below 6.5 | Slightly acidic; suitable for many crops |
| 6.5 to 7.5 | Neutral; ideal for many Indian crops |
| Above 7.5 to 8.5 | Slightly alkaline; gypsum or sulfur may be considered |
| Above 8.5 | Highly alkaline; soil amendment is required |

### Team owner

Member 6.

## 18. Project Topic: Analysis Result Screen

**Screen:** `app/analysis.tsx`

### Displayed sections

1. Soil type hero card
2. Confidence donut gauge
3. Nutrient radar chart
4. Nutrient pie chart
5. Individual nutrient detail bars
6. Soil pH scale
7. Soil probability graph
8. Fertilizer advice
9. Recommended crops
10. Image validation status
11. Share report button
12. Analyze another sample button

### Purpose

This screen translates backend output into visual information that a non-technical user can understand.

### User actions

- Read soil type and confidence
- Compare nutrient values with optimal ranges
- Read pH and fertilizer advice
- View crop season and water needs
- Share a formatted report
- Return and analyze another sample

### Team owner

Member 3 for navigation/data handoff and Member 5 for chart meaning.

## 19. Project Topic: Confidence Donut Gauge

**Component:** `components/charts/DonutGauge.tsx`

### What it displays

A circular progress ring showing the selected soil class confidence as a percentage.

### Meaning

A value such as 87% means the classifier assigned the highest probability to that soil class. It is not a guarantee of soil chemistry accuracy.

### Team owner

Member 5.

## 20. Project Topic: Nutrient Radar Chart

**Component:** `components/charts/NutrientRadarChart.tsx`

### What it displays

Five axes:

- N
- P
- K
- pH
- Confidence

Values are normalized to a visual scale so measurements with different units can appear in one chart.

### Important explanation

The radar chart is for comparison and visualization. It does not mean that percent, ppm, pH, and confidence are physically the same kind of measurement.

### Team owner

Member 5.

## 21. Project Topic: Nutrient Pie Chart

**Component:** `components/charts/NutrientPieChart.tsx`

### Purpose

Shows the relative visual share of the displayed nutrient values.

### Caution

N, P, K, and pH use different units and scales. The pie chart is a visual summary, not a scientific proportion or a substitute for the individual nutrient bars.

### Team owner

Member 5.

## 22. Project Topic: Nutrient Detail Bars

**Screen component:** `NutrientBar` inside `app/analysis.tsx`

### What is displayed

- Nutrient name
- Predicted value
- Unit
- Low, Optimal, or High status
- Horizontal value bar
- Optimal range markers

### Why this is useful

The bar is easier for a farmer or field worker to interpret than raw numeric output alone.

### Team owner

Member 5 and Member 6.

## 23. Project Topic: Soil pH Scale

**Component:** `components/charts/PHScale.tsx`

### What it displays

A visual pH scale with a marker showing the predicted pH.

### Interpretation

- Lower pH means more acidic soil.
- Around 6.5-7.5 is generally near neutral.
- Higher pH means more alkaline soil.

### Team owner

Member 6 for interpretation.

## 24. Project Topic: Soil Probability Graph

**Component:** `components/charts/SoilProbabilityGraph.tsx`

### What it displays

- Soil class probability chart
- Ranked bars for all five soil classes
- Highlighted predicted class
- Percentage for each class

### Why it matters

It shows that classification is a probability decision, not simply an unexplained label.

### Team owner

Member 5.

## 25. Project Topic: Image Validation Status

### What is displayed

- Verified soil sample message when validation succeeds
- Warning when the image may not be soil
- Validation confidence and labels when available

### Important behavior

A failed image-validation signal warns the user but does not stop the rest of the analysis. This is useful for a prototype but should be reconsidered for safety-critical deployment.

### Team owner

Member 4 and Member 5.

## 26. Project Topic: Share Report

### What is shared

The app creates a text report containing:

- Soil type and confidence
- N/P/K/pH values
- Top crop recommendations
- Summary sentence

### Purpose

A field worker can share the result with the farmer or another agriculture staff member.

### Limitation

The shared report is generated from predicted values and should include a clear advisory/laboratory-validation message in a production version.

### Team owner

Member 3.

## 27. Project Topic: Profile and Language

**Screen:** `app/(tabs)/profile.tsx`

### What is displayed

- Admin User profile
- Soil Extension Officer role
- Karnataka Region
- Language setting
- Notifications setting
- Privacy setting
- Help option
- Logout option

### Supported languages

- English
- Hindi
- Kannada
- Tamil
- Telugu

### How language works

`LanguageContext.tsx` stores the selected language and provides the translation function `t()`. Screens use translation keys from `constants/i18n.ts`.

### Current limitation

The language option is functional for translated keys. Notifications now show live farmer-registration and sample-collection activity; privacy, help, and logout menu items remain planned UI areas.

### Team owner

Member 1.

## 28. Project Topic: Notification Modal

**Screen:** `app/modal.tsx`

### Current display

The modal currently shows a generic Modal title and development helper content.

### Intended purpose

It is opened from the dashboard header bell icon and is intended to become a notification screen.

### Current limitation

It does not yet display real SoilHelp notifications. This should be described as unfinished UI if a judge opens it.

### Team owner

Member 1.

## 29. Project Topic: Data Preparation

**Files:** `backend/prepare_dataset.py` and `backend/data/collect_npk_data.py`

### Soil image preparation

The image preparation script:

- Downloads or organizes image datasets.
- Maps source folder names to five project classes.
- Checks whether images can be opened.
- Copies valid files into class folders.
- Reports images per class.

### NPK preparation

The NPK collector:

- Reads compatible CSV formats.
- Normalizes column names.
- Maps soil names and colors to project classes.
- Removes rows missing N, P, or K.
- Adds Karnataka data and augmentation.
- Can generate ICAR-calibrated synthetic rows.

### Current repository facts

- Soil images: 750 total, 150 for each class.
- NPK rows: 5,413.
- NPK provenance: 3,000 synthetic ICAR, 127 Karnataka ICAR, 2,286 Karnataka-augmented.

### Team owner

Member 5 and Member 6.

## 30. Project Topic: Model Training and Saved Files

**File:** `backend/train_models.py`

### Training command

```powershell
cd d:\APP\SoilHelp\backend
pip install -r requirements.txt
python train_models.py
```

### Optional CNN training

```powershell
python train_models.py --soil-data ./data/soil_images
```

### Saved model files

- `saved_models/soil_classifier.h5` - CNN classifier
- `saved_models/npk_regressor.pkl` - RF/GB nutrient ensemble
- `saved_models/npk_scaler.pkl` - feature scaler

### Team owner

Member 5.

## 31. Complete Data Flow in Simple Steps

1. Operator registers a farmer.
2. Operator collects and labels a sample.
3. Sample status is tracked.
4. Operator captures or selects a soil image.
5. Mobile app checks backend health.
6. Mobile app sends image and metadata.
7. Backend validates the image.
8. Vision service optionally validates soil appearance.
9. CNN predicts soil class.
10. OpenCV extracts color histogram features.
11. Regression ensemble estimates N/P/K/pH.
12. Rule engine selects crops and advice.
13. Backend returns JSON.
14. App displays charts, warnings, and recommendations.
15. Operator shares the report with the farmer.

## 32. Six-Member Topic Ownership

| Member | Main topics | Main evidence |
|---|---|---|
| 1 | Dashboard, registration, farmer list, profile, language, requirements | User problem and app workflow |
| 2 | Collection, QR workflow, tracking, sample lifecycle | Sample identity and traceability |
| 3 | Upload, camera/gallery, API client, sharing | Mobile-to-backend communication |
| 4 | FastAPI, endpoints, validation, integration | Server architecture and API contract |
| 5 | Dataset, preprocessing, CNN, NPK model, charts | Machine learning and model explanation |
| 6 | Crops, fertilizer, pH, QA, risks, release | Agronomy and responsible recommendations |

## 33. Essential Judge Answers

**What is the main innovation?**

The project combines a mobile soil-image workflow with ML estimation and understandable agronomic recommendations in one application.

**Why is the backend separate?**

Python has the required ML and image-processing libraries. Separating it from the mobile app makes model execution and future updates easier.

**Why use MobileNetV2?**

It is a pretrained lightweight CNN suitable for transfer learning with a limited soil-image dataset.

**Why use metadata with the image?**

Nutrient condition cannot be reliably inferred from image appearance alone. Structured soil and environmental values add context.

**What does the confidence percentage mean?**

It represents confidence in the predicted soil class, not guaranteed accuracy of nutrient values.

**Are all training records real lab samples?**

No. The current file combines synthetic ICAR-calibrated rows, Karnataka reference rows, and augmented Karnataka rows.

**Can it replace a soil laboratory?**

No. It is a preliminary decision-support tool. Final fertilizer recommendations should use a laboratory soil report and local expertise.

**What is incomplete?**

Database persistence, real QR scanning, live tracking, production authentication, tested Vision integration, and formal held-out model evaluation.

## 34. Final Presentation Rule

Every team member should answer five points for any topic:

1. What does the topic display or do?
2. What input does it receive?
3. What output does it produce?
4. Which file or model controls it?
5. What is its current limitation?

The complete project story is:

**farmer -> sample -> tracking -> image -> API -> validation -> soil classification -> nutrient estimation -> recommendation -> report.**
