@echo off
echo ================================================================
echo   Gemini API Key Setup - Secure Method
echo ================================================================
echo.
echo This will help you add your Gemini API key securely.
echo.
echo INSTRUCTIONS:
echo 1. Go to: https://aistudio.google.com/apikey
echo 2. Delete ANY old keys you see
echo 3. Click "Create API key" 
echo 4. Copy the new key
echo 5. Come back here and paste it when prompted
echo.
echo ================================================================
echo.
set /p api_key="Paste your NEW Gemini API key here: "

echo.
echo Updating .env file...

REM Create the new .env content
(
echo # SoilHelp Backend - Environment Variables
echo.
echo # Google Gemini API Key ^(for AI-powered features^)
echo # Get from: https://aistudio.google.com/apikey
echo # IMPORTANT: Keep this secret! Never commit to git.
echo GEMINI_API_KEY=%api_key%
echo.
echo # Google Cloud Vision API Key ^(optional^)
echo GOOGLE_CLOUD_API_KEY=
echo.
echo # Server config
echo BACKEND_HOST=0.0.0.0
echo BACKEND_PORT=8000
) > .env

echo.
echo ================================================================
echo   SUCCESS! API key added to .env file
echo ================================================================
echo.
echo Now testing the connection...
echo.
python test_gemini_setup.py
echo.
echo Press any key to exit...
pause >nul