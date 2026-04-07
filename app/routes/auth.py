from datetime import datetime, timedelta
from flask import Blueprint, request, current_app
from app.extensions import db, bcrypt
from app.models.user import User
import jwt

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if User.query.filter_by(username=username).first():
        return {"error": "Username already exists"}, 400

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, password_hash=password_hash, role=role)
    db.session.add(user)
    db.session.commit()

    return {"message": "User registered successfully"}, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return {"error": "Invalid username or password"}, 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(hours=24)
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return {"token": token, "role": user.role}, 200
