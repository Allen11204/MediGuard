from datetime import date
from flask import Blueprint, jsonify, request
from backend.models.patient import Patient
from backend.models.condition import Condition
from backend.models.medication import Medication
from backend.models.observation import Observation
from backend.extensions import db
from backend.decorators import jwt_required, role_required, patient_access_required


def _parse_date(s):
    return date.fromisoformat(s) if s else None

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api")


# ── 患者基本信息 ──────────────────────────────────────────

@doctors_bp.route("/patients", methods=["GET"])
@jwt_required
@role_required("Doctor")
def get_my_patients():
    doctor_id = request.current_user["user_id"]
    patients = Patient.query.filter_by(doctor_id=doctor_id).all()
    return jsonify([p.to_dict() for p in patients]), 200


@doctors_bp.route("/patients/<int:patient_id>", methods=["GET"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    return jsonify(patient.to_dict()), 200


# ── Conditions ────────────────────────────────────────────

@doctors_bp.route("/patients/<int:patient_id>/conditions", methods=["GET"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def get_conditions(patient_id):
    conditions = Condition.query.filter_by(patient_id=patient_id).all()
    return jsonify([c.to_dict() for c in conditions]), 200


@doctors_bp.route("/patients/<int:patient_id>/conditions", methods=["POST"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def add_condition(patient_id):
    data = request.get_json()
    condition = Condition(
        patient_id=patient_id,
        disease_name=data.get("disease_name"),
        severity=data.get("severity"),
        status=data.get("status"),
        diagnosed_date=_parse_date(data.get("diagnosed_date")),
        body_system=data.get("body_system")
    )
    db.session.add(condition)
    db.session.commit()
    return jsonify(condition.to_dict()), 201


# ── Medications ───────────────────────────────────────────

@doctors_bp.route("/patients/<int:patient_id>/medications", methods=["GET"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def get_medications(patient_id):
    medications = Medication.query.filter_by(patient_id=patient_id).all()
    return jsonify([m.to_dict() for m in medications]), 200


@doctors_bp.route("/patients/<int:patient_id>/medications", methods=["POST"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def add_medication(patient_id):
    data = request.get_json()
    medication = Medication(
        patient_id=patient_id,
        medicine_name=data.get("medicine_name"),
        dosage=data.get("dosage"),
        start_date=_parse_date(data.get("start_date")),
        end_date=_parse_date(data.get("end_date")),
        purpose=data.get("purpose")
    )
    db.session.add(medication)
    db.session.commit()
    return jsonify(medication.to_dict()), 201


# ── Observations ──────────────────────────────────────────

@doctors_bp.route("/patients/<int:patient_id>/observations", methods=["GET"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def get_observations(patient_id):
    observations = Observation.query.filter_by(patient_id=patient_id).all()
    return jsonify([o.to_dict() for o in observations]), 200


@doctors_bp.route("/patients/<int:patient_id>/observations", methods=["POST"])
@jwt_required
@role_required("Doctor")
@patient_access_required
def add_observation(patient_id):
    data = request.get_json()
    observation = Observation(
        patient_id=patient_id,
        test_name=data.get("test_name"),
        value=data.get("value"),
        unit=data.get("unit"),
        is_normal=data.get("is_normal", True),
        test_date=_parse_date(data.get("test_date"))
    )
    db.session.add(observation)
    db.session.commit()
    return jsonify(observation.to_dict()), 201
