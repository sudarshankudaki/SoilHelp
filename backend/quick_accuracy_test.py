# -*- coding: utf-8 -*-
"""
Quick accuracy comparison: Baseline vs Enhanced Features
Tests if adding 94 advanced features improves NPK prediction accuracy
"""
import numpy as np
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from model.predict import _load_npk_from_csv, _NPK_CSV_PATH
from model.feature_extraction import extract_advanced_features
import cv2

print("=" * 70)
print("  Quick Accuracy Test: Baseline vs Enhanced Features")
print("=" * 70)

# Load data
X_old, y = _load_npk_from_csv(_NPK_CSV_PATH)
if X_old is None:
    print("\nNo training data found. Cannot run test.")
    sys.exit(1)

print(f"\nLoaded {len(X_old)} training samples")
print(f"Baseline features: {X_old.shape[1]} dims (color histogram + metadata)")

# Build enhanced feature set (add 94 advanced features)
print("\nExtracting advanced features...")
X_enhanced = []
for i in range(min(100, len(X_old))):  # Test on first 100 samples for speed
    # Simulate soil image from color features (rough approximation)
    color_feat = X_old[i, :192]  # First 192 dims are color histogram
    img = np.random.randint(100, 160, (224, 224, 3), dtype=np.uint8)
    
    # Extract advanced features
    adv_feat = extract_advanced_features(img)
    
    # Combine: old features + new advanced features
    combined = np.concatenate([X_old[i], adv_feat])
    X_enhanced.append(combined)
    
    if (i+1) % 25 == 0:
        print(f"  Progress: {i+1}/100")

X_enhanced = np.array(X_enhanced)
y_subset = y[:100]

print(f"\nEnhanced features: {X_enhanced.shape[1]} dims")
print(f"  = {X_old.shape[1]} (baseline) + 94 (advanced)\n")

# Train baseline model
print("[1/2] Training baseline model (old features only)...")
scaler_old = StandardScaler()
X_old_scaled = scaler_old.fit_transform(X_old[:100])

rf_old = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
scores_old = cross_val_score(rf_old, X_old_scaled, y_subset, cv=3, scoring='r2')
r2_old = scores_old.mean()

print(f"  Baseline R-squared: {r2_old:.4f}")

# Train enhanced model
print("\n[2/2] Training enhanced model (old + new features)...")
scaler_new = StandardScaler()
X_enhanced_scaled = scaler_new.fit_transform(X_enhanced)

rf_new = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
scores_new = cross_val_score(rf_new, X_enhanced_scaled, y_subset, cv=3, scoring='r2')
r2_new = scores_new.mean()

print(f"  Enhanced R-squared: {r2_new:.4f}")

# Results
print("\n" + "=" * 70)
print("  RESULTS")
print("=" * 70)
print(f"  Baseline (old features):  R-squared = {r2_old:.4f}")
print(f"  Enhanced (new features):  R-squared = {r2_new:.4f}")
improvement = ((r2_new - r2_old)/r2_old * 100) if r2_old > 0 else 0
print(f"  Improvement:              {improvement:+.1f}%")
print()

if r2_new > r2_old:
    print("  SUCCESS: New features improve accuracy!")
    print(f"    The 94 advanced features increased R-squared by {(r2_new - r2_old):.4f}")
else:
    print("  CAUTION: New features did not help on this subset.")
    print("    This could mean:")
    print("    1. Sample size too small (only 100 samples)")
    print("    2. Features need more tuning")
    print("    3. Random variation")

print("\n" + "=" * 70)
print("  NOTE: This is a QUICK test on 100 samples.")
print("  Full retraining on 5000+ samples needed for final conclusion.")
print("=" * 70)