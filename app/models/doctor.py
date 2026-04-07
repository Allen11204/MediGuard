from app.extensions import db

class Doctor(db.Model):
    __tablename__ = "doctors"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name       = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    license_no = db.Column(db.String(50), unique=True, nullable=False)
