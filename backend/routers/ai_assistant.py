"""
AI-Enhanced Soil Analysis Endpoints
Adds Gemini-powered intelligence to soil analysis
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from soil_ai_assistant import SoilAIAssistant, get_ai_recommendations

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

# Initialize AI assistant
ai_assistant = SoilAIAssistant()


# Request/Response Models
class SoilAnalysisData(BaseModel):
    soil_type: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    region: str = "Karnataka"


class QuestionRequest(BaseModel):
    question: str
    soil_context: Optional[Dict] = None


# ===== ENDPOINTS =====

@router.post("/recommendations")
async def get_ai_recommendations_endpoint(data: SoilAnalysisData):
    """
    Get comprehensive AI-powered recommendations for soil analysis.
    
    Returns:
    - Personalized fertilizer recommendations
    - Suitable crop suggestions
    - Easy-to-understand soil health explanation
    """
    try:
        recommendations = get_ai_recommendations(
            soil_type=data.soil_type,
            nitrogen=data.nitrogen,
            phosphorus=data.phosphorus,
            potassium=data.potassium,
            ph=data.ph,
            region=data.region
        )
        
        return {
            "success": True,
            "fertilizer_recommendation": recommendations["fertilizer"],
            "crop_suggestions": recommendations["crops"],
            "soil_health_explanation": recommendations["explanation"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/fertilizer")
async def get_fertilizer_recommendation(data: SoilAnalysisData):
    """
    Get AI-generated fertilizer recommendations based on NPK analysis.
    """
    try:
        result = ai_assistant.generate_fertilizer_recommendation(
            soil_type=data.soil_type,
            nitrogen=data.nitrogen,
            phosphorus=data.phosphorus,
            potassium=data.potassium,
            ph=data.ph,
            region=data.region
        )
        
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/crops")
async def get_crop_suggestions(data: SoilAnalysisData):
    """
    Get AI-suggested crops suitable for the analyzed soil.
    """
    try:
        result = ai_assistant.suggest_suitable_crops(
            soil_type=data.soil_type,
            ph=data.ph,
            nitrogen=data.nitrogen,
            region=data.region
        )
        
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/explain")
async def explain_soil_health(data: SoilAnalysisData):
    """
    Get a simple, easy-to-understand explanation of soil health.
    Perfect for farmers who want plain-language insights.
    """
    try:
        explanation = ai_assistant.explain_soil_health(
            soil_type=data.soil_type,
            nitrogen=data.nitrogen,
            phosphorus=data.phosphorus,
            potassium=data.potassium,
            ph=data.ph
        )
        
        return {
            "success": True,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    Ask the AI assistant any question about soil, farming, or fertilizers.
    Can provide soil context for more relevant answers.
    
    Example questions:
    - "When should I apply fertilizer?"
    - "What causes low nitrogen in soil?"
    - "How can I improve my soil pH?"
    """
    try:
        answer = ai_assistant.answer_farmer_question(
            question=request.question,
            soil_context=request.soil_context
        )
        
        return {
            "success": True,
            "question": request.question,
            "answer": answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/health")
async def ai_health_check():
    """Check if AI service is available."""
    try:
        # Try a simple test
        test_response = ai_assistant.client.models.generate_content(
            model=ai_assistant.model,
            contents="Test"
        )
        
        return {
            "success": True,
            "status": "AI service operational",
            "model": ai_assistant.model
        }
    except Exception as e:
        return {
            "success": False,
            "status": "AI service unavailable",
            "error": str(e),
            "fallback": "Rule-based recommendations will be used"
        }