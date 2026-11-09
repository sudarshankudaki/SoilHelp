# 🚂 Deploy Backend to Railway.app

## Why Railway for Production?

- ✅ **$5/month FREE credit** (enough for your app)
- ✅ **8GB RAM** (vs 512MB on Render)
- ✅ **No cold starts** (instant response)
- ✅ **Permanent URL** (never changes)
- ✅ **Docker support** (easy deployment)
- ✅ **Free SSL** (HTTPS automatic)

---

## Step 1: Create Railway Account

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (easiest)
4. Verify your email

---

## Step 2: Connect Your GitHub Repo

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"SoilHelp"** repository
4. Select **"backend"** folder as root

Or if that doesn't work:

1. Click **"Deploy from GitHub repo"**
2. Install Railway GitHub App
3. Give access to your SoilHelp repo

---

## Step 3: Configure Environment Variables

In Railway dashboard:
1. Click on your service
2. Go to **"Variables"** tab
3. Add these:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-12345
DEFAULT_API_TOKEN=demo_token_12345
PORT=8000
PYTHON_VERSION=3.11
```

---

## Step 4: Add Railway Configuration

Railway will auto-detect Python, but let's make sure:

Create `railway.json` in backend folder:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Step 5: Update requirements.txt

Make sure your `requirements.txt` is optimized:

```txt
fastapi==0.115.6
uvicorn==0.24.0.post1
python-multipart==0.0.6

Pillow>=11.0.0
numpy<2.0.0
tensorflow==2.18.0
scikit-learn==1.8.0
joblib==1.4.2

opencv-python-headless==4.8.1.78
google-genai==2.24.0

httpx==0.28.1
python-dotenv==1.0.0
sqlalchemy==2.0.23
psutil==6.1.0
```

---

## Step 6: Add Nixpacks Configuration

Create `nixpacks.toml` in backend folder:

```toml
[phases.setup]
nixPkgs = ['python311', 'gcc', 'g++', 'gfortran', 'libopenblas']

[phases.install]
cmds = ['pip install --upgrade pip', 'pip install -r requirements.txt']

[phases.build]
cmds = ['python -c "import tensorflow; print(tensorflow.__version__)"']

[start]
cmd = 'python main.py'
```

---

## Step 7: Push Changes

```powershell
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

Railway will **automatically deploy**!

---

## Step 8: Get Your Production URL

1. Go to Railway dashboard
2. Click on your service
3. Go to **"Settings"** tab
4. Under **"Domains"**, click **"Generate Domain"**
5. You'll get: `your-app-name.railway.app`

**Copy this URL!** This is your permanent backend URL.

---

## Step 9: Test Your Backend

```powershell
curl https://your-app-name.railway.app/health
```

Should return: `{"status":"ok","service":"SoilHelp API","version":"1.0.0"}`

---

## Step 10: Update Frontend

Update `constants/ServerConfig.ts`:

```typescript
export const DEFAULT_WEB_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-app-name.railway.app';
```

Push to GitHub:
```powershell
git add constants/ServerConfig.ts
git commit -m "Update backend URL to Railway"
git push origin main
```

---

## 🎯 Expected Costs:

- **First month**: FREE ($5 credit)
- **After credit**: ~$3-5/month (based on usage)
- **For your use case**: Should stay within free credit!

---

## 📊 Railway Dashboard:

- **Logs**: See backend errors in real-time
- **Metrics**: CPU, RAM, Network usage
- **Deployments**: See all builds
- **Variables**: Manage secrets easily

---

## 🆘 Troubleshooting:

### Build fails?
Check logs in Railway dashboard. Common issues:
- Missing dependencies in requirements.txt
- Python version mismatch
- Out of memory (unlikely with 8GB)

### App crashes?
- Check environment variables are set
- Look at deployment logs
- Verify PORT is set to 8000

### Can't access URL?
- Make sure domain is generated
- Wait 2-3 minutes after deployment
- Check service is "Active" in dashboard

---

## ✅ Benefits vs Other Options:

| Feature | Railway | Render | ngrok |
|---------|---------|--------|-------|
| RAM | 8GB | 512MB | N/A |
| Cold Starts | No | Yes | No |
| Permanent URL | Yes | Yes | No (free) |
| Price | $5 free | Free | Free |
| Best For | **Production** | Demo | Development |

---

## 🚀 After Railway is Live:

1. ✅ Backend has permanent URL
2. ✅ No cold starts (instant response)
3. ✅ Enough RAM for ML models
4. ✅ Ready for Play Store/App Store!

**Next:** Build mobile app for stores!
