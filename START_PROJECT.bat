@echo off
title SoilHelp - Project Starter
color 0A
echo.
echo ================================================
echo        SoilHelp - AI Soil Analysis System
echo ================================================
echo.
echo Starting Backend Server...
start "SoilHelp Backend" cmd /k "cd backend && color 0C && title SoilHelp Backend && python main.py"
timeout /t 8 /nobreak > nul

echo Starting Frontend Application...
start "SoilHelp Frontend" cmd /k "color 0B && title SoilHelp Frontend && npm start"
timeout /t 5 /nobreak > nul

echo.
echo ================================================
echo   Services Started Successfully!
echo ================================================
echo.
echo Backend API: http://localhost:8000/docs
echo Frontend App: http://localhost:8081
echo.
echo In the Frontend window, press 'w' to open browser
echo.
echo Press any key to close this window...
pause > nul
