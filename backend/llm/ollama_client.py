import requests

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "llama3.2"


def chat(messages: list[dict]) -> str:
    """Send a messages list to Ollama and return the assistant reply as a string."""
    resp = requests.post(
        OLLAMA_URL,
        json={"model": MODEL, "messages": messages, "stream": False},
        timeout=120
    )
    resp.raise_for_status()
    return resp.json()["message"]["content"]
