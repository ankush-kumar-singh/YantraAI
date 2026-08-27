# ============================================================
# YantraAI RAG - Reranker
# ============================================================

import re

from ollama import chat

from config import CHAT_MODEL


# ============================================================
# SCORE ONE DOCUMENT
# ============================================================

def score_document(query, document):
    """
    Ask the local LLM to judge how relevant
    a document is to the user's query.

    Score:
    0 = Not relevant
    1 = Slightly relevant
    2 = Relevant
    3 = Highly relevant
    4 = Directly answers the query
    """

    prompt = f"""
You are a document relevance evaluator.

User Query:
{query}

Document:
{document}

Rate how relevant the document is to the query.

Return ONLY one integer:

0 = Not relevant
1 = Slightly relevant
2 = Relevant
3 = Highly relevant
4 = Directly answers the query

Do not explain.
Return only the number.
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

    answer = response["message"]["content"].strip()

    match = re.search(
        r"\b[0-4]\b",
        answer
    )

    if match:
        return int(match.group())

    return 0


# ============================================================
# RERANK DOCUMENTS
# ============================================================

def rerank_documents(
    query,
    retrieved_documents,
    top_n=3
):
    """
    Rerank retrieved documents using
    the local LLM.
    """

    if not retrieved_documents:

        return []


    scored_documents = []


    for result in retrieved_documents:

        score = score_document(
            query,
            result["text"]
        )

        result_copy = result.copy()

        result_copy["rerank_score"] = score

        scored_documents.append(
            result_copy
        )


    # --------------------------------------------------------
    # SORT BY RELEVANCE
    # --------------------------------------------------------

    scored_documents.sort(
        key=lambda x: x["rerank_score"],
        reverse=True
    )


    return scored_documents[:top_n]


# ============================================================
# DISPLAY RESULTS
# ============================================================

def print_reranked_results(
    results
):

    if not results:

        print(
            "\nNo relevant documents found."
        )

        return


    print(
        "\n==================================="
    )

    print(
        "          RERANKED RESULTS"
    )

    print(
        "==================================="
    )


    for index, result in enumerate(
        results,
        start=1
    ):

        metadata = result["metadata"]

        print(
            f"\nResult {index}"
        )

        print(
            "-----------------------------------"
        )

        print(
            "File:",
            metadata.get("filename")
        )

        print(
            "Page:",
            metadata.get("page")
        )

        print(
            "Section:",
            metadata.get("section")
        )

        print(
            "Chunk:",
            metadata.get("chunk")
        )

        print(
            "Chroma Distance:",
            result["distance"]
        )

        print(
            "Rerank Score:",
            result["rerank_score"]
        )

        print(
            "\nText:"
        )

        print(
            result["text"]
        )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    from retrieval import retrieve_documents


    print(
        "\nYantraAI Reranker Test"
    )


    query = input(
        "\nEnter your question: "
    )


    print(
        "\nRetrieving documents..."
    )


    retrieved_documents = retrieve_documents(
        query
    )


    print(
        f"Retrieved {len(retrieved_documents)} documents."
    )


    print(
        "\nReranking documents..."
    )


    reranked_documents = rerank_documents(
        query,
        retrieved_documents,
        top_n=3
    )


    print_reranked_results(
        reranked_documents
    )