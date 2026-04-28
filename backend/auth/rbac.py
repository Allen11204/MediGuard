from functools import wraps
from datetime import datetime
from flask import request
from backend.extensions import db
from backend.models.audit_log import AuditLog
from backend.models.patient import Patient


def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.current_user["role"] not in allowed_roles:
                db.session.add(AuditLog(
                    user_id=request.current_user["user_id"],
                    action="ACCESS",
                    resource_type=request.path,
                    outcome="failure",
                    source_ip=request.remote_addr,
                    timestamp=datetime.utcnow()
                ))
                db.session.commit()
                return {"error": "Permission denied"}, 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


def patient_access_required(f):
    """
    Enforce per-patient access control on routes with a patient_id parameter.

    - Admin: all patients
    - Doctor: assigned patients only
    - Patient: own record only
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        patient_id = kwargs.get("patient_id")
        if not patient_id:
            return {"error": "Patient ID required"}, 400

        user_id = request.current_user["user_id"]
        role = request.current_user["role"]

        if role == "Admin":
            return f(*args, **kwargs)

        patient = Patient.query.get(patient_id)
        if not patient:
            return {"error": "Patient not found"}, 404

        if role == "Doctor" and patient.doctor_id != user_id:
            _deny(user_id)
            return {"error": "Access denied - Not your patient"}, 403

        if role == "Patient" and patient.user_id != user_id:
            _deny(user_id)
            return {"error": "Access denied - Not your record"}, 403

        return f(*args, **kwargs)
    return wrapper


def _deny(user_id: int) -> None:
    db.session.add(AuditLog(
        user_id=user_id,
        action="ACCESS",
        resource_type=request.path,
        outcome="failure",
        source_ip=request.remote_addr,
        timestamp=datetime.utcnow()
    ))
    db.session.commit()
