@echo off
echo ================================================
echo SoilHelp Quick Start Script
echo ================================================
echo.

echo [1/4] Checking prerequisites...
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python: OK

REM Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js: OK
echo.

echo [2/4] Setting up backend...
cd backend

REM Check if venv exists
if not exist .venv (
    echo Creating Python virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing/updating Python dependencies...
python -m pip install --upgrade pip --quiet
python -m pip install -r requirements.txt --quiet

echo.
echo [3/4] Setting up frontend...
cd ..

if not exist node_modules (
    echo Installing Node dependencies...
    call npm install
) else (
    echo Node modules already installed
)

echo.
echo [4/4] Starting servers...
echo.
echo ================================================
echo IMPORTANT: Two windows will open
echo ================================================
echo 1. Backend server (Python/FastAPI) on port 8000
echo 2. Frontend server (Expo) on port 8081
echo.
echo DO NOT CLOSE THESE WINDOWS!
echo.
echo Backend API docs: http://127.0.0.1:8000/docs
echo Frontend: http://localhost:8081
echo.
echo Press any key to start servers...
pause >nul

REM Start backend in new window
start "SoilHelp Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate.bat && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "SoilHelp Frontend" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo ================================================
echo Servers are starting!
echo ================================================
echo.
echo Backend: http://127.0.0.1:8000/docs
echo Frontend: http://localhost:8081
echo.
echo To stop: Close the server windows or press Ctrl+C
echo.
echo See SETUP_GUIDE.md for detailed instructions
echo.
pause
