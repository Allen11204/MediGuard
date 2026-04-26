from flask import Blueprint, request, jsonify
from backend.decorators import jwt_required, role_required
from backend.models.patient import Patient
from backend.llm.agent import run_agent

llm_bp = Blueprint("llm", __name__, url_prefix="/api/llm")


@llm_bp.route("/chat", methods=["POST"])
@jwt_required
@role_required("Doctor", "Patient")
def chat():
    data = request.get_json()
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return {"error": "Message is required"}, 400

    current_user = request.current_user
    role = current_user["role"]

    # Resolve patient_id based on role
    if role == "Patient":
        # Patients always query their own record — ignore any patient_id from request body
        patient = Patient.query.filter_by(user_id=current_user["user_id"]).first()
        if not patient:
            return {"error": "Patient record not found"}, 404
        patient_id = patient.id
    else:
        # Doctor must provide patient_id in request body
        patient_id = data.get("patient_id")
        if not patient_id:
            return {"error": "patient_id is required"}, 400

    reply = run_agent(
        user_message=message,
        patient_id=patient_id,
        current_user=current_user,
        history=history
    )

    return jsonify({"reply": reply}), 200
