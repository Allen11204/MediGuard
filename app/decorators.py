import jwt
from functools import wraps
from datetime import datetime
from flask import request, current_app
from app.extensions import db
from app.models.audit_log import AuditLog


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
