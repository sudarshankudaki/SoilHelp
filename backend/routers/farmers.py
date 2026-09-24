"""
SoilHelp - Farmers Router
CRUD REST endpoints for farmer registration and management.
"""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Farmer
from schemas import FarmerCreate, FarmerResponse

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.get("", response_model=list[FarmerResponse])
def list_farmers(
    search: Optional[str] = Query(None, description="Search by name or village"),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    """List all registered farmers, with optional name/village search."""
    query = db.query(Farmer)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(Farmer.name.ilike(pattern), Farmer.village.ilike(pattern))
        )
    farmers = query.order_by(Farmer.created_at.desc()).limit(limit).all()
    return [FarmerResponse(**f.to_dict()) for f in farmers]


@router.post("", response_model=FarmerResponse, status_code=201)
def register_farmer(payload: FarmerCreate, db: Session = Depends(get_db)):
    """Register a new farmer and return the persisted record."""
    farmer = Farmer(
        id=str(uuid.uuid4()),
        name=payload.name.strip(),
        village=payload.village.strip(),
        farm_size=payload.farmSize.strip(),
        phone=payload.phone.strip(),
        primary_crop=payload.primaryCrop,
        soil_type=payload.soilType,
        created_at=datetime.utcnow(),
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    print(f"[Farmer] Registered: {farmer.name} ({farmer.id})")
    return FarmerResponse(**farmer.to_dict())


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(farmer_id: str, db: Session = Depends(get_db)):
    """Get a single farmer by ID."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return FarmerResponse(**farmer.to_dict())


@router.delete("/{farmer_id}", status_code=204)
def delete_farmer(farmer_id: str, db: Session = Depends(get_db)):
    """Delete a farmer and all their associated samples (cascade)."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    db.delete(farmer)
    db.commit()
    print(f"[Farmer] Deleted: {farmer_id}")
