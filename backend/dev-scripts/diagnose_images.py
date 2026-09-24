"""Diagnose CNN training data quality"""
import os, cv2, numpy as np

data_dir = "data/soil_images"
for soil_class in ["Sandy", "Clay", "Loam", "Black", "Red"]:
    class_dir = os.path.join(data_dir, soil_class)
    images = [f for f in os.listdir(class_dir) if f.endswith('.jpg')][:5]
    
    print(f"\n{soil_class} class ({len(os.listdir(class_dir))} images):")
    for img_name in images:
        img_path = os.path.join(class_dir, img_name)
        img = cv2.imread(img_path)
        if img is not None:
            print(f"  {img_name}: shape={img.shape}, mean={np.mean(img):.1f}, std={np.std(img):.1f}, unique_colors={len(np.unique(img.reshape(-1,3), axis=0))}")
        else:
            print(f"  {img_name}: FAILED TO LOAD")