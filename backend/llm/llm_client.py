"""
Unified LLM client using the OpenAI-compatible /chat/completions HTTP API.

Works with any compatible backend — local Ollama, OpenAI, Together, Groq, vLLM, etc.

Environment variables
---------------------
LLM_BASE_URL   Base URL of the API  (default: http://localhost:11434/v1  — local Ollama)
LLM_API_KEY    API key              (default: "ollama" — Ollama ignores it; required for remote services)
LLM_MODEL      Model name           (default: llama3.2)
"""

import os
import requests


def chat(messages: list[dict]) -> str:
    """Send a messages list to the configured LLM endpoint and return the reply."""
    base_url = os.getenv("LLM_BASE_URL", "http://localhost:11434/v1")
    api_key = os.getenv("LLM_API_KEY", "ollama")
    model = os.getenv("LLM_MODEL", "llama3.2")

    resp = requests.post(
        f"{base_url.rstrip('/')}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, "messages": messages},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]
