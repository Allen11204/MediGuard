def register_blueprints(app):
    from backend.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

