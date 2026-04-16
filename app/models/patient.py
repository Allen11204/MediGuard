"""
Patient model - Core table for testing NER (Named Entity Recognition) and RBAC
Contains deliberately sensitive PII fields for security feature demonstration
"""

from app.extensions import db
from datetime import datetime

class Patient(db.Model):
    """
    Tests:
    - NER: SSN, address, phone should be masked by NER system
    - RBAC: Different roles see different levels of detail
    """
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # Assigned doctor

    # Basic demographics
    name = db.Column(db.String(100), nullable=False)  # NER: should mask
    dob = db.Column(db.Date, nullable=False)  # NER: should mask
    gender = db.Column(db.String(20))

    # High-risk PII for NER testing
    ssn = db.Column(db.String(20))  # NER: CRITICAL - always mask
    address = db.Column(db.Text)  # NER: should mask
    phone = db.Column(db.String(20))  # NER: should mask
    email = db.Column(db.String(100))  # NER: should mask

    # Medical identifier
    mrn = db.Column(db.String(50), unique=True)  # Medical Record Number

    # Relationships
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='patients')
    conditions = db.relationship('Condition', back_populates='patient', cascade='all, delete-orphan')
    medications = db.relationship('Medication', back_populates='patient', cascade='all, delete-orphan')
    observations = db.relationship('Observation', back_populates='patient', cascade='all, delete-orphan')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, mask_pii=False):
        """Convert to dict with optional PII masking for NER testing"""
        return {
            "id": self.id,
            "mrn": self.mrn,
            "name": "[MASKED]" if mask_pii else self.name,
            "dob": "[MASKED]" if mask_pii else (self.dob.isoformat() if self.dob else None),
            "gender": self.gender,
            "ssn": "[MASKED]" if mask_pii else self.ssn,
            "address": "[MASKED]" if mask_pii else self.address,
            "phone": "[MASKED]" if mask_pii else self.phone,
            "email": "[MASKED]" if mask_pii else self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
