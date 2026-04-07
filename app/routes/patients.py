from flask import Blueprint, jsonify, request
from app.models.medical_record import MedicalRecord
from app.decorators import jwt_required, role_required, audit_log

patients_bp = Blueprint("patients", __name__, url_prefix="/api")


@patients_bp.route("/my-records", methods=["GET"])
@jwt_required
@role_required("patient")
@audit_log("READ", "medical_record")
def get_my_records():
    user_id = request.current_user["user_id"]
    records = MedicalRecord.query.filter_by(patient_id=user_id).all()
    return jsonify([r.to_dict() for r in records]), 200
