"""
Simple Shallow CNN for Soil Classification
Focuses on color/brightness differences which are clearly separated in the data
"""
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam
import numpy as np

SOIL_CLASSES = ["Sandy", "Clay", "Loam", "Black", "Red"]
IMG_SIZE = (224, 224)
MODEL_PATH = "saved_models/soil_classifier.h5"

def build_simple_cnn():
    """Simple CNN that focuses on global color/brightness patterns."""
    model = models.Sequential([
        layers.Input(shape=(*IMG_SIZE, 3)),
        
        # Global color extraction
        layers.Conv2D(16, 7, strides=2, padding='same', activation='relu'),
        layers.MaxPooling2D(2),
        layers.BatchNormalization(),
        
        layers.Conv2D(32, 5, strides=2, padding='same', activation='relu'),
        layers.MaxPooling2D(2),
        layers.BatchNormalization(),
        
        layers.Conv2D(64, 3, padding='same', activation='relu'),
        layers.GlobalAveragePooling2D(),
        
        # Classification
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(5, activation='softmax')
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train():
    print("=" * 70)
    print("  Training Simple CNN (Color-Based Classification)")
    print("=" * 70)
    
    data_dir = "data/soil_images_v2"
    
    # Minimal augmentation to preserve color differences
    data_aug = tf.keras.Sequential([
        layers.Rescaling(1./255),
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomBrightness(0.1),
    ])
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=64,  # Larger batch for stability
        class_names=SOIL_CLASSES,
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=64,
        class_names=SOIL_CLASSES,
    )
    
    train_ds = train_ds.map(lambda x, y: (data_aug(x), y))
    val_ds = val_ds.map(lambda x, y: (tf.keras.layers.Rescaling(1./255)(x), y))
    
    train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)
    
    print(f"\nDataset: {data_dir}")
    print(f"Classes: {SOIL_CLASSES}\n")
    
    model = build_simple_cnn()
    model.summary()
    
    print("\nTraining...")
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=30,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=4),
            tf.keras.callbacks.ModelCheckpoint(MODEL_PATH, save_best_only=True),
        ],
        verbose=2
    )
    
    val_loss, val_acc = model.evaluate(val_ds, verbose=0)
    
    print(f"\n{'='*70}")
    print(f"Training Complete!")
    print(f"Validation Accuracy: {val_acc*100:.1f}%")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"{'='*70}")
    
    return model

if __name__ == "__main__":
    train()