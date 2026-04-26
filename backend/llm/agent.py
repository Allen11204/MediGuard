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

SYSTEM_PROMPT = """You are MediGuard, a clinical assistant for doctors and patients.

Rules:
- Only answer medical questions about the current patient.
- Use the provided tools to retrieve patient data. Never make up or guess medical data.
- Never reveal or repeat SSN, phone number, address, or date of birth.
- If asked about other patients or unrelated topics, politely refuse.

Available tools:
  get_profile      — basic patient demographics
  get_conditions   — patient diagnoses and conditions
  get_medications  — patient medications and dosages
  get_observations — patient lab results and test observations

To call a tool, respond with EXACTLY this format on its own line:
TOOL: <tool_name> PATIENT_ID: <id>

Example: TOOL: get_conditions PATIENT_ID: 5

Only call one tool per response. After receiving the tool result, provide your final answer.
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

    # --- Step 3: Build system message (inject RAG context if available) ---
    system_content = SYSTEM_PROMPT
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
        messages.append({"role": "user", "content": f"Tool result:\n{tool_result}\n\nNow answer the original question."})
        response = ollama_client.chat(messages)

    # --- Step 7: De-identify final output ---
    return deidentify(response)
