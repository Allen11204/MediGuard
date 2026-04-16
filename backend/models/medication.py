from backend.extensions import db

class Medication(db.Model):
    __tablename__ = "medications"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)

    medicine_name = db.Column(db.String(200), nullable=False)  # e.g., "Aspirin", "Metformin"
    dosage = db.Column(db.String(100))  # e.g., "500mg twice daily"
    start_date = db.Column(db.Date, nullable=False)  # Date when the medication started
    end_date = db.Column(db.Date)  # Date when medication stopped (optional)
    purpose = db.Column(db.String(200))  # Reason for prescription (e.g., "Lower blood pressure")

    patient = db.relationship('Patient', back_populates='medications')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "medicine_name": self.medicine_name,
            "dosage": self.dosage,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "purpose": self.purpose
        }