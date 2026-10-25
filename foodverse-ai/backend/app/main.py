from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.routers import (
    food_recognition,
    freshness_detector,
    hygiene_monitor,
    kitchen_assistant,
    meal_planner
)

# Initialize FastAPI app
app = FastAPI(
    title="FoodVerse AI API",
    description="AI-powered Food Intelligence Platform API for recognition, freshness, hygiene, kitchen assistance, and meal planning.",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*" # allows flexible cloud testing while keeping standard origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(food_recognition.router)
app.include_router(freshness_detector.router)
app.include_router(hygiene_monitor.router)
app.include_router(kitchen_assistant.router)
app.include_router(meal_planner.router)

@app.get("/")
async def root():
    return {
        "platform": "FoodVerse AI",
        "status": "online",
        "documentation": "/docs",
        "modules": [
            "/api/food-recognition",
            "/api/freshness-detector",
            "/api/hygiene-monitor",
            "/api/kitchen-assistant",
            "/api/meal-planner"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "foodverse-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
