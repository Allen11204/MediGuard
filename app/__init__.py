from flask import Flask
from app.config import Config
from app.extensions import db, bcrypt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        # Import all models to register them with SQLAlchemy
        from app.models.user import User
        from app.models.patient import Patient
        from app.models.doctor import Doctor
        from app.models.condition import Condition
        from app.models.medication import Medication
        from app.models.observation import Observation
        from app.models.audit_log import AuditLog
        db.create_all()

        from app.routes import register_blueprints
        register_blueprints(app)

    @app.route("/")
    def index():
        return {"message": "MediGuard API is running"}

    return app
