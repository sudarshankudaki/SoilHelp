# SoilHelp - Quick Reference

## ?? Fastest Way to Start

**Option 1: Automated Script (Recommended)**
```powershell
# Double-click this file:
quick-start.bat
```

**Option 2: Manual Commands**

**Terminal 1 - Backend:**
```powershell
cd D:\APP\SoilHelp\backend
.\.venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 - Frontend:**
```powershell
cd D:\APP\SoilHelp
npm start
```

Then press `w` for web, `a` for Android, or `i` for iOS.

---

## ?? Backend URLs by Device

| Device | URL to Configure |
|--------|------------------|
| Web | `http://localhost:8000` |
| iOS Simulator | `http://localhost:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical Phone | `http://YOUR_COMPUTER_IP:8000` |

**Find your IP:** `ipconfig` ? look for IPv4 Address

**Set in app:** Profile tab ? Server Connection

---

## ?? Common Issues

### "Cannot connect to server"
```powershell
# Test backend
Invoke-RestMethod http://127.0.0.1:8000/health

# Check what's using port 8000
netstat -ano | findstr :8000
```

### "Module not found" (Python)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### "Unable to resolve module" (Node)
```powershell
npm start -- --clear
```

### Physical device can't connect
1. Computer and phone on same WiFi? ?
2. Firewall allows Python/Node? ?
3. Correct IP in app settings? ?
4. Test: Open `http://YOUR_IP:8000/health` in phone browser

---

## ?? First-Time Setup Only

**Backend:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Frontend:**
```powershell
npm install
```

**After first setup, just use the commands at the top!**

---

## ?? Testing

```powershell
npm test                              # Frontend tests
.\node_modules\.bin\tsc --noEmit      # TypeScript check
```

---

## ?? Share with Teammates

**Expo Publish:**
```powershell
.\publish-expo-simple.bat
```

See `PUBLISHING_GUIDE.md` for details.

---

## ?? More Help

- **Complete setup:** `SETUP_GUIDE.md`
- **Backend details:** `backend/README.md`
- **Publishing:** `PUBLISHING_GUIDE.md`

---

## ? Quick Health Check

Backend running? ? http://127.0.0.1:8000/health
Frontend running? ? http://localhost:8081
App working? ? Upload soil image in app

**All green? You're ready to go! ??**
