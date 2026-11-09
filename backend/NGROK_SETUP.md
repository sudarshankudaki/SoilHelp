# 🌐 ngrok Setup - Share Backend Globally

Use ngrok to expose your localhost backend to the internet, so your Netlify frontend can connect from anywhere!

## Why Use ngrok?

- ✅ Share localhost with anyone, anywhere
- ✅ No deployment needed
- ✅ Works with Netlify frontend
- ✅ Free tier available
- ✅ HTTPS enabled automatically

---

## Setup (One-Time)

### Step 1: Install ngrok

1. Go to https://ngrok.com/download
2. Download **Windows 64-bit**
3. Extract `ngrok.exe` to: `C:\Users\sudar\OneDrive\Desktop\soil\backend\`
4. (Or any folder in your PATH)

### Step 2: Create Account & Get Token

1. Sign up: https://ngrok.com/signup (free!)
2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your authtoken
4. Run in PowerShell:
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

Done! One-time setup complete. ✅

---

## Usage (Every Time You Demo)

### Step 1: Start Backend

```powershell
cd C:\Users\sudar\OneDrive\Desktop\soil\backend
python main.py
```

Backend runs on http://localhost:8000

### Step 2: Start ngrok

**Option A: Using Script**
```powershell
.\start_ngrok.bat
```

**Option B: Manual Command**
```powershell
ngrok http 8000
```

### Step 3: Copy the ngrok URL

You'll see output like:
```
Session Status                online
Account                       your@email.com (Plan: Free)
Version                       3.3.0
Region                        United States (us)
Latency                       28ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-456.ngrok-free.app -> http://localhost:8000
```

**Copy this URL**: `https://abc123-456.ngrok-free.app`

### Step 4: Update Netlify Environment Variable

1. Go to https://app.netlify.com
2. Select your **soilhelp** site
3. Go to **Site settings** → **Environment variables**
4. Find or Add: `EXPO_PUBLIC_API_URL`
5. Set value to: `https://YOUR_NGROK_URL` (from Step 3)
6. Click **Save**

### Step 5: Trigger Netlify Rebuild

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait 2-3 minutes for build to complete

### Step 6: Test It!

Go to: https://soilhelp.netlify.app

The frontend should now connect to your ngrok backend! ✅

---

## Quick Test

After ngrok is running, test your backend:

```powershell
curl https://YOUR_NGROK_URL/health
```

Should return: `{"status":"ok","service":"SoilHelp API","version":"1.0.0"}`

---

## Important Notes

### ⚠️ ngrok URL Changes Every Time

Every time you restart ngrok, you get a **new URL**!

**Free tier**: URL changes on restart  
**Paid tier** ($8/month): Get a permanent URL

**For demos**, you need to:
1. Start ngrok
2. Update Netlify env variable
3. Rebuild Netlify

### ⚠️ Keep ngrok Running

ngrok must stay running during your demo!
- Don't close the terminal
- Keep your laptop awake
- Have power connected

### ✅ Alternative: Use Render

If you don't want to deal with ngrok changing URLs:
- Use Render: https://soilhelp.onrender.com
- Already deployed
- Permanent URL
- Just wake it before demo: `.\wake_render.bat`

---

## Demo Checklist with ngrok

**Before your demo:**

- [ ] Start backend: `python main.py`
- [ ] Start ngrok: `.\start_ngrok.bat`
- [ ] Copy ngrok URL
- [ ] Update Netlify env variable: `EXPO_PUBLIC_API_URL`
- [ ] Trigger Netlify rebuild
- [ ] Wait 2-3 minutes
- [ ] Test: Open https://soilhelp.netlify.app
- [ ] Keep ngrok running throughout demo!

---

## Comparison: ngrok vs Render

| Feature | ngrok | Render |
|---------|-------|--------|
| **Setup Time** | 5 minutes | Already done |
| **URL Stability** | Changes each time | Permanent |
| **Laptop Required** | Yes, must stay on | No |
| **RAM Limit** | None | 512MB (may crash) |
| **Cold Start** | Instant | 30-60 seconds |
| **Cost** | Free | Free |
| **Best For** | Local demo | Production |

---

## My Recommendation

### For Tomorrow's Demo:

**Option 1: Use Render** (Easier)
```powershell
# 15 min before demo
.\wake_render.bat

# Frontend connects to: https://soilhelp.onrender.com
# Already configured!
```

**Option 2: Use ngrok** (More Reliable)
```powershell
# Start backend
python main.py

# Start ngrok
.\start_ngrok.bat

# Update Netlify env + rebuild
# Takes 5-10 minutes total
```

**Option 3: Both!** (Smartest)
- Primary: Render (wake it early)
- Backup: ngrok (if Render crashes)
- Just update Netlify env to switch

---

## Troubleshooting

### "ngrok: command not found"

**Solution**: Either:
1. Move ngrok.exe to backend folder
2. Add ngrok to PATH:
   - Copy ngrok.exe to `C:\Windows\System32\`
   - Or run with full path: `C:\path\to\ngrok.exe http 8000`

### "Tunnel session failed: Not authenticated"

**Solution**: Add your auth token:
```powershell
ngrok config add-authtoken YOUR_TOKEN
```

Get token from: https://dashboard.ngrok.com/get-started/your-authtoken

### Frontend shows "Cannot connect to server"

**Check:**
1. Is backend running? `curl http://localhost:8000/health`
2. Is ngrok running? Check terminal
3. Did you update Netlify env variable?
4. Did you rebuild Netlify?
5. Test ngrok directly: `curl https://YOUR_NGROK_URL/health`

### ngrok shows "ERR_NGROK_108"

**Solution**: You already have ngrok running! Close the other instance.

---

## Quick Commands

**Start everything:**
```powershell
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: ngrok
cd backend
.\start_ngrok.bat
```

**Test backend:**
```powershell
# Local
curl http://localhost:8000/health

# ngrok
curl https://YOUR_NGROK_URL/health
```

**Stop:**
- Close terminals
- Or press Ctrl+C in each terminal

---

## Support

- ngrok Dashboard: https://dashboard.ngrok.com
- ngrok Docs: https://ngrok.com/docs
- Web Interface (while running): http://localhost:4040

**Good luck with your demo! 🚀**
