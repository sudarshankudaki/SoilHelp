# SoilHelp Backend

The backend is a Python FastAPI service used by the SoilHelp Expo app. It
provides soil-image analysis, farmer and sample persistence, and optional AI
assistant endpoints.

## Requirements

- Python 3.10 or newer
- Windows PowerShell, macOS/Linux shell, or an equivalent terminal
- The saved model files in `saved_models/` for local soil analysis

TensorFlow is used for inference. On native Windows, TensorFlow runs on the
CPU; GPU support requires WSL2 or another supported environment.

## Quick start

From the repository root:

```powershell
cd D:\APP\SoilHelp\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

The API will be available at:

- API: <http://127.0.0.1:8000>
- Swagger/OpenAPI docs: <http://127.0.0.1:8000/docs>
- Health check: <http://127.0.0.1:8000/health>

To stop the server, press `Ctrl+C`.

### Windows shortcut

After dependencies are installed, `start_server.bat` can start the server:

```powershell
.\start_server.bat
```

The batch file may attempt model training if the expected NPK model is missing.
For normal development, keep the supplied files in `saved_models/` and start
with `python main.py`.

## Connect the Expo app

Start the frontend from a second terminal:

```powershell
cd D:\APP\SoilHelp
npm install
npm start
```

The backend URL is configured in the app under **Profile → Server Connection**.

Use the appropriate URL for the client:

| Client | Backend URL |
| --- | --- |
| Web | `http://localhost:8000` |
| iOS simulator | `http://localhost:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical phone | `http://YOUR_COMPUTER_LAN_IP:8000` |

For a physical device, find the computer's LAN address with:

```powershell
ipconfig
```

The phone and computer must be on the same network, and the firewall must
allow inbound connections to port `8000`.

`EXPO_PUBLIC_API_URL` can also provide the native default URL. The in-app
server setting takes precedence after it is saved.

## API areas

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| POST | `/analyze` | Analyze a soil image |
| GET/POST | `/farmers` | List or register farmers |
| GET/DELETE | `/farmers/{farmer_id}` | Read or delete a farmer |
| GET/POST | `/samples` | List or register samples |
| GET | `/samples/{sample_id}` | Read a sample |
| PATCH | `/samples/{sample_id}/status` | Update sample status |
| GET/POST | `/ai/health`, `/ai/*` | Optional AI assistant endpoints |

Farmer and sample data are stored in `soilhelp.db`, a SQLite database created
automatically when the server starts.

## Environment configuration

Copy `.env.example` to `.env` when optional integrations are needed:

```powershell
Copy-Item .env.example .env
```

Supported settings include:

- `GOOGLE_CLOUD_API_KEY` — optional image validation through Google Vision
- `BACKEND_HOST` and `BACKEND_PORT` — informational local configuration
- Gemini configuration used by the optional AI assistant

Do not commit `.env` or API keys.

Without an external Vision or Gemini key, the backend uses its local/fallback
behavior where supported. The main image analysis still requires valid model
files and a valid image.

## Model training

Training is not required to start the current project when the saved models
are already present. Training scripts are available for development:

```powershell
python train_models.py
```

For CNN training with a soil image dataset, organize images under:

```text
data/soil_images/
  Sandy/
  Clay/
  Loam/
  Black/
  Red/
```

Training can take substantially longer than normal API startup and should be
run separately from the application server.

## Troubleshooting

### `Cannot connect to server`

1. Confirm the backend is running.
2. Open <http://127.0.0.1:8000/health> on the computer running the server.
3. Check the URL under Profile → Server Connection.
4. Use the computer's LAN IP for a physical phone, not `localhost`.
5. Check Windows Firewall and confirm both devices share the same network.

### Model loading errors

Confirm that the required files exist under `saved_models/`. If they are
missing, use the training scripts or restore the supplied model artifacts.

### API validation errors

Open <http://127.0.0.1:8000/docs> to inspect the current request schemas and
try an endpoint independently of the mobile app.
