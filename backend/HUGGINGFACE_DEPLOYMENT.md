# 🚀 Deploy SoilHelp Backend to Hugging Face Spaces

This guide will help you deploy your ML backend to Hugging Face Spaces with **16GB RAM** on the free tier!

## Why Hugging Face Spaces?
- ✅ **16GB RAM** (vs 512MB on Render)
- ✅ Built for ML applications
- ✅ Free tier is very generous
- ✅ Fast GPU inference available
- ✅ Automatic Docker builds
- ✅ Built-in CI/CD

## Prerequisites
1. Create a Hugging Face account at https://huggingface.co/join
2. Install Git LFS: https://git-lfs.github.com/
3. Have your JWT_SECRET and DEFAULT_API_TOKEN ready

## Step 1: Create a New Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in the details:
   - **Space name**: `soilhelp-backend` (or your choice)
   - **License**: MIT
   - **Select SDK**: **Docker**
   - **Space hardware**: CPU basic (free) - You can upgrade to 16GB later
   - **Visibility**: Public (or Private if you have Pro)
4. Click **"Create Space"**

## Step 2: Configure Space Secrets

1. Go to your Space settings (gear icon)
2. Click on **"Variables and secrets"**
3. Add these secrets (click "New secret"):
   - **Name**: `JWT_SECRET`
     - **Value**: Your JWT secret (e.g., `your-super-secret-jwt-key-change-this`)
   - **Name**: `DEFAULT_API_TOKEN`
     - **Value**: Your API token (e.g., `demo_token_12345`)
4. Click **"Save"** for each

## Step 3: Push Your Code to Hugging Face

### Option A: Using Git (Recommended)

```bash
# Navigate to backend folder
cd backend

# Initialize git (if not already)
git init

# Add Hugging Face Space as remote
# Replace YOUR_USERNAME and YOUR_SPACE_NAME
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME

# Install Git LFS (if not already installed)
git lfs install

# Add all files
git add .

# Commit
git commit -m "Initial deployment to Hugging Face Spaces"

# Push to Hugging Face
git push hf main

# If pushing to a new branch, use:
# git push hf main:main --force
```

### Option B: Upload Files via Web Interface

1. Go to your Space page
2. Click **"Files"** tab
3. Click **"Add file"** > **"Upload files"**
4. Upload these files from the `backend` folder:
   - `README.md` (with the metadata header)
   - `Dockerfile`
   - `requirements.txt`
   - `main.py`
   - `auth.py`
   - All `.py` files
   - `model/` folder (with all Python files)
5. Click **"Commit changes to main"**

## Step 4: Wait for Build

1. Go to your Space page
2. Watch the **"Building"** status in the top right
3. The Docker build will take 5-10 minutes
4. Once done, status will change to **"Running"**

## Step 5: Test Your Deployment

Your API will be available at:
```
https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space
```

Test the health endpoint:
```bash
curl https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/health
```

Test with your frontend by updating `constants/ServerConfig.ts`:
```typescript
export const PRESET_SERVER_URLS = [
  { label: 'Hugging Face (Primary)', url: 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space' },
  { label: 'Render (Backup)', url: 'https://soilhelp.onrender.com' },
  { label: 'Localhost', url: 'http://localhost:8000' },
];
```

## Step 6: Upgrade to 16GB RAM (Optional)

Once your Space is running:
1. Go to Space settings (gear icon)
2. Click **"Change hardware"**
3. Select **"CPU upgrade"** → **"16GB RAM"**
4. Click **"Request"**

**Note**: 16GB upgrade is free but requires approval. Usually approved within hours.

## Troubleshooting

### Build fails with "Out of memory"
- Wait for 16GB RAM approval
- Or reduce model size temporarily

### "Application startup failed"
- Check logs in the Space page
- Verify secrets are set correctly
- Make sure `main.py` uses `PORT` environment variable

### Models not loading
- Check that model files are being generated
- Logs will show "[--] No soil model found - using rule-based fallback"
- This is normal on first run - models train on first use

### CORS errors from frontend
- Make sure CORS is configured in `main.py`
- Should allow your Netlify domain

## Updating Your Deployment

To update after making changes:
```bash
cd backend
git add .
git commit -m "Update: describe your changes"
git push hf main
```

Hugging Face will automatically rebuild and redeploy!

## Environment Variables Reference

Your Space automatically gets these from secrets:
- `JWT_SECRET` - For JWT token generation
- `DEFAULT_API_TOKEN` - For API authentication
- `PORT` - Automatically set to 7860 by Hugging Face

## Files Required for Deployment

✅ Files included:
- `README.md` - Space metadata (title, emoji, SDK)
- `Dockerfile` - Container configuration
- `requirements.txt` - Python dependencies
- `.dockerignore` - Files to exclude from image
- `main.py` - FastAPI application
- `auth.py` - Authentication logic
- `model/` - ML model code

## Space Configuration in README.md

The README.md includes metadata at the top:
```yaml
---
title: SoilHelp API
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: docker
pinned: false
license: mit
app_port: 8000
---
```

This tells Hugging Face:
- **sdk: docker** - Use Docker (not Gradio/Streamlit)
- **app_port: 8000** - Your FastAPI runs on port 8000
- **title/emoji** - How it appears in the gallery

## Benefits vs Render

| Feature | Hugging Face | Render Free |
|---------|-------------|-------------|
| RAM | 16GB (upgraded) | 512MB |
| Sleep | No sleep | Sleep after 15min |
| ML Libraries | Optimized | Limited |
| Build Time | 5-10 min | 5-10 min |
| Custom Domain | Yes (Pro) | Yes |
| Price | **FREE** | **FREE** |

## Need Help?

- Hugging Face Docs: https://huggingface.co/docs/hub/spaces-overview
- Docker SDK Guide: https://huggingface.co/docs/hub/spaces-sdks-docker
- Community Forum: https://discuss.huggingface.co/

---

**Ready to deploy? Follow Step 1 above! 🚀**

Your backend will be live at: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`
