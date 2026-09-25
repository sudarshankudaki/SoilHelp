# SoilHelp - Complete Setup Guide

This guide will walk you through running the SoilHelp project from scratch on your local machine.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Clone the Repository](#step-1-clone-the-repository)
- [Step 2: Backend Setup](#step-2-backend-setup)
- [Step 3: Frontend Setup](#step-3-frontend-setup)
- [Step 4: Running on Different Devices](#step-4-running-on-different-devices)
- [Step 5: Testing the Setup](#step-5-testing-the-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
1. **Python 3.10 or newer**
   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify: Open PowerShell and run `python --version`

2. **Node.js 18 or newer**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

3. **Git**
   - Download from: https://git-scm.com/downloads
   - Verify: `git --version`

4. **Expo Go App** (for physical devices)
   - iOS: Install from App Store
   - Android: Install from Google Play Store

---

## Step 1: Clone the Repository

Open PowerShell and navigate to where you want the project:

```powershell
# Navigate to your desired directory
cd D:\

# Clone the repository
git clone https://github.com/sudarshankudaki/SoilHelp.git

# Navigate into the project
cd SoilHelp
```

---

## Step 2: Backend Setup

The backend is a Python FastAPI server that handles soil analysis and data management.

### 2.1 Navigate to Backend Directory

```powershell
cd D:\APP\SoilHelp\backend
```

### 2.2 Create Python Virtual Environment

```powershell
python -m venv .venv
```

### 2.3 Activate Virtual Environment

```powershell
.\.venv\Scripts\Activate.ps1
```

**Note**: If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

You should see `(.venv)` at the beginning of your prompt.

### 2.4 Install Python Dependencies

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- TensorFlow (machine learning)
- SQLAlchemy (database)
- Pillow, OpenCV (image processing)
- And other dependencies

**Note**: Installation may take 5-10 minutes depending on your internet speed.

### 2.5 Verify Model Files

Check that the trained models exist:

```powershell
ls saved_models
```

You should see files like:
- `soil_cnn_model.keras` or `soil_cnn_model.h5`
- `npk_model.pkl`
- `crop_model.pkl`

### 2.6 Start the Backend Server

```powershell
python main.py
```

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2.7 Test the Backend

**Keep the backend running** and open a NEW PowerShell window:

```powershell
# Test health endpoint
Invoke-RestMethod http://127.0.0.1:8000/health
```

You should see: `{status: "healthy"}`

Also open in your browser:
- API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

**Leave this terminal running!**

---

## Step 3: Frontend Setup

The frontend is an Expo React Native app.

### 3.1 Open a NEW PowerShell Window

Navigate to the project root:

```powershell
cd D:\APP\SoilHelp
```

### 3.2 Install Node Dependencies

```powershell
npm install
```

This will install:
- React Native
- Expo SDK
- TypeScript
- And other frontend dependencies

**Note**: Installation may take 3-5 minutes.

### 3.3 Start Expo Development Server

```powershell
npm start
```

You should see:
```
Metro waiting on exp://10.70.2.26:8081
```

A browser window will open with Expo Dev Tools.

**Leave this terminal running!**

---

## Step 4: Running on Different Devices

### Option A: Web Browser (Easiest)

Press `w` in the terminal where Expo is running, or:

```powershell
npm run web
```

The app will open in your browser at `http://localhost:8081`

### Option B: Android Emulator

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Press `a` in the Expo terminal, or:

```powershell
npm run android
```

**Important**: Android emulator uses `http://10.0.2.2:8000` for backend.

### Option C: iOS Simulator (macOS only)

1. Install Xcode
2. Press `i` in the Expo terminal, or:

```powershell
npm run ios
```

### Option D: Physical Device (Phone/Tablet)

#### Prerequisites:
- Install **Expo Go** app on your device
- Connect phone and computer to the **same WiFi network**

#### Steps:

1. Find your computer's IP address:

```powershell
ipconfig
```

Look for `IPv4 Address` under your active network adapter (e.g., `10.70.2.26`)

2. In the Expo terminal, scan the QR code with:
   - **iOS**: Open Camera app, scan QR code
   - **Android**: Open Expo Go app, tap "Scan QR code"

3. **Configure Backend URL in the App**:
   - Open the app on your device
   - Go to **Profile** tab
   - Tap **Server Connection**
   - Enter your computer's IP: `http://10.70.2.26:8000`
   - Tap **Save**

4. **Allow Firewall Access** (Windows):
   - When prompted, allow Python and Node.js through Windows Firewall
   - Or manually add rules in Windows Defender Firewall settings

---

## Step 5: Testing the Setup

### Test Backend Connection

1. Open the app (web, emulator, or physical device)
2. Go to **Profile** tab
3. Check **Server Connection** shows correct URL
4. Try registering a farmer or viewing existing data

### Test Soil Analysis

1. Go to **Upload** tab
2. Upload or take a photo of soil
3. Wait for analysis results
4. Check that you receive:
   - Soil type prediction
   - NPK values
   - Crop recommendations

### Test Other Features

- **Registration**: Add new farmer records
- **Collection**: View registered farmers
- **Tracking**: View soil samples
- **Analysis**: View detailed analysis results

---

## Troubleshooting

### Backend Issues

#### "Cannot connect to server"

**Solution 1**: Verify backend is running
```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

**Solution 2**: Check if port 8000 is already in use
```powershell
netstat -ano | findstr :8000
```

If something is using it, either kill that process or change the port in `backend/main.py`

**Solution 3**: Check Windows Firewall
- Go to Windows Defender Firewall
- Allow Python through private and public networks

#### "ModuleNotFoundError"

Make sure:
1. Virtual environment is activated (you see `(.venv)` in prompt)
2. You ran `pip install -r requirements.txt`

**Solution**:
```powershell
cd D:\APP\SoilHelp\backend
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

#### "Model file not found"

Check if model files exist:
```powershell
ls saved_models
```

If missing, you need to train models or restore from backup.

### Frontend Issues

#### "Unable to resolve module"

**Solution**:
```powershell
# Clear cache
npm start -- --clear

# Or delete and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

#### "Metro bundler not responding"

**Solution**:
```powershell
# Kill all Node processes
Stop-Process -Name node -Force

# Restart Expo
npm start
```

#### "QR code doesn't work on phone"

**Solutions**:
1. Make sure phone and computer are on same WiFi
2. Check computer firewall allows connections
3. Use tunnel mode (slower but works across networks):
   ```powershell
   npx expo start --tunnel
   ```

### Device-Specific Issues

#### Physical Device: "Cannot reach backend"

1. **Find computer IP**:
   ```powershell
   ipconfig
   ```

2. **Update in app**:
   - Profile ? Server Connection
   - Use: `http://YOUR_COMPUTER_IP:8000`
   - Example: `http://10.70.2.26:8000`

3. **Test connection** from phone browser:
   - Open: `http://YOUR_COMPUTER_IP:8000/health`
   - Should show: `{status: "healthy"}`

4. **Check firewall**:
   ```powershell
   # Allow Python through firewall
   netsh advfirewall firewall add rule name="Python Backend" dir=in action=allow program="D:\APP\SoilHelp\backend\.venv\Scripts\python.exe" enable=yes
   ```

#### Android Emulator: "Network error"

Android emulator has special networking:
- Use `http://10.0.2.2:8000` (NOT `localhost`)
- Update in Profile ? Server Connection

---

## Quick Reference Commands

### Starting Backend
```powershell
cd D:\APP\SoilHelp\backend
.\.venv\Scripts\Activate.ps1
python main.py
```

### Starting Frontend
```powershell
cd D:\APP\SoilHelp
npm start
```

### Running Tests
```powershell
# Frontend tests
npm test

# TypeScript check
.\node_modules\.bin\tsc --noEmit

# Backend Python syntax check
cd backend
python -m compileall -q .
```

### Stopping Servers
- Press `Ctrl + C` in the terminal running the server

---

## Backend URLs by Device Type

| Device Type | Backend URL |
|-------------|-------------|
| Web Browser | `http://localhost:8000` |
| iOS Simulator | `http://localhost:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical Device | `http://YOUR_COMPUTER_IP:8000` |

---

## Publishing for Teammates

If you want teammates to access without being on the same WiFi:

### Option 1: Expo Publish (Recommended)

```powershell
# Simple publish
.\publish-expo-simple.bat

# Or with full options
.\publish-expo.bat
```

See `PUBLISHING_GUIDE.md` for detailed instructions.

### Option 2: Deploy Backend to Cloud

The backend is configured for Render deployment:
- Push to GitHub
- Connect Render to your repository
- Backend will auto-deploy using `render.yaml` config

---

## Support

For more detailed information:
- **Backend details**: See `backend/README.md`
- **Publishing guide**: See `PUBLISHING_GUIDE.md`
- **Project structure**: See main `README.md`

---

## Success Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 8081
- [ ] Can access http://127.0.0.1:8000/health
- [ ] Can open app in browser/emulator/device
- [ ] Backend URL configured correctly in app
- [ ] Can perform soil analysis successfully

**Happy coding! ??**
