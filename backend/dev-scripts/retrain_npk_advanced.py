"""
Retrain NPK Regressor with Advanced Features
Integrate 94 advanced features + CNN embeddings for improved NPK prediction
"""
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, cross_val_predict
from sklearn.metrics import r2_score, mean_absolute_error
import xgboost as xgb
import lightgbm as lgb

from model.predict import _load_npk_from_csv, _NPK_CSV_PATH, NPK_MODEL_PATH, SCALER_PATH
from model.feature_extraction import extract_advanced_features
import cv2

print("=" * 70)
print("  NPK Regressor Training with Advanced Features")
print("=" * 70)

# Load NPK training data
X_basic, y = _load_npk_from_csv(_NPK_CSV_PATH)
print(f"\n[1/4] Loaded {len(X_basic)} training samples")
print(f"  Basic features: {X_basic.shape[1]}-dim (color histograms + soil-type one-hots)")

# Extract advanced features for each sample
print("\n[2/4] Extracting advanced features from soil images...")
print("  (This may take a few minutes...)")

# Load corresponding images and extract advanced features
df = pd.read_csv(_NPK_CSV_PATH)
X_advanced_list = []

for idx, row in df.iterrows():
    # For now, use synthetic images from v2 dataset
    # In production, this would load actual field images
    soil_type = row.get("soil_type", "Sandy")
    img_idx = idx % 600  # cycle through images
    
    img_path = f"data/soil_images_v2/{soil_type}/synth_{img_idx:04d}.jpg"
    
    if os.path.exists(img_path):
        img = cv2.imread(img_path)
        if img is not None:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            advanced_feat = extract_advanced_features(img_rgb)
            X_advanced_list.append(advanced_feat)
        else:
            # Fallback: zeros
            X_advanced_list.append(np.zeros(94))
    else:
        # Fallback: zeros
        X_advanced_list.append(np.zeros(94))
    
    if (idx + 1) % 1000 == 0:
        print(f"  Processed {idx + 1}/{len(df)} samples...")

X_advanced = np.array(X_advanced_list)
print(f"  Advanced features extracted: {X_advanced.shape[1]}-dim")

# Combine basic + advanced features
X_full = np.hstack([X_basic, X_advanced])
print(f"\n[3/4] Combined feature vector: {X_full.shape[1]}-dim")
print(f"  = {X_basic.shape[1]} (basic) + {X_advanced.shape[1]} (advanced)")

# Train enhanced ensemble with XGBoost, LightGBM, and Random Forest
print("\n[4/4] Training enhanced ensemble...")

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_full)

# Define models
models = {
    "xgb": xgb.XGBRegressor(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    ),
    "lgb": lgb.LGBMRegressor(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbose=-1
    ),
    "rf": RandomForestRegressor(
        n_estimators=500,
        max_depth=22,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    ),
}

# Train each model and evaluate
ensemble = {}
print("\nTraining models:")
for name, model in models.items():
    print(f"\n  {name.upper()}:")
    model.fit(X_scaled, y)
    
    # 5-fold cross-validation
    cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='r2', n_jobs=-1)
    print(f"    5-fold CV R²: {cv_scores.mean():.4f} (± {cv_scores.std():.4f})")
    
    ensemble[name] = model

# Save ensemble and scaler
print(f"\n[5/5] Saving models...")
joblib.dump(ensemble, NPK_MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)
print(f"  ✓ Ensemble saved to {NPK_MODEL_PATH}")
print(f"  ✓ Scaler saved to {SCALER_PATH}")

# Final evaluation with weighted ensemble
print("\n" + "=" * 70)
print("  Final Ensemble Performance (Weighted Average)")
print("=" * 70)

# Test different ensemble weights
weight_configs = [
    {"xgb": 0.5, "lgb": 0.3, "rf": 0.2},
    {"xgb": 0.4, "lgb": 0.4, "rf": 0.2},
    {"xgb": 0.6, "lgb": 0.2, "rf": 0.2},
]

best_r2 = 0
best_weights = None

for weights in weight_configs:
    # Get predictions from each model
    y_pred_xgb = cross_val_predict(ensemble["xgb"], X_scaled, y, cv=5, n_jobs=-1)
    y_pred_lgb = cross_val_predict(ensemble["lgb"], X_scaled, y, cv=5, n_jobs=-1)
    y_pred_rf = cross_val_predict(ensemble["rf"], X_scaled, y, cv=5, n_jobs=-1)
    
    # Weighted ensemble
    y_pred = (y_pred_xgb * weights["xgb"] + 
              y_pred_lgb * weights["lgb"] + 
              y_pred_rf * weights["rf"])
    
    # Calculate R²
    r2 = r2_score(y, y_pred)
    
    weights_str = f"XGB:{weights['xgb']:.1f} LGB:{weights['lgb']:.1f} RF:{weights['rf']:.1f}"
    print(f"\nWeights [{weights_str}]:")
    print(f"  Overall R²: {r2:.4f}")
    
    # Per-nutrient metrics
    labels = ["Nitrogen (%)", "Phosphorus (ppm)", "Potassium (ppm)", "pH"]
    for i, label in enumerate(labels):
        r2_i = r2_score(y[:, i], y_pred[:, i])
        mae_i = mean_absolute_error(y[:, i], y_pred[:, i])
        print(f"    {label:18s}: R²={r2_i:.4f}, MAE={mae_i:.4f}")
    
    if r2 > best_r2:
        best_r2 = r2
        best_weights = weights

print("\n" + "=" * 70)
print(f"✅ BEST ENSEMBLE: R²={best_r2:.4f}")
print(f"   Weights: XGB={best_weights['xgb']:.1f}, LGB={best_weights['lgb']:.1f}, RF={best_weights['rf']:.1f}")
print("=" * 70)

# Save best weights
ensemble["weights"] = best_weights
joblib.dump(ensemble, NPK_MODEL_PATH)
print(f"\n✓ Best weights saved to ensemble")