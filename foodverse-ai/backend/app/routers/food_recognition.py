import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.config import TEMP_UPLOADS_DIR
from app.schemas.food_recognition import FoodAnalysisResponse
from app.services.groq_client import analyze_food_with_groq

router = APIRouter(prefix="/api/food-recognition", tags=["Food Recognition & Nutrition Analyzer"])

@router.post("/analyze", response_model=FoodAnalysisResponse)
async def analyze_food(
    file: Optional[UploadFile] = File(None),
    text_context: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Analyze food item from image, voice/audio notes, or textual descriptions.
    Saves temporary upload files in temp_uploads/ and queries Groq AI.
    """
    saved_image_path: Optional[Path] = None
    saved_audio_path: Optional[Path] = None

    try:
        # 1. Save uploaded image file to temp_uploads/
        if file and file.filename:
            file_ext = Path(file.filename).suffix or ".jpg"
            unique_filename = f"img_{uuid.uuid4().hex[:8]}_{file.filename}"
            saved_image_path = TEMP_UPLOADS_DIR / unique_filename

            with open(saved_image_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        # 2. Save uploaded audio file to temp_uploads/ if provided
        if audio_file and audio_file.filename:
            audio_ext = Path(audio_file.filename).suffix or ".wav"
            audio_unique_name = f"audio_{uuid.uuid4().hex[:8]}_{audio_file.filename}"
            saved_audio_path = TEMP_UPLOADS_DIR / audio_unique_name

            with open(saved_audio_path, "wb") as buffer:
                shutil.copyfileobj(audio_file.file, buffer)

        # 3. If audio is uploaded, we can add a context indicator (or process speech)
        combined_context = text_context or ""
        if saved_audio_path:
            combined_context += f" [Audio Note Attached: {audio_file.filename}]"

        # Validate that at least an image or text context is provided
        if not saved_image_path and not combined_context.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please upload an image file or provide a text description of the food item."
            )

        # 4. Perform AI multimodal analysis via Groq
        result = await analyze_food_with_groq(
            image_path=saved_image_path,
            text_context=combined_context.strip() if combined_context else None
        )

        return result

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the food item: {str(exc)}"
        )
    finally:
        # Clean up file handles
        if file:
            await file.close()
        if audio_file:
            await audio_file.close()
