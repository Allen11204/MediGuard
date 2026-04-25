from flask import Blueprint, jsonify, request
from backend.models.user import User
from backend.models.audit_log import AuditLog
from backend.extensions import db, bcrypt
from backend.decorators import jwt_required, role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/users", methods=["GET"])
@jwt_required
@role_required("Admin")
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route("/users", methods=["POST"])
@jwt_required
@role_required("Admin")
def create_user():
    data = request.get_json()
    if User.query.filter_by(username=data.get("username")).first():
        return {"error": "Username already exists"}, 400
    if User.query.filter_by(email=data.get("email")).first():
        return {"error": "Email already exists"}, 400

    password_hash = bcrypt.generate_password_hash(data.get("password")).decode("utf-8")
    user = User(
        username=data.get("username"),
        email=data.get("email"),
        password_hash=password_hash,
        role=data.get("role")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required
@role_required("Admin")
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404
    db.session.delete(user)
    db.session.commit()
    return {"message": "User deleted"}, 200


@admin_bp.route("/audit-logs", methods=["GET"])
@jwt_required
@role_required("Admin")
def get_audit_logs():
    logs = AuditLog.query.filter_by(outcome="failure").all()
    return jsonify([log.to_dict() for log in logs]), 200
