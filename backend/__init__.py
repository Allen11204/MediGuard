from flask import Flask
from flask_cors import CORS
from backend.config import Config
from backend.extensions import db, bcrypt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, origins=["http://localhost:3000"])

    with app.app_context():
        # Import all models to register them with SQLAlchemy
        from backend.models.user import User
        from backend.models.patient import Patient
        from backend.models.doctor import Doctor
        from backend.models.condition import Condition
        from backend.models.medication import Medication
        from backend.models.observation import Observation
        from backend.models.audit_log import AuditLog
        db.create_all()

        from backend.routes import register_blueprints
        register_blueprints(app)

        # Auto-ingest medical knowledge into ChromaDB if collection is empty
        from backend.llm.rag import get_count
        if get_count() == 0:
            from backend.llm.ingest import ingest_all
            print("[RAG] ChromaDB collection is empty — running ingest...")
            ingest_all()
        else:
            print(f"[RAG] ChromaDB ready ({get_count()} chunks)")

    @app.route("/")
    def index():
        return {"message": "MediGuard API is running"}

    return app
