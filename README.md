# SoilHelp

SoilHelp is an Expo React Native app with a FastAPI backend for farmer
registration, soil-sample tracking, image-based soil analysis, and crop or
fertilizer recommendations.

## Stack

- Frontend: TypeScript, React Native, Expo SDK 54, Expo Router
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite (`backend/soilhelp.db`)
- ML: TensorFlow, scikit-learn, Pillow, and OpenCV

## Run the full project

### 1. Start the backend

In a terminal:

```powershell
cd D:\APP\SoilHelp\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Verify it is running:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

The interactive API documentation is at
<http://127.0.0.1:8000/docs>.

### 2. Start the frontend

In a second terminal:

```powershell
cd D:\APP\SoilHelp
npm install
npm start
```

Available platform commands:

```powershell
npm run web
npm run android
npm run ios
```

Web and iOS simulator clients can normally use `http://localhost:8000`.
Android emulators use `http://10.0.2.2:8000`. A physical phone must use the
computer's LAN IP, such as `http://192.168.1.10:8000`.

Set the URL in **Profile → Server Connection** inside the app. The phone and
computer must be on the same network for a physical-device connection.

## Tests and checks

Run the focused frontend service tests:

```powershell
npm test
```

Run the TypeScript check:

```powershell
.\node_modules\.bin\tsc --noEmit
```

Check backend Python syntax:

```powershell
cd D:\APP\SoilHelp\backend
python -m compileall -q .
```

## Project documentation

- Backend setup and API details: [backend/README.md](./backend/README.md)
- API service client: [constants/ApiService.ts](./constants/ApiService.ts)
- Server URL configuration: [constants/ServerConfig.ts](./constants/ServerConfig.ts)
