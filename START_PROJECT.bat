@echo off
title SoilHelp Launcher
color 0A

echo ============================================================
echo           Starting SoilHelp AI Application
echo ============================================================
echo.
echo Starting Backend Server on http://localhost:8000 ...
start "SoilHelp Backend" cmd /k "cd /d "%~dp0backend" && call start_server.bat"

echo Waiting for backend to initialize...
ping 127.0.0.1 -n 4 >nul

echo Starting Frontend Expo Server on http://localhost:8081 ...
start "SoilHelp Frontend (Expo)" cmd /k "cd /d "%~dp0" && npx expo start"

echo.
echo ============================================================
echo  Both services launched in separate windows!
echo  - Frontend Web/Expo: http://localhost:8081 (Press 'w' in Expo window for Web)
echo  - Backend API:       http://localhost:8000
echo  - API Documentation: http://localhost:8000/docs
echo ============================================================
echo.
