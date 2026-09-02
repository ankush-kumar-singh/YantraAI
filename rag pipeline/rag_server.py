# ============================================================
# YantraAI - Distributed RAG Server
# ============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from retrieval import retrieve_documents
from reranker import rerank_documents


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="YantraAI Distributed RAG Server",
    description="Central RAG service for YantraAI distributed nodes",
    version="2.0"
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RAGRequest(BaseModel):

    query: str

    user_role: str = "technical"

    document_ids: Optional[List[str]] = None

    category: Optional[str] = None


# ============================================================
# RESPONSE HELPERS
# ============================================================

def build_context(documents):

    if not documents:
        return ""

    context_parts = []

    for index, result in enumerate(documents, start=1):

        metadata = result.get("metadata", {})

        filename = metadata.get("filename", "Unknown")
        document_id = metadata.get("document_id", "Unknown")
        category = metadata.get("category", "Unknown")
        page = metadata.get("page", "Unknown")
        section = metadata.get("section", "Unknown")
        chunk = metadata.get("chunk", "Unknown")

        text = result.get("text", "")

        context_parts.append(
            f"""
============================================================
SOURCE {index}
============================================================

File: {filename}
Document ID: {document_id}
Category: {category}
Page: {page}
Section: {section}
Chunk: {chunk}

Content:
{text}
"""
        )

    return "\n".join(context_parts)


def build_sources(documents):

    sources = []

    for result in documents:

        metadata = result.get("metadata", {})

        sources.append({

            "filename": metadata.get(
                "filename",
                "Unknown"
            ),

            "document_id": metadata.get(
                "document_id",
                "Unknown"
            ),

            "category": metadata.get(
                "category",
                "Unknown"
            ),

            "page": metadata.get(
                "page",
                "Unknown"
            ),

            "section": metadata.get(
                "section",
                "Unknown"
            ),

            "chunk": metadata.get(
                "chunk",
                "Unknown"
            ),

            "rerank_score": result.get(
                "rerank_score"
            )
        })

    return sources


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "YantraAI Distributed RAG",
        "node": "Ankush",
        "version": "2.0"
    }


# ============================================================
# RAG ENDPOINT
# ============================================================

@app.post("/rag")
def rag(request: RAGRequest):

    try:

        print()
        print("============================================================")
        print("YANTRAAI RAG REQUEST")
        print("============================================================")

        print(
            f"Query       : {request.query}"
        )

        print(
            f"User Role   : {request.user_role}"
        )

        print(
            f"Documents   : {request.document_ids}"
        )

        print(
            f"Category    : {request.category}"
        )


        # ====================================================
        # STEP 1 - RETRIEVAL
        # ====================================================

        print()
        print("[1/3] Retrieving documents...")

        retrieved_documents = retrieve_documents(

            query=request.query,

            user_role=request.user_role,

            document_ids=request.document_ids,

            category=request.category
        )

        print(
            f"Retrieved: {len(retrieved_documents)} documents"
        )


        # ====================================================
        # STEP 2 - RERANKING
        # ====================================================

        print()
        print("[2/3] Reranking documents...")

        reranked_documents = rerank_documents(

            request.query,

            retrieved_documents,

            top_n=3
        )

        print(
            f"Selected: {len(reranked_documents)} documents"
        )


        # ====================================================
        # STEP 3 - BUILD CONTEXT
        # ====================================================

        print()
        print("[3/3] Building context...")

        context = build_context(
            reranked_documents
        )

        sources = build_sources(
            reranked_documents
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        response = {

            "success": True,

            "query": request.query,

            "context": context,

            "sources": sources
        }


        print()
        print("RAG processing completed.")

        print(
            "============================================================"
        )


        return response


    except Exception as error:

        print()
        print("============================================================")
        print("RAG ERROR")
        print("============================================================")

        print(error)


        raise HTTPException(

            status_code=500,

            detail=str(error)
        )


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {

        "service": "YantraAI Distributed RAG",

        "status": "running",

        "node": "Ankush",

        "endpoints": {

            "health": "/health",

            "rag": "/rag"
        }
    }


# ============================================================
# SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    print()
    print("============================================================")
    print("          YANTRAAI DISTRIBUTED RAG SERVER")
    print("============================================================")
    print()
    print("Node       : Ankush")
    print("Tailscale  : 100.87.210.43")
    print("Port       : 8000")
    print()
    print("RAG Server : http://100.87.210.43:8000")
    print()
    print("============================================================")

    uvicorn.run(

        app,

        host="0.0.0.0",

        port=8000
    )