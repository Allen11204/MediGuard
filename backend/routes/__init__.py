def register_blueprints(app):
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

