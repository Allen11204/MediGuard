from datetime import datetime
from app.extensions import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action        = db.Column(db.String(50), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)
    outcome       = db.Column(db.String(20), nullable=False)
    source_ip     = db.Column(db.String(45))
    timestamp     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "outcome": self.outcome,
            "source_ip": self.source_ip,
            "timestamp": self.timestamp.isoformat()
        }
