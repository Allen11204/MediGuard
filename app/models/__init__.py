# rbac role tables
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient

# patient data
# core tables
from app.models.condition import Condition
from app.models.medication import Medication
from app.models.observation import Observation

# audit table
from app.models.audit_log import AuditLog