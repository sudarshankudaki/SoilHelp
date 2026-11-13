"""
Train NPK model with a balanced subset for faster training
Uses 10,000 samples instead of 17,913
"""

import os
import sys
import pandas as pd

# Set path
sys.path.insert(0, os.path.dirname(__file__))

# Load full dataset
data_file = os.path.join(os.path.dirname(__file__), "data", "npk_training_data.csv")
df = pd.read_csv(data_file)

print(f"Original dataset: {len(df)} samples")

# Take balanced subset (2000 per soil type = 10,000 total)
SOIL_CLASSES = ["Sandy", "Clay", "Loam", "Black", "Red"]
subset_frames = []

for soil_type in SOIL_CLASSES:
    soil_df = df[df['soil_type'] == soil_type]
    if len(soil_df) > 2000:
        soil_subset = soil_df.sample(n=2000, random_state=42)
    else:
        soil_subset = soil_df
    subset_frames.append(soil_subset)
    print(f"{soil_type}: {len(soil_subset)} samples")

subset_df = pd.concat(subset_frames, ignore_index=True)
subset_df = subset_df.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"\nSubset dataset: {len(subset_df)} samples")

# Save subset temporarily
subset_file = os.path.join(os.path.dirname(__file__), "data", "npk_training_data_backup.csv")
df.to_csv(subset_file, index=False)
print(f"Backed up full dataset to: npk_training_data_backup.csv")

# Replace with subset
subset_df.to_csv(data_file, index=False)
print(f"Using subset for training")

# Now train
from model.predict import train_npk_regressor

print("\n" + "="*60)
print("Training NPK model with balanced subset...")
print("="*60)

train_npk_regressor()

print("\n" + "="*60)
print("✅ Training complete!")
print("="*60)
print("\nTo restore full dataset:")
print("  Rename npk_training_data_backup.csv back to npk_training_data.csv")
print("="*60)
