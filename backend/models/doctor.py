"""
Doctor model - Business entity for doctor role
Linked to User table via user_id (1-to-1 relationship)
"""

from backend.extensions import db
from datetime import datetime

class Doctor(db.Model):
    """
    Doctor-specific business data
    user_id links back to authentication in User table
    """
    __tablename__ = "doctors"

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)  # UNIQUE ensures 1-to-1

    # Professional information
    name          = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100))
    department    = db.Column(db.String(100))
    license_number = db.Column(db.String(50), unique=True, nullable=False)

    # Contact information
    office_phone  = db.Column(db.String(20))
    office_location = db.Column(db.String(200))

    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship back to User
    user = db.relationship('User', backref=db.backref('doctor_profile', uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "specialization": self.specialization,
            "department": self.department,
            "license_number": self.license_number,
            "office_phone": self.office_phone,
            "office_location": self.office_location
        }
