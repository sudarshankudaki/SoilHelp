"""
SoilHelp - Pydantic Schemas
Request bodies and response shapes for Farmer and Sample endpoints.
"""

from pydantic import BaseModel
from typing import Optional


# ---------------------------------------------------------------------------
# Farmer Schemas
# ---------------------------------------------------------------------------

class FarmerCreate(BaseModel):
    name: str
    village: str
    farmSize: str
    phone: str
    primaryCrop: Optional[str] = None
    soilType: Optional[str] = None


class FarmerResponse(BaseModel):
    id: str
    name: str
    village: str
    farmSize: str
    phone: str
    primaryCrop: Optional[str] = None
    soilType: Optional[str] = None
    date: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Sample Schemas
# ---------------------------------------------------------------------------

class SampleTimeline(BaseModel):
    collectedDate: Optional[str] = None
    dispatchedDate: Optional[str] = None
    labAnalysisDate: Optional[str] = None
    completedDate: Optional[str] = None


class SampleCreate(BaseModel):
    sampleId: str
    farmerName: str
    acres: str
    village: str
    status: Optional[str] = "collected"
    collectionDate: Optional[str] = None
    qrData: Optional[str] = None
    farmerId: Optional[str] = None


class SampleStatusUpdate(BaseModel):
    status: str  # collected | in_transit | lab_analysis | completed


class SampleResponse(BaseModel):
    id: str
    sampleId: str
    farmerName: str
    acres: str
    village: str
    collectionDate: Optional[str] = None
    status: str
    statusLabel: str
    timeline: SampleTimeline
    qrData: Optional[str] = None

    model_config = {"from_attributes": True}
