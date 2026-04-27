"""
LLM Agent — orchestrates the full conversation flow:
1. Input filter (block PHI in user message)
2. RAG search (retrieve relevant medical knowledge context)
3. LLM round 1 (with system prompt + RAG context + history + user message)
4. Parse LLM response: if tool call detected → execute tool → LLM round 2
5. De-identify final output
6. Return answer
"""

import re
from backend.llm import ollama_client
from backend.llm.ner import input_filter, deidentify
from backend.llm.rag import search as rag_search
from backend.llm.tools import TOOL_REGISTRY

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

To call a tool, output ONLY this on its own line (nothing else on that line):
TOOL: <tool_name> PATIENT_ID: <id>

Example: TOOL: get_conditions PATIENT_ID: 5

If the question requires multiple data sources, call tools one at a time. After each tool result you may call another tool or give your final answer.
Your final answer must be based entirely on tool results — specific, complete, and clinically useful.
"""

# Regex to detect tool call in LLM response: "TOOL: get_conditions PATIENT_ID: 5"
TOOL_CALL_PATTERN = re.compile(r'TOOL:\s*(\w+)\s+PATIENT_ID:\s*(\d+)', re.IGNORECASE)


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

    # --- Step 1: Input filter ---
    clean_message, err = input_filter(user_message)
    if err:
        return err

    # --- Step 2: RAG context ---
    rag_context = rag_search(clean_message)

    # --- Step 3: Build system message (inject patient_id + RAG context) ---
    system_content = SYSTEM_PROMPT + f"\n\nCurrent patient ID: {patient_id}. Always use this exact ID when calling tools."
    if rag_context:
        system_content += f"\n\nRelevant medical knowledge:\n{rag_context}"

    system_message = {"role": "system", "content": system_content}

    # --- Step 4: First LLM call ---
    messages = [system_message] + history + [{"role": "user", "content": clean_message}]
    response = ollama_client.chat(messages)

    # --- Step 5: Check if LLM wants to call a tool ---
    match = TOOL_CALL_PATTERN.search(response)
    if match:
        tool_name = match.group(1).lower()
        requested_patient_id = int(match.group(2))

        # Execute the tool (RBAC enforced inside)
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

        # De-identify tool result before feeding back to LLM
        tool_result = deidentify(tool_result)

        # --- Step 6: Second LLM call with tool result ---
        messages.append({"role": "assistant", "content": response})
        messages.append({"role": "user", "content": f"[VERIFIED DATABASE RESULT]\n{tool_result}\n\nUsing the above verified data, now answer the original question."})
        response = ollama_client.chat(messages)

    # --- Step 7: Strip any leaked tool call lines, then de-identify ---
    response = TOOL_CALL_PATTERN.sub('', response).strip()
    return deidentify(response)
