from flask import Blueprint, jsonify
from app.models.audit_log import AuditLog
from app.decorators import jwt_required, role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/audit-logs", methods=["GET"])
@jwt_required
@role_required("admin")
def get_audit_logs():
    logs = AuditLog.query.all()
    return jsonify([log.to_dict() for log in logs]), 200
