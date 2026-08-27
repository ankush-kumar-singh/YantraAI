# ============================================================
# YantraAI RAG - Retrieval
# ============================================================

from ingestion import collection

from config import TOP_K, DISTANCE_THRESHOLD


# ============================================================
# RETRIEVE RELEVANT DOCUMENTS
# ============================================================

def retrieve_documents(
    query,
    top_k=TOP_K
):
    """
    Retrieve the most relevant document chunks
    from ChromaDB for a given user query.
    """

    if not query or not query.strip():

        return []


    results = collection.query(

        query_texts=[query],

        n_results=top_k

    )


    documents = results.get(
        "documents",
        [[]]
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]

    distances = results.get(
        "distances",
        [[]]
    )[0]


    retrieved_chunks = []


    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

        # ----------------------------------------------------
        # DISTANCE FILTER
        # ----------------------------------------------------

        if distance > DISTANCE_THRESHOLD:

            continue


        retrieved_chunks.append({

            "text": document,

            "metadata": metadata,

            "distance": distance

        })


    return retrieved_chunks


# ============================================================
# DISPLAY RETRIEVED RESULTS
# ============================================================

def print_results(
    results
):

    if not results:

        print("\nNo relevant documents found.")

        return


    print(
        "\n==================================="
    )

    print(
        "       RETRIEVED DOCUMENTS"
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
            metadata.get(
                "filename"
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
            "Distance:",
            result["distance"]
        )

        print(
            "\nText:"
        )

        print(
            result["text"]
        )


# ============================================================
# TEST RETRIEVAL
# ============================================================

if __name__ == "__main__":

    print(
        "\nYantraAI Retrieval Test"
    )

    query = input(
        "\nEnter your question: "
    )


    results = retrieve_documents(
        query
    )


    print_results(
        results
    )