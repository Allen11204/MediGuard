import jwt
from functools import wraps
from datetime import datetime
from flask import request, current_app
from app.extensions import db
from app.models.audit_log import AuditLog
from app.models.patient import Patient


def jwt_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return {"error": "Missing token"}, 401
        try:
            payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}, 401
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}, 401
        return f(*args, **kwargs)
    return wrapper


def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.current_user["role"] not in allowed_roles:
                return {"error": "Permission denied"}, 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


def audit_log(action, resource_type):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            result = f(*args, **kwargs)
            log = AuditLog(
                user_id=request.current_user["user_id"],
                action=action,
                resource_type=resource_type,
                outcome="success" if result[1] < 400 else "failure",
                timestamp=datetime.utcnow()
            )
            db.session.add(log)
            db.session.commit()
            return result
        return wrapper
    return decorator


def patient_access_required(f):
    """
    Decorator to check if the current user has access to a patient's data.
    Works with routes that have patient_id parameter.

    Access rules:
    - Admin: Can access all patients
    - Doctor: Can only access their assigned patients
    - Patient: Can only access their own data
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        patient_id = kwargs.get('patient_id')
        if not patient_id:
            return {"error": "Patient ID required"}, 400

        user_id = request.current_user["user_id"]
        user_role = request.current_user["role"]

        # Admin can access all
        if user_role == "Admin":
            return f(*args, **kwargs)

        # Get the patient record
        patient = Patient.query.get(patient_id)
        if not patient:
            return {"error": "Patient not found"}, 404

        # Doctor can only access their assigned patients
        if user_role == "Doctor":
            if patient.doctor_id != user_id:
                return {"error": "Access denied - Not your patient"}, 403
            return f(*args, **kwargs)

        # Patient can only access their own record
        if user_role == "Patient":
            if patient.user_id != user_id:
                return {"error": "Access denied - Not your record"}, 403
            return f(*args, **kwargs)

        # Default deny
        return {"error": "Access denied"}, 403
    return wrapper
