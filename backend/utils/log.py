# Structured print utility for tracing the LLM agent call chain.
# Each log line is prefixed with a tag so the full pipeline is visible in server stdout:
#   [AGENT] → [RAG] → [LLM] → [TOOL] → [LLM] → [AGENT] done
import inspect


def log(tag: str, msg: str) -> None:
    frame = inspect.stack()[1]
    location = f"{frame.filename.split('MediGuard/')[-1]}:{frame.lineno}"
    print(f"[{tag}] ({location}) {msg}")
