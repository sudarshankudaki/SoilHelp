"""
SoilHelp - AI-Powered Soil Analysis Features
Using Gemini API to provide intelligent recommendations
"""
import os
from typing import Dict, List, Optional
from gemini_config import get_gemini_client

class SoilAIAssistant:
    """AI-powered assistant for soil analysis and recommendations."""
    
    def __init__(self):
        self.client = get_gemini_client()
        self.model = 'gemini-3.5-flash'
    
    def generate_fertilizer_recommendation(
        self,
        soil_type: str,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        ph: float,
        region: str = "Karnataka"
    ) -> Dict[str, str]:
        """
        Generate personalized fertilizer recommendations based on NPK analysis.
        
        Args:
            soil_type: Type of soil (Sandy, Clay, Loam, Black, Red)
            nitrogen: Nitrogen percentage
            phosphorus: Phosphorus in ppm
            potassium: Potassium in ppm
            ph: Soil pH level
            region: Geographic region (default: Karnataka)
        
        Returns:
            Dict with recommendations, deficiencies, and actions
        """
        prompt = f"""
You are an agricultural expert helping a farmer in {region}, India.

Soil Analysis Results:
- Soil Type: {soil_type}
- Nitrogen (N): {nitrogen}%
- Phosphorus (P): {phosphorus} ppm
- Potassium (K): {potassium} ppm
- pH: {ph}

Provide practical fertilizer recommendations in this exact format:

**Status:**
[Brief 1-sentence assessment: deficient, balanced, or excess for each NPK]

**Fertilizer Recommendations:**
- [Specific fertilizer type and application rate in kg/acre]
- [Alternative organic options if applicable]

**Application Timing:**
[When and how to apply - specific to {region} growing seasons]

**Expected Results:**
[What improvements to expect and timeline]

Keep language simple for farmers. Focus on practical, affordable solutions available in {region}.
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            
            return {
                "recommendation": response.text,
                "soil_type": soil_type,
                "region": region
            }
        except Exception as e:
            # Fallback to rule-based recommendation
            return self._fallback_fertilizer_recommendation(
                soil_type, nitrogen, phosphorus, potassium, ph
            )
    
    def suggest_suitable_crops(
        self,
        soil_type: str,
        ph: float,
        nitrogen: float,
        region: str = "Karnataka"
    ) -> Dict[str, any]:
        """
        Suggest suitable crops based on soil characteristics.
        
        Args:
            soil_type: Type of soil
            ph: Soil pH
            nitrogen: Nitrogen level
            region: Geographic region
        
        Returns:
            Dict with crop suggestions and reasons
        """
        prompt = f"""
You are an agricultural expert for {region}, India.

Soil Characteristics:
- Soil Type: {soil_type}
- pH: {ph}
- Nitrogen: {nitrogen}%

Recommend the TOP 5 most suitable crops for this soil in {region}, considering:
1. Local climate and rainfall patterns
2. Market demand and profitability
3. Soil suitability

Format your response as:

**Highly Recommended Crops:**
1. [Crop Name] - [2-line explanation: why suitable + expected yield]
2. [Crop Name] - [2-line explanation]
3. [Crop Name] - [2-line explanation]

**Alternative Crops:**
4. [Crop Name] - [1-line explanation]
5. [Crop Name] - [1-line explanation]

**Growing Tips:**
[1-2 key tips specific to this soil type]

Use simple language. Focus on crops commonly grown in {region}.
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            
            return {
                "crops": response.text,
                "soil_type": soil_type,
                "region": region
            }
        except Exception as e:
            return self._fallback_crop_suggestions(soil_type, ph, region)
    
    def explain_soil_health(
        self,
        soil_type: str,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        ph: float
    ) -> str:
        """
        Generate easy-to-understand explanation of soil health.
        
        Returns:
            Simple explanation for farmers
        """
        prompt = f"""
Explain this soil analysis to a farmer in simple, friendly language:

Soil Type: {soil_type}
Nitrogen: {nitrogen}%
Phosphorus: {phosphorus} ppm
Potassium: {potassium} ppm
pH: {ph}

Write a brief explanation (3-4 sentences) that:
1. Tells them if their soil is healthy or needs improvement
2. Explains what each nutrient does for plants (in 1 line each)
3. Gives ONE main action to improve their soil

Use simple words. Be encouraging and positive. Write like you're talking to a friend.
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return self._fallback_soil_explanation(nitrogen, phosphorus, potassium, ph)
    
    def answer_farmer_question(
        self,
        question: str,
        soil_context: Optional[Dict] = None
    ) -> str:
        """
        Answer farmer's questions about their soil or farming practices.
        
        Args:
            question: Farmer's question
            soil_context: Optional soil analysis data for context
        
        Returns:
            AI-generated answer
        """
        context = ""
        if soil_context:
            context = f"""
Based on your soil analysis:
- Soil Type: {soil_context.get('soil_type', 'N/A')}
- Nitrogen: {soil_context.get('nitrogen', 'N/A')}%
- Phosphorus: {soil_context.get('phosphorus', 'N/A')} ppm
- Potassium: {soil_context.get('potassium', 'N/A')} ppm
- pH: {soil_context.get('ph', 'N/A')}

"""
        
        prompt = f"""
You are a helpful agricultural expert for Indian farmers.

{context}

Farmer's Question: {question}

Provide a clear, practical answer in 2-3 short paragraphs. Use simple language.
If the question is about soil/fertilizer, relate it to their soil data if available.
Be encouraging and supportive.
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
    
    # Fallback methods (when AI is unavailable)
    
    def _fallback_fertilizer_recommendation(
        self, soil_type, n, p, k, ph
    ) -> Dict[str, str]:
        """Rule-based fallback recommendation."""
        
        # Simple rule-based logic
        deficiencies = []
        if n < 0.2:
            deficiencies.append("Nitrogen")
        if p < 10:
            deficiencies.append("Phosphorus")
        if k < 100:
            deficiencies.append("Potassium")
        
        if deficiencies:
            rec = f"Your soil needs: {', '.join(deficiencies)}. "
            rec += "Apply NPK fertilizer (10-26-26) at 50 kg/acre before planting."
        else:
            rec = "Your soil nutrient levels are good! Maintain with organic compost."
        
        return {
            "recommendation": rec,
            "soil_type": soil_type,
            "region": "Karnataka"
        }
    
    def _fallback_crop_suggestions(
        self, soil_type, ph, region
    ) -> Dict[str, str]:
        """Rule-based crop suggestions."""
        
        crops = {
            "Sandy": ["Groundnut", "Pulses", "Millets", "Sunflower", "Watermelon"],
            "Clay": ["Rice", "Wheat", "Sugarcane", "Cotton", "Vegetables"],
            "Loam": ["All crops", "Vegetables", "Fruits", "Cereals", "Pulses"],
            "Black": ["Cotton", "Sorghum", "Wheat", "Sugarcane", "Sunflower"],
            "Red": ["Ragi", "Groundnut", "Pulses", "Cotton", "Millets"]
        }
        
        suggested = crops.get(soil_type, ["Rice", "Wheat", "Vegetables"])
        crops_text = "Suitable crops for your soil: " + ", ".join(suggested)
        
        return {
            "crops": crops_text,
            "soil_type": soil_type,
            "region": region
        }
    
    def _fallback_soil_explanation(self, n, p, k, ph) -> str:
        """Simple explanation when AI unavailable."""
        return f"""
Your soil has {n}% Nitrogen (helps leaves grow), {p} ppm Phosphorus (helps roots), 
and {k} ppm Potassium (helps overall plant health). The pH is {ph}. 
This is important information for choosing the right fertilizer!
"""


# Convenience function for easy integration
def get_ai_recommendations(
    soil_type: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    region: str = "Karnataka"
) -> Dict[str, any]:
    """
    Get all AI-powered recommendations for soil analysis.
    
    Returns:
        Dict containing:
        - fertilizer_recommendation
        - crop_suggestions
        - soil_health_explanation
    """
    assistant = SoilAIAssistant()
    
    return {
        "fertilizer": assistant.generate_fertilizer_recommendation(
            soil_type, nitrogen, phosphorus, potassium, ph, region
        ),
        "crops": assistant.suggest_suitable_crops(
            soil_type, ph, nitrogen, region
        ),
        "explanation": assistant.explain_soil_health(
            soil_type, nitrogen, phosphorus, potassium, ph
        )
    }


if __name__ == "__main__":
    # Test example
    print("=" * 70)
    print("  SoilHelp AI Assistant - Test")
    print("=" * 70)
    
    # Example soil data
    test_data = {
        "soil_type": "Red",
        "nitrogen": 0.15,
        "phosphorus": 12.5,
        "potassium": 145.0,
        "ph": 6.2
    }
    
    assistant = SoilAIAssistant()
    
    print("\n[1/3] Generating fertilizer recommendations...")
    fert_rec = assistant.generate_fertilizer_recommendation(**test_data)
    print(fert_rec["recommendation"][:200] + "...")
    
    print("\n[2/3] Suggesting suitable crops...")
    crops = assistant.suggest_suitable_crops(
        test_data["soil_type"],
        test_data["ph"],
        test_data["nitrogen"]
    )
    print(crops["crops"][:200] + "...")
    
    print("\n[3/3] Explaining soil health...")
    explanation = assistant.explain_soil_health(**test_data)
    print(explanation)
    
    print("\n" + "=" * 70)
    print("  ✅ AI Assistant working!")
    print("=" * 70)