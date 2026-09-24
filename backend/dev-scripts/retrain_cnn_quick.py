# -*- coding: utf-8 -*-
"""
Quick CNN Retraining - Fix the broken soil classifier
"""
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
sys.path.insert(0, os.path.dirname(__file__))

from model.predict import train_soil_classifier, SOIL_CLASSES

print("=" * 70)
print("  Retraining CNN Soil Classifier")
print("=" * 70)

data_dir = "data/soil_images"
print(f"\nTraining on: {data_dir}")
print(f"Classes: {SOIL_CLASSES}")
print(f"Expected: 150 images per class (750 total)\n")

print("[1/1] Training MobileNetV2 classifier...")
print("  - Initial training: 20 epochs")
print("  - Fine-tuning: 10 epochs (top 30 layers unfrozen)")
print()

model = train_soil_classifier(data_dir, epochs=20, batch_size=32)

print("\n" + "=" * 70)
print("  Training complete! Model saved to saved_models/soil_classifier.h5")
print("  Run 'python check_accuracy.py' to verify accuracy.")
print("=" * 70)