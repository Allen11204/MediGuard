# MediGuard
Privacy-aware medical information system with LLM chatbot — RBAC, NER, RAG, Audit Logging

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- An LLM backend (see [LLM Configuration](#llm-configuration) below)

### Backend
```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment (copy and edit)
cp .env.example .env   # set SECRET_KEY, DATABASE_URL, and LLM settings

# 4. Seed the database (creates all tables + 1 admin, 6 doctors, 30 patients)
PYTHONPATH=. python backend/db_seed.py

# 5. Start the server (auto-ingests RAG knowledge base on first run)
PYTHONPATH=. python backend_run.py
# Server runs on http://localhost:5001
```

> **Note:** ChromaDB and SQLite are stored in `instance/` (gitignored).  
> The server automatically ingests `clinical_guidelines.txt`, `medications.txt`, `conditions.txt` into ChromaDB on first startup.

---

## LLM Configuration

The chatbot uses a unified client that speaks the OpenAI-compatible `/chat/completions` API, so it works with any compatible backend — local or cloud — without extra dependencies.

Configure via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_BASE_URL` | `http://localhost:11434/v1` | Base URL of the API endpoint |
| `LLM_API_KEY` | `ollama` | API key (`ollama` is ignored by local Ollama) |
| `LLM_MODEL` | `llama3.2` | Model name |

**Local Ollama (default)**
```bash
# Pull a model first
ollama pull llama3.2

# .env
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=llama3.2
```

**OpenAI**
```bash
# .env
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o
```

**Other OpenAI-compatible services** (Together, Groq, LM Studio, vLLM, …): set `LLM_BASE_URL` and `LLM_API_KEY` to the provider's values.

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
│       ├── llm_client.py      # Unified LLM client — OpenAI-compatible API (local or cloud)
│       ├── rag.py             # ChromaDB persistent store + semantic search
│       ├── ingest.py          # Chunk & embed medical knowledge files → ChromaDB
│       ├── agent.py           # LLM agent: RAG → LLM → tool call → LLM → de-identify
│       ├── tools.py           # DB query tools (get_profile/conditions/medications/observations)
│       └── ner.py             # Input filter + output de-identification
├── frontend/
│   ├── src/pages/       # Login, Register, DoctorPatients, DoctorPatientDetail, PatientDashboard, AdminUsers, AdminAuditLogs
│   ├── src/components/  # ProtectedRoute (RBAC guard), ChatBot
│   └── src/services/    # API clients (authApi, doctorApi, patientApi, adminApi, llmApi)
└── knowledge_base/      # RAG knowledge — chunked & embedded into ChromaDB on first startup
    ├── clinical_guidelines.txt        
    ├── medications.txt               
    └── conditions.txt               
```

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

- **RBAC**: frontend + backend
- **Doctor scope**: `patient_access_required` ensures doctors only access their assigned patients
- **LLM RBAC**: Each DB tool independently verifies access — the LLM cannot bypass permission checks
- **Audit trail**: All unauthorized access attempts (HTTP and LLM tool calls) are logged with user ID, resource, and IP
- **PHI protection**: LLM input is filtered for PHI; output is de-identified before returning to client
- **RAG grounding**: LLM answers are grounded in verified medical knowledge, reducing hallucination

---

## Agent Design Reflection

1. **The model is too small** — `llama3.2` (3B) has weak instruction-following, which limits how much prompt engineering and agent harness design can compensate. A larger model would likely respond better to the same prompts.
2. **Larger models may need better prompts** — switching to a more capable model is not a silver bullet; the system prompt and tool-calling format would need to be revisited and tuned accordingly.
3. **LLM backend is swappable** — the unified client speaks the OpenAI-compatible API, so any model (local or cloud) can be dropped in by changing three environment variables.

---

## Data Source
https://synthetichealth.github.io/synthea/
