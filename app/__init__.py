from flask import Flask
from app.config import Config
from app.extensions import db, bcrypt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        from app import models
        db.create_all()

        from app.routes import register_blueprints
        register_blueprints(app)

    @app.route("/")
    def index():
        return {"message": "MediGuard API is running"}

    return app
