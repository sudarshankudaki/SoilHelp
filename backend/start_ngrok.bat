@echo off
echo ========================================
echo Starting ngrok for SoilHelp Backend
echo ========================================
echo.
echo Make sure your backend is running on port 8000!
echo If not, run: python main.py
echo.
echo Starting ngrok tunnel...
echo.

ngrok http 8000

echo.
echo ========================================
echo ngrok stopped
echo ========================================
pause
