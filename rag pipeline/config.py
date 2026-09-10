# ============================================================
# YantraAI RAG - Configuration
# ============================================================

from pathlib import Path

RAG_DIR = Path(__file__).resolve().parent

DOCUMENTS_FOLDER = RAG_DIR / "documents"
CHROMA_PATH = RAG_DIR / "chroma_db"

COLLECTION_NAME = "yantra_documents"


# ============================================================
# MODELS
# ============================================================

EMBEDDING_MODEL = "nomic-embed-text"

CHAT_MODEL = "qwen3:1.7b"


# ============================================================
# RETRIEVAL
# ============================================================

TOP_K = 10

DISTANCE_THRESHOLD = 0.90


# ============================================================
# CHUNKING
# ============================================================

MAX_WORDS_PER_CHUNK = 180