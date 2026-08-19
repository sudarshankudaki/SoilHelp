"""
SoilHelp - Train the NPK Regressor (quick, no dataset needed)
Run this once after pip install to generate the saved_models/ files.

Usage:
    python train_models.py
"""

import os
import sys

print("=" * 55)
print("  SoilHelp - Model Training Script")
print("=" * 55)

# -- Make sure we can import from parent dir ----------------
sys.path.insert(0, os.path.dirname(__file__))

from model.predict import train_npk_regressor, SOIL_MODEL_PATH, NPK_MODEL_PATH

print("\n[1/2] Training NPK Regressor (Random Forest)...")
train_npk_regressor()

if os.path.exists(SOIL_MODEL_PATH):
    print(f"\n[2/2] Soil classifier already found at: {SOIL_MODEL_PATH}")
else:
    print("\n[2/2] No soil image dataset found - skipping CNN training.")
    print("      To train the CNN, run:")
    print("      python train_models.py --soil-data <path-to-soil-images/>")
    print()
    print("      Dataset structure expected:")
    print("      soil_images/")
    print("        Sandy/  (*.jpg images)")
    print("        Clay/   (*.jpg images)")
    print("        Loam/   (*.jpg images)")
    print("        Black/  (*.jpg images)")
    print("        Red/    (*.jpg images)")
    print()
    print("  Tip: Download from Kaggle 'Soil Types Dataset'")
    print("  https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset")

print("\n- Done! You can now start the server:")
print("   python main.py")
print("=" * 55)

# Optional CNN training if --soil-data flag passed
if "--soil-data" in sys.argv:
    idx = sys.argv.index("--soil-data")
    if idx + 1 < len(sys.argv):
        data_dir = sys.argv[idx + 1]
        if os.path.isdir(data_dir):
            from model.predict import train_soil_classifier
            print(f"\n[2/2] Training CNN soil classifier on: {data_dir}")
            train_soil_classifier(data_dir, epochs=25)
        else:
            print(f"[!] Directory not found: {data_dir}")
