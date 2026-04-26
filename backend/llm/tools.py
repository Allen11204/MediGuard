"""
LLM Agent Tools — DB query functions available to the LLM.

Security design:
- Every tool re-checks RBAC independently. We never trust the LLM's judgment on access control.
- Doctor: can only query patients assigned to them (patient.doctor_id == user_id)
- Patient: can only query their own record (patient.user_id == user_id)
- Unauthorized access → AuditLog entry + PermissionError
- All returned data is de-identified via Patient.to_dict(mask_pii=True) and ner.deidentify()
"""

from datetime import datetime
from backend.models.patient import Patient
from backend.models.condition import Condition
from backend.models.medication import Medication
from backend.models.observation import Observation
from backend.models.audit_log import AuditLog
from backend.extensions import db
from backend.llm.ner import deidentify


def _check_access(patient_id: int, current_user: dict) -> Patient:
    """
    Shared RBAC check used by all tools.
    Returns the Patient object if access is allowed, raises PermissionError otherwise.
    """
    patient = Patient.query.get(patient_id)
    if not patient:
        raise ValueError(f"Patient {patient_id} not found.")

    user_id = current_user["user_id"]
    role = current_user["role"]

    # Doctor can only access their assigned patients
    if role == "Doctor" and patient.doctor_id != user_id:
        log = AuditLog(
            user_id=user_id,
            action="LLM_TOOL_ACCESS",
            resource_type=f"/llm/tool/patient/{patient_id}",
            outcome="failure",
            source_ip="internal",
            timestamp=datetime.utcnow()
        )
        db.session.add(log)
        db.session.commit()
        raise PermissionError(f"Access denied: patient {patient_id} is not assigned to you.")

    # Patient can only access their own record
    if role == "Patient" and patient.user_id != user_id:
        log = AuditLog(
            user_id=user_id,
            action="LLM_TOOL_ACCESS",
            resource_type=f"/llm/tool/patient/{patient_id}",
            outcome="failure",
            source_ip="internal",
            timestamp=datetime.utcnow()
        )
        db.session.add(log)
        db.session.commit()
        raise PermissionError("Access denied: you can only access your own record.")

    return patient


def get_patient_profile(patient_id: int, current_user: dict) -> str:
    """Return basic patient profile (PII masked)."""
    patient = _check_access(patient_id, current_user)
    data = patient.to_dict(mask_pii=True)
    return (
        f"Patient profile — Gender: {data['gender']}, MRN: {data['mrn']}, "
        f"Name: {data['name']}, DOB: {data['dob']}"
    )


def get_patient_conditions(patient_id: int, current_user: dict) -> str:
    """Return the patient's conditions/diagnoses."""
    patient = _check_access(patient_id, current_user)
    conditions = Condition.query.filter_by(patient_id=patient.id).all()
    if not conditions:
        return "No conditions on record."
    lines = [
        f"- {c.disease_name} ({c.severity}, {c.status}) — {c.body_system}, diagnosed {c.diagnosed_date}"
        for c in conditions
    ]
    return deidentify("Conditions:\n" + "\n".join(lines))


def get_patient_medications(patient_id: int, current_user: dict) -> str:
    """Return the patient's current medications."""
    patient = _check_access(patient_id, current_user)
    medications = Medication.query.filter_by(patient_id=patient.id).all()
    if not medications:
        return "No medications on record."
    lines = [
        f"- {m.medicine_name} {m.dosage}, started {m.start_date}, purpose: {m.purpose}"
        for m in medications
    ]
    return deidentify("Medications:\n" + "\n".join(lines))


def get_patient_observations(patient_id: int, current_user: dict) -> str:
    """Return the patient's lab results and observations."""
    patient = _check_access(patient_id, current_user)
    observations = Observation.query.filter_by(patient_id=patient.id).all()
    if not observations:
        return "No observations on record."
    lines = [
        f"- {o.test_name}: {o.value} {o.unit or ''} ({'normal' if o.is_normal else 'abnormal'}) on {o.test_date}"
        for o in observations
    ]
    return deidentify("Observations:\n" + "\n".join(lines))


# Tool registry — maps tool name string (from LLM output) to the actual function
TOOL_REGISTRY = {
    "get_profile":      get_patient_profile,
    "get_conditions":   get_patient_conditions,
    "get_medications":  get_patient_medications,
    "get_observations": get_patient_observations,
}
