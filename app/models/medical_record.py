from datetime import datetime
from app.extensions import db

class MedicalRecord(db.Model):
    __tablename__ = "medical_records"

    id         = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    doctor_id  = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)
    diagnosis  = db.Column(db.Text, nullable=False)
    notes      = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "diagnosis": self.diagnosis,
            "notes": self.notes,
            "created_at": self.created_at.isoformat()
        }
