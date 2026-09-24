# -*- coding: utf-8 -*-
"""
SoilHelp - Advanced Feature Extraction Module

Extracts discriminative features from soil images beyond simple color histograms:
- GLCM texture features (20-dim)
- Local Binary Patterns (32-dim)
- Gabor filter responses (24-dim)
- HSV color statistics (15-dim)
- Edge density features (3-dim)

Total: 94 advanced features for improved NPK prediction accuracy.

Author: SoilHelp ML Team
Version: 2.0
"""

import numpy as np
import cv2
from typing import Tuple

# Optional imports with graceful fallback
try:
    from skimage.feature import graycomatrix, graycoprops, local_binary_pattern
    from skimage.filters import gabor
    SKIMAGE_AVAILABLE = True
except ImportError:
    SKIMAGE_AVAILABLE = False
    print("[WARNING] scikit-image not installed. Advanced features will use fallback.")


def extract_glcm_features(img_gray: np.ndarray) -> np.ndarray:
    """
    Extract texture features using Gray-Level Co-occurrence Matrix.
    
    GLCM captures spatial relationships between pixel intensities, revealing
    soil texture patterns (smooth clay vs coarse sand vs cracked soil).
    
    Args:
        img_gray: Grayscale image (H x W), uint8 [0-255]
    
    Returns:
        20-dim feature vector:
        - contrast (4 angles) - intensity variation
        - dissimilarity (4 angles) - how different neighboring pixels are
        - homogeneity (4 angles) - uniformity
        - energy (4 angles) - orderliness
        - correlation (4 angles) - linear dependency
    
    Time: ~50ms per image
    """
    if not SKIMAGE_AVAILABLE:
        # Fallback: basic texture statistics
        return np.array([
            np.std(img_gray),
            np.std(img_gray[:-1] - img_gray[1:]),
            np.std(img_gray[:,:-1] - img_gray[:,1:]),
            np.mean(np.abs(img_gray[:-1] - img_gray[1:])),
            np.mean(np.abs(img_gray[:,:-1] - img_gray[:,1:])),
        ] * 4)  # Repeat to get 20 dims
    
    # Reduce resolution for speed (224x224 to 112x112)
    img_small = cv2.resize(img_gray, (112, 112), interpolation=cv2.INTER_AREA)
    
    # Compute GLCM at 4 angles (0, 45, 90, 135 degrees)
    glcm = graycomatrix(
        img_small,
        distances=[1],  # adjacent pixels
        angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
        levels=256,
        symmetric=True,
        normed=True
    )
    
    features = []
    for prop in ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation']:
        features.extend(graycoprops(glcm, prop).flatten())
    
    return np.array(features, dtype=np.float32)


def extract_lbp_features(img_gray: np.ndarray, n_bins: int = 32) -> np.ndarray:
    """
    Extract Local Binary Pattern histogram (micro-texture patterns).
    
    LBP encodes local texture by comparing each pixel with its neighbors,
    creating a rotation-invariant texture descriptor. Excellent for
    distinguishing soil granularity (sandy vs clayey).
    
    Args:
        img_gray: Grayscale image (H x W), uint8 [0-255]
        n_bins: Number of histogram bins (default 32 for speed)
    
    Returns:
        n_bins-dim normalized histogram
    
    Time: ~30ms per image
    """
    if not SKIMAGE_AVAILABLE:
        # Fallback: simple local variance histogram
        h, w = img_gray.shape
        local_var = np.zeros_like(img_gray, dtype=np.float32)
        for i in range(1, h-1):
            for j in range(1, w-1):
                neighborhood = img_gray[i-1:i+2, j-1:j+2]
                local_var[i, j] = np.var(neighborhood)
        
        hist, _ = np.histogram(local_var.ravel(), bins=n_bins, range=(0, 100))
        hist = hist.astype('float32')
        return hist / (hist.sum() + 1e-6)
    
    # Compute LBP (P=8 neighbors, R=1 radius, uniform pattern)
    lbp = local_binary_pattern(img_gray, P=8, R=1, method='uniform')
    
    # Create normalized histogram
    hist, _ = np.histogram(lbp.ravel(), bins=n_bins, range=(0, n_bins))
    hist = hist.astype('float32')
    hist = hist / (hist.sum() + 1e-6)  # normalize to probability distribution
    
    return hist


def extract_gabor_features(img_gray: np.ndarray) -> np.ndarray:
    """
    Extract Gabor filter responses (frequency + orientation texture).
    
    Gabor filters detect edges and textures at specific scales and orientations.
    Useful for detecting soil cracks, aggregates, and directional patterns.
    
    Args:
        img_gray: Grayscale image (H x W), uint8 [0-255]
    
    Returns:
        24-dim feature vector:
        - 4 frequency scales x 6 orientations
        - Each filter contributes 1 feature (mean response)
    
    Time: ~80ms per image
    """
    if not SKIMAGE_AVAILABLE:
        # Fallback: multi-scale edge detection
        features = []
        for ksize in [3, 5, 7, 9]:
            sobelx = cv2.Sobel(img_gray, cv2.CV_64F, 1, 0, ksize=ksize)
            sobely = cv2.Sobel(img_gray, cv2.CV_64F, 0, 1, ksize=ksize)
            magnitude = np.sqrt(sobelx**2 + sobely**2)
            features.extend([
                np.mean(magnitude),
                np.std(magnitude),
                np.mean(sobelx),
                np.mean(sobely),
                np.percentile(magnitude, 75),
                np.percentile(magnitude, 25)
            ])
        return np.array(features[:24], dtype=np.float32)
    
    # Normalize image for Gabor
    img_norm = img_gray.astype(np.float32) / 255.0
    
    features = []
    
    # 4 frequency scales (low to high)
    for frequency in [0.1, 0.2, 0.3, 0.4]:
        # 6 orientations (0 to 150 degrees in 30 degree steps)
        for theta in np.linspace(0, np.pi, 6, endpoint=False):
            try:
                # Apply Gabor filter
                real, imag = gabor(img_norm, frequency=frequency, theta=theta)
                
                # Use mean response as feature
                features.append(np.mean(np.abs(real)))
            except:
                # Fallback if gabor fails
                features.append(0.0)
    
    return np.array(features[:24], dtype=np.float32)


def extract_hsv_stats(img_rgb: np.ndarray) -> np.ndarray:
    """
    Extract HSV color space statistics (perceptually meaningful color features).
    
    HSV (Hue-Saturation-Value) is more perceptually uniform than RGB,
    making it better for distinguishing soil colors (red vs black vs sandy).
    
    Args:
        img_rgb: RGB image (H x W x 3), uint8 [0-255]
    
    Returns:
        15-dim feature vector:
        - 5 statistics (mean, std, median, Q1, Q3) x 3 channels (H, S, V)
    
    Time: ~10ms per image
    """
    # Convert RGB to HSV
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    
    features = []
    
    for ch in range(3):
        channel = hsv[:, :, ch].astype(np.float32)
        
        features.extend([
            np.mean(channel),
            np.std(channel),
            np.median(channel),
            np.percentile(channel, 25),
            np.percentile(channel, 75)
        ])
    
    return np.array(features, dtype=np.float32)


def extract_edge_features(img_gray: np.ndarray) -> np.ndarray:
    """
    Extract edge density and distribution features (soil structure indicators).
    
    Edges reveal soil structure: cracks in clay, aggregates in loam,
    smooth texture in sandy soil.
    
    Args:
        img_gray: Grayscale image (H x W), uint8 [0-255]
    
    Returns:
        3-dim feature vector:
        - edge_density: fraction of pixels on edges
        - edge_mean: average edge strength
        - edge_std: variability of edge strength
    
    Time: ~15ms per image
    """
    # Canny edge detection (optimal thresholds for soil images)
    edges = cv2.Canny(img_gray, threshold1=50, threshold2=150)
    
    features = [
        np.sum(edges > 0) / edges.size,  # edge density (0-1)
        np.mean(edges),                   # average edge strength
        np.std(edges)                     # edge variability
    ]
    
    return np.array(features, dtype=np.float32)


def extract_advanced_features(img_rgb: np.ndarray) -> np.ndarray:
    """
    Extract ALL advanced features from soil image.
    
    Combines texture, color, and structure features for comprehensive
    soil characterization beyond simple color histograms.
    
    Args:
        img_rgb: RGB image (H x W x 3), uint8 [0-255]
    
    Returns:
        94-dim feature vector:
        - GLCM texture (20)
        - LBP patterns (32)
        - Gabor responses (24)
        - HSV statistics (15)
        - Edge features (3)
    
    Time: ~185ms per image (parallelizable if needed)
    
    Example:
        >>> img = cv2.imread('soil.jpg')
        >>> img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        >>> features = extract_advanced_features(img_rgb)
        >>> print(features.shape)  # (94,)
    """
    # Convert to grayscale for texture features
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    
    # Extract all feature groups
    glcm = extract_glcm_features(img_gray)      # 20 features
    lbp = extract_lbp_features(img_gray, 32)    # 32 features
    gabor = extract_gabor_features(img_gray)    # 24 features
    hsv = extract_hsv_stats(img_rgb)            # 15 features
    edge = extract_edge_features(img_gray)      # 3 features
    
    # Concatenate into single feature vector
    features = np.concatenate([glcm, lbp, gabor, hsv, edge])
    
    # Sanity check: ensure no NaN or Inf values
    if np.any(np.isnan(features)) or np.any(np.isinf(features)):
        print("[WARNING] NaN/Inf detected in advanced features. Replacing with zeros.")
        features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
    
    return features


def validate_feature_vector(features: np.ndarray, expected_dim: int = 94) -> Tuple[bool, str]:
    """
    Validate extracted feature vector.
    
    Args:
        features: Feature vector to validate
        expected_dim: Expected dimensionality (default 94)
    
    Returns:
        (is_valid, error_message)
    """
    if features.shape[0] != expected_dim:
        return False, f"Expected {expected_dim} features, got {features.shape[0]}"
    
    if np.any(np.isnan(features)):
        return False, "Feature vector contains NaN values"
    
    if np.any(np.isinf(features)):
        return False, "Feature vector contains Inf values"
    
    if np.all(features == 0):
        return False, "Feature vector is all zeros (extraction likely failed)"
    
    return True, ""


def get_feature_names() -> list:
    """
    Get descriptive names for all 94 advanced features.
    Useful for feature importance analysis.
    
    Returns:
        List of 94 feature names
    """
    names = []
    
    # GLCM features (20)
    for prop in ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation']:
        for angle in ['0deg', '45deg', '90deg', '135deg']:
            names.append(f'glcm_{prop}_{angle}')
    
    # LBP features (32)
    for i in range(32):
        names.append(f'lbp_bin_{i}')
    
    # Gabor features (24)
    for freq_idx, freq in enumerate([0.1, 0.2, 0.3, 0.4]):
        for orient_idx in range(6):
            names.append(f'gabor_f{freq_idx}_o{orient_idx}')
    
    # HSV features (15)
    for ch in ['H', 'S', 'V']:
        for stat in ['mean', 'std', 'median', 'q25', 'q75']:
            names.append(f'hsv_{ch}_{stat}')
    
    # Edge features (3)
    names.extend(['edge_density', 'edge_mean', 'edge_std'])
    
    return names


def benchmark_feature_extraction(img_rgb: np.ndarray, n_runs: int = 10) -> dict:
    """
    Benchmark feature extraction performance.
    
    Args:
        img_rgb: Test image
        n_runs: Number of runs for averaging
    
    Returns:
        Dict with timing statistics
    """
    import time
    
    times = {
        'glcm': [],
        'lbp': [],
        'gabor': [],
        'hsv': [],
        'edge': [],
        'total': []
    }
    
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    
    for _ in range(n_runs):
        # GLCM
        t0 = time.perf_counter()
        extract_glcm_features(img_gray)
        times['glcm'].append(time.perf_counter() - t0)
        
        # LBP
        t0 = time.perf_counter()
        extract_lbp_features(img_gray, 32)
        times['lbp'].append(time.perf_counter() - t0)
        
        # Gabor
        t0 = time.perf_counter()
        extract_gabor_features(img_gray)
        times['gabor'].append(time.perf_counter() - t0)
        
        # HSV
        t0 = time.perf_counter()
        extract_hsv_stats(img_rgb)
        times['hsv'].append(time.perf_counter() - t0)
        
        # Edge
        t0 = time.perf_counter()
        extract_edge_features(img_gray)
        times['edge'].append(time.perf_counter() - t0)
        
        # Total
        t0 = time.perf_counter()
        extract_advanced_features(img_rgb)
        times['total'].append(time.perf_counter() - t0)
    
    # Compute statistics
    stats = {}
    for key, values in times.items():
        stats[key] = {
            'mean_ms': np.mean(values) * 1000,
            'std_ms': np.std(values) * 1000,
            'min_ms': np.min(values) * 1000,
            'max_ms': np.max(values) * 1000
        }
    
    return stats


if __name__ == "__main__":
    print("=" * 70)
    print("  SoilHelp Advanced Feature Extraction - Test & Benchmark")
    print("=" * 70)
    
    # Create synthetic test image (simulated soil texture)
    np.random.seed(42)
    img_test = np.random.randint(100, 160, (224, 224, 3), dtype=np.uint8)
    
    # Add some texture (simulated soil aggregates)
    for _ in range(20):
        cx, cy = np.random.randint(0, 224, 2)
        cv2.circle(img_test, (cx, cy), np.random.randint(5, 15), 
                   (np.random.randint(80, 120),) * 3, -1)
    
    print(f"\n[1/3] Extracting features from {img_test.shape} test image...")
    features = extract_advanced_features(img_test)
    
    print(f"   Success: Feature vector shape: {features.shape}")
    print(f"   Success: Feature range: [{np.min(features):.4f}, {np.max(features):.4f}]")
    print(f"   Success: Feature mean: {np.mean(features):.4f}")
    print(f"   Success: Feature std: {np.std(features):.4f}")
    
    print(f"\n[2/3] Validating feature vector...")
    is_valid, error_msg = validate_feature_vector(features)
    if is_valid:
        print("   Success: Feature vector VALID")
    else:
        print(f"   Error: Feature vector INVALID: {error_msg}")
    
    print(f"\n[3/3] Benchmarking performance...")
    stats = benchmark_feature_extraction(img_test, n_runs=10)
    
    print("\n   Component Timing (mean +/- std):")
    print("   " + "-" * 50)
    for component, timing in stats.items():
        if component != 'total':
            print(f"   {component.upper():<8} {timing['mean_ms']:>6.1f} +/- {timing['std_ms']:>4.1f} ms")
    print("   " + "-" * 50)
    print(f"   {'TOTAL':<8} {stats['total']['mean_ms']:>6.1f} +/- {stats['total']['std_ms']:>4.1f} ms")
    
    if stats['total']['mean_ms'] < 200:
        print("\n   Success: Performance target MET (<200ms)")
    else:
        print(f"\n   Warning: Performance target MISSED (expected <200ms, got {stats['total']['mean_ms']:.1f}ms)")
    
    print("\n" + "=" * 70)
    print("  Feature extraction module ready for integration!")
    print("=" * 70)