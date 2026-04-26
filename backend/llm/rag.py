import os
import chromadb
from sentence_transformers import SentenceTransformer

# Persist ChromaDB to disk so embeddings survive server restarts
_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "../../instance/chroma")
_client = chromadb.PersistentClient(path=os.path.abspath(_CHROMA_PATH))
_collection = _client.get_or_create_collection("medical_knowledge")

# all-MiniLM-L6-v2: small (80MB), fast, good semantic quality for medical text
_embedder = SentenceTransformer("all-MiniLM-L6-v2")


def add_document(doc_id: str, text: str, metadata: dict = None) -> None:
    """Add or update a chunk in ChromaDB. metadata can include source/section info."""
    embedding = _embedder.encode(text).tolist()
    _collection.upsert(
        ids=[doc_id],
        documents=[text],
        embeddings=[embedding],
        metadatas=[metadata or {}]
    )


def get_count() -> int:
    return _collection.count()


def search(query: str, n_results: int = 3) -> str:
    """
    Retrieve the top-k most relevant chunks for a query.
    Returns concatenated passages with source labels, or "" if collection is empty.
    """
    if _collection.count() == 0:
        return ""

    query_embedding = _embedder.encode(query).tolist()
    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, _collection.count()),
        include=["documents", "metadatas"]
    )

    passages = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    parts = []
    for doc, meta in zip(passages, metadatas):
        source = meta.get("source", "")
        section = meta.get("section", "")
        label = f"[{source} — {section}]" if source else ""
        parts.append(f"{label}\n{doc}" if label else doc)

    return "\n\n---\n\n".join(parts)
