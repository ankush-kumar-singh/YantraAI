# ============================================================
# YantraAI - Remote RAG Server
# ============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from retrieval import retrieve_documents
from reranker import rerank_documents


app = FastAPI(
    title="YantraAI RAG Server",
    version="1.0"
)


# ============================================================
# REQUEST FORMAT
# ============================================================

class RAGRequest(BaseModel):

    query: str

    user_role: str = "technical"

    document_ids: Optional[List[str]] = None

    category: Optional[str] = None


# ============================================================
# BUILD CONTEXT
# ============================================================

def build_context(documents):

    if not documents:
        return ""

    context_parts = []

    for index, result in enumerate(
        documents,
        start=1
    ):

        metadata = result.get(
            "metadata",
            {}
        )

        filename = metadata.get(
            "filename",
            "Unknown"
        )

        document_id = metadata.get(
            "document_id",
            "Unknown"
        )

        category = metadata.get(
            "category",
            "Unknown"
        )

        page = metadata.get(
            "page",
            "Unknown"
        )

        section = metadata.get(
            "section",
            "Unknown"
        )

        chunk = metadata.get(
            "chunk",
            "Unknown"
        )

        text = result.get(
            "text",
            ""
        )

        context_parts.append(
            f"""
SOURCE {index}

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

    return "\n".join(
        context_parts
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "YantraAI RAG",
        "node": "Ankush"
    }


# ============================================================
# RAG ENDPOINT
# ============================================================

@app.post("/rag")
def rag(request: RAGRequest):

    try:

        print(
            f"\nIncoming query: {request.query}"
        )

        # ----------------------------------------------------
        # STEP 1: RETRIEVAL
        # ----------------------------------------------------

        print(
            "Step 1: Retrieving documents..."
        )

        retrieved_documents = (
            retrieve_documents(

                query=request.query,

                user_role=request.user_role,

                document_ids=request.document_ids,

                category=request.category
            )
        )

        print(
            f"Retrieved: "
            f"{len(retrieved_documents)} documents"
        )


        # ----------------------------------------------------
        # STEP 2: RERANK
        # ----------------------------------------------------

        print(
            "Step 2: Reranking documents..."
        )

        reranked_documents = (
            rerank_documents(

                request.query,

                retrieved_documents,

                top_n=3
            )
        )

        print(
            f"Selected: "
            f"{len(reranked_documents)} documents"
        )


        # ----------------------------------------------------
        # STEP 3: BUILD CONTEXT
        # ----------------------------------------------------

        context = build_context(
            reranked_documents
        )


        # ----------------------------------------------------
        # STEP 4: SOURCES
        # ----------------------------------------------------

        sources = []

        for result in reranked_documents:

            metadata = result.get(
                "metadata",
                {}
            )

            sources.append({

                "filename":
                    metadata.get(
                        "filename",
                        "Unknown"
                    ),

                "document_id":
                    metadata.get(
                        "document_id",
                        "Unknown"
                    ),

                "category":
                    metadata.get(
                        "category",
                        "Unknown"
                    ),

                "page":
                    metadata.get(
                        "page",
                        "Unknown"
                    ),

                "section":
                    metadata.get(
                        "section",
                        "Unknown"
                    ),

                "chunk":
                    metadata.get(
                        "chunk",
                        "Unknown"
                    ),

                "rerank_score":
                    result.get(
                        "rerank_score"
                    )
            })


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {

            "success": True,

            "query":
                request.query,

            "context":
                context,

            "sources":
                sources
        }


    except Exception as error:

        print(
            f"RAG Error: {error}"
        )

        raise HTTPException(

            status_code=500,

            detail=str(error)
        )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(

        app,

        host="0.0.0.0",

        port=8000
    )