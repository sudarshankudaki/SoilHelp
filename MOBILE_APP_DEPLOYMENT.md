# 📱 Deploy SoilHelp to Play Store & App Store

## Complete Guide: From Code to Stores

---

## **PREREQUISITES** ✅

Before starting, you need:

1. **Backend deployed** on Railway (permanent URL)
2. **Google Play Console account** ($25 one-time fee)
3. **Apple Developer account** ($99/year) - Optional for now
4. **Expo account** (free)

---

## **PHASE 1: Prepare Your App for Production** 🛠️

### Step 1: Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "SoilHelp",
    "slug": "soilhelp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "soilhelp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.soilhelp.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.soilhelp.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-font",
      "expo-router",
      "expo-splash-screen",
      "expo-status-bar",
      "expo-web-browser",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow SoilHelp to access your camera to take soil photos."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow SoilHelp to access your photos to analyze soil images."
        }
      ]
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### Step 2: Set Production Backend URL

Update `constants/ServerConfig.ts`:

```typescript
// Production backend URL (Railway)
export const DEFAULT_WEB_URL = 'https://your-app-name.railway.app';
export const DEFAULT_DEVICE_URL = 'https://your-app-name.railway.app';
```

### Step 3: Install EAS CLI

```powershell
npm install -g eas-cli
```

### Step 4: Login to Expo

```powershell
eas login
```

Enter your Expo credentials (or create account).

### Step 5: Configure EAS Build

```powershell
eas build:configure
```

This creates `eas.json`. Update it:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## **PHASE 2: Build Android App (Play Store)** 🤖

### Step 1: Create Google Play Console Account

1. Go to: https://play.google.com/console
2. Click **"Create account"**
3. Pay **$25** one-time registration fee
4. Complete profile setup

### Step 2: Build APK for Testing

```powershell
eas build --platform android --profile preview
```

This takes 10-20 minutes. You'll get a link to download APK.

**Test the APK** on your phone before uploading to Play Store!

### Step 3: Build Production AAB

```powershell
eas build --platform android --profile production
```

This creates an **Android App Bundle (.aab)** for Play Store.

### Step 4: Create App in Play Console

1. Go to Play Console
2. Click **"Create app"**
3. Fill in:
   - **App name**: SoilHelp
   - **Default language**: English
   - **App type**: App
   - **Free or paid**: Free
4. Accept declarations
5. Click **"Create app"**

### Step 5: Set Up App Content

Complete these sections in Play Console:

**1. App content:**
- Privacy policy URL (you need to create one)
- Ads: No
- App access: All functionality is available
- Content ratings: Complete questionnaire

**2. Store listing:**
- Short description (80 chars):
  ```
  AI-powered soil analysis app for farmers. Get instant crop recommendations!
  ```
  
- Full description (4000 chars):
  ```
  SoilHelp is an AI-powered mobile application that helps farmers analyze their soil and get personalized crop recommendations.

  Features:
  • 📸 Take or upload soil photos
  • 🤖 AI-powered soil type classification
  • 🌱 Get NPK (Nitrogen, Phosphorus, Potassium) predictions
  • 🌾 Receive crop recommendations based on your soil
  • 💊 Get fertilizer suggestions
  • 📊 Track soil samples over time
  • 👨‍🌾 Manage farmer profiles

  How it works:
  1. Take a photo of your soil
  2. Our AI analyzes the soil type and nutrients
  3. Get instant recommendations for best crops
  4. Follow fertilizer suggestions for optimal yield

  Perfect for:
  • Farmers looking to optimize crop yield
  • Agricultural students
  • Soil researchers
  • Anyone interested in smart farming

  SoilHelp uses advanced machine learning to provide accurate soil analysis without expensive lab testing.
  ```

- **App icon**: 512x512 PNG (use your icon.png)
- **Feature graphic**: 1024x500 PNG (create a banner)
- **Screenshots**: At least 2 screenshots (take from app)
- **Phone screenshots**: 16:9 or 9:16 ratio

### Step 6: Upload AAB

1. Go to **"Release" → "Production"**
2. Click **"Create new release"**
3. Upload the **.aab** file from EAS build
4. Add release notes:
   ```
   Initial release of SoilHelp!
   - AI-powered soil analysis
   - Crop recommendations
   - NPK predictions
   - Sample tracking
   ```
5. Click **"Save"**

### Step 7: Review and Publish

1. Complete all required sections (green checkmarks)
2. Click **"Send for review"**
3. Google reviews in **1-3 days**
4. Once approved, your app is **LIVE!** 🎉

---

## **PHASE 3: Build iOS App (App Store)** 🍎

**Note:** iOS requires Mac computer for final build. Alternative: use EAS Build cloud service.

### Step 1: Create Apple Developer Account

1. Go to: https://developer.apple.com/programs/
2. Enroll ($99/year)
3. Wait 24-48 hours for approval

### Step 2: Build iOS App

```powershell
eas build --platform ios --profile production
```

**Important:** You'll need to:
- Create App ID in Apple Developer Portal
- Generate provisioning profiles
- Configure push notification certificates (if needed)

### Step 3: Submit to App Store

```powershell
eas submit --platform ios
```

Follow prompts to upload to App Store Connect.

### Step 4: App Store Connect Setup

1. Go to: https://appstoreconnect.apple.com
2. Create new app
3. Fill in metadata (similar to Play Store)
4. Upload screenshots
5. Submit for review

**Apple review takes 1-2 days.**

---

## **PHASE 4: Alternative - Start with Android Only** 📱

**My Recommendation:** Start with **Android only** because:

1. ✅ Cheaper ($25 vs $99)
2. ✅ Faster approval (1-3 days vs 1-2 weeks)
3. ✅ Don't need Mac computer
4. ✅ Easier to update
5. ✅ Most farmers in India use Android

**Later**, once you have users and feedback, add iOS!

---

## **QUICK START COMMANDS** ⚡

```powershell
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build Android APK for testing
eas build --platform android --profile preview

# 5. Build Android AAB for Play Store
eas build --platform android --profile production

# 6. Submit to Play Store
eas submit --platform android
```

---

## **COSTS BREAKDOWN** 💰

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Console | $25 | One-time |
| Apple Developer | $99 | Yearly |
| Railway Backend | $3-5 | Monthly |
| Expo (Free tier) | $0 | - |
| **Total Year 1** | **$160** | - |
| **Android Only Year 1** | **$61** | - |

---

## **TIMELINE** 📅

| Task | Time |
|------|------|
| Backend to Railway | 30 minutes |
| Configure app for production | 1 hour |
| Build Android APK | 20 minutes |
| Create Play Console account | 30 minutes |
| Set up store listing | 2 hours |
| Build production AAB | 20 minutes |
| Upload and submit | 30 minutes |
| **Total** | **~5 hours** |
| **Google review** | **1-3 days** |

---

## **AFTER LAUNCH** 🚀

### Monitor Your App:

1. **Play Console Analytics**:
   - Downloads
   - Crashes
   - User ratings
   - Reviews

2. **Railway Logs**:
   - Backend errors
   - API usage
   - Response times

### Update Your App:

```powershell
# 1. Make changes
# 2. Update version in app.json
# 3. Build new version
eas build --platform android --profile production

# 4. Submit update
eas submit --platform android
```

---

## **IMPORTANT FILES TO PREPARE** 📄

Before submitting, you need:

1. **Privacy Policy** (required!)
   - Create at: https://www.privacypolicygenerator.info/
   - Host on: GitHub Pages or your website
   - Include: Data collection, usage, storage

2. **Screenshots** (at least 2):
   - Dashboard
   - Soil upload
   - Analysis results
   - Profile screen

3. **App Icon** (512x512):
   - Already have: `assets/images/icon.png`
   - Make sure it's 512x512 PNG

4. **Feature Graphic** (1024x500):
   - Create a banner with:
   - App name
   - Tagline: "AI-Powered Soil Analysis"
   - Background: soil/farm image

---

## **TESTING BEFORE LAUNCH** ✅

Test these features thoroughly:

- [ ] Upload soil image
- [ ] Get analysis results
- [ ] View crop recommendations
- [ ] Register as farmer
- [ ] Track samples
- [ ] Change server settings
- [ ] App works offline (basic functionality)
- [ ] No crashes
- [ ] Good performance

---

## **🎯 MY RECOMMENDATION FOR YOU:**

1. **Week 1**: Deploy backend to Railway
2. **Week 2**: Build & test Android APK
3. **Week 3**: Set up Play Console & store listing
4. **Week 4**: Submit to Play Store
5. **Month 2**: Launch! 🚀

**Start with Android, add iOS later when you have budget and users!**

---

Need help with any specific step? Let me know! 🚀
