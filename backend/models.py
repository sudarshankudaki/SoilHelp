"""
SoilHelp - SQLAlchemy ORM Models
Defines the Farmer and Sample database tables.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String, primary_key=True, index=True)          # UUID string
    name = Column(String, nullable=False, index=True)
    village = Column(String, nullable=False)
    farm_size = Column(String, nullable=False)                  # stored as string e.g. "5.5"
    phone = Column(String, nullable=False)
    primary_crop = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship: one farmer -> many samples
    samples = relationship("Sample", back_populates="farmer", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "village": self.village,
            "farmSize": self.farm_size,
            "phone": self.phone,
            "primaryCrop": self.primary_crop,
            "soilType": self.soil_type,
            "date": self.created_at.strftime("%Y-%m-%d") if self.created_at else None,
        }


class Sample(Base):
    __tablename__ = "samples"

    id = Column(String, primary_key=True, index=True)           # UUID string
    sample_id = Column(String, unique=True, nullable=False, index=True)  # e.g. "SH-2026-892"
    farmer_id = Column(String, ForeignKey("farmers.id", ondelete="SET NULL"), nullable=True, index=True)
    farmer_name = Column(String, nullable=False)
    acres = Column(String, nullable=False)
    village = Column(String, nullable=False)
    status = Column(String, nullable=False, default="collected")  # collected | in_transit | lab_analysis | completed
    collected_date = Column(String, nullable=True)
    dispatched_date = Column(String, nullable=True)
    lab_analysis_date = Column(String, nullable=True)
    completed_date = Column(String, nullable=True)
    qr_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="samples")

    STATUS_LABELS = {
        "collected": "Collected",
        "in_transit": "In Transit",
        "lab_analysis": "Lab Analysis",
        "completed": "Completed",
    }

    def to_dict(self):
        return {
            "id": self.id,
            "sampleId": self.sample_id,
            "farmerName": self.farmer_name,
            "acres": self.acres,
            "village": self.village,
            "collectionDate": self.collected_date,
            "status": self.status,
            "statusLabel": self.STATUS_LABELS.get(self.status, self.status.title()),
            "timeline": {
                "collectedDate": self.collected_date,
                "dispatchedDate": self.dispatched_date,
                "labAnalysisDate": self.lab_analysis_date,
                "completedDate": self.completed_date,
            },
            "qrData": self.qr_data,
        }
