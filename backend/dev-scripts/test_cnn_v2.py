"""
Test CNN accuracy with REAL soil images from the v2 test set
"""
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from model.predict import SOIL_MODEL_PATH, SOIL_CLASSES, IMG_SIZE

print("=" * 70)
print("  Testing CNN with Realistic Synthetic Soil Images (v2)")
print("=" * 70)

# Load model
model = tf.keras.models.load_model(SOIL_MODEL_PATH)
print(f"\n[1/2] Loaded model from: {SOIL_MODEL_PATH}")

# Load test images from v2 dataset
data_dir = "data/soil_images_v2"
print(f"[2/2] Loading test images from: {data_dir}\n")

# Create test dataset (20% validation split)
test_ds = image_dataset_from_directory(
    data_dir,
    labels="inferred",
    label_mode="int",
    class_names=SOIL_CLASSES,
    batch_size=32,
    image_size=IMG_SIZE,
    shuffle=False,
    seed=42,
    validation_split=0.2,
    subset="validation"
)

# Get predictions
y_true = []
y_pred = []

for images, labels in test_ds:
    preds = model.predict(images, verbose=0)
    y_pred.extend(np.argmax(preds, axis=1))
    y_true.extend(labels.numpy())

# Calculate accuracy
y_true = np.array(y_true)
y_pred = np.array(y_pred)
overall_acc = accuracy_score(y_true, y_pred)

print("Results:")
print("-" * 70)
print(f"Total test images: {len(y_true)}")
print(f"\nPer-class accuracy:")
for idx, soil in enumerate(SOIL_CLASSES):
    mask = y_true == idx
    if mask.sum() > 0:
        acc = accuracy_score(y_true[mask], y_pred[mask])
        rating = "🟢" if acc >= 0.80 else "🟡" if acc >= 0.60 else "🔴"
        correct = int(acc * mask.sum())
        total = mask.sum()
        print(f"  {soil:<12} {correct:>3}/{total:>3}  {acc*100:>6.1f}%  {rating}")

print(f"\nOverall Accuracy: {overall_acc*100:.1f}%")
rating = "🟢 Excellent" if overall_acc >= 0.90 else "🟢 Good" if overall_acc >= 0.80 else "🟡 Fair" if overall_acc >= 0.60 else "🔴 Low"
print(f"Rating: {rating}")

if overall_acc >= 0.80:
    print("\n✅ CNN TARGET ACHIEVED! (≥80% accuracy)")
else:
    print(f"\n❌ CNN below target. Need {0.80 - overall_acc:.1%} improvement.")

print("\n" + "=" * 70)

# Detailed classification report
print("\nConfusion Matrix:")
cm = confusion_matrix(y_true, y_pred)
print("          ", "  ".join([f"{s[:4]:>4s}" for s in SOIL_CLASSES]))
for idx, row in enumerate(cm):
    print(f"{SOIL_CLASSES[idx]:<10}", "  ".join([f"{v:>4d}" for v in row]))

print("\nDetailed Classification Report:")
try:
    print(classification_report(y_true, y_pred, target_names=SOIL_CLASSES, zero_division=0))
except:
    print("(Classification report skipped due to missing classes in predictions)")