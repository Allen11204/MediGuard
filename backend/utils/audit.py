from functools import wraps
from datetime import datetime
from flask import request
from backend.extensions import db
from backend.models.audit_log import AuditLog


# Decorator that writes an AuditLog entry after every route call.
# outcome is derived from the HTTP status code: <400 = success, >=400 = failure.
def audit_log(action, resource_type):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            result = f(*args, **kwargs)
            db.session.add(AuditLog(
                user_id=request.current_user["user_id"],
                action=action,
                resource_type=resource_type,
                outcome="success" if result[1] < 400 else "failure",
                timestamp=datetime.utcnow()
            ))
            db.session.commit()
            return result
        return wrapper
    return decorator
