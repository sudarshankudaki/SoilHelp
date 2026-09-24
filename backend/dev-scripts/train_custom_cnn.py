"""
Custom Lightweight CNN for Soil Classification
Designed specifically for 5 soil classes with realistic textures
"""
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
sys.path.insert(0, os.path.dirname(__file__))

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam
import numpy as np

SOIL_CLASSES = ["Sandy", "Clay", "Loam", "Black", "Red"]
IMG_SIZE = (224, 224)
MODEL_PATH = "saved_models/soil_classifier.h5"

def build_custom_soil_cnn():
    """
    Build a custom CNN optimized for soil texture classification.
    Much simpler than MobileNetV2, designed for 5 classes.
    """
    model = models.Sequential([
        # Input: 224x224x3
        layers.Input(shape=(*IMG_SIZE, 3)),
        layers.Rescaling(1./255),
        
        # Block 1: Extract basic textures
        layers.Conv2D(32, 3, padding='same', activation='relu'),
        layers.Conv2D(32, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(2),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        
        # Block 2: Extract mid-level patterns
        layers.Conv2D(64, 3, padding='same', activation='relu'),
        layers.Conv2D(64, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(2),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        # Block 3: Extract high-level features
        layers.Conv2D(128, 3, padding='same', activation='relu'),
        layers.Conv2D(128, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(2),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        # Block 4: Deep features
        layers.Conv2D(256, 3, padding='same', activation='relu'),
        layers.GlobalAveragePooling2D(),
        
        # Classification head
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(5, activation='softmax')  # 5 soil classes
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_custom_cnn():
    """Train the custom CNN on v2 synthetic soil images."""
    print("=" * 70)
    print("  Training Custom Soil CNN")
    print("=" * 70)
    
    data_dir = "data/soil_images_v2"
    
    # Data augmentation
    data_aug = tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.15),
        layers.RandomBrightness(0.2),
        layers.RandomContrast(0.2),
    ])
    
    # Load training data
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=32,
        class_names=SOIL_CLASSES,
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=32,
        class_names=SOIL_CLASSES,
    )
    
    # Apply augmentation to training set only
    train_ds = train_ds.map(lambda x, y: (data_aug(x, training=True), y))
    
    # Cache and prefetch
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    
    print(f"\nDataset loaded from: {data_dir}")
    print(f"  Training batches: {len(train_ds)}")
    print(f"  Validation batches: {len(val_ds)}")
    print(f"  Classes: {SOIL_CLASSES}\n")
    
    # Build model
    model = build_custom_soil_cnn()
    model.summary()
    
    print("\n[1/1] Training custom CNN...")
    print("  Epochs: 50")
    print("  Early stopping patience: 10")
    print("  Learning rate reduction: factor=0.5, patience=5\n")
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            factor=0.5,
            patience=5,
            verbose=1
        ),
        tf.keras.callbacks.ModelCheckpoint(
            MODEL_PATH,
            save_best_only=True,
            verbose=1
        ),
    ]
    
    # Train
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=50,
        callbacks=callbacks,
        verbose=1
    )
    
    # Final validation accuracy
    val_loss, val_acc = model.evaluate(val_ds, verbose=0)
    
    print("\n" + "=" * 70)
    print(f"✅ Training Complete!")
    print(f"   Final validation accuracy: {val_acc*100:.1f}%")
    print(f"   Model saved to: {MODEL_PATH}")
    print("=" * 70)
    
    return model, history

if __name__ == "__main__":
    model, history = train_custom_cnn()