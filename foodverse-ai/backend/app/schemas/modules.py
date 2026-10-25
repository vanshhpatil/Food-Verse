from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FreshnessDetectionResponse(BaseModel):
    item_name: str
    freshness_score: int = Field(..., description="1-100 score where 100 is perfectly fresh")
    status: str = Field(..., description="e.g. Fresh, Consumable Soon, Spoiled")
    estimated_shelf_life_days: int
    spoilage_indicators: List[str]
    storage_recommendations: str

class HygieneInspectionResponse(BaseModel):
    area_type: str = Field(..., description="e.g. Food Prep Counter, Storage, Dining Area")
    cleanliness_score: int = Field(..., description="1-100 compliance score")
    status: str = Field(..., description="e.g. Excellent, Satisfactory, High Risk")
    hazards_detected: List[str]
    corrective_actions: List[str]

class RecipeSuggestionRequest(BaseModel):
    ingredients: List[str]
    dietary_preference: Optional[str] = "Any"
    cooking_time_minutes: Optional[int] = 30

class RecipeSuggestionResponse(BaseModel):
    recipe_title: str
    difficulty: str
    prep_time: str
    cook_time: str
    servings: int
    matched_ingredients: List[str]
    missing_ingredients: List[str]
    instructions: List[str]
    chef_tips: str

class MealPlanRequest(BaseModel):
    diet_type: str = "Balanced" # Balanced, Keto, Vegan, High-Protein, Mediterranean
    target_calories_per_day: int = 2000
    days: int = 7

class MealItem(BaseModel):
    meal_type: str # Breakfast, Lunch, Dinner, Snack
    dish_name: str
    calories: int
    macros: Dict[str, str]

class DailyPlan(BaseModel):
    day: str
    total_calories: int
    meals: List[MealItem]

class MealPlanResponse(BaseModel):
    diet_type: str
    target_calories: int
    duration_days: int
    schedule: List[DailyPlan]
    nutrition_summary: str
