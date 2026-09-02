import requests
from ollama import chat


# ============================================================
# YantraAI - Remote Generator
# Amardeep Node - Qwen3 1.7B
# ============================================================

RAG_SERVER_URL = "http://100.87.210.43:8000"

REASONING_MODEL = "qwen3:1.7b"

REQUEST_TIMEOUT = 120


# ============================================================
# RAG SERVER
# ============================================================

def check_rag_server():

    try:
        response = requests.get(
            f"{RAG_SERVER_URL}/health",
            timeout=5
        )

        response.raise_for_status()

        return True

    except Exception:
        return False


def call_rag(
    query,
    user_role="technical",
    document_ids=None,
    category=None
):

    payload = {
        "query": query,
        "user_role": user_role,
        "document_ids": document_ids,
        "category": category
    }

    response = requests.post(
        f"{RAG_SERVER_URL}/rag",
        json=payload,
        timeout=REQUEST_TIMEOUT
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# REASONING MODEL
# ============================================================

def generate_answer(query, rag_result):

    context = rag_result.get(
        "context",
        ""
    )

    sources = rag_result.get(
        "sources",
        []
    )

    # --------------------------------------------------------
    # No relevant information found
    # --------------------------------------------------------

    if not context.strip():

        return {
            "answer": (
                "I could not find this information "
                "in the provided documents."
            ),
            "sources": sources
        }

    # --------------------------------------------------------
    # Prompt for Qwen3 1.7B
    # --------------------------------------------------------

    prompt = f"""
You are YantraAI's reasoning model.

The user asked a question.

A separate RAG system searched the user's authorized
documents and returned the relevant context below.

Your job is to understand that context and provide
the best final answer.

IMPORTANT RULES:

1. Use ONLY the information present in the retrieved context.
2. Do NOT use outside knowledge.
3. Do NOT invent facts.
4. Do NOT invent sources.
5. You may summarize, explain, compare, and combine information
   from the retrieved context.
6. Keep the answer clear, concise, and relevant to the question.
7. If the retrieved context does not contain enough information
   to answer the question, say:

"I could not find this information in the provided documents."

USER QUESTION:
{query}

============================================================
RETRIEVED CONTEXT
============================================================

{context}

============================================================
FINAL ANSWER
============================================================
"""

    # --------------------------------------------------------
    # Generate answer using Qwen3 1.7B
    # --------------------------------------------------------

    response = chat(
        model=REASONING_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    answer = response["message"]["content"].strip()

    return {
        "answer": answer,
        "sources": sources
    }


# ============================================================
# DISPLAY SOURCES
# ============================================================

def display_sources(sources):

    if not sources:
        return

    print()
    print("===================================")
    print("              SOURCES")
    print("===================================")

    for i, source in enumerate(
        sources,
        start=1
    ):

        print(
            f"\n[{i}] {source.get('filename', 'Unknown')}"
        )

        print(
            "Document ID:",
            source.get(
                "document_id",
                "Unknown"
            )
        )

        print(
            "Category:",
            source.get(
                "category",
                "Unknown"
            )
        )

        print(
            "Page:",
            source.get(
                "page",
                "Unknown"
            )
        )

        print(
            "Section:",
            source.get(
                "section",
                "Unknown"
            )
        )

        print(
            "Chunk:",
            source.get(
                "chunk",
                "Unknown"
            )
        )

        print(
            "Rerank Score:",
            source.get(
                "rerank_score",
                "Unknown"
            )
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("===================================")
    print("       YantraAI Remote Mode")
    print("===================================")

    print(
        f"RAG Server      : {RAG_SERVER_URL}"
    )

    print(
        f"Reasoning Model : {REASONING_MODEL}"
    )

    print()
    print("Checking RAG connection...")

    # --------------------------------------------------------
    # Check Ankush RAG server
    # --------------------------------------------------------

    if not check_rag_server():

        print(
            "RAG Status: NOT CONNECTED"
        )

        print()
        print(
            "Make sure Ankush's RAG server is running:"
        )

        print(
            "python rag_server.py"
        )

        return

    print(
        "RAG Status: CONNECTED"
    )

    # ========================================================
    # USER ROLE
    # ========================================================

    user_role = input(
        "\nEnter user role "
        "(admin/technical/onsite): "
    ).strip().lower()

    if user_role not in {
        "admin",
        "technical",
        "onsite"
    }:

        print(
            "Invalid role."
        )

        return

    # ========================================================
    # READY
    # ========================================================

    print()
    print(
        "YantraAI is ready."
    )

    print(
        "Type 'exit' or 'quit' to stop."
    )

    # ========================================================
    # CHAT LOOP
    # ========================================================

    while True:

        print()

        query = input(
            "You: "
        ).strip()

        # ----------------------------------------------------
        # Empty query
        # ----------------------------------------------------

        if not query:
            continue

        # ----------------------------------------------------
        # Exit
        # ----------------------------------------------------

        if query.lower() in {
            "exit",
            "quit"
        }:

            print(
                "\nYantraAI: Goodbye!"
            )

            break

        try:

            # =================================================
            # STEP 1 - RAG SEARCH
            # =================================================

            print(
                "\n[1/3] Searching RAG..."
            )

            rag_result = call_rag(
                query=query,
                user_role=user_role
            )

            # =================================================
            # STEP 2 - CONTEXT
            # =================================================

            print(
                "[2/3] Context received."
            )

            # =================================================
            # STEP 3 - QWEN 1.7B
            # =================================================

            print(
                "[3/3] Qwen3 1.7B reasoning..."
            )

            result = generate_answer(
                query=query,
                rag_result=rag_result
            )

            # =================================================
            # FINAL ANSWER
            # =================================================

            print()

            print(
                "==================================="
            )

            print(
                "           YANTRAAI ANSWER"
            )

            print(
                "==================================="
            )

            print()

            print(
                result["answer"]
            )

            # =================================================
            # SOURCES
            # =================================================

            display_sources(
                result["sources"]
            )

        # =====================================================
        # RAG TIMEOUT
        # =====================================================

        except requests.exceptions.Timeout:

            print()

            print(
                "RAG request timed out."
            )

            print(
                "Check whether Ankush's RAG server is running."
            )

        # =====================================================
        # RAG CONNECTION ERROR
        # =====================================================

        except requests.exceptions.ConnectionError:

            print()

            print(
                "Could not connect to Ankush's RAG server."
            )

            print(
                f"RAG Server: {RAG_SERVER_URL}"
            )

        # =====================================================
        # HTTP ERROR
        # =====================================================

        except requests.exceptions.HTTPError as error:

            print()

            print(
                "RAG server returned an error:"
            )

            print(
                error
            )

        # =====================================================
        # OTHER ERROR
        # =====================================================

        except Exception as error:

            print()

            print(
                "Error:"
            )

            print(
                error
            )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()