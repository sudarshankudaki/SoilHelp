# Download 2000 Beach Sand Images

## 🎯 Goal
Collect 2000 beach sand images to train the model to distinguish:
- 🏖️ **Beach Sand** (non-agricultural, very low nutrients)
- 🌾 **Sandy Soil** (agricultural, normal nutrients)

---

## 🚀 Quick Start - Choose ONE Method:

### METHOD 1: Kaggle Datasets (Recommended - Most Reliable)

```bash
cd backend/data

# Install Kaggle API
pip install kaggle

# Download from multiple datasets
python download_2000_beach_images.py
```

**Setup Kaggle API:**
1. Go to https://www.kaggle.com/settings
2. Click "Create New API Token"
3. Save `kaggle.json` to: `C:\Users\sudar\.kaggle\kaggle.json`

---

### METHOD 2: Web Scraper (Automatic - Fast)

```bash
cd backend/data

# Install dependencies
pip install duckduckgo-search pillow requests

# Run scraper
python scrape_beach_images.py
```

This downloads from DuckDuckGo Image Search (no API key needed).

---

### METHOD 3: Manual Download (Most Control)

**Best Free Sources:**

1. **Kaggle** (600-800 images):
   - https://www.kaggle.com/datasets/puneet6060/intel-image-classification
   - Download → Extract "beach" folder → Copy to `Beach_Sand/`

2. **Unsplash** (200-300 images):
   - Search: "beach sand"
   - https://unsplash.com/s/photos/beach-sand

3. **Pexels** (200-300 images):
   - Search: "beach sand texture"
   - https://www.pexels.com/search/beach%20sand/

4. **Pixabay** (200-300 images):
   - Search: "beach sand"
   - https://pixabay.com/images/search/beach%20sand/

5. **Google Images** (use browser extension):
   - Search: "beach sand close up"
   - Use "Download All Images" extension
   - Download 200-300 per search term

**Search Terms to Use:**
- "beach sand close up"
- "white beach sand texture"
- "golden beach sand"
- "tropical beach sand"
- "coastal sand beach"
- "sea sand beach macro"
- "beach sand grains"
- "beach sand background"

---

## 📁 Save Location

All images must go here:
```
backend/data/soil_images/Beach_Sand/
```

File naming:
```
beach_sand_0001.jpg
beach_sand_0002.jpg
beach_sand_0003.jpg
...
beach_sand_2000.jpg
```

---

## 🔄 Batch Rename Script

If you downloaded images with random names, use this to rename:

```python
from pathlib import Path

beach_dir = Path("backend/data/soil_images/Beach_Sand")
images = sorted(beach_dir.glob("*.*"))

for idx, img in enumerate(images, 1):
    if img.suffix.lower() in ['.jpg', '.jpeg', '.png']:
        new_name = beach_dir / f"beach_sand_{idx:04d}.jpg"
        if not new_name.exists():
            img.rename(new_name)
            print(f"Renamed: {new_name.name}")
```

Save as `rename_images.py` and run: `python rename_images.py`

---

## ✅ Verify Download

Check how many images you have:

```bash
cd backend/data
python -c "from pathlib import Path; print(f'Total: {len(list(Path(\"soil_images/Beach_Sand\").glob(\"*.jpg\")))} images')"
```

**Minimum needed:** 1500 images (model will work)  
**Recommended:** 2000 images (best accuracy)

---

## 🎓 Train the Model

Once you have 1500+ images:

```bash
cd backend

# Train soil classifier (adds Beach_Sand class)
python model/train_soil_classifier.py

# Train NPK predictor (uses low Beach_Sand ranges)
python -c "from model.predict import train_npk_regressor; train_npk_regressor()"
```

---

## 🧪 Test

```bash
# Start backend
python main.py

# Open http://localhost:8081
# Upload beach sand image
# Expected: Very low NPK values
```

---

## 📊 Progress Tracker

- [ ] Install dependencies
- [ ] Download images (0/2000)
- [ ] Verify images saved correctly
- [ ] Rename images if needed
- [ ] Train soil classifier
- [ ] Train NPK predictor
- [ ] Test with beach sand image
- [ ] Test with agricultural sandy soil
- [ ] Deploy to Railway

---

## 🆘 Troubleshooting

**Q: Download script not working?**  
A: Try manual download from Kaggle or Unsplash

**Q: Only have 1000 images?**  
A: 1000+ is okay, but 2000 is better for accuracy

**Q: Images are PNG/WebP format?**  
A: Scripts automatically convert to JPG

**Q: How long does training take?**  
A: ~10-20 minutes on CPU, ~2-5 minutes on GPU

---

## 🎯 Expected Results After Training

### Beach Sand Upload:
- Soil Type: **Beach_Sand**
- Nitrogen: **0.01-0.05%** (very low)
- Phosphorus: **1-5 ppm** (very low)
- Potassium: **20-60 ppm** (very low)
- Warning: "Not suitable for agriculture"

### Agricultural Sandy Soil Upload:
- Soil Type: **Sandy**
- Nitrogen: **0.04-0.14%** (normal)
- Phosphorus: **4-16 ppm** (normal)
- Potassium: **60-155 ppm** (normal)
- Crops: Coconut, Cashew, Groundnut

---

Ready to start? Run:
```bash
cd backend/data
python download_2000_beach_images.py
```
