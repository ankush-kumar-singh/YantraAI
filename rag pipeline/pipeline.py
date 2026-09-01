# ============================================================
# YantraAI - Ankush RAG Worker
# FINAL RAG WORKER API
# ============================================================

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List

from retrieval import retrieve_documents
from reranker import rerank_documents
from generator import generate_answer

from decision_control import (
    analyze_query,
    print_decision
)

from memory import (
    add_user_message,
    add_assistant_message,
    clear_memory
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="YantraAI - Ankush RAG Worker",
    description="Distributed RAG worker for YantraAI",
    version="1.0.0"
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RAGRequest(BaseModel):

    query: str

    user_role: str = "technical"

    document_ids: Optional[List[str]] = None

    category: Optional[str] = None

    conversation_history: Optional[str] = None


# ============================================================
# RESPONSE MODEL
# ============================================================

class RAGResponse(BaseModel):

    success: bool

    worker: str

    answer: str

    sources: list

    follow_up: bool

    root_question: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {

        "status": "online",

        "worker": "ankush-rag",

        "service": "rag",

        "version": "1.0"

    }


# ============================================================
# RAG QUERY
# ============================================================

@app.post("/rag/query")
def rag_query(request: RAGRequest):

    try:

        # ----------------------------------------------------
        # INPUT
        # ----------------------------------------------------

        query = request.query.strip()

        if not query:

            return {

                "success": False,

                "worker": "ankush-rag",

                "answer": "Query cannot be empty.",

                "sources": [],

                "follow_up": False,

                "root_question": ""

            }


        # ----------------------------------------------------
        # DECISION CONTROL
        # ----------------------------------------------------

        decision = analyze_query(

            query=query,

            user_role=request.user_role

        )

        print_decision(
            decision
        )


        # ----------------------------------------------------
        # EXTERNAL SCOPE OVERRIDE
        # ----------------------------------------------------

        if request.document_ids:

            decision["document_ids"] = (
                request.document_ids
            )


        if request.category:

            decision["category"] = (
                request.category
            )


        # ----------------------------------------------------
        # CONVERSATION HISTORY
        # ----------------------------------------------------

        conversation_history = (
            request.conversation_history
            if request.conversation_history is not None
            else decision["conversation_history"]
        )


        # ====================================================
        # STEP 1 - RETRIEVAL
        # ====================================================

        print(
            "\nStep 1: Retrieving documents..."
        )


        retrieved_documents = retrieve_documents(

            query=decision["search_query"],

            user_role=decision["user_role"],

            document_ids=decision.get(
                "document_ids"
            ),

            category=decision.get(
                "category"
            )

        )


        print(
            f"Retrieved: "
            f"{len(retrieved_documents)} documents"
        )


        # ====================================================
        # STEP 2 - RERANKING
        # ====================================================

        print(
            "\nStep 2: Reranking documents..."
        )


        reranked_documents = rerank_documents(

            decision["search_query"],

            retrieved_documents,

            top_n=3

        )


        print(
            f"Selected: "
            f"{len(reranked_documents)} documents"
        )


        # ====================================================
        # STEP 3 - GENERATION
        # ====================================================

        print(
            "\nStep 3: Generating answer..."
        )


        result = generate_answer(

            query=decision["original_query"],

            reranked_documents=(
                reranked_documents
            ),

            conversation_history=(
                conversation_history
            )

        )


        # ====================================================
        # MEMORY
        # ====================================================

        add_user_message(

            decision["original_query"]

        )


        add_assistant_message(

            result["answer"]

        )


        # ====================================================
        # RETURN RESULT TO RIYA
        # ====================================================

        return {

            "success": True,

            "worker": "ankush-rag",

            "answer": result["answer"],

            "sources": result["sources"],

            "follow_up": decision["follow_up"],

            "root_question": decision["root_question"]

        }


    except Exception as error:

        print(
            "\nRAG Worker Error:"
        )

        print(
            str(error)
        )


        return {

            "success": False,

            "worker": "ankush-rag",

            "answer": "",

            "sources": [],

            "follow_up": False,

            "root_question": "",

            "error": str(error)

        }


# ============================================================
# CLEAR MEMORY
# ============================================================

@app.post("/rag/clear")
def rag_clear():

    clear_memory()

    return {

        "success": True,

        "worker": "ankush-rag",

        "message": "RAG conversation memory cleared."

    }


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    import uvicorn

    print()
    print("===================================")
    print("       ANKUSH RAG WORKER")
    print("===================================")
    print()
    print("API:")
    print("  GET  /health")
    print("  POST /rag/query")
    print("  POST /rag/clear")
    print()
    print("Starting worker...")
    print()

    uvicorn.run(

        app,

        host="0.0.0.0",

        port=8001

    )