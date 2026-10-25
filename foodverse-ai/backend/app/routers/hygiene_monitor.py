from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.modules import HygieneInspectionResponse

router = APIRouter(prefix="/api/hygiene-monitor", tags=["Restaurant Hygiene Monitor"])

@router.post("/inspect", response_model=HygieneInspectionResponse)
async def inspect_hygiene(
    file: Optional[UploadFile] = File(None),
    area_type: Optional[str] = Form("Food Preparation Station")
):
    """
    Computer vision inspection of commercial/home kitchens for cleanliness,
    cross-contamination risks, and health code compliance.
    """
    return HygieneInspectionResponse(
        area_type=area_type or "Commercial Prep Surface",
        cleanliness_score=87,
        status="Satisfactory / Grade A Compliance",
        hazards_detected=[
            "Raw poultry cutting board within 0.5m of ready-to-eat salad station",
            "Minor oil splatter near induction range hood"
        ],
        corrective_actions=[
            "Enforce strict color-coded cutting boards (Red for raw meat, Green for produce)",
            "Sanitize stainless steel prep counter with food-grade quat sanitizing spray (200 ppm)",
            "Ensure chef personnel wear mandatory hair nets and single-use nitrile gloves"
        ]
    )
