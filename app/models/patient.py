from app.extensions import db

class Patient(db.Model):
    __tablename__ = "patients"

    id       = db.Column(db.Integer, primary_key=True)
    user_id  = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name     = db.Column(db.String(100), nullable=False)
    age      = db.Column(db.Integer, nullable=False)
    gender   = db.Column(db.String(10), nullable=False)
    allergies = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "allergies": self.allergies
        }
