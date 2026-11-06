@echo off
echo ========================================
echo SoilHelp - Deploy to Hugging Face Spaces
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Step 1: Configure your Hugging Face Space
echo.
echo Please enter your Hugging Face details:
echo.

set /p HF_USERNAME="Enter your Hugging Face username: "
set /p HF_SPACE="Enter your Space name (e.g., soilhelp-backend): "

echo.
echo Your backend will be deployed to:
echo https://huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE%
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Step 2: Initializing Git repository...
git init

echo.
echo Step 3: Adding Hugging Face remote...
git remote remove hf 2>nul
git remote add hf https://huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE%

echo.
echo Step 4: Installing Git LFS (for large files)...
git lfs install

echo.
echo Step 5: Adding files...
git add .

echo.
echo Step 6: Creating commit...
git commit -m "Deploy SoilHelp backend to Hugging Face Spaces"

echo.
echo Step 7: Pushing to Hugging Face...
echo You will be prompted for your Hugging Face credentials
echo.
git push hf main --force

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your backend is now deploying at:
echo https://huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE%
echo.
echo What to do next:
echo 1. Wait 5-10 minutes for the build to complete
echo 2. Go to your Space settings and add secrets:
echo    - JWT_SECRET
echo    - DEFAULT_API_TOKEN
echo 3. Test at: https://%HF_USERNAME%-%HF_SPACE%.hf.space/health
echo.
echo Press any key to exit...
pause >nul
