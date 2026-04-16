from backend.extensions import db

class Observation(db.Model):
    __tablename__ = "observations"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)

    test_name = db.Column(db.String(100), nullable=False)  # e.g., "Blood Pressure", "Body Weight", "Blood Glucose"
    value = db.Column(db.String(50), nullable=False)  # Stored as string to support both numeric (85.5) and text (140/90)
    unit = db.Column(db.String(20))  # e.g., "mmHg", "kg", "mg/dL"
    is_normal = db.Column(db.Boolean, default=True)  # True if value is within normal reference range
    test_date = db.Column(db.Date, nullable=False)  # Date when the observation was recorded

    patient = db.relationship('Patient', back_populates='observations')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "test_name": self.test_name,
            "value": self.value,
            "unit": self.unit,
            "is_normal": self.is_normal,
            "test_date": self.test_date.isoformat() if self.test_date else None
        }