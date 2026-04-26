# MediGuard
Privacy-aware medical information system with LLM chatbot — RBAC, NER, RAG, Audit Logging

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.com) with `llama3.2` pulled (`ollama pull llama3.2`)

### Backend
```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment (copy and edit)
cp .env.example .env   # set SECRET_KEY and DATABASE_URL

# 4. Seed the database (creates all tables + 1 admin, 6 doctors, 30 patients)
PYTHONPATH=. python backend/db_seed.py

# 5. Start the server (auto-ingests RAG knowledge base on first run)
PYTHONPATH=. python backend_run.py
# Server runs on http://localhost:5001
```

> **Note:** ChromaDB and SQLite are stored in `instance/` (gitignored).  
> The server automatically ingests `clinical_guidelines.txt`, `medications.txt`, `conditions.txt` into ChromaDB on first startup.

### Frontend
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

### Test Accounts (password: `111111`)
| Role   | Username        |
|--------|-----------------|
| Admin  | `admin`         |
| Doctor | `robert_smith`  |
| Doctor | `emily_johnson` |
| Patient| `robert_walsh`  |
| Patient| (any patient — check db_seed output) |

---

## Architecture

```
MediGuard/
├── backend/
│   ├── models/          # SQLAlchemy models (User, Patient, Doctor, Condition, Medication, Observation, AuditLog)
│   ├── routes/          # Flask blueprints (auth, doctors, patients, admin, llm)
│   ├── decorators.py    # jwt_required, role_required, patient_access_required + audit logging
│   └── llm/
│       ├── ollama_client.py   # Ollama HTTP client (llama3.2)
│       ├── rag.py             # ChromaDB persistent store + semantic search
│       ├── ingest.py          # Chunk & embed medical knowledge files → ChromaDB
│       ├── agent.py           # LLM agent: RAG → LLM → tool call → LLM → de-identify
│       ├── tools.py           # DB query tools (get_profile/conditions/medications/observations)
│       └── ner.py             # Input filter + output de-identification
├── frontend/
│   ├── src/pages/       # Login, Register, DoctorPatients, DoctorPatientDetail, PatientDashboard, AdminUsers, AdminAuditLogs
│   ├── src/components/  # ProtectedRoute (RBAC guard)
│   └── src/services/    # API clients (authApi, doctorApi, patientApi, adminApi)
├── clinical_guidelines.txt   # RAG knowledge: exam guidelines, BP protocol, diabetes mgmt, lab ranges
├── medications.txt            # RAG knowledge: Metformin, Lisinopril, Albuterol, Atorvastatin, Sertraline, Aspirin
└── conditions.txt             # RAG knowledge: Hypertension, T2DM, Asthma, CAD, MDD
```

---

## Progress

### Part 1 — Authentication, Authorization & Infrastructure ✅

| Feature | Status | Notes |
|---------|--------|-------|
| JWT authentication | ✅ Done | PyJWT, 24h expiry |
| Password encryption | ✅ Done | bcrypt via Flask-Bcrypt |
| RBAC — backend | ✅ Done | `role_required` + `patient_access_required` decorators |
| RBAC — frontend | ✅ Done | `ProtectedRoute` with `allowedRoles` |
| Audit logging | ✅ Done | Logs failed access attempts to `audit_logs` table |
| Backend API | ✅ Done | Auth / Doctor / Patient / Admin endpoints |
| Frontend UI | ✅ Done | Login, Register, Doctor dashboard, Patient dashboard, Admin panel |
| Database seed | ✅ Done | 1 admin, 6 doctors, 30 patients with conditions/medications/observations |

### Part 2 — LLM & Privacy Protection

| Feature | Status | Notes |
|---------|--------|-------|
| Local LLM (Ollama) | ✅ Done | llama3.2 via `ollama_client.py` |
| RAG knowledge base | ✅ Done | 15 chunks (4 guidelines + 6 medications + 5 conditions), ChromaDB + sentence-transformers |
| RAG auto-ingest | ✅ Done | Server ingests on startup if ChromaDB is empty |
| LLM Agent | ✅ Done | Tool-calling loop: RAG → LLM → DB tool → LLM → reply |
| DB query tools | ✅ Done | get_profile / get_conditions / get_medications / get_observations |
| RBAC in tools | ✅ Done | Each tool re-checks access; violations logged to AuditLog |
| System prompt | ✅ Done | Role-restricted, tool-format enforced |
| Input/output filter (NER) | ✅ Done | PHI detection on input, de-identification on output |
| Differential Privacy (DP) | ⬜ Todo | — |
| Frontend chatbot UI | ⬜ Todo | Backend `/api/llm/chat` ready; UI not yet added |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT token |

### Doctor
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/patients` | Doctor | List own patients |
| GET | `/api/patients/:id` | Doctor | Patient detail |
| GET/POST | `/api/patients/:id/conditions` | Doctor | Read / add conditions |
| GET/POST | `/api/patients/:id/medications` | Doctor | Read / add medications |
| GET/POST | `/api/patients/:id/observations` | Doctor | Read / add observations |

### Patient
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/my/profile` | Patient | Own profile |
| GET | `/api/my/conditions` | Patient | Own conditions |
| GET | `/api/my/medications` | Patient | Own medications |
| GET | `/api/my/observations` | Patient | Own observations |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/POST | `/api/admin/users` | Admin | List / create users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/audit-logs` | Admin | Failed access logs |

### LLM Chatbot
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/llm/chat` | Doctor / Patient | Chat with LLM agent (RAG + DB tools) |

**Request body:**
```json
{
  "message": "Can this patient take metformin?",
  "patient_id": 1,
  "history": []
}
```

---

## Security Design

- **Two-layer access control**: JWT (authentication) + role/patient checks (authorization)
- **Doctor scope**: `patient_access_required` ensures doctors only access their assigned patients
- **LLM RBAC**: Each DB tool independently verifies access — the LLM cannot bypass permission checks
- **Audit trail**: All unauthorized access attempts (HTTP and LLM tool calls) are logged with user ID, resource, and IP
- **PHI protection**: LLM input is filtered for PHI; output is de-identified before returning to client
- **RAG grounding**: LLM answers are grounded in verified medical knowledge, reducing hallucination

---

## Data Source
https://synthetichealth.github.io/synthea/
