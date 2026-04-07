from flask import Blueprint, jsonify
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord
from app.decorators import jwt_required, role_required, audit_log

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api")


@doctors_bp.route("/patients", methods=["GET"])
@jwt_required
@role_required("doctor", "admin")
@audit_log("READ", "patient")
def get_patients():
    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients]), 200


@doctors_bp.route("/patients/<int:patient_id>/records", methods=["GET"])
@jwt_required
@role_required("doctor", "admin")
@audit_log("READ", "medical_record")
def get_patient_records(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return {"error": "Patient not found"}, 404
    records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    return jsonify([r.to_dict() for r in records]), 200
