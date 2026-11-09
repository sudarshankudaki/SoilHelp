# 🎯 Demo Tomorrow - Final Setup

## ✅ What's Ready:

1. **Backend**: Running locally with ngrok ✅
2. **Frontend**: Deployed on Netlify ✅  
3. **ngrok**: Exposing backend globally ✅

## 🚀 Before Your Demo (15 minutes early):

### Step 1: Start Backend
```powershell
cd C:\Users\sudar\OneDrive\Desktop\soil\backend
python main.py
```

### Step 2: Start ngrok
```powershell
cd C:\Users\sudar\OneDrive\Desktop\soil\backend
.\ngrok.exe http 8000
```

### Step 3: Get ngrok URL
Open: http://127.0.0.1:4040

Copy the URL (like: `https://XXXX.ngrok-free.dev`)

### Step 4: Test Backend
```powershell
curl YOUR_NGROK_URL/health
```

Should return: `{"status":"ok"...}`

---

## 🌐 Your App URLs:

**For you and your friend:**
- https://soilhelp.netlify.app

**Backend (through ngrok):**
- https://imply-sitting-grating.ngrok-free.dev (changes each restart!)

---

## ⚠️ Important Notes:

### ngrok Free Tier Issue:
ngrok free tier shows a warning page in browsers that can block API calls. 

**Solutions:**
1. **Best**: Upgrade ngrok ($8/month) for no warning
2. **Alternative**: Use localhost for demo
3. **Workaround**: Have users click "Visit Site" on ngrok warning once

### Banner Image Issue:
The banner might not show on Netlify due to build caching.

**For localhost demo:**
```powershell
npm start
```
Then open: http://localhost:8081

---

## 🎯 Recommended: Localhost Demo

Since you have issues with ngrok/Netlify, **use localhost for the safest demo:**

1. **Start backend**:
   ```powershell
   cd backend
   python main.py
   ```

2. **Start frontend**:
   ```powershell
   npm start
   ```

3. **Open**: http://localhost:8081

4. **Demo from your laptop** - 100% reliable! ✅

---

## 📱 Demo Flow:

1. Open http://localhost:8081 (or Netlify URL)
2. Show **Dashboard** with banner
3. Go to **Upload** tab
4. Upload soil image (use one from `backend/data/soil_images/`)
5. Show **Analysis Results**
6. Show **Crop Recommendations**
7. Show **Profile** with farmer info

---

## 🆘 If Something Breaks:

1. Backend not responding?
   - Restart: `python main.py`

2. Frontend not loading?
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try incognito mode (Ctrl+Shift+N)

3. ngrok URL changed?
   - Get new URL from http://127.0.0.1:4040
   - Update Netlify env variable

4. Everything fails?
   - **Fall back to localhost** (always works!)

---

## 📊 What Works:

✅ Soil image upload
✅ AI analysis (soil type classification)
✅ NPK prediction
✅ Crop recommendations  
✅ Fertilizer suggestions
✅ Farmer registration
✅ Sample tracking

---

## 🎉 Good Luck with Your Demo!

**Keep it simple:**
- Run locally if possible (most reliable)
- Have backend + frontend running 15 min early
- Test upload once before demo starts
- Have a backup soil image ready

**You've got this! 🚀**
