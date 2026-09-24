"""
SoilHelp - Samples Router
CRUD REST endpoints for soil sample collection and tracking.
"""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Sample
from schemas import SampleCreate, SampleStatusUpdate, SampleResponse

router = APIRouter(prefix="/samples", tags=["Samples"])

VALID_STATUSES = {"collected", "in_transit", "lab_analysis", "completed"}

STATUS_LABELS = {
    "collected": "Collected",
    "in_transit": "In Transit",
    "lab_analysis": "Lab Analysis",
    "completed": "Completed",
}

# Natural progression order for auto-timestamping
STATUS_NEXT_FIELD = {
    "in_transit": "dispatched_date",
    "lab_analysis": "lab_analysis_date",
    "completed": "completed_date",
}


def _format_date(dt: Optional[datetime] = None) -> str:
    """Format date portably across all platforms without platform-specific flags (e.g. %-d)."""
    d = dt or datetime.utcnow()
    return f"{d.day} {d:%b %Y}"



@router.get("", response_model=list[SampleResponse])
def list_samples(
    farmer_id: Optional[str] = Query(None, description="Filter by farmer ID"),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    """List all samples, optionally filtered by farmer_id."""
    query = db.query(Sample)
    if farmer_id:
        query = query.filter(Sample.farmer_id == farmer_id)
    samples = query.order_by(Sample.created_at.desc()).limit(limit).all()
    return [SampleResponse(**s.to_dict()) for s in samples]


@router.post("", response_model=SampleResponse, status_code=201)
def register_sample(payload: SampleCreate, db: Session = Depends(get_db)):
    """Register a new soil sample from QR scan or manual entry."""
    # Idempotent: return existing record if same sampleId already scanned
    existing = db.query(Sample).filter(
        Sample.sample_id == payload.sampleId.upper()
    ).first()
    if existing:
        return SampleResponse(**existing.to_dict())

    # Cross-platform date formatting
    today_str = payload.collectionDate or _format_date()

    sample = Sample(
        id=str(uuid.uuid4()),
        sample_id=payload.sampleId.upper().strip(),
        farmer_id=payload.farmerId,
        farmer_name=payload.farmerName.strip(),
        acres=payload.acres.strip(),
        village=payload.village.strip(),
        status=payload.status or "collected",
        collected_date=today_str,
        qr_data=payload.qrData,
        created_at=datetime.utcnow(),
    )
    db.add(sample)
    db.commit()
    db.refresh(sample)
    print(f"[Sample] Registered: {sample.sample_id} for {sample.farmer_name}")
    return SampleResponse(**sample.to_dict())


@router.get("/{sample_id}", response_model=SampleResponse)
def get_sample(sample_id: str, db: Session = Depends(get_db)):
    """Get a single sample by its UUID id or human-readable sampleId."""
    sample = (
        db.query(Sample).filter(
            (Sample.id == sample_id) | (Sample.sample_id == sample_id.upper())
        ).first()
    )
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    return SampleResponse(**sample.to_dict())


@router.patch("/{sample_id}/status", response_model=SampleResponse)
def update_sample_status(
    sample_id: str,
    payload: SampleStatusUpdate,
    db: Session = Depends(get_db),
):
    """Advance the tracking status of a sample and auto-timestamp the transition."""
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
        )

    sample = (
        db.query(Sample).filter(
            (Sample.id == sample_id) | (Sample.sample_id == sample_id.upper())
        ).first()
    )
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    today_str = _format_date()
    sample.status = payload.status

    # Auto-populate the transition timestamp
    ts_field = STATUS_NEXT_FIELD.get(payload.status)
    if ts_field and getattr(sample, ts_field) is None:
        setattr(sample, ts_field, today_str)

    db.commit()
    db.refresh(sample)
    print(f"[Sample] Status updated: {sample.sample_id} -> {payload.status}")
    return SampleResponse(**sample.to_dict())
