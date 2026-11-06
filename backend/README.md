---
title: SoilHelp API
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: docker
pinned: false
license: mit
app_port: 8000
---

# SoilHelp Backend API

AI-powered soil analysis backend using FastAPI, TensorFlow, and scikit-learn.

## Features
- Soil type classification from images (Black, Red, Sandy, Loam, Clayey)
- NPK (Nitrogen, Phosphorus, Potassium) prediction
- Crop recommendations based on soil parameters
- Fertilizer recommendations

## API Endpoints
- `GET /health` - Health check
- `POST /analyze` - Soil image analysis
- `POST /register` - User registration
- `POST /login` - User login
- `GET /farmers` - List all farmers

## Tech Stack
- FastAPI
- TensorFlow/Keras
- scikit-learn
- OpenCV
- PIL

## Environment Variables
Required: `JWT_SECRET`, `DEFAULT_API_TOKEN`
