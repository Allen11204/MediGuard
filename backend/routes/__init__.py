def register_blueprints(app):
    from backend.routes.auth import auth_bp
    from backend.routes.doctors import doctors_bp
    from backend.routes.patients import patients_bp
    from backend.routes.admin import admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(admin_bp)

