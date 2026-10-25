from pydantic import BaseModel, Field
from typing import Optional, List

class NutritionData(BaseModel):
    calories: float = Field(..., description="Estimated total energy in kcal")
    protein: float = Field(..., description="Estimated protein in grams")
    carbs: float = Field(..., description="Estimated carbohydrates in grams")
    fats: float = Field(..., description="Estimated total fats in grams")
    fiber: float = Field(..., description="Estimated dietary fiber in grams")
    sugar: float = Field(..., description="Estimated sugars in grams")

class FoodAnalysisResponse(BaseModel):
    food_name: str = Field(..., description="Identified food item name or dish")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    nutrition: NutritionData = Field(..., description="Nutritional breakdown for standard portion")
    per_100g: Optional[NutritionData] = Field(default=None, description="Standard reference values per 100 grams")
    serving_weight_grams: Optional[float] = Field(default=100.0, description="Serving weight in grams")
    health_score: int = Field(..., description="Overall health score rating from 1 to 100")
    recommendations: str = Field(..., description="Dietary notes and health suggestions")
    serving_size: Optional[str] = Field(default="100g standard portion", description="Estimated portion size")
    allergens: Optional[List[str]] = Field(default_factory=list, description="Potential allergens identified")

