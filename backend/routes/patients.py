from flask import Blueprint, jsonify, request
from backend.models.patient import Patient
from backend.models.condition import Condition
from backend.models.medication import Medication
from backend.models.observation import Observation
from backend.decorators import jwt_required, role_required

patients_bp = Blueprint("patients", __name__, url_prefix="/api/my")


@patients_bp.route("/profile", methods=["GET"])
@jwt_required
@role_required("Patient")
def get_my_profile():
    user_id = request.current_user["user_id"]
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        return {"error": "Patient record not found"}, 404
    return jsonify(patient.to_dict()), 200


@patients_bp.route("/conditions", methods=["GET"])
@jwt_required
@role_required("Patient")
def get_my_conditions():
    user_id = request.current_user["user_id"]
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        return {"error": "Patient record not found"}, 404
    conditions = Condition.query.filter_by(patient_id=patient.id).all()
    return jsonify([c.to_dict() for c in conditions]), 200


@patients_bp.route("/medications", methods=["GET"])
@jwt_required
@role_required("Patient")
def get_my_medications():
    user_id = request.current_user["user_id"]
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        return {"error": "Patient record not found"}, 404
    medications = Medication.query.filter_by(patient_id=patient.id).all()
    return jsonify([m.to_dict() for m in medications]), 200


@patients_bp.route("/observations", methods=["GET"])
@jwt_required
@role_required("Patient")
def get_my_observations():
    user_id = request.current_user["user_id"]
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        return {"error": "Patient record not found"}, 404
    observations = Observation.query.filter_by(patient_id=patient.id).all()
    return jsonify([o.to_dict() for o in observations]), 200
