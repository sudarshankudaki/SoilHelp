"""
Test image quality checker with synthetic edge cases
"""
import numpy as np
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from model.predict import check_image_quality

print("=" * 70)
print("  Image Quality Checker - Edge Case Testing")
print("=" * 70)

# Test 1: Good quality soil image (simulated)
print("\n[Test 1] Good quality soil image...")
img_good = np.random.randint(100, 160, (224, 224, 3), dtype=np.uint8)
is_valid, msg = check_image_quality(img_good)
print(f"  Result: {'PASS' if is_valid else 'FAIL'}")
if not is_valid:
    print(f"  Error: {msg}")

# Test 2: Too dark image
print("\n[Test 2] Too dark image (brightness < 40)...")
img_dark = np.random.randint(0, 30, (224, 224, 3), dtype=np.uint8)
is_valid, msg = check_image_quality(img_dark)
print(f"  Result: {'PASS' if is_valid else 'FAIL (expected)'}")
if not is_valid:
    print(f"  Error: {msg}")

# Test 3: Too bright image
print("\n[Test 3] Too bright image (brightness > 220)...")
img_bright = np.random.randint(225, 255, (224, 224, 3), dtype=np.uint8)
is_valid, msg = check_image_quality(img_bright)
print(f"  Result: {'PASS' if is_valid else 'FAIL (expected)'}")
if not is_valid:
    print(f"  Error: {msg}")

# Test 4: Blurry image (low edge variance)
print("\n[Test 4] Blurry image (uniform, no edges)...")
img_blur = np.ones((224, 224, 3), dtype=np.uint8) * 128  # uniform gray
is_valid, msg = check_image_quality(img_blur)
print(f"  Result: {'PASS' if is_valid else 'FAIL (expected)'}")
if not is_valid:
    print(f"  Error: {msg}")

# Test 5: Mostly green vegetation (not soil)
print("\n[Test 5] Mostly vegetation (green, not soil-colored)...")
img_green = np.zeros((224, 224, 3), dtype=np.uint8)
img_green[:,:,1] = 200  # Lots of green
img_green[:,:,0] = 50   # Little red
img_green[:,:,2] = 50   # Little blue
is_valid, msg = check_image_quality(img_green)
print(f"  Result: {'PASS' if is_valid else 'FAIL (expected)'}")
if not is_valid:
    print(f"  Error: {msg}")

# Test 6: All white image
print("\n[Test 6] All white image...")
img_white = np.ones((224, 224, 3), dtype=np.uint8) * 255
is_valid, msg = check_image_quality(img_white)
print(f"  Result: {'PASS' if is_valid else 'FAIL (expected)'}")
if not is_valid:
    print(f"  Error: {msg}")

print("\n" + "=" * 70)
print("  Quality checker tests complete!")
print("=" * 70)
