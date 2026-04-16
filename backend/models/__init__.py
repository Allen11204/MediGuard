# rbac role tables
from backend.models.user import User
from backend.models.doctor import Doctor
from backend.models.patient import Patient

# patient data
# core tables
from backend.models.condition import Condition
from backend.models.medication import Medication
from backend.models.observation import Observation

# audit table
from backend.models.audit_log import AuditLog