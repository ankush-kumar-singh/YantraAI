# ============================================================
# YantraAI RAG - Fast Reranker
# BGE Cross-Encoder Reranker
# ============================================================

from sentence_transformers import CrossEncoder

from config import TOP_K


# ============================================================
# MODEL
# ============================================================

RERANKER_MODEL = "BAAI/bge-reranker-base"

# Minimum reranker score required.
# Tune this later using real queries.

RERANK_SCORE_THRESHOLD = 0.01


print(
    f"Loading reranker: {RERANKER_MODEL}"
)

reranker = CrossEncoder(
    RERANKER_MODEL,
    max_length=512
)


# ============================================================
# RERANK DOCUMENTS
# ============================================================

def rerank_documents(
    query,
    retrieved_documents,
    top_n=3
):

    if not retrieved_documents:

        return []

    # --------------------------------------------------------
    # CREATE QUERY-DOCUMENT PAIRS
    # --------------------------------------------------------

    pairs = []

    for result in retrieved_documents:

        pairs.append([
            query,
            result["text"]
        ])

    # --------------------------------------------------------
    # SCORE
    # --------------------------------------------------------

    scores = reranker.predict(
        pairs,
        batch_size=4,
        show_progress_bar=False
    )

    # --------------------------------------------------------
    # ATTACH SCORES
    # --------------------------------------------------------

    scored_documents = []

    for result, score in zip(
        retrieved_documents,
        scores
    ):

        result_copy = result.copy()

        result_copy[
            "rerank_score"
        ] = float(score)

        scored_documents.append(
            result_copy
        )

    # --------------------------------------------------------
    # SORT
    # --------------------------------------------------------

    scored_documents.sort(
        key=lambda x: x["rerank_score"],
        reverse=True
    )

    # --------------------------------------------------------
    # RELEVANCE FILTER
    # --------------------------------------------------------

    filtered_documents = [

        result

        for result in scored_documents

        if result["rerank_score"]
        >= RERANK_SCORE_THRESHOLD

    ]

    # --------------------------------------------------------
    # TOP N
    # --------------------------------------------------------

    return filtered_documents[
        :top_n
    ]


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

        metadata = result[
            "metadata"
        ]

        print(
            f"\nResult {index}"
        )

        print(
            "-----------------------------------"
        )

        print(
            "File:",
            metadata.get(
                "filename"
            )
        )

        print(
            "Document ID:",
            metadata.get(
                "document_id"
            )
        )

        print(
            "Category:",
            metadata.get(
                "category"
            )
        )

        print(
            "Page:",
            metadata.get(
                "page"
            )
        )

        print(
            "Section:",
            metadata.get(
                "section"
            )
        )

        print(
            "Chunk:",
            metadata.get(
                "chunk"
            )
        )

        print(
            "Chroma Distance:",
            result[
                "distance"
            ]
        )

        print(
            "Rerank Score:",
            result[
                "rerank_score"
            ]
        )

        print(
            "\nText:"
        )

        print(
            result[
                "text"
            ]
        )


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":

    from retrieval import (
        retrieve_documents
    )

    print(
        "\n==================================="
    )

    print(
        "       YantraAI Reranker Test"
    )

    print(
        "==================================="
    )

    user_role = input(
        "\nEnter user role "
        "(admin/technical/onsite): "
    ).strip()

    query = input(
        "\nEnter your question: "
    ).strip()

    print(
        "\nRetrieving documents..."
    )

    try:

        retrieved_documents = (
            retrieve_documents(
                query,
                user_role
            )
        )

        print(
            f"\nRetrieved "
            f"{len(retrieved_documents)} "
            f"documents."
        )

        print(
            "\nReranking documents..."
        )

        reranked_documents = (
            rerank_documents(
                query,
                retrieved_documents,
                top_n=3
            )
        )

        print(
            f"\nSelected "
            f"{len(reranked_documents)} "
            f"documents."
        )

        print_reranked_results(
            reranked_documents
        )

    except ValueError as error:

        print(
            f"\nError: {error}"
        )