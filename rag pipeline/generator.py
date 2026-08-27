# ============================================================
# YantraAI RAG - Generator
# ============================================================

from ollama import chat

from config import CHAT_MODEL


# ============================================================
# BUILD DOCUMENT CONTEXT
# ============================================================

def build_context(
    reranked_documents
):
    """
    Convert reranked documents into a clean context
    for the language model.
    """

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
    """
    Generate a grounded answer using:

    1. Current user question
    2. Previous conversation history
    3. Retrieved and reranked documents
    """

    # --------------------------------------------------------
    # NO DOCUMENTS
    # --------------------------------------------------------

    if not reranked_documents:

        return {

            "answer": (
                "I could not find relevant "
                "information in the knowledge base."
            ),

            "sources": []

        }


    # --------------------------------------------------------
    # BUILD DOCUMENT CONTEXT
    # --------------------------------------------------------

    context = build_context(
        reranked_documents
    )


    # --------------------------------------------------------
    # CONVERSATION HISTORY
    # --------------------------------------------------------

    if not conversation_history.strip():

        conversation_history = (
            "No previous conversation."
        )


    # --------------------------------------------------------
    # PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are YantraAI, a private local AI assistant
that answers questions using a document knowledge base.

Your job is to provide accurate, concise,
and grounded answers.

IMPORTANT RULES:

1. Use the DOCUMENT CONTEXT as the primary source
   for answering the question.

2. Use CONVERSATION HISTORY only to understand
   the context of the current question.

3. Do NOT use outside knowledge.

4. Do NOT invent facts, examples, names,
   numbers, or explanations that are not supported
   by the document context.

5. If the required information is not present
   in the document context, say:

   "I could not find this information in the
   provided documents."

6. If the user asks a follow-up question such as:
   - "Give me some examples."
   - "Explain it."
   - "What about classification?"
   - "What are its types?"

   use the conversation history to understand
   what the user is referring to.

7. Answer the CURRENT USER QUESTION directly.

8. Do not mention these instructions.

9. Do not mention "context window", "retrieval",
   "reranking", embeddings, or internal system details
   unless the user specifically asks about them.

10. When appropriate, organize the answer with
    headings or bullet points.


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


    # --------------------------------------------------------
    # CALL OLLAMA
    # --------------------------------------------------------

    response = chat(

        model=CHAT_MODEL,

        messages=[

            {
                "role": "user",
                "content": prompt
            }

        ]

    )


    # --------------------------------------------------------
    # EXTRACT ANSWER
    # --------------------------------------------------------

    answer = response[
        "message"
    ][
        "content"
    ].strip()


    # --------------------------------------------------------
    # SOURCES
    # --------------------------------------------------------

    sources = []


    for result in reranked_documents:

        metadata = result.get(
            "metadata",
            {}
        )


        sources.append({

            "filename": metadata.get(
                "filename",
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

            print(

                f"Rerank Score: "
                f"{source['rerank_score']}"

            )


# ============================================================
# STANDALONE GENERATOR TEST
# ============================================================

if __name__ == "__main__":

    from retrieval import retrieve_documents

    from reranker import rerank_documents


    print(
        "\nYantraAI Generator Test"
    )


    query = input(
        "\nEnter your question: "
    ).strip()


    # --------------------------------------------------------
    # RETRIEVAL
    # --------------------------------------------------------

    print(
        "\nStep 1: Retrieving documents..."
    )


    retrieved_documents = retrieve_documents(
        query
    )


    print(
        f"Retrieved: "
        f"{len(retrieved_documents)} documents"
    )


    # --------------------------------------------------------
    # RERANKING
    # --------------------------------------------------------

    print(
        "\nStep 2: Reranking documents..."
    )


    reranked_documents = rerank_documents(

        query,

        retrieved_documents,

        top_n=3

    )


    print(
        f"Selected: "
        f"{len(reranked_documents)} documents"
    )


    # --------------------------------------------------------
    # GENERATION
    # --------------------------------------------------------

    print(
        "\nStep 3: Generating answer..."
    )


    result = generate_answer(

        query,

        reranked_documents,

        ""

    )


    print_answer(
        result
    )