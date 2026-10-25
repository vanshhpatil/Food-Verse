from fastapi import APIRouter
from app.schemas.modules import RecipeSuggestionRequest, RecipeSuggestionResponse

router = APIRouter(prefix="/api/kitchen-assistant", tags=["Smart Cooking Assistant"])

@router.post("/suggest-recipe", response_model=RecipeSuggestionResponse)
async def suggest_recipe(request: RecipeSuggestionRequest):
    """
    Suggests gourmet recipes based on available ingredients, cooking time, and dietary preferences.
    """
    ingredients_str = ", ".join(request.ingredients)
    return RecipeSuggestionResponse(
        recipe_title=f"Artisanal Fusion Skillet with {request.ingredients[0] if request.ingredients else 'Fresh Veggies'}",
        difficulty="Easy to Moderate",
        prep_time="10 mins",
        cook_time=f"{request.cooking_time_minutes or 20} mins",
        servings=2,
        matched_ingredients=request.ingredients,
        missing_ingredients=["Cold-pressed Extra Virgin Olive Oil", "Sea Salt & Cracked Pepper", "Fresh Thyme"],
        instructions=[
            "Prep: Wash, pat dry, and evenly dice all primary ingredients into bite-sized 1-inch cubes.",
            "Sauté: Heat 1 tbsp olive oil in a heavy cast-iron skillet over medium-high heat until shimmering.",
            f"Sear: Add {request.ingredients[0] if request.ingredients else 'main ingredients'} and cook undisturbed for 4 minutes to achieve golden-brown caramelization.",
            "Toss: Incorporate remaining vegetables and aromatics, gently stirring for 6-8 minutes until tender-crisp.",
            "Finish: Season with cracked black pepper, a squeeze of fresh lemon juice, and garnish with fresh herbs. Serve piping hot."
        ],
        chef_tips="Do not overcrowd the skillet during the initial sear; spacing creates crisp caramelization rather than steaming."
    )
