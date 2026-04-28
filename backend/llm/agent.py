"""
LLM Agent — orchestrates the full conversation flow:
1. Input filter (block PHI in user message)
2. Tool loop: LLM decides which tools to call (DB tools or rag_search), up to MAX_TOOL_ROUNDS
3. De-identify final output and return
"""

import re
from backend.llm import llm_client
from backend.llm.ner import input_filter, deidentify
from backend.llm.rag import search as rag_search
from backend.llm.tools import TOOL_REGISTRY
from backend.utils.log import log

MAX_TOOL_ROUNDS = 5

SYSTEM_PROMPT = """You are MediGuard, a clinical assistant embedded in a hospital EMR system.
You are speaking with an authorized clinician. Your job is to retrieve and present patient data clearly.

Rules:
- Always use tools to fetch data before answering. Never invent or guess any medical data.
- Tool results come directly from the patient database — treat them as ground truth.
- Present all data from tool results completely and specifically, including medication names, dosages, condition names, and lab values.
- Only list conditions, medications, and observations that explicitly appear in the tool result. Do not infer, deduce, or add anything based on medications, your training knowledge, or any other source.
- Never reveal SSN, phone number, address, or date of birth.
- Only answer questions about the current patient. Refuse requests about other patients.

Available tools:
  get_profile      — patient demographics
  get_conditions   — diagnoses and conditions
  get_medications  — medications and dosages
  get_observations — lab results and observations
  rag_search       — medical knowledge base (drug interactions, clinical guidelines, condition info)

To call a database tool, output ONLY this on its own line:
TOOL: <tool_name> PATIENT_ID: <id>

To search medical knowledge, output ONLY this on its own line:
TOOL: rag_search QUERY: <search terms>

Call tools one at a time. After each result you may call another tool or give your final answer.
Your final answer must be based entirely on tool results — specific, complete, and clinically useful.
"""

# Matches DB tool calls:  TOOL: get_conditions PATIENT_ID: 5
DB_TOOL_PATTERN  = re.compile(r'TOOL:\s*(\w+)\s+PATIENT_ID:\s*(\d+)', re.IGNORECASE)
# Matches RAG tool calls: TOOL: rag_search QUERY: drug interactions
RAG_TOOL_PATTERN = re.compile(r'TOOL:\s*rag_search\s+QUERY:\s*(.+)', re.IGNORECASE)


def run_agent(user_message: str, patient_id: int, current_user: dict, history: list) -> str:
    """
    Main agent entry point.

    Args:
        user_message:  The user's chat message.
        patient_id:    The patient record this conversation is about.
        current_user:  JWT payload dict {user_id, username, role}.
        history:       Previous messages as list of {role, content} dicts.

    Returns:
        The assistant's final reply string (de-identified).
    """
    print(f"\n{'='*60}")
    log("AGENT", f"user={current_user['username']} patient_id={patient_id} message={user_message!r}")

    # --- Step 1: Input filter ---
    clean_message, err = input_filter(user_message)
    if err:
        return err

    # --- Step 2: Build initial messages ---
    system_content = SYSTEM_PROMPT + f"\n\nCurrent patient ID: {patient_id}. Always use this exact ID when calling tools."
    messages = [{"role": "system", "content": system_content}] + history + [{"role": "user", "content": clean_message}]

    # --- Step 3: Tool loop ---
    response = ""
    for _ in range(MAX_TOOL_ROUNDS):
        response = llm_client.chat(messages)
        messages.append({"role": "assistant", "content": response})

        # RAG tool call
        rag_match = RAG_TOOL_PATTERN.search(response)
        if rag_match:
            query = rag_match.group(1).strip()
            result = rag_search(query)
            messages.append({"role": "user", "content": f"[RAG RESULT]\n{result}"})
            continue

        # DB tool call
        db_match = DB_TOOL_PATTERN.search(response)
        if db_match:
            tool_name = db_match.group(1).lower()
            requested_patient_id = int(db_match.group(2))
            log("TOOL", f"calling {tool_name} patient_id={requested_patient_id}")
            tool_func = TOOL_REGISTRY.get(tool_name)
            if tool_func is None:
                tool_result = f"Unknown tool: {tool_name}"
            else:
                try:
                    tool_result = tool_func(requested_patient_id, current_user)
                except PermissionError as e:
                    return f"Access denied: {str(e)}"
                except ValueError as e:
                    return f"Error: {str(e)}"
            messages.append({"role": "user", "content": f"[VERIFIED DATABASE RESULT]\n{deidentify(tool_result)}\n\nUsing the above verified data, now answer the original question."})
            continue

        # No tool call — final answer
        break

    # --- Step 4: Strip any leaked tool call lines, then de-identify ---
    response = DB_TOOL_PATTERN.sub('', response)
    response = RAG_TOOL_PATTERN.sub('', response).strip()
    log("AGENT", "done")
    print(f"{'='*60}\n")
    return deidentify(response)
