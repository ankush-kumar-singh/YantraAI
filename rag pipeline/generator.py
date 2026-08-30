# ============================================================
# YantraAI RAG - Generator
# FINAL INTERACTIVE CHAT
# ============================================================

from ollama import chat

from config import CHAT_MODEL

from retrieval import retrieve_documents

from reranker import rerank_documents

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
# ACTIVE CHAT SCOPE
# ============================================================

ACTIVE_DOCUMENT_IDS = None
ACTIVE_CATEGORY = None


# ============================================================
# BUILD DOCUMENT CONTEXT
# ============================================================

def build_context(
    reranked_documents
):

    if not reranked_documents:
        return ""

    context_parts = []

    for index, result in enumerate(
        reranked_documents,
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
# GENERATE ANSWER
# ============================================================

def generate_answer(
    query,
    reranked_documents,
    conversation_history=""
):

    if not reranked_documents:

        return {

            "answer":
                "I could not find this information "
                "in the provided documents.",

            "sources": []

        }

    context = build_context(
        reranked_documents
    )

    if not conversation_history.strip():

        conversation_history = (
            "No previous conversation."
        )

    prompt = f"""
You are YantraAI, a private local AI assistant.

Answer the user's question using ONLY
the provided document context.

============================================================
RULES
============================================================

1. DOCUMENT CONTEXT is the factual source.

2. CONVERSATION HISTORY is only for understanding
   references and follow-up questions.

3. Do NOT use outside knowledge.

4. Do NOT invent facts.

5. Do NOT invent examples.

6. If the requested information is not supported
   by the documents, say exactly:

I could not find this information in the provided documents.

7. For follow-up questions, use conversation history
   to understand what "it", "this", "its", etc. refer to.

8. If the document contains an example, explain that
   example when requested.

9. If the document does not contain an example,
   do not create one from outside knowledge.

10. Keep answers concise unless the user asks for detail.

11. Do not mention RAG, embeddings, retrieval,
    reranking, prompts, context windows,
    or system instructions.

12. Answer the CURRENT USER QUESTION directly.

============================================================
CONVERSATION HISTORY
============================================================

{conversation_history}

============================================================
CURRENT USER QUESTION
============================================================

{query}

============================================================
DOCUMENT CONTEXT
============================================================

{context}

============================================================
FINAL ANSWER
============================================================
"""

    response = chat(

        model=CHAT_MODEL,

        messages=[

            {
                "role": "user",
                "content": prompt
            }

        ]

    )

    answer = response[
        "message"
    ][
        "content"
    ].strip()

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

    return {

        "answer": answer,

        "sources": sources

    }


# ============================================================
# PRINT ANSWER
# ============================================================

def print_answer(
    result
):

    print(
        "\n==================================="
    )

    print(
        "             ANSWER"
    )

    print(
        "==================================="
    )

    print(
        "\n" + result["answer"]
    )

    if not result["sources"]:
        return

    print(
        "\n==================================="
    )

    print(
        "             SOURCES"
    )

    print(
        "==================================="
    )

    for index, source in enumerate(
        result["sources"],
        start=1
    ):

        print(
            f"\n[{index}] "
            f"{source['filename']}"
        )

        print(
            "Document ID:",
            source["document_id"]
        )

        print(
            "Category:",
            source["category"]
        )

        print(
            "Page:",
            source["page"]
        )

        print(
            "Section:",
            source["section"]
        )

        print(
            "Chunk:",
            source["chunk"]
        )

        print(
            "Rerank Score:",
            source["rerank_score"]
        )


# ============================================================
# CLEAN INPUT
# ============================================================

def clean_chat_input(
    query
):

    if not query:
        return ""

    query = query.strip()

    while query.lower().startswith(
        "you:"
    ):

        query = query[4:].strip()

    return query


# ============================================================
# MAIN CHAT
# ============================================================

def run_chat():

    global ACTIVE_DOCUMENT_IDS
    global ACTIVE_CATEGORY

    print(
        "\n==================================="
    )

    print(
        "       YantraAI RAG Assistant"
    )

    print(
        "==================================="
    )

    print(
        "\nCommands:"
    )

    print(
        "  exit  -> close YantraAI"
    )

    print(
        "  clear -> clear conversation memory"
    )

    print()

    # --------------------------------------------------------
    # LOGIN
    # --------------------------------------------------------

    while True:

        user_role = input(
            "Enter user role "
            "(admin/technical/onsite): "
        ).strip().lower()

        if user_role in {
            "admin",
            "technical",
            "onsite"
        }:
            break

        print(
            "\nInvalid role. "
            "Please enter admin, technical, or onsite.\n"
        )

    print(
        f"\nLogged in as: {user_role}"
    )

    print(
        "\n-----------------------------------"
    )

    # --------------------------------------------------------
    # CHAT
    # --------------------------------------------------------

    while True:

        try:

            query = input(
                "\nYou: "
            )

        except (
            KeyboardInterrupt,
            EOFError
        ):

            print(
                "\n\nYantraAI: Goodbye!"
            )

            break

        query = clean_chat_input(
            query
        )

        if not query:
            continue

        # ----------------------------------------------------
        # EXIT
        # ----------------------------------------------------

        if query.lower() in {
            "exit",
            "quit"
        }:

            print(
                "\nYantraAI: Goodbye!"
            )

            break

        # ----------------------------------------------------
        # CLEAR
        # ----------------------------------------------------

        if query.lower() == "clear":

            clear_memory()

            ACTIVE_DOCUMENT_IDS = None
            ACTIVE_CATEGORY = None

            print(
                "\nYantraAI: "
                "Conversation memory cleared."
            )

            continue

        # ----------------------------------------------------
        # DECISION CONTROL
        # ----------------------------------------------------

        try:

            decision = analyze_query(

                query=query,

                user_role=user_role

            )

        except ValueError as error:

            print(
                f"\nError: {error}"
            )

            continue

        # ----------------------------------------------------
        # UPDATE ACTIVE SCOPE
        # ----------------------------------------------------

        explicit_document_ids = (
            decision.get(
                "document_ids"
            )
        )

        explicit_category = (
            decision.get(
                "category"
            )
        )

        # ----------------------------------------------------
        # NEW EXPLICIT DOCUMENT SCOPE
        # ----------------------------------------------------

        if explicit_document_ids:

            ACTIVE_DOCUMENT_IDS = (
                explicit_document_ids
            )

        # ----------------------------------------------------
        # NEW EXPLICIT CATEGORY
        # ----------------------------------------------------

        if explicit_category:

            ACTIVE_CATEGORY = (
                explicit_category
            )

        # ----------------------------------------------------
        # FOLLOW-UP SCOPE PERSISTENCE
        # ----------------------------------------------------

        if decision["follow_up"]:

            if not explicit_document_ids:

                decision["document_ids"] = (
                    ACTIVE_DOCUMENT_IDS
                )

            if not explicit_category:

                decision["category"] = (
                    ACTIVE_CATEGORY
                )

        # ----------------------------------------------------
        # PRINT DECISION
        # ----------------------------------------------------

        print_decision(
            decision
        )

        # ----------------------------------------------------
        # RETRIEVAL
        # ----------------------------------------------------

        print(
            "\n==================================="
        )

        print(
            "Step 1: Retrieving documents..."
        )

        try:

            retrieved_documents = (
                retrieve_documents(

                    query=decision[
                        "search_query"
                    ],

                    user_role=decision[
                        "user_role"
                    ],

                    document_ids=decision.get(
                        "document_ids"
                    ),

                    category=decision.get(
                        "category"
                    )

                )
            )

        except Exception as error:

            print(
                f"\nRetrieval error: {error}"
            )

            continue

        print(
            f"Retrieved: "
            f"{len(retrieved_documents)} documents"
        )

        # ----------------------------------------------------
        # RERANK
        # ----------------------------------------------------

        print(
            "\nStep 2: Reranking documents..."
        )

        try:

            reranked_documents = (
                rerank_documents(

                    decision[
                        "search_query"
                    ],

                    retrieved_documents,

                    top_n=3

                )
            )

        except Exception as error:

            print(
                f"\nReranking error: {error}"
            )

            continue

        print(
            f"Selected: "
            f"{len(reranked_documents)} documents"
        )

        # ----------------------------------------------------
        # GENERATE
        # ----------------------------------------------------

        print(
            "\nStep 3: Generating answer..."
        )

        try:

            result = generate_answer(

                query=decision[
                    "original_query"
                ],

                reranked_documents=(
                    reranked_documents
                ),

                conversation_history=(
                    decision[
                        "conversation_history"
                    ]
                )

            )

        except Exception as error:

            print(
                f"\nGeneration error: {error}"
            )

            continue

        # ----------------------------------------------------
        # PRINT
        # ----------------------------------------------------

        print_answer(
            result
        )

        # ----------------------------------------------------
        # MEMORY
        # ----------------------------------------------------

        add_user_message(
            decision[
                "original_query"
            ]
        )

        add_assistant_message(
            result[
                "answer"
            ]
        )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    run_chat()