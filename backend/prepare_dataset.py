"""
SoilHelp - Dataset Preparation Script
======================================
Downloads and organizes soil image datasets for training the CNN classifier.

Supports:
  1. Automatic download via Kaggle CLI (if kaggle.json is configured)
  2. Manual download fallback with clear instructions

Target folder structure:
  backend/data/soil_images/
    Sandy/   (-100 images)
    Clay/    (-100 images)
    Loam/    (-100 images)
    Black/   (-100 images)
    Red/     (-100 images)

Usage:
  python prepare_dataset.py                  # Auto-detect mode
  python prepare_dataset.py --download       # Force Kaggle CLI download
  python prepare_dataset.py --organize <dir> # Organize images from a folder
  python prepare_dataset.py --stats          # Show current dataset stats
  python prepare_dataset.py --synthetic      # Generate synthetic fallback data
"""

import os
import sys
import shutil
import argparse
import subprocess
import zipfile
from pathlib import Path
from PIL import Image
import numpy as np

# -- Constants ------------------------------------------------------------------
BASE_DIR        = Path(__file__).parent
DATA_DIR        = BASE_DIR / "data" / "soil_images"
DOWNLOAD_DIR    = BASE_DIR / "data" / "downloads"

# Target classes for the SoilHelp app
SOIL_CLASSES    = ["Sandy", "Clay", "Loam", "Black", "Red"]
MIN_IMAGES      = 100   # Minimum per class for decent training
IMG_SIZE        = (224, 224)

# -- Kaggle datasets (best match to app's 5 classes) ---------------------------
KAGGLE_DATASETS = [
    {
        "slug": "jayaprakashpondy/soil-image-dataset",
        "desc": "Soil Image Dataset (Sandy, Clay, Loam, Black, Red) - primary",
        "class_map": {
            # Source folder name - Target class
            "Sandy Soil":     "Sandy",
            "Sandy":          "Sandy",
            "Clay Soil":      "Clay",
            "Clay":           "Clay",
            "Loamy Soil":     "Loam",
            "Loam":           "Loam",
            "Alluvial Soil":  "Loam",   # Alluvial - Loam
            "Black Soil":     "Black",
            "Black":          "Black",
            "Red Soil":       "Red",
            "Red":            "Red",
        },
    },
    {
        "slug": "jhislaine/soil-types-dataset",
        "desc": "Soil Types Dataset (Alluvial, Black, Clay, Red) - supplementary",
        "class_map": {
            "Alluvial Soil":  "Loam",
            "Alluvial":       "Loam",
            "Black Soil":     "Black",
            "Black":          "Black",
            "Clay Soil":      "Clay",
            "Clay":           "Clay",
            "Red Soil":       "Red",
            "Red":            "Red",
        },
    },
    {
        "slug": "gpiosenka/soil-types",
        "desc": "Soil Types Dataset (Clayey, Laterite, Loamy, Sandy) - supplementary",
        "class_map": {
            "Clayey Soil":    "Clay",
            "Clayey":         "Clay",
            "Loamy Soil":     "Loam",
            "Loamy":          "Loam",
            "Sandy Soil":     "Sandy",
            "Sandy Loam":     "Sandy",
            "Sandy":          "Sandy",
            "Laterite":       "Red",    # Laterite - Red/Ferralitic
            "Laterite Soil":  "Red",
        },
    },
]

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


# ------------------------------------------------------------------------------
# UTILITY FUNCTIONS
# ------------------------------------------------------------------------------

def print_header(title: str):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def count_images(folder: Path) -> int:
    if not folder.exists():
        return 0
    return sum(1 for f in folder.rglob("*") if f.suffix.lower() in VALID_EXTENSIONS)


def show_stats():
    """Print current dataset statistics."""
    print_header("Dataset Statistics")
    total = 0
    for cls in SOIL_CLASSES:
        cls_dir = DATA_DIR / cls
        count   = count_images(cls_dir)
        total  += count
        status  = "[OK]" if count >= MIN_IMAGES else ("[WARN] " if count > 0 else "[ERR]")
        bar     = "-" * min(count // 10, 40)
        print(f"  {status} {cls:<8}  {count:>4} images  {bar}")
    print(f"\n  Total: {total} images across {len(SOIL_CLASSES)} classes")
    if total > 0:
        print(f"\n  Min recommended per class: {MIN_IMAGES}")
        lacking = [c for c in SOIL_CLASSES if count_images(DATA_DIR / c) < MIN_IMAGES]
        if lacking:
            print(f"  [WARN]  Classes needing more images: {', '.join(lacking)}")
        else:
            print("  [OK] All classes have sufficient images!")


def is_valid_image(path: Path) -> bool:
    """Check that a file is a readable image."""
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception:
        return False


def copy_images(src_dir: Path, target_class: str, max_per_class: int = 500):
    """Copy valid images from src_dir into the correct class folder."""
    dest_dir = DATA_DIR / target_class
    dest_dir.mkdir(parents=True, exist_ok=True)

    existing = count_images(dest_dir)
    copied   = 0
    skipped  = 0

    for img_path in src_dir.rglob("*"):
        if img_path.suffix.lower() not in VALID_EXTENSIONS:
            continue
        if existing + copied >= max_per_class:
            break
        if not is_valid_image(img_path):
            skipped += 1
            continue
        # Unique filename to avoid collisions
        dest_name = f"{target_class}_{existing + copied:05d}{img_path.suffix.lower()}"
        shutil.copy2(img_path, dest_dir / dest_name)
        copied += 1

    return copied, skipped


# ------------------------------------------------------------------------------
# KAGGLE CLI DOWNLOAD
# ------------------------------------------------------------------------------

def check_kaggle_available() -> bool:
    """Check if kaggle CLI is installed and configured."""
    try:
        result = subprocess.run(
            ["kaggle", "--version"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            return False
        # Check for kaggle.json
        kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
        return kaggle_json.exists()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def download_kaggle_dataset(slug: str, dest_dir: Path) -> bool:
    """Download a dataset from Kaggle using the CLI."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    print(f"  [DL]  Downloading: {slug}")
    try:
        result = subprocess.run(
            ["kaggle", "datasets", "download", "-d", slug, "-p", str(dest_dir), "--unzip"],
            capture_output=False, timeout=300
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print("  [ERR] Download timed out (5 min). Try downloading manually.")
        return False
    except FileNotFoundError:
        print("  [ERR] kaggle command not found.")
        return False


def organize_downloaded_dataset(download_dir: Path, class_map: dict) -> dict:
    """Walk a downloaded dataset directory and copy images into class folders."""
    counts = {cls: 0 for cls in SOIL_CLASSES}

    # Find all subdirectories that match known class names (case-insensitive)
    matched_dirs = {}
    for entry in download_dir.rglob("*"):
        if not entry.is_dir():
            continue
        folder_name = entry.name
        for src_name, target_cls in class_map.items():
            if folder_name.lower() == src_name.lower():
                matched_dirs[entry] = target_cls

    if not matched_dirs:
        print(f"  [WARN]  No matching class folders found in {download_dir}")
        print(f"      Looking for: {list(class_map.keys())}")
        print(f"      Found dirs:  {[d.name for d in download_dir.iterdir() if d.is_dir()]}")
        return counts

    for src_dir, target_cls in matched_dirs.items():
        copied, skipped = copy_images(src_dir, target_cls, max_per_class=500)
        counts[target_cls] = counts.get(target_cls, 0) + copied
        if copied > 0:
            print(f"    [OK] {src_dir.name} - {target_cls}: {copied} images copied")
        if skipped > 0:
            print(f"    [WARN]  {skipped} corrupted images skipped")

    return counts


def run_kaggle_download():
    """Download all datasets from Kaggle and organize them."""
    print_header("Kaggle Dataset Download")

    if not check_kaggle_available():
        print("\n  [WARN]  Kaggle CLI not configured.")
        print_manual_instructions()
        return False

    print("  [OK] Kaggle CLI detected!\n")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    overall_counts = {cls: 0 for cls in SOIL_CLASSES}

    for dataset_info in KAGGLE_DATASETS:
        slug        = dataset_info["slug"]
        desc        = dataset_info["desc"]
        class_map   = dataset_info["class_map"]
        dl_dir      = DOWNLOAD_DIR / slug.replace("/", "_")

        print(f"\n[PKG] {desc}")

        # Skip if already downloaded
        if dl_dir.exists() and any(dl_dir.iterdir()):
            print(f"  - Already downloaded: {dl_dir}")
        else:
            success = download_kaggle_dataset(slug, dl_dir)
            if not success:
                print(f"  [ERR] Failed to download {slug} - skipping")
                continue

        # Organize into class folders
        counts = organize_downloaded_dataset(dl_dir, class_map)
        for cls, n in counts.items():
            overall_counts[cls] += n

        # Stop early if all classes have enough images
        if all(count_images(DATA_DIR / cls) >= MIN_IMAGES for cls in SOIL_CLASSES):
            print("\n  [OK] All classes have sufficient images. Stopping early.")
            break

    return True


# ------------------------------------------------------------------------------
# MANUAL ORGANIZE (user already downloaded zip/folder)
# ------------------------------------------------------------------------------

def organize_manual(source_dir: str):
    """Organize images from a manually downloaded/extracted folder."""
    src = Path(source_dir)
    if not src.exists():
        print(f"[ERR] Source directory not found: {source_dir}")
        return

    print_header(f"Organizing from: {src}")

    # Try all known class maps across all datasets
    all_class_maps = {}
    for ds in KAGGLE_DATASETS:
        all_class_maps.update(ds["class_map"])

    counts = organize_downloaded_dataset(src, all_class_maps)
    total  = sum(counts.values())

    if total == 0:
        print("\n  [WARN]  No images were organized. Folder may use different names.")
        print("      Available sub-folders:")
        for d in src.iterdir():
            if d.is_dir():
                print(f"        - {d.name}")
        print("\n  Try renaming folders to match: Sandy, Clay, Loam, Black, Red")
    else:
        print(f"\n  [OK] Total organized: {total} images")


# ------------------------------------------------------------------------------
# SYNTHETIC FALLBACK (improved with real Indian soil data ranges)
# ------------------------------------------------------------------------------

def generate_synthetic_dataset(images_per_class: int = 100):
    """
    Generate synthetic soil images as a fallback when no real data available.
    Uses realistic color/texture profiles derived from Indian soil literature.
    """
    print_header("Generating Synthetic Soil Images")
    print(f"  Generating {images_per_class} images per class...")

    # More realistic color profiles based on actual Indian soil samples
    # Values: [R, G, B] mean - std
    soil_profiles = {
        "Sandy": {
            "colors": [
                ([194, 175, 128], 20),   # Light beige
                ([210, 190, 140], 18),   # Pale golden
                ([180, 160, 115], 22),   # Warm tan
            ],
            "texture": "grainy",
        },
        "Clay": {
            "colors": [
                ([115, 95,  80],  15),   # Greyish brown
                ([130, 110, 90],  18),   # Medium brown-grey
                ([100, 85,  75],  12),   # Dark grey-brown
            ],
            "texture": "smooth",
        },
        "Loam": {
            "colors": [
                ([105, 80,  55],  20),   # Rich dark brown
                ([120, 90,  60],  18),   # Medium brown
                ([90,  70,  45],  15),   # Very dark brown
            ],
            "texture": "mixed",
        },
        "Black": {
            "colors": [
                ([42,  38,  35],  12),   # Near-black
                ([55,  50,  45],  15),   # Very dark charcoal
                ([35,  30,  28],  10),   # Deep black
            ],
            "texture": "cracked",
        },
        "Red": {
            "colors": [
                ([175, 78,  55],  22),   # Brick red
                ([195, 90,  65],  20),   # Warm red
                ([160, 70,  48],  18),   # Deep terra cotta
            ],
            "texture": "gritty",
        },
    }

    for soil_type, profile in soil_profiles.items():
        class_dir = DATA_DIR / soil_type
        class_dir.mkdir(parents=True, exist_ok=True)

        existing = count_images(class_dir)
        to_gen   = max(0, images_per_class - existing)

        if to_gen == 0:
            print(f"  [OK] {soil_type}: already has {existing} images, skipping")
            continue

        for i in range(to_gen):
            # Randomly choose one of the color sub-profiles
            color_mean, std = profile["colors"][i % len(profile["colors"])]

            # Base image
            img_array = np.random.normal(color_mean, std, (224, 224, 3))

            # Add texture variation
            if profile["texture"] == "grainy":
                grain = np.random.normal(0, 15, (224, 224, 3))
                img_array += grain
            elif profile["texture"] == "cracked":
                # Simulate crack-like dark streaks
                for _ in range(np.random.randint(3, 8)):
                    x = np.random.randint(0, 220)
                    img_array[x:x+4, :] -= np.random.uniform(10, 25)
            elif profile["texture"] == "mixed":
                # Mix two slightly different areas
                boundary = np.random.randint(80, 150)
                img_array[boundary:] += np.random.normal(5, 8, (224 - boundary, 224, 3))

            # Add overall noise
            noise = np.random.normal(0, 8, (224, 224, 3))
            img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)

            img = Image.fromarray(img_array)
            img.save(class_dir / f"synth_{existing + i:04d}.jpg", quality=90)

        print(f"  [OK] {soil_type}: generated {to_gen} synthetic images")

    print(f"\n  Dataset saved to: {DATA_DIR}")


# ------------------------------------------------------------------------------
# MANUAL DOWNLOAD INSTRUCTIONS
# ------------------------------------------------------------------------------

def print_manual_instructions():
    print("""
  -----------------------------------------------------------
  -  HOW TO GET KAGGLE DATASETS (Manual Method)             -
  -----------------------------------------------------------

  STEP 1 - Create a free Kaggle account at https://kaggle.com

  STEP 2 - Download the primary soil image dataset:
    - https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset
    Click "Download" button - saves a .zip file

  STEP 3 - Extract the zip file anywhere on your PC.

  STEP 4 - Run this script to auto-organize into correct folders:
    python prepare_dataset.py --organize "C:\\path\\to\\extracted\\folder"

  ---------------------------------------------------------
  FOR KAGGLE API (faster, automated):
    1. Go to https://kaggle.com - Account Settings - Create New Token
    2. It downloads a kaggle.json file
    3. Place it at: C:\\Users\\sudar\\.kaggle\\kaggle.json
    4. Run: pip install kaggle
    5. Run: python prepare_dataset.py --download
  ---------------------------------------------------------
  See also: backend/data/DOWNLOAD_GUIDE.md
""")


# ------------------------------------------------------------------------------
# MAIN
# ------------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="SoilHelp Dataset Preparation Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--download",  action="store_true", help="Download datasets via Kaggle CLI")
    parser.add_argument("--organize",  metavar="DIR",       help="Organize images from a manually downloaded folder")
    parser.add_argument("--stats",     action="store_true", help="Show current dataset statistics")
    parser.add_argument("--synthetic", action="store_true", help="Generate synthetic fallback images")
    parser.add_argument("--n",         type=int, default=100, help="Number of synthetic images per class (default: 100)")
    args = parser.parse_args()

    print_header("SoilHelp - Dataset Preparation")

    # -- Mode: show stats only
    if args.stats:
        show_stats()
        return

    # -- Mode: organize manual download
    if args.organize:
        organize_manual(args.organize)
        show_stats()
        return

    # -- Mode: synthetic only
    if args.synthetic:
        generate_synthetic_dataset(images_per_class=args.n)
        show_stats()
        return

    # -- Mode: auto (default) or --download
    print("\n  Checking dataset status...")
    show_stats()

    # Check if we already have enough data
    lacking = [c for c in SOIL_CLASSES if count_images(DATA_DIR / c) < MIN_IMAGES]

    if not lacking:
        print("\n  [OK] Dataset already complete! No action needed.")
        print("  To train the CNN model, run:")
        print(f"    python train_models.py --soil-data {DATA_DIR}")
        return

    print(f"\n  Classes needing images: {', '.join(lacking)}")

    # Try Kaggle auto-download
    if check_kaggle_available():
        print("\n  - Kaggle API found - attempting auto-download...\n")
        success = run_kaggle_download()
    elif args.download:
        print("\n  [WARN]  Kaggle CLI not configured but --download was requested.")
        print_manual_instructions()
        return
    else:
        print("\n  --  Kaggle API not configured. Generating synthetic data as fallback.")
        print("  (For real data, see instructions below or run --download after setup)\n")
        generate_synthetic_dataset(images_per_class=args.n)
        print_manual_instructions()

    # Final stats
    print()
    show_stats()

    # Training reminder
    print("\n  -------------------------------------------------")
    print("  To train the CNN with this dataset, run:")
    print(f"    python train_models.py --soil-data {DATA_DIR}")
    print("  -------------------------------------------------\n")


if __name__ == "__main__":
    main()
