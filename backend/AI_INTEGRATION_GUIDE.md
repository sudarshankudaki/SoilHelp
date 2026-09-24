# 🤖 SoilHelp AI Integration Guide

## ✨ **What's New: AI-Powered Features**

Your SoilHelp backend now includes intelligent Gemini AI features to enhance farmer experience!

---

## 🎯 **New AI Endpoints**

### **Base URL:** `http://localhost:8000/ai`

---

### 1. **Get Comprehensive Recommendations**
**POST** `/ai/recommendations`

Get ALL AI recommendations in one call.

**Request:**
```json
{
  "soil_type": "Red",
  "nitrogen": 0.15,
  "phosphorus": 12.5,
  "potassium": 145.0,
  "ph": 6.2,
  "region": "Karnataka"
}
```

**Response:**
```json
{
  "success": true,
  "fertilizer_recommendation": {
    "recommendation": "Your soil is moderately deficient in Nitrogen...",
    "soil_type": "Red",
    "region": "Karnataka"
  },
  "crop_suggestions": {
    "crops": "**Highly Recommended Crops:**\n1. Ragi...",
    "soil_type": "Red",
    "region": "Karnataka"
  },
  "soil_health_explanation": "Your soil has good phosphorus and potassium..."
}
```

---

### 2. **Fertilizer Recommendations Only**
**POST** `/ai/fertilizer`

Get personalized fertilizer advice.

---

### 3. **Crop Suggestions Only**
**POST** `/ai/crops`

Get suitable crop recommendations.

---

### 4. **Simple Soil Explanation**
**POST** `/ai/explain`

Get easy-to-understand soil health explanation (perfect for farmers!).

---

### 5. **Ask Questions (Q&A Assistant)**
**POST** `/ai/ask`

Ask any farming/soil question!

**Request:**
```json
{
  "question": "When should I apply fertilizer?",
  "soil_context": {
    "soil_type": "Red",
    "nitrogen": 0.15,
    "ph": 6.2
  }
}
```

**Response:**
```json
{
  "success": true,
  "question": "When should I apply fertilizer?",
  "answer": "For your Red soil with moderate nitrogen levels, the best time..."
}
```

---

### 6. **AI Health Check**
**GET** `/ai/health`

Check if AI service is working.

---

## 🚀 **How to Use from Frontend**

### **React Native Example:**

```javascript
// After soil analysis
const soilData = {
  soil_type: "Red",
  nitrogen: 0.15,
  phosphorus: 12.5,
  potassium: 145.0,
  ph: 6.2,
  region: "Karnataka"
};

// Get AI recommendations
const response = await fetch('http://YOUR_SERVER:8000/ai/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(soilData)
});

const aiRecommendations = await response.json();

// Display to farmer
console.log(aiRecommendations.fertilizer_recommendation.recommendation);
console.log(aiRecommendations.crop_suggestions.crops);
console.log(aiRecommendations.soil_health_explanation);
```

### **Q&A Feature Example:**

```javascript
// Farmer asks a question
const askQuestion = async (question) => {
  const response = await fetch('http://YOUR_SERVER:8000/ai/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: question,
      soil_context: soilData  // Optional: provide soil context
    })
  });
  
  const result = await response.json();
  return result.answer;
};

// Usage
const answer = await askQuestion("How can I improve soil fertility?");
```

---

## 🧪 **Testing the AI Features**

### **1. Start your backend:**
```bash
cd d:\APP\SoilHelp\backend
python -m uvicorn main:app --reload
```

### **2. Test with curl:**

**Get Recommendations:**
```bash
curl -X POST "http://localhost:8000/ai/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "soil_type": "Red",
    "nitrogen": 0.15,
    "phosphorus": 12.5,
    "potassium": 145.0,
    "ph": 6.2,
    "region": "Karnataka"
  }'
```

**Ask a Question:**
```bash
curl -X POST "http://localhost:8000/ai/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What causes low nitrogen in soil?"
  }'
```

### **3. Or use the interactive API docs:**
```
http://localhost:8000/docs
```

Navigate to the "AI Assistant" section!

---

## 💡 **Feature Ideas for Your App**

### **1. Enhanced Results Screen**
After soil analysis, show:
- ✅ NPK values (existing)
- ✨ **NEW:** AI explanation in simple language
- ✨ **NEW:** Personalized fertilizer recommendations
- ✨ **NEW:** Top 5 suitable crops

### **2. Fertilizer Assistant**
Dedicated screen with:
- Specific fertilizer types and quantities
- Application timing for Karnataka seasons
- Cost estimates
- Where to buy locally

### **3. Crop Planner**
Help farmers choose crops:
- AI-suggested crops based on their soil
- Expected yields
- Market prices
- Growing tips

### **4. Ask the Expert**
Chat-like interface where farmers can:
- Ask questions about their soil
- Get instant AI-powered answers
- Context-aware (knows their soil data)

### **5. Seasonal Advice**
- Best crops for current season
- Fertilizer timing
- Weather-based recommendations

---

## 🔧 **Configuration**

### **Change AI Model** (if needed):
Edit `soil_ai_assistant.py`:
```python
self.model = 'gemini-3.5-flash'  # Fast and efficient
# or
self.model = 'gemini-3.6-flash'  # More accurate
```

### **Customize Prompts:**
Edit prompts in `soil_ai_assistant.py` to:
- Change language/tone
- Add regional specifics
- Focus on certain crops/practices

---

## ⚡ **Performance Notes**

- **Response Time:** 1-3 seconds (AI generation)
- **Fallback:** Automatic rule-based recommendations if AI unavailable
- **Cost:** Gemini API has generous free tier

---

## 🆘 **Troubleshooting**

**"AI service unavailable":**
- Check internet connection
- Verify API key in `.env`
- Try again (might be temporary high demand)

**Slow responses:**
- Normal for first request (model loading)
- Consider caching common questions

**Want to test without API calls:**
- Use fallback methods (always available)
- Check `/ai/health` endpoint

---

## 📈 **Next Steps**

1. **Test the endpoints** with sample data
2. **Integrate into your React Native app**
3. **Design UI for AI recommendations**
4. **Add user feedback collection**
5. **Monitor which features farmers use most**

---

**Your SoilHelp is now AI-powered!** 🚀🌱

Questions? The AI assistant is ready to help your farmers make better decisions!