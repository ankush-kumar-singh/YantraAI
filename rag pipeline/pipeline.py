# ============================================================
# YantraAI RAG - Fast Conversational Pipeline
# ============================================================

from retrieval import retrieve_documents
from reranker import rerank_documents
from generator import generate_answer

from memory import (
    add_user_message,
    add_assistant_message,
    format_history,
    clear_memory
)


# ============================================================
# CREATE FAST CONTEXTUAL QUERY
# ============================================================

def create_contextual_query(
    query,
    history
):
    """
    Create a retrieval query using conversation memory
    WITHOUT making an additional LLM call.

    This keeps conversational context while making
    the pipeline faster.

    Example:

    Previous:
        User: What is supervised learning?

    Current:
        Give me some examples.

    Retrieval query:
        Previous topic: What is supervised learning?
        Current question: Give me some examples.
    """

    query = query.strip()

    # --------------------------------------------------------
    # NO HISTORY
    # --------------------------------------------------------

    if not history.strip():

        return query


    # --------------------------------------------------------
    # USE RECENT CONVERSATION
    # --------------------------------------------------------

    # Keep only recent history to avoid making the
    # retrieval query unnecessarily large.

    history_lines = history.strip().splitlines()

    # Last few lines contain the most recent conversation.
    recent_history = "\n".join(
        history_lines[-8:]
    )


    # --------------------------------------------------------
    # BUILD CONTEXTUAL SEARCH QUERY
    # --------------------------------------------------------

    contextual_query = f"""
Previous conversation:
{recent_history}

Current question:
{query}
""".strip()


    # --------------------------------------------------------
    # CLEAN EXTRA WHITESPACE
    # --------------------------------------------------------

    contextual_query = " ".join(
        contextual_query.split()
    )


    return contextual_query


# ============================================================
# ASK YANTRAAI
# ============================================================

def ask_yantra(
    query
):
    """
    Complete conversational RAG pipeline.

    Flow:

        User Question
             ↓
        Conversation Memory
             ↓
        Fast Contextual Query
             ↓
        Retrieval
             ↓
        Reranking
             ↓
        Generation
             ↓
        Save Memory
             ↓
        Answer
    """

    # --------------------------------------------------------
    # GET CONVERSATION HISTORY
    # --------------------------------------------------------

    previous_history = format_history(
        max_messages=6
    )


    # ========================================================
    # STEP 1 - CONTEXT
    # ========================================================

    print(
        "\n[1/5] Understanding conversation..."
    )


    contextual_query = create_contextual_query(

        query,

        previous_history

    )


    print(
        "Search query:",
        contextual_query
    )


    # ========================================================
    # STEP 2 - RETRIEVAL
    # ========================================================

    print(
        "\n[2/5] Retrieving documents..."
    )


    retrieved_documents = retrieve_documents(

        contextual_query

    )


    print(
        f"Retrieved: "
        f"{len(retrieved_documents)} documents"
    )


    # ========================================================
    # STEP 3 - RERANKING
    # ========================================================

    print(
        "\n[3/5] Reranking documents..."
    )


    reranked_documents = rerank_documents(

        contextual_query,

        retrieved_documents,

        top_n=3

    )


    print(
        f"Selected: "
        f"{len(reranked_documents)} documents"
    )


    # ========================================================
    # STEP 4 - GENERATION
    # ========================================================

    print(
        "\n[4/5] Generating answer..."
    )


    result = generate_answer(

        query,

        reranked_documents,

        previous_history

    )


    answer = result[
        "answer"
    ]


    # ========================================================
    # STEP 5 - UPDATE MEMORY
    # ========================================================

    print(
        "\n[5/5] Updating conversation memory..."
    )


    add_user_message(
        query
    )


    add_assistant_message(
        answer
    )


    # ========================================================
    # DISPLAY ANSWER
    # ========================================================

    print(
        "\n==================================="
    )

    print(
        "             YANTRAAI"
    )

    print(
        "==================================="
    )


    print(
        "\n" + answer
    )


    # ========================================================
    # DISPLAY SOURCES
    # ========================================================

    if result["sources"]:

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

                f"Page: "
                f"{source['page']}"

            )

            print(

                f"Section: "
                f"{source['section']}"

            )

            print(

                f"Chunk: "
                f"{source['chunk']}"

            )


    return result


# ============================================================
# CHAT LOOP
# ============================================================

def run_chat():

    print(
        "\n==================================="
    )

    print(
        "          YANTRAAI RAG"
    )

    print(
        "==================================="
    )

    print(
        "\nType 'exit' to quit."
    )

    print(
        "Type 'clear' to clear conversation memory."
    )


    while True:

        # ----------------------------------------------------
        # USER INPUT
        # ----------------------------------------------------

        query = input(
            "\nYou: "
        ).strip()


        # ----------------------------------------------------
        # EXIT
        # ----------------------------------------------------

        if query.lower() == "exit":

            print(
                "\nGoodbye!"
            )

            break


        # ----------------------------------------------------
        # CLEAR MEMORY
        # ----------------------------------------------------

        if query.lower() == "clear":

            clear_memory()

            print(
                "\nConversation memory cleared."
            )

            continue


        # ----------------------------------------------------
        # EMPTY INPUT
        # ----------------------------------------------------

        if not query:

            print(
                "\nPlease enter a question."
            )

            continue


        # ----------------------------------------------------
        # PROCESS QUERY
        # ----------------------------------------------------

        try:

            ask_yantra(
                query
            )

        except Exception as e:

            print(
                "\n==================================="
            )

            print(
                "             ERROR"
            )

            print(
                "==================================="
            )

            print(
                str(e)
            )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    run_chat()