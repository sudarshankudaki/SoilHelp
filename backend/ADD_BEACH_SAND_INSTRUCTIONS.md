# Adding Beach Sand Detection to SoilHelp

## Overview
Beach sand is NOT suitable for agriculture. It has:
- ❌ Very low NPK nutrients (N: 0.01-0.05%, P: 1-5 ppm, K: 20-60 ppm)
- ❌ High pH (7.5-8.5) - too alkaline
- ❌ No organic matter
- ❌ Poor water retention
- ❌ High salinity from sea water

This guide helps you collect beach sand images and retrain the model.

---

## Step 1: Collect Beach Sand Images

### Option A: Download from Kaggle (Recommended)

1. **Install Kaggle API:**
   ```bash
   cd backend
   pip install kaggle
   ```

2. **Configure Kaggle API:**
   - Go to https://www.kaggle.com/settings
   - Click "Create New API Token"
   - Save `kaggle.json` to: `C:\Users\sudar\.kaggle\kaggle.json`

3. **Download Intel Image Classification dataset (has beach category):**
   ```bash
   cd backend/data
   python download_beach_sand.py
   ```

### Option B: Manual Download

1. **Google Images Search:**
   - Search: "beach sand close up"
   - Search: "white beach sand texture"
   - Search: "sea sand beach macro"
   - Download 100-150 images

2. **Kaggle Datasets:**
   - https://www.kaggle.com/datasets/puneet6060/intel-image-classification
   - Look for "beach" or "sand" categories

3. **Save images to:**
   ```
   backend/data/soil_images/Beach_Sand/
   ```

4. **Rename files:**
   ```
   beach_sand_0001.jpg
   beach_sand_0002.jpg
   beach_sand_0003.jpg
   ...
   ```

**Target: 100-150 images** (similar to other soil classes)

---

## Step 2: Verify Dataset Structure

Your folder structure should look like:

```
backend/data/soil_images/
├── Sandy/         (agricultural sandy soil - brown/tan)
├── Clay/          (dark gray, dense)
├── Loam/          (medium brown, best for farming)
├── Black/         (very dark, cotton-growing soil)
├── Red/           (reddish, laterite soil)
└── Beach_Sand/    (NEW! very light/white sand, NOT for farming)
```

---

## Step 3: Retrain the Model

### 3.1 Train Soil Classifier (with Beach_Sand class)

```bash
cd backend
python model/train_soil_classifier.py
```

This will:
- ✅ Load all 6 soil classes (including Beach_Sand)
- ✅ Train MobileNetV2 model
- ✅ Save to `saved_models/soil_classifier.h5`

### 3.2 Train NPK Predictor (with Beach_Sand ranges)

```bash
cd backend
python model/predict.py
```

Or call the training function in Python:
```python
from model.predict import train_npk_regressor
train_npk_regressor()
```

This will:
- ✅ Use Beach_Sand NPK ranges (very low values)
- ✅ Save to `saved_models/npk_regressor.pkl`

---

## Step 4: Update Recommendations

### 4.1 Update `utils/recommendations.py`

Add Beach_Sand handling:

```python
def get_recommendations(soil_type, N, P, K, pH, state):
    # Special case: Beach sand is NOT suitable for agriculture
    if soil_type == "Beach_Sand":
        return {
            "crops": [],
            "fertilizer_advice": [
                "⚠️ This is beach sand, NOT agricultural soil",
                "Beach sand has very low nutrients and high salinity",
                "Not suitable for farming - use agricultural sandy soil instead",
                "Consider mixing with compost and organic matter if you must use it"
            ],
            "ph_advice": "Beach sand pH is too high (alkaline) for most crops",
            "summary": "Beach sand detected - NOT suitable for agriculture due to low nutrients and high salinity"
        }
    
    # ... existing code for other soil types ...
```

---

## Step 5: Test the Model

### 5.1 Start Backend

```bash
cd backend
python main.py
```

### 5.2 Test with Beach Sand Image

1. Go to http://localhost:8081
2. Upload a beach sand image
3. Expected result:
   - **Soil Type:** Beach_Sand
   - **Confidence:** 70-95%
   - **NPK Values:**
     - N: 0.01-0.05% (very low)
     - P: 1-5 ppm (very low)
     - K: 20-60 ppm (very low)
   - **Crops:** None recommended
   - **Warning:** "Not suitable for agriculture"

### 5.3 Test with Regular Sandy Soil

1. Upload agricultural sandy soil image
2. Expected result:
   - **Soil Type:** Sandy (NOT Beach_Sand)
   - **Confidence:** 70-95%
   - **NPK Values:** Normal agricultural ranges
   - **Crops:** Coconut, Cashew, Groundnut, etc.

---

## Step 6: Deploy to Railway

### 6.1 Commit Changes

```bash
git add backend/model/predict.py
git add backend/data/soil_images/Beach_Sand/
git commit -m "Add Beach_Sand detection with very low NPK values"
git push origin main
```

### 6.2 Railway Will Auto-Deploy

Railway will:
1. Detect new commit
2. Rebuild Docker image
3. Train models during build (including Beach_Sand)
4. Deploy automatically

**Wait 5-10 minutes** for deployment.

### 6.3 Test Production

Go to: https://soilhelp-production.up.railway.app

Upload beach sand image → Should detect Beach_Sand with low NPK

---

## Expected NPK Values

| Soil Type    | N (%)      | P (ppm)    | K (ppm)     | pH        | Use Case           |
|--------------|------------|------------|-------------|-----------|-------------------|
| **Beach_Sand** | 0.01-0.05  | 1-5        | 20-60       | 7.5-8.5   | ❌ NOT for farming |
| Sandy        | 0.04-0.14  | 4-16       | 60-155      | 5.5-7.2   | ✅ Coconut, Cashew |
| Clay         | 0.15-0.38  | 10-26      | 140-260     | 6.0-7.8   | ✅ Rice, Cotton    |
| Loam         | 0.25-0.52  | 18-36      | 175-285     | 5.8-7.2   | ✅ Best for crops  |
| Black        | 0.30-0.58  | 14-32      | 195-360     | 7.0-8.6   | ✅ Cotton, Wheat   |
| Red          | 0.06-0.22  | 5-20       | 90-185      | 4.8-6.8   | ✅ Millet, Pulses  |

---

## Troubleshooting

### Issue: Model still classifies beach sand as "Sandy"

**Solution:** Collect more beach sand images (need at least 100)

### Issue: NPK values are too high for Beach_Sand

**Solution:** Check `_ICAR_NPK["Beach_Sand"]` ranges in `predict.py`

### Issue: Training fails with "Beach_Sand not found"

**Solution:** Ensure folder exists: `backend/data/soil_images/Beach_Sand/`

---

## Summary

✅ **Beach_Sand class added** to soil classifier  
✅ **Very low NPK ranges** defined (N: 0.01-0.05%, P: 1-5 ppm, K: 20-60 ppm)  
✅ **Warning message** for non-agricultural sand  
✅ **No crop recommendations** for beach sand  
✅ **Model distinguishes** beach sand from agricultural sandy soil  

Your app will now correctly identify beach sand as unsuitable for farming!
