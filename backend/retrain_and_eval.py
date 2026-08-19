"""
SoilHelp - Retrain NPK regressor on expanded dataset and evaluate accuracy.
Run: python retrain_and_eval.py
"""
import sys
import os
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 55)
print("  SoilHelp - Retraining on Karnataka + ICAR Dataset")
print("=" * 55)

# ── Step 1: Retrain NPK ensemble ─────────────────────────────────────────────
from model.predict import (
    train_npk_regressor,
    _load_npk_from_csv,
    _NPK_CSV_PATH,
    SOIL_CLASSES,
)

print("\n[1/3] Training RF + GradientBoosting ensemble on 5,413 rows...")
ensemble, scaler = train_npk_regressor()

# ── Step 2: Cross-validation evaluation ──────────────────────────────────────
print("\n[2/3] Running 5-fold cross-validation (full ensemble)...")
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import r2_score, mean_absolute_error

X, y = _load_npk_from_csv(_NPK_CSV_PATH)
sc   = StandardScaler()
Xs   = sc.fit_transform(X)

rf = ensemble["rf"]
gb = ensemble["gb"]

y_pred_rf = cross_val_predict(rf, Xs, y, cv=5, n_jobs=-1)
y_pred_gb = cross_val_predict(gb, Xs, y, cv=5, n_jobs=-1)
y_blend   = y_pred_rf * 0.60 + y_pred_gb * 0.40

labels = ["N(%)", "P(ppm)", "K(ppm)", "pH"]

print()
print("  Ensemble 5-fold CV results:")
print("  {:<10} {:>8} {:>10}".format("Target", "R2", "MAE"))
print("  " + "-" * 32)
for i, lbl in enumerate(labels):
    r2  = r2_score(y[:, i], y_blend[:, i])
    mae = mean_absolute_error(y[:, i], y_blend[:, i])
    print("  {:<10} {:>8.4f} {:>10.4f}".format(lbl, r2, mae))

overall_r2 = r2_score(y, y_blend)
print("  " + "-" * 32)
print("  {:<10} {:>8.4f}".format("OVERALL", overall_r2))
print("\n  Estimated model accuracy: {:.1f}%".format(overall_r2 * 100))

# ── Step 3: Per-soil-type accuracy (Karnataka sub-range check) ───────────────
print("\n[3/3] Per soil-type accuracy on Karnataka sub-ranges...")
import pandas as pd
from model.predict import _ICAR_NPK, build_npk_feature_vector, _run_npk_ensemble
import joblib

model_ensemble = joblib.load(os.path.join(os.path.dirname(__file__), "saved_models", "npk_regressor.pkl"))
model_scaler   = joblib.load(os.path.join(os.path.dirname(__file__), "saved_models", "npk_scaler.pkl"))

df = pd.read_csv(_NPK_CSV_PATH)
print()
print("  {:<8} {:>6} {:>8} {:>8} {:>8} {:>8}".format(
    "Soil", "n", "N-MAE", "P-MAE", "K-MAE", "pH-MAE"))
print("  " + "-" * 52)

for soil in SOIL_CLASSES:
    sub = df[df["soil_type"] == soil].reset_index(drop=True)
    if len(sub) < 5:
        continue
    params = _ICAR_NPK[soil]
    c_min, c_max = params["colors"]
    X_sub, y_sub = [], []
    for _, row in sub.iterrows():
        c   = [np.random.randint(lo, hi) for lo, hi in zip(c_min, c_max)]
        img = np.random.normal(c, 20, (224, 224, 3)).clip(0, 255).astype(np.uint8)
        from model.predict import extract_color_features
        cf  = extract_color_features(img)
        feat = build_npk_feature_vector(cf, soil)
        X_sub.append(feat)
        y_sub.append([row["N"], row["P"], row["K"], row["pH"]])

    X_sub = np.array(X_sub)
    y_sub = np.array(y_sub)
    Xs_sub = model_scaler.transform(X_sub)
    y_hat  = _run_npk_ensemble(model_ensemble, Xs_sub.reshape(len(Xs_sub), -1) if Xs_sub.ndim == 1 else Xs_sub)

    # Predict row by row
    preds = []
    for feat_row in Xs_sub:
        preds.append(_run_npk_ensemble(model_ensemble, feat_row.reshape(1, -1)))
    preds = np.array(preds)

    maes = mean_absolute_error(y_sub, preds, multioutput="raw_values")
    print("  {:<8} {:>6} {:>8.4f} {:>8.3f} {:>8.2f} {:>8.3f}".format(
        soil, len(sub), maes[0], maes[1], maes[2], maes[3]))

print()
print("=" * 55)
print("  Retraining COMPLETE. Models saved to saved_models/")
print("=" * 55)
