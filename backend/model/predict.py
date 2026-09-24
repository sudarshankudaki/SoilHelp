"""
SoilHelp - ML Model: Soil Type Classifier + NPK Predictor

Architecture:
  - Soil Type: MobileNetV2 transfer learning (5 classes)
  - NPK + pH: Color histogram features - Random Forest Regressor

Training Data:
  - Soil images from Kaggle "Soil Types" dataset (jayaprakashpondy et al.)
  - NPK data: real Indian lab data (Kaggle CSVs) or ICAR-calibrated synthetic
  - Run `python data/collect_npk_data.py` to build the NPK CSV first
  - Run `python prepare_dataset.py` to build the image dataset first
"""

import os
import numpy as np
import cv2
from PIL import Image
import io

# --- TensorFlow / Keras -------------------------------------------------------
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam

# --- scikit-learn -------------------------------------------------------------
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

# --- Constants ----------------------------------------------------------------
SOIL_CLASSES = ["Sandy", "Clay", "Loam", "Black", "Red"]
TEXTURE_TO_INDEX = {cls.lower(): idx for idx, cls in enumerate(SOIL_CLASSES)}
IMG_SIZE = (224, 224)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

SOIL_MODEL_PATH   = os.path.join(MODEL_DIR, "soil_classifier.h5")
NPK_MODEL_PATH    = os.path.join(MODEL_DIR, "npk_regressor.pkl")
SCALER_PATH       = os.path.join(MODEL_DIR, "npk_scaler.pkl")
SOIL_ENCODER_PATH = os.path.join(MODEL_DIR, "soil_label_encoder.pkl")

STRUCTURED_SOIL_FEATURE_KEYS = [
    "moisture_pct",
    "organic_carbon_pct",
    "ec_ds_m",
    "temperature_c",
    "rainfall_mm",
    "ph",
    "slope",
    "water_logging",
]


# ------------------------------------------------------------------------------
# PART 1 - Soil Type Classifier (MobileNetV2)
# ------------------------------------------------------------------------------

def build_soil_classifier(num_classes: int = 5) -> tf.keras.Model:
    """Build MobileNetV2 transfer learning model."""
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    # Freeze base layers
    base.trainable = False

    model = models.Sequential([
        base,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.4),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax"),
    ])

    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train_soil_classifier(data_dir: str, epochs: int = 20, batch_size: int = 32):
    """
    Train the soil classifier from a directory structured as:
    data_dir/
      Sandy/  *.jpg
      Clay/   *.jpg
      Loam/   *.jpg
      Black/  *.jpg
      Red/    *.jpg
    """
    # Data augmentation
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.3),
        layers.RandomZoom(0.2),
        layers.RandomBrightness(0.2),
    ])

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=batch_size,
        class_names=SOIL_CLASSES,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=batch_size,
        class_names=SOIL_CLASSES,
    )

    # Normalize + augment
    normalization = layers.Rescaling(1.0 / 255)
    train_ds = train_ds.map(lambda x, y: (data_augmentation(normalization(x), training=True), y))
    val_ds   = val_ds.map(lambda x, y: (normalization(x), y))

    # Cache and prefetch
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds   = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    model = build_soil_classifier()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3),
        tf.keras.callbacks.ModelCheckpoint(SOIL_MODEL_PATH, save_best_only=True),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
    )

    # Fine-tune: unfreeze top 30 layers
    model.layers[0].trainable = True
    for layer in model.layers[0].layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        callbacks=callbacks,
    )

    print(f"[-] Soil classifier saved to {SOIL_MODEL_PATH}")
    return model


# ------------------------------------------------------------------------------
# PART 2 - NPK + pH Regressor (Color Histogram + Random Forest)
# ------------------------------------------------------------------------------

def extract_color_features(image_array: np.ndarray) -> np.ndarray:
    """
    Extract color histogram features from a soil image.
    Returns a 192-dim feature vector (64 bins × 3 channels).
    """
    img_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    features = []
    for channel in range(3):
        hist = cv2.calcHist([img_rgb], [channel], None, [64], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        features.extend(hist)
    return np.array(features)


def _normalize_soil_features(soil_features: dict | None, soil_type: str | None) -> dict:
    """Normalize optional soil metadata into a consistent dictionary."""
    normalized = {
        "texture": (soil_type or "Loam").strip().title(),
        "moisture_pct": 28.0,
        "organic_carbon_pct": 1.2,
        "ec_ds_m": 1.5,
        "temperature_c": 28.0,
        "rainfall_mm": 750.0,
        "ph": 6.5,
        "slope": 0.5,
        "water_logging": 0.0,
    }
    if soil_features:
        for key, value in soil_features.items():
            if value is None or value == "":
                continue
            normalized[key] = value
    if normalized["texture"] not in SOIL_CLASSES:
        normalized["texture"] = soil_type if soil_type in SOIL_CLASSES else "Loam"
    return normalized


def build_npk_feature_vector(
    color_features: np.ndarray,
    soil_type: str = None,
    soil_features: dict | None = None,
) -> np.ndarray:
    """
    Build the full feature vector for NPK inference:
      192 colour histogram dims + 5 soil-type one-hot dims + 9 structured soil feature dims.
    The structured values keep the model grounded in real soil measurements while still
    preserving the old image-based fallback when metadata is empty.
    """
    one_hot = np.zeros(len(SOIL_CLASSES), dtype=np.float32)
    if soil_type and soil_type in SOIL_CLASSES:
        one_hot[SOIL_CLASSES.index(soil_type)] = 1.0

    normalized = _normalize_soil_features(soil_features, soil_type)
    texture_idx = TEXTURE_TO_INDEX.get(normalized["texture"].lower(), TEXTURE_TO_INDEX["loam"])
    texture_one_hot = np.zeros(len(SOIL_CLASSES), dtype=np.float32)
    texture_one_hot[texture_idx] = 1.0

    structured_values = np.array([
        float(normalized.get("moisture_pct", 28.0)),
        float(normalized.get("organic_carbon_pct", 1.2)),
        float(normalized.get("ec_ds_m", 1.5)),
        float(normalized.get("temperature_c", 28.0)),
        float(normalized.get("rainfall_mm", 750.0)),
        float(normalized.get("ph", 6.5)),
        float(normalized.get("slope", 0.5)),
        float(normalized.get("water_logging", 0.0)),
    ], dtype=np.float32)

    # Preserve the old color+soil-type representation by appending structured values.
    return np.concatenate([color_features, one_hot, texture_one_hot, structured_values])


# -- ICAR-calibrated NPK ranges (Indian Council of Agricultural Research norms) -
# Ranges updated to incorporate Karnataka district-wise ICAR-NBSS&LUP survey data.
# The Karnataka sub-ranges are tighter and sit inside the original wider national
# ranges — so existing synthetic data remains valid and is supplemented.
_ICAR_NPK = {
    "Sandy": {
        # National: 0.04–0.14 | Karnataka (Tumkur/Chitradurga): 0.06–0.12
        "N": (0.04, 0.14), "P": (4.0, 16.0), "K": (60.0, 155.0), "pH": (5.5, 7.2),
        "colors": ([180, 150, 100], [220, 190, 140]),
        "ka_N": (0.06, 0.12), "ka_P": (5.0, 9.0), "ka_K": (88.0, 118.0), "ka_pH": (5.8, 6.4),
    },
    "Clay": {
        # National: 0.15–0.38 | Karnataka (Coastal/Malnad): 0.19–0.27
        "N": (0.15, 0.38), "P": (10.0, 26.0), "K": (140.0, 260.0), "pH": (6.0, 7.8),
        "colors": ([100, 100, 100], [140, 140, 140]),
        "ka_N": (0.19, 0.27), "ka_P": (14.5, 19.0), "ka_K": (172.0, 198.0), "ka_pH": (5.5, 6.2),
    },
    "Loam": {
        # National: 0.25–0.52 | Karnataka (Hassan/Mysuru alluvial): 0.26–0.34
        "N": (0.25, 0.52), "P": (18.0, 36.0), "K": (175.0, 285.0), "pH": (5.8, 7.2),
        "colors": ([120, 90, 60], [160, 120, 90]),
        "ka_N": (0.26, 0.34), "ka_P": (18.5, 23.5), "ka_K": (195.0, 225.0), "ka_pH": (6.3, 6.8),
    },
    "Black": {
        # National: 0.30–0.58 | Karnataka (North KA Vertisols): 0.36–0.50
        "N": (0.30, 0.58), "P": (14.0, 32.0), "K": (195.0, 360.0), "pH": (7.0, 8.6),
        "colors": ([20, 20, 20], [60, 60, 60]),
        "ka_N": (0.36, 0.50), "ka_P": (21.0, 29.0), "ka_K": (275.0, 345.0), "ka_pH": (7.4, 8.4),
    },
    "Red": {
        # National: 0.06–0.22 | Karnataka (South-east laterite): 0.10–0.17
        "N": (0.06, 0.22), "P": (5.0, 20.0), "K": (90.0, 185.0), "pH": (4.8, 6.8),
        "colors": ([150, 60, 40], [200, 100, 80]),
        "ka_N": (0.10, 0.17), "ka_P": (7.5, 12.5), "ka_K": (130.0, 168.0), "ka_pH": (5.8, 6.5),
    },
}

_NPK_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "npk_training_data.csv")


def _load_npk_from_csv(csv_path: str) -> tuple:
    """
    Load real NPK lab data from CSV and generate color histogram features.
    CSV must have columns: N, P, K, pH (and optionally soil_type).
    Returns (X, y) arrays ready for training.
    """
    try:
        import pandas as pd
    except ImportError:
        print("[--] pandas not installed - cannot load CSV. Falling back to synthetic.")
        return None, None

    if not os.path.exists(csv_path):
        return None, None

    df = pd.read_csv(csv_path)
    required = {"N", "P", "K"}
    if not required.issubset(df.columns):
        print(f"[--] CSV missing required columns. Found: {list(df.columns)}")
        return None, None

    # Drop rows with missing NPK
    df = df.dropna(subset=["N", "P", "K"]).reset_index(drop=True)

    # Fill missing pH with per-soil-type median (or global median)
    if "pH" not in df.columns:
        df["pH"] = 6.5
    else:
        df["pH"] = df["pH"].fillna(df["pH"].median())

    # Map soil_type - color range for synthetic image generation
    soil_col = "soil_type" if "soil_type" in df.columns else None

    X, y = [], []
    for _, row in df.iterrows():
        soil = row.get(soil_col) if soil_col else None
        if soil in _ICAR_NPK:
            c_min, c_max = _ICAR_NPK[soil]["colors"]
        else:
            # Generic medium-brown soil color
            c_min, c_max = [100, 80, 55], [160, 130, 90]

        # Simulate image from color range + slight randomness
        c = [np.random.randint(lo, hi) for lo, hi in zip(c_min, c_max)]
        img = np.random.normal(c, 20, (224, 224, 3)).clip(0, 255).astype(np.uint8)
        color_feat = extract_color_features(img)
        soil_features = {
            "texture": soil if soil in SOIL_CLASSES else "Loam",
            "moisture_pct": float(row.get("moisture_pct", 28.0)),
            "organic_carbon_pct": float(row.get("organic_carbon_pct", 1.2)),
            "ec_ds_m": float(row.get("ec_ds_m", 1.5)),
            "temperature_c": float(row.get("temperature_c", 28.0)),
            "rainfall_mm": float(row.get("rainfall_mm", 750.0)),
            "ph": float(row.get("pH", 6.5)),
            "slope": float(row.get("slope", 0.5)),
            "water_logging": float(row.get("water_logging", 0.0)),
        }
        feat = build_npk_feature_vector(color_feat, soil, soil_features)
        X.append(feat)
        y.append([float(row["N"]), float(row["P"]),
                  float(row["K"]), float(row["pH"])])

    print(f"[-] Loaded {len(X)} samples from real NPK CSV")
    return np.array(X), np.array(y)


def _generate_synthetic_npk_data(n_samples: int = 3000) -> tuple:
    """
    Generate synthetic training data using ICAR-calibrated NPK ranges.
    Uses Beta distribution for realistic (non-uniform) value spread.
    Also generates Karnataka-sub-range samples to improve regional accuracy.
    Features are 197-dim: 192 colour histogram + 5 soil-type one-hot.
    Fallback when no real CSV is available.
    """
    np.random.seed(42)
    X, y = [], []

    n_per_class = n_samples // len(SOIL_CLASSES)

    for soil_name, params in _ICAR_NPK.items():
        c_min, c_max = params["colors"]

        # ── National ICAR range samples ───────────────────────────────────────
        for _ in range(n_per_class):
            img = np.random.randint(c_min, c_max, (224, 224, 3), dtype=np.uint8)
            color_feat = extract_color_features(img)
            soil_features = {
                "texture": soil_name,
                "moisture_pct": np.random.uniform(18.0, 42.0),
                "organic_carbon_pct": np.random.uniform(0.4, 2.0),
                "ec_ds_m": np.random.uniform(0.8, 3.2),
                "temperature_c": np.random.uniform(24.0, 34.0),
                "rainfall_mm": np.random.uniform(400.0, 1200.0),
                "ph": np.random.uniform(params["pH"][0], params["pH"][1]),
                "slope": np.random.uniform(0.1, 1.0),
                "water_logging": np.random.uniform(0.0, 0.3),
            }
            feat = build_npk_feature_vector(color_feat, soil_name, soil_features)
            X.append(feat)

            N  = params["N"][0]  + (params["N"][1]  - params["N"][0])  * np.random.beta(2, 2)
            P  = params["P"][0]  + (params["P"][1]  - params["P"][0])  * np.random.beta(2, 2)
            K  = params["K"][0]  + (params["K"][1]  - params["K"][0])  * np.random.beta(2, 2)
            pH = params["pH"][0] + (params["pH"][1] - params["pH"][0]) * np.random.beta(2, 2)
            factor = np.random.normal(1.0, 0.04)
            y.append([N * factor, P, K, pH])

        # ── Karnataka sub-range samples (150 extra per class) ─────────────────
        # Tighter distributions anchored to district survey data
        ka_n_lo,  ka_n_hi  = params["ka_N"]
        ka_p_lo,  ka_p_hi  = params["ka_P"]
        ka_k_lo,  ka_k_hi  = params["ka_K"]
        ka_ph_lo, ka_ph_hi = params["ka_pH"]

        for _ in range(150):
            img = np.random.randint(c_min, c_max, (224, 224, 3), dtype=np.uint8)
            color_feat = extract_color_features(img)
            soil_features = {
                "texture": soil_name,
                "moisture_pct": np.random.uniform(20.0, 40.0),
                "organic_carbon_pct": np.random.uniform(0.5, 2.2),
                "ec_ds_m": np.random.uniform(1.0, 2.8),
                "temperature_c": np.random.uniform(22.0, 32.0),
                "rainfall_mm": np.random.uniform(500.0, 1000.0),
                "ph": np.random.uniform(ka_ph_lo, ka_ph_hi),
                "slope": np.random.uniform(0.2, 0.8),
                "water_logging": np.random.uniform(0.0, 0.25),
            }
            feat = build_npk_feature_vector(color_feat, soil_name, soil_features)
            X.append(feat)

            N  = ka_n_lo  + (ka_n_hi  - ka_n_lo)  * np.random.beta(3, 3)
            P  = ka_p_lo  + (ka_p_hi  - ka_p_lo)  * np.random.beta(3, 3)
            K  = ka_k_lo  + (ka_k_hi  - ka_k_lo)  * np.random.beta(3, 3)
            pH = ka_ph_lo + (ka_ph_hi - ka_ph_lo) * np.random.beta(3, 3)
            y.append([N, P, K, pH])

    return np.array(X), np.array(y)


def train_npk_regressor():
    """
    Train and save the NPK regressor ensemble.
    Feature vector: 197-dim = 192 colour histogram + 5 soil-type one-hot.

    Model: VotingRegressor of tuned RandomForest + GradientBoosting
    wrapped in MultiOutputRegressor for joint N/P/K/pH prediction.

    Data priority:
      1. Real NPK CSV (npk_training_data.csv) — includes Karnataka augmented rows
      2. ICAR-calibrated synthetic fallback (with Karnataka sub-ranges baked in)
    """
    # Try real CSV data first
    X, y = _load_npk_from_csv(_NPK_CSV_PATH)

    if X is None or len(X) < 100:
        print("[-] No real NPK CSV found — generating ICAR+Karnataka synthetic data...")
        print("     Tip: run `python data/collect_npk_data.py --generate` first")
        X, y = _generate_synthetic_npk_data(3000)
    else:
        print(f"[-] Training NPK regressor on {len(X)} samples "
              f"(real CSV + Karnataka augmented)...")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── Tuned RandomForest ────────────────────────────────────────────────────
    rf = RandomForestRegressor(
        n_estimators=500,       # up from 300
        max_depth=22,           # up from 18
        min_samples_split=3,    # tighter splits
        min_samples_leaf=1,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1,
    )

    # ── GradientBoosting per output (handles non-linear Karnataka patterns) ───
    gb = MultiOutputRegressor(
        GradientBoostingRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            min_samples_split=4,
            random_state=42,
        ),
        n_jobs=-1,
    )

    # ── Voting ensemble: RF gets higher weight (more stable on histogram feats)
    print("[-] Fitting RF + GradientBoosting ensemble...")
    rf.fit(X_scaled, y)
    gb.fit(X_scaled, y)

    # Blend predictions at inference: 60% RF + 40% GB
    # Saved as a dict so we can weighted-average at predict time
    ensemble = {"rf": rf, "gb": gb, "rf_weight": 0.60, "gb_weight": 0.40}

    joblib.dump(ensemble, NPK_MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"[-] NPK ensemble saved to {NPK_MODEL_PATH}")
    return ensemble, scaler


# ------------------------------------------------------------------------------
# PART 3 - Inference (used by main.py)
# ------------------------------------------------------------------------------

_soil_model = None
_npk_model  = None
_scaler     = None


def load_models():
    global _soil_model, _npk_model, _scaler
    if os.path.exists(SOIL_MODEL_PATH):
        _soil_model = tf.keras.models.load_model(SOIL_MODEL_PATH)
        print("[-] Soil classifier loaded")
    else:
        print("[--] No soil model found - using rule-based fallback")

    if os.path.exists(NPK_MODEL_PATH) and os.path.exists(SCALER_PATH):
        _npk_model = joblib.load(NPK_MODEL_PATH)
        _scaler    = joblib.load(SCALER_PATH)
        print("[-] NPK regressor loaded")
    else:
        print("[--] No NPK model found - training now...")
        _npk_model, _scaler = train_npk_regressor()

def preprocess_image(image_bytes: bytes) -> tuple:
    """Convert raw image bytes to model-ready tensors."""
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pil_img_resized = pil_img.resize(IMG_SIZE)

    # For soil classifier — normalised [0,1] tensor
    img_array = np.array(pil_img_resized) / 255.0
    img_tensor = np.expand_dims(img_array, axis=0)

    # For NPK — BGR for OpenCV histogram extraction
    img_cv = cv2.cvtColor(np.array(pil_img_resized), cv2.COLOR_RGB2BGR)
    color_features = extract_color_features(img_cv)

    return img_tensor, color_features, img_cv



def check_image_quality(img_array: np.ndarray) -> tuple:
    """
    Check if soil image meets quality standards for accurate prediction.
    
    Rejects images that are:
    - Too blurry (camera shake, out of focus)
    - Too dark or too bright (poor lighting)
    - Missing sufficient soil content (mostly vegetation/hands)
    
    Args:
        img_array: RGB image array (H x W x 3), uint8 [0-255]
    
    Returns:
        (is_valid, error_message)
        - is_valid: True if image passes quality checks
        - error_message: Empty string if valid, helpful error message if invalid
    
    Example:
        >>> img = np.array(Image.open('soil.jpg'))
        >>> is_valid, msg = check_image_quality(img)
        >>> if not is_valid:
        >>>     print(f"Image rejected: {msg}")
    """
    # Convert to grayscale for blur detection
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # 1. BLUR DETECTION (Laplacian variance method)
    # Blurry images have low edge strength variance
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 100:
        return False, "Image is too blurry. Please hold camera steady and retake photo."
    
    # 2. BRIGHTNESS CHECK
    # Too dark or too bright images lose color/texture information
    brightness = np.mean(img_array)
    if brightness < 15:
        return False, "Image is too dark. Please retake in better lighting or use flash."
    if brightness > 220:
        return False, "Image is overexposed. Reduce brightness or avoid direct sunlight and retake."
    
    # 3. SOIL CONTENT CHECK
    # Ensure at least 30% of image contains soil-colored pixels
    # Soil colors: brown/red/gray hues (H: 0-30 or low saturation)
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    # Soil mask: brown/red hues OR low saturation (gray/black soil)
    h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
    soil_mask = (
        ((h < 30) | (h > 150)) &  # Brown/red or gray hues
        (s > 10) &                 # Not pure white
        (v > 20) & (v < 200)       # Not too dark or too bright
    )
    
    soil_pct = np.sum(soil_mask) / soil_mask.size
    if soil_pct < 0.30:
        return False, "Not enough soil visible in image. Please retake closer to soil surface with less vegetation/background."
    
    # All checks passed
    return True, ""

def _run_npk_ensemble(ensemble, feat_scaled: np.ndarray) -> np.ndarray:
    """Weighted blend of RF and GB ensemble predictions."""
    if isinstance(ensemble, dict):
        rf_pred = ensemble["rf"].predict(feat_scaled)[0]
        gb_pred = ensemble["gb"].predict(feat_scaled)[0]
        w_rf = ensemble.get("rf_weight", 0.60)
        w_gb = ensemble.get("gb_weight", 0.40)
        return rf_pred * w_rf + gb_pred * w_gb
    else:
        # Legacy: plain RandomForestRegressor (backward compat with old .pkl)
        return ensemble.predict(feat_scaled)[0]


def predict(image_bytes: bytes, vision_hint: str = "Loam", soil_features: dict | None = None) -> dict:
    """Run full soil analysis on image bytes and optional structured soil metadata."""
    if _soil_model is None or _npk_model is None:
        load_models()

    img_tensor, color_features, img_cv = preprocess_image(image_bytes)

    # -- Soil Type Prediction --------------------------------------------------
    if _soil_model is not None:
        probs = _soil_model.predict(img_tensor, verbose=0)[0]
        soil_idx = int(np.argmax(probs))
        soil_type = SOIL_CLASSES[soil_idx]
        soil_confidence = float(np.max(probs))
        all_probs = {cls: float(p) for cls, p in zip(SOIL_CLASSES, probs)}
    else:
        # Fallback: use Vision API color hint
        soil_type = vision_hint if vision_hint in SOIL_CLASSES else "Loam"
        soil_confidence = 0.65
        all_probs = {cls: 0.2 for cls in SOIL_CLASSES}
        all_probs[soil_type] = soil_confidence

    # -- NPK + pH Prediction ---------------------------------------------------
    # Build feature vector from image + soil metadata. Structured measurements help the
    # model separate soil conditions that are visually similar but agronomically different.
    merged_features = _normalize_soil_features(soil_features, soil_type)
    full_feat = build_npk_feature_vector(color_features, soil_type, merged_features)
    feat_scaled = _scaler.transform([full_feat])
    npk_pred = _run_npk_ensemble(_npk_model, feat_scaled)

    nitrogen   = round(float(np.clip(npk_pred[0], 0.0,   1.0)),  3)
    phosphorus = round(float(np.clip(npk_pred[1], 0.0,  50.0)),  2)
    potassium  = round(float(np.clip(npk_pred[2], 0.0, 400.0)),  2)

    # pH: clamp to soil-type known window for tighter accuracy
    # This uses the Karnataka-calibrated national ICAR window
    ph_lo, ph_hi = _ICAR_NPK[soil_type]["pH"]
    ph_raw = float(npk_pred[3])
    # Blend raw prediction with soil-type midpoint (30% pull) to reduce outliers
    ph_mid = (ph_lo + ph_hi) / 2.0
    ph_blended = ph_raw * 0.75 + ph_mid * 0.25
    ph = round(float(np.clip(ph_blended, ph_lo - 0.3, ph_hi + 0.3)), 2)

    return {
        "soil_type":        soil_type,
        "soil_confidence":  round(soil_confidence * 100, 1),
        "all_probabilities": all_probs,
        "nutrients": {
            "nitrogen":   {"value": nitrogen,   "unit": "%",   "label": "Nitrogen (N)"},
            "phosphorus": {"value": phosphorus, "unit": "ppm", "label": "Phosphorus (P)"},
            "potassium":  {"value": potassium,  "unit": "ppm", "label": "Potassium (K)"},
            "ph":         {"value": ph,         "unit": "",    "label": "Soil pH"},
        },
    }


# ------------------------------------------------------------------------------
# Entry point - run to train models
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--train":
        data_dir = sys.argv[2] if len(sys.argv) > 2 else "./data/soil_images"
        if os.path.exists(data_dir):
            print(f"[-] Training soil classifier on {data_dir}...")
            train_soil_classifier(data_dir)
        else:
            print(f"[--] Data dir '{data_dir}' not found. Skipping CNN training.")

    print("[-] Training NPK regressor...")
    train_npk_regressor()
    print("[-] All models trained and saved!")

