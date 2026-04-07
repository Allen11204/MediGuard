def register_blueprints(app):
    from app.routes.auth import auth_bp
    from app.routes.doctors import doctors_bp
    from app.routes.patients import patients_bp
    from app.routes.admin import admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(admin_bp)
