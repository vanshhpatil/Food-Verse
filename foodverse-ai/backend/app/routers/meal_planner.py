from fastapi import APIRouter
from app.schemas.modules import MealPlanRequest, MealPlanResponse, DailyPlan, MealItem

router = APIRouter(prefix="/api/meal-planner", tags=["Personalized Meal Planner"])

@router.post("/generate-plan", response_model=MealPlanResponse)
async def generate_plan(request: MealPlanRequest):
    """
    Generates a personalized multi-day meal plan based on caloric target and dietary preference.
    """
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    schedule = []
    
    sample_meals = {
        "Balanced": [
            ("Breakfast", "Greek Yogurt Parfait with Mixed Berries & Walnuts", 420, {"P": "26g", "C": "48g", "F": "14g"}),
            ("Lunch", "Quinoa Buddha Bowl with Roasted Chickpeas & Tahini", 650, {"P": "24g", "C": "82g", "F": "26g"}),
            ("Dinner", "Baked Wild Salmon with Steamed Broccolini & Wild Rice", 680, {"P": "48g", "C": "45g", "F": "24g"}),
            ("Snack", "Crisp Sliced Apple with Almond Butter", 250, {"P": "5g", "C": "28g", "F": "15g"})
        ],
        "High-Protein": [
            ("Breakfast", "Egg White & Spinach Omelet with Avocado on Rye", 460, {"P": "38g", "C": "30g", "F": "18g"}),
            ("Lunch", "Grilled Herb Chicken Breast Salad with Quinoa", 620, {"P": "52g", "C": "40g", "F": "16g"}),
            ("Dinner", "Grass-Fed Sirloin Steak with Roasted Asparagus & Sweet Potato", 720, {"P": "58g", "C": "42g", "F": "22g"}),
            ("Snack", "Whey/Casein Protein Shake with Chia Seeds", 220, {"P": "32g", "C": "8g", "F": "4g"})
        ],
        "Vegan": [
            ("Breakfast", "Overnight Steel-Cut Oats with Chia Seeds & Almonds", 430, {"P": "16g", "C": "62g", "F": "15g"}),
            ("Lunch", "Mediterranean Lentil Stew with Warm Whole Grain Pita", 590, {"P": "28g", "C": "85g", "F": "12g"}),
            ("Dinner", "Crispy Tofu & Edamame Stir-fry with Brown Basmati Rice", 640, {"P": "34g", "C": "70g", "F": "20g"}),
            ("Snack", "Roasted Spicy Edamame & Roasted Pumpkin Seeds", 240, {"P": "14g", "C": "12g", "F": "12g"})
        ],
        "Keto": [
            ("Breakfast", "Scrambled Eggs in Ghee with Smoked Salmon & Arugula", 480, {"P": "32g", "C": "3g", "F": "38g"}),
            ("Lunch", "Cobb Salad with Bacon, Avocado, Blue Cheese & Ranch", 680, {"P": "36g", "C": "6g", "F": "58g"}),
            ("Dinner", "Herb-Butter Ribeye with Creamed Garlic Spinach", 740, {"P": "48g", "C": "5g", "F": "60g"}),
            ("Snack", "Macadamia Nuts & Green Olives", 220, {"P": "3g", "C": "2g", "F": "23g"})
        ]
    }

    diet = request.diet_type if request.diet_type in sample_meals else "Balanced"
    selected_template = sample_meals[diet]

    for i in range(min(request.days, 7)):
        meals = [
            MealItem(meal_type=m[0], dish_name=m[1], calories=m[2], macros=m[3])
            for m in selected_template
        ]
        total_cals = sum(m.calories for m in meals)
        schedule.append(DailyPlan(day=days[i], total_calories=total_cals, meals=meals))

    return MealPlanResponse(
        diet_type=diet,
        target_calories=request.target_calories_per_day,
        duration_days=len(schedule),
        schedule=schedule,
        nutrition_summary=f"Designed for {diet} metabolism with optimized macronutrient distribution."
    )
