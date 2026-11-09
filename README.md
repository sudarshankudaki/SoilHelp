# 🌱 SoilHelp - AI-Powered Soil Analysis for Karnataka Farmers

An intelligent mobile application that helps farmers analyze soil health and get crop recommendations using AI and Machine Learning.

## ✨ Features

- 📸 **Instant Soil Analysis**: Upload a soil photo and get results in seconds
- 🤖 **AI-Powered**: Uses TensorFlow CNN + Google Gemini AI
- 🌾 **Crop Recommendations**: Get Karnataka-specific crop suggestions
- 📊 **NPK Values**: Nitrogen, Phosphorus, Potassium analysis
- 🌍 **Multilingual**: English + Kannada support
- 📱 **Cross-Platform**: Works on Web, Android, and iOS
- 💾 **Data Tracking**: Track soil samples over time

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sudarshankudaki/SoilHelp.git
   cd SoilHelp
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**
   ```bash
   cd backend
   copy .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

### Running the Project

**Option 1: Use Startup Script (Recommended)**
```bash
# Double-click START_PROJECT.bat (Windows)
# Or run: ./START_PROJECT.bat
```

**Option 2: Manual Start**

Terminal 1 - Backend:
```bash
cd backend
python main.py
```

Terminal 2 - Frontend:
```bash
npm start
# Press 'w' for web
```

The app will open at http://localhost:8081

## 📖 Usage

1. **Home**: Overview of features
2. **Upload**: Take/upload soil photo for analysis
3. **Collection**: Register new soil samples
4. **Tracking**: View all samples and trends
5. **Profile**: Settings and server configuration

## 🏗️ Tech Stack

### Frontend
- React Native + Expo
- TypeScript
- Expo Router
- React Navigation

### Backend
- FastAPI (Python)
- TensorFlow / Keras
- Google Gemini AI
- SQLite Database
- OpenCV
- Scikit-learn

## 📁 Project Structure

```
SoilHelp/
├── app/              # React Native screens
├── components/       # Reusable UI components
├── constants/        # API services, config
├── context/          # React context providers
├── backend/
│   ├── main.py      # FastAPI server
│   ├── models.py    # Database models
│   ├── routers/     # API endpoints
│   ├── model/       # ML models
│   ├── data/        # Training data
│   └── utils/       # Helper functions
├── assets/          # Images, fonts
└── public/          # Static files
```

## 🔑 API Keys

Get your Gemini API key from:
https://aistudio.google.com/apikey

Add it to `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```

## 🌐 Deployment

- **Frontend**: Deployed on Netlify - https://soilhelp.netlify.app
- **Backend**: Deployed on Render - https://soilhelp.onrender.com

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

- Sudarshan Kudaki

## 🙏 Acknowledgments

- Karnataka Agricultural Department
- Google Gemini AI
- TensorFlow Team
- Expo Team

---

Made with ❤️ for Karnataka Farmers 🌾
