"""
Condition model - Simplified for DP (Differential Privacy) testing
Uses plain language fields that non-medical people can understand
"""

from app.extensions import db

class Condition(db.Model):
    """
    PURPOSE: Test Differential Privacy on aggregate queries
    DEMO: "How many patients have diabetes?" -> Add Laplace noise
    """
    __tablename__ = "conditions"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)

    disease_name = db.Column(db.String(100), nullable=False)  # e.g., "Diabetes", "Hypertension"
    severity = db.Column(db.String(20))  # e.g., "Mild", "Moderate", "Severe"
    status = db.Column(db.String(20))  # e.g., "Active", "Controlled", "Resolved"

    diagnosed_date = db.Column(db.Date)  # Date when the condition was diagnosed

    # Category for grouping (plain language)
    body_system = db.Column(db.String(50))  # e.g., "Cardiovascular", "Metabolic"

    # Relationship
    patient = db.relationship('Patient', back_populates='conditions')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "disease_name": self.disease_name,
            "severity": self.severity,
            "status": self.status,
            "diagnosed_date": self.diagnosed_date.isoformat() if self.diagnosed_date else None,
            "body_system": self.body_system
        }