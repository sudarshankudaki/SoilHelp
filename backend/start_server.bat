@echo off
title SoilHelp Backend Server
color 0A

echo ============================================
echo    SoilHelp AI Backend - Starting Up
echo ============================================
echo.

:: Check if models exist, train if missing
IF NOT EXIST "saved_models\npk_regressor.pkl" (
    echo [!] Models not found. Running training first...
    echo.
    python train_models.py
    echo.
)

echo [*] Starting FastAPI server on http://0.0.0.0:8000
echo [*] Press Ctrl+C to stop
echo.
echo Find your local IP for device testing:
ipconfig | findstr /i "IPv4"
echo.
echo ============================================

python main.py

pause
