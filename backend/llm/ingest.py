"""
RAG Ingest Script
Reads the three medical knowledge txt files, splits them into chunks by
ALL-CAPS section headers, and stores each chunk in ChromaDB with metadata.

Run from project root:
    PYTHONPATH=. python backend/llm/ingest.py
"""

import os
import re
from backend.llm.rag import add_document, get_count

DOCS_DIR = os.path.join(os.path.dirname(__file__), "../../")

SOURCE_FILES = [
    ("clinical_guidelines.txt", "Clinical Guidelines"),
    ("medications.txt",         "Medications"),
    ("conditions.txt",          "Conditions"),
]


def split_by_headers(text: str) -> list[tuple[str, str]]:
    """
    Split text into (section_title, section_body) pairs.
    Section headers are lines that are entirely uppercase (and non-empty).
    """
    lines = text.split("\n")
    chunks = []
    current_title = "General"
    current_body: list[str] = []

    for line in lines:
        stripped = line.strip()
        # Detect ALL-CAPS header: non-empty, all uppercase (allow spaces/parens)
        if stripped and stripped == stripped.upper() and len(stripped) > 4 and stripped[0].isalpha():
            if current_body:
                body = "\n".join(current_body).strip()
                if body:
                    chunks.append((current_title, body))
            current_title = stripped
            current_body = []
        else:
            current_body.append(line)

    # flush last section
    if current_body:
        body = "\n".join(current_body).strip()
        if body:
            chunks.append((current_title, body))

    return chunks


def ingest_all() -> None:
    total = 0
    for filename, source_label in SOURCE_FILES:
        filepath = os.path.join(DOCS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  [SKIP] {filename} not found at {filepath}")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()

        chunks = split_by_headers(text)
        print(f"\n[{source_label}] {filename} → {len(chunks)} chunks")

        for i, (section, body) in enumerate(chunks):
            doc_id = f"{source_label.lower().replace(' ', '_')}_{i:03d}"
            add_document(
                doc_id=doc_id,
                text=f"{section}\n\n{body}",
                metadata={"source": source_label, "section": section}
            )
            print(f"  ✓ [{doc_id}] {section[:60]}")
            total += 1

    print(f"\n✅ Ingestion complete — {total} chunks stored in ChromaDB")
    print(f"   Total documents in collection: {get_count()}")


if __name__ == "__main__":
    ingest_all()
