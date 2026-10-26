#!/usr/bin/env bash
# Render build script for SoilHelp Backend

set -o errexit  # Exit on error

echo "=== Installing Python dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Training ML models ==="
python train_models.py

echo "=== Build complete! ==="
