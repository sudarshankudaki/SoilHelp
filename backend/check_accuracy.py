"""
SoilHelp - Quick accuracy report for trained models.
Run: python check_accuracy.py
"""
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import joblib
from sklearn.metrics import r2_score, mean_absolute_error, accuracy_score
from sklearn.model_selection import cross_val_predict
from sklearn.preprocessing import StandardScaler

from model.predict import (
    _load_npk_from_csv, _NPK_CSV_PATH,
    _generate_synthetic_npk_data,
    _run_npk_ensemble, build_npk_feature_vector,
    SOIL_CLASSES, SOIL_MODEL_PATH, NPK_MODEL_PATH, SCALER_PATH,
)

SEP = "=" * 52

# ── 1. NPK Regressor ─────────────────────────────────────────────────────────
print(SEP)
print("  SoilHelp - Model Accuracy Report")
print(SEP)

print("\n[1/3]  NPK Regressor (RF + GradientBoosting ensemble)")
print("-" * 52)

X, y = _load_npk_from_csv(_NPK_CSV_PATH)
if X is None:
    print("  No CSV found — using synthetic fallback")
    X, y = _generate_synthetic_npk_data(3000)

ensemble = joblib.load(NPK_MODEL_PATH)
scaler   = joblib.load(SCALER_PATH)
Xs = scaler.transform(X)

rf = ensemble["rf"]
gb = ensemble["gb"]

print(f"  Training samples : {len(X):,}")
print(f"  Features per sample: {X.shape[1]}  (192 colour hist + 5 soil-type one-hot)")
print()
print("  Running 5-fold cross-validation...")

y_rf = cross_val_predict(rf, Xs, y, cv=5, n_jobs=-1)
y_gb = cross_val_predict(gb, Xs, y, cv=5, n_jobs=-1)
y_blend = y_rf * 0.60 + y_gb * 0.40

labels = ["Nitrogen (%)", "Phosphorus (ppm)", "Potassium (ppm)", "pH"]
print()
print(f"  {'Target':<18} {'R² Score':>8}  {'MAE':>10}  {'Rating'}")
print("  " + "-" * 50)
r2s = []
for i, lbl in enumerate(labels):
    r2  = r2_score(y[:, i], y_blend[:, i])
    mae = mean_absolute_error(y[:, i], y_blend[:, i])
    r2s.append(r2)
    rating = "🟢 Good" if r2 >= 0.80 else "🟡 Fair" if r2 >= 0.65 else "🔴 Low"
    print(f"  {lbl:<18} {r2:>8.4f}  {mae:>10.4f}  {rating}")

overall = r2_score(y, y_blend)
print("  " + "-" * 50)
print(f"  {'OVERALL':<18} {overall:>8.4f}             "
      f"{'🟢 Good' if overall>=0.80 else '🟡 Fair' if overall>=0.65 else '🔴 Low'}")
print(f"\n  Estimated NPK prediction accuracy : {overall*100:.1f}%")

# ── 2. CNN Soil Classifier ───────────────────────────────────────────────────
print()
print("[2/3]  CNN Soil Classifier (MobileNetV2)")
print("-" * 52)

if not os.path.exists(SOIL_MODEL_PATH):
    print("  Model file not found — skipping CNN evaluation")
else:
    import tensorflow as tf
    tf.get_logger().setLevel("ERROR")
    model = tf.keras.models.load_model(SOIL_MODEL_PATH)

    # Evaluate on synthetic test images (same distribution as training)
    from model.predict import _ICAR_NPK, extract_color_features
    np.random.seed(99)
    X_img, y_cls = [], []
    n_test = 50   # 50 images per class = 250 total

    for idx, (soil_name, params) in enumerate(list(_ICAR_NPK.items())):
        c_min, c_max = params["colors"]
        for _ in range(n_test):
            img = np.random.randint(c_min, c_max, (224, 224, 3), dtype=np.uint8)
            X_img.append(img / 255.0)
            y_cls.append(idx)

    X_img = np.array(X_img)
    y_cls = np.array(y_cls)

    probs  = model.predict(X_img, verbose=0)
    y_pred = np.argmax(probs, axis=1)
    acc    = accuracy_score(y_cls, y_pred)

    print(f"  Test images      : {len(X_img)} (50 per class, 5 classes)")
    print(f"  Architecture     : MobileNetV2 + Dense head (fine-tuned)")
    print()
    print(f"  {'Soil Class':<12} {'Correct':>8}  {'Accuracy':>9}")
    print("  " + "-" * 34)
    for idx, soil in enumerate(SOIL_CLASSES):
        mask   = y_cls == idx
        c_acc  = accuracy_score(y_cls[mask], y_pred[mask])
        rating = "🟢" if c_acc >= 0.80 else "🟡" if c_acc >= 0.60 else "🔴"
        print(f"  {soil:<12} {int(c_acc*n_test):>8}/{n_test}  {c_acc*100:>7.1f}%  {rating}")

    print("  " + "-" * 34)
    print(f"  {'OVERALL':<12} {int(acc*len(X_img)):>8}/{len(X_img)}  {acc*100:>7.1f}%  "
          f"{'🟢 Good' if acc>=0.80 else '🟡 Fair' if acc>=0.60 else '🔴 Low'}")
    print(f"\n  Estimated CNN classification accuracy: {acc*100:.1f}%")

# ── 3. Summary ───────────────────────────────────────────────────────────────
print()
print("[3/3]  Overall System Accuracy Summary")
print("-" * 52)
print(f"  NPK / pH prediction  (R² × 100)  : {overall*100:.1f}%")
if os.path.exists(SOIL_MODEL_PATH):
    print(f"  Soil type classification         : {acc*100:.1f}%")
    combined = (overall * 100 + acc * 100) / 2
    print(f"  Combined estimate                : {combined:.1f}%")
print()
print("  Dataset breakdown:")
import pandas as pd
df = pd.read_csv(_NPK_CSV_PATH)
for src, cnt in df["source"].value_counts().items():
    print(f"    {src:<30} {cnt:>5} rows")
print(f"    {'TOTAL':<30} {len(df):>5} rows")
print()
print(SEP)
