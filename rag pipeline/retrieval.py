# ============================================================
# YantraAI RAG - Retrieval
# Role + Document + Category Aware Retrieval
# ============================================================

from ingestion import collection

from config import (
    TOP_K,
    DISTANCE_THRESHOLD
)


# ============================================================
# USER ROLES
# ============================================================

ADMIN_ROLE = "admin"
TECHNICAL_ROLE = "technical"
ONSITE_ROLE = "onsite"


# ============================================================
# DOCUMENT CATEGORIES
# ============================================================

TECHNICAL = "technical"
ONSITE = "onsite"
COMMON = "common"

VALID_CATEGORIES = {
    TECHNICAL,
    ONSITE,
    COMMON
}


# ============================================================
# GET ALLOWED DOCUMENT CATEGORIES
# ============================================================

def get_allowed_categories(user_role):
    """
    Decide which document categories a user can access.

    admin:
        technical + onsite + common

    technical:
        technical + common

    onsite:
        onsite + common
    """

    if not user_role:
        raise ValueError(
            "User role is required."
        )

    user_role = user_role.lower().strip()

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    if user_role == ADMIN_ROLE:

        return [
            TECHNICAL,
            ONSITE,
            COMMON
        ]

    # --------------------------------------------------------
    # TECHNICAL
    # --------------------------------------------------------

    if user_role == TECHNICAL_ROLE:

        return [
            TECHNICAL,
            COMMON
        ]

    # --------------------------------------------------------
    # ONSITE
    # --------------------------------------------------------

    if user_role == ONSITE_ROLE:

        return [
            ONSITE,
            COMMON
        ]

    # --------------------------------------------------------
    # INVALID ROLE
    # --------------------------------------------------------

    raise ValueError(
        f"Invalid user role: {user_role}. "
        f"Allowed roles: admin, technical, onsite."
    )


# ============================================================
# NORMALIZE DOCUMENT IDS
# ============================================================

def normalize_document_ids(document_ids):
    """
    Convert a single document ID or list of IDs
    into a clean list.

    Examples:

        "DOC_12345678"

        ["DOC_12345678", "DOC_87654321"]
    """

    if not document_ids:
        return None

    if isinstance(document_ids, str):

        document_ids = [
            document_ids
        ]

    normalized_ids = []

    for document_id in document_ids:

        document_id = str(
            document_id
        ).strip()

        if document_id:

            normalized_ids.append(
                document_id
            )

    return normalized_ids or None


# ============================================================
# BUILD SEARCH FILTER
# ============================================================

def build_where_filter(
    user_role,
    document_ids=None,
    category=None
):
    """
    Build the final ChromaDB security/search filter.

    IMPORTANT:

    User role ALWAYS determines the maximum
    accessible scope.

    document_ids and category can only
    narrow that scope.

    They can NEVER increase permissions.
    """

    allowed_categories = get_allowed_categories(
        user_role
    )

    # --------------------------------------------------------
    # CATEGORY FILTER
    # --------------------------------------------------------

    requested_category = None

    if category:

        requested_category = (
            category
            .lower()
            .strip()
        )

        if requested_category not in VALID_CATEGORIES:

            raise ValueError(
                f"Invalid category: {category}. "
                f"Allowed categories: "
                f"technical, onsite, common."
            )

        # ----------------------------------------------------
        # SECURITY CHECK
        # ----------------------------------------------------

        if requested_category not in allowed_categories:

            # Return impossible scope rather than
            # allowing unauthorized retrieval.

            return {
                "category": "__ACCESS_DENIED__"
            }

    # --------------------------------------------------------
    # DOCUMENT ID FILTER
    # --------------------------------------------------------

    document_ids = normalize_document_ids(
        document_ids
    )

    # --------------------------------------------------------
    # ONLY ROLE FILTER
    # --------------------------------------------------------

    if not requested_category and not document_ids:

        return {
            "category": {
                "$in": allowed_categories
            }
        }

    # --------------------------------------------------------
    # ROLE + CATEGORY
    # --------------------------------------------------------

    if requested_category and not document_ids:

        return {
            "$and": [
                {
                    "category": {
                        "$in": allowed_categories
                    }
                },
                {
                    "category": requested_category
                }
            ]
        }

    # --------------------------------------------------------
    # ROLE + DOCUMENT IDs
    # --------------------------------------------------------

    if document_ids and not requested_category:

        return {
            "$and": [
                {
                    "category": {
                        "$in": allowed_categories
                    }
                },
                {
                    "document_id": {
                        "$in": document_ids
                    }
                }
            ]
        }

    # --------------------------------------------------------
    # ROLE + CATEGORY + DOCUMENT IDs
    # --------------------------------------------------------

    return {
        "$and": [
            {
                "category": {
                    "$in": allowed_categories
                }
            },
            {
                "category": requested_category
            },
            {
                "document_id": {
                    "$in": document_ids
                }
            }
        ]
    }


# ============================================================
# RETRIEVE RELEVANT DOCUMENTS
# ============================================================

def retrieve_documents(
    query,
    user_role,
    top_k=TOP_K,
    document_ids=None,
    category=None
):
    """
    Retrieve relevant document chunks.

    Parameters
    ----------
    query:
        User's question.

    user_role:
        admin / technical / onsite

    top_k:
        Number of chunks to retrieve.

    document_ids:
        Optional document ID or list of document IDs.

        Example:
            "DOC_3E9F5184"

        or:

            [
                "DOC_3E9F5184",
                "DOC_A2BB1D39"
            ]

    category:
        Optional category.

        technical / onsite / common


    SECURITY
    --------
    Role permissions are ALWAYS applied first.

    Requested document/category can only
    narrow the accessible scope.
    """

    # --------------------------------------------------------
    # VALIDATE QUERY
    # --------------------------------------------------------

    if not query or not query.strip():

        return []

    # --------------------------------------------------------
    # NORMALIZE TOP K
    # --------------------------------------------------------

    try:

        top_k = int(top_k)

    except (TypeError, ValueError):

        top_k = TOP_K

    if top_k <= 0:

        top_k = TOP_K

    # --------------------------------------------------------
    # BUILD SECURE FILTER
    # --------------------------------------------------------

    where_filter = build_where_filter(
        user_role=user_role,
        document_ids=document_ids,
        category=category
    )

    # --------------------------------------------------------
    # VECTOR SEARCH
    # --------------------------------------------------------

    results = collection.query(

        query_texts=[
            query.strip()
        ],

        n_results=top_k,

        where=where_filter

    )

    # --------------------------------------------------------
    # EXTRACT RESULTS
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # PROCESS RESULTS
    # --------------------------------------------------------

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

def print_results(results):

    if not results:

        print(
            "\nNo relevant documents found."
        )

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
            "Document ID:",
            metadata.get(
                "document_id"
            )
        )

        print(
            "File:",
            metadata.get(
                "filename"
            )
        )

        print(
            "File Type:",
            metadata.get(
                "file_type"
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
# INTERACTIVE TEST
# ============================================================

if __name__ == "__main__":

    print(
        "\n==================================="
    )

    print(
        "       YantraAI Retrieval Test"
    )

    print(
        "==================================="
    )

    # --------------------------------------------------------
    # USER ROLE
    # --------------------------------------------------------

    user_role = input(
        "\nEnter user role "
        "(admin/technical/onsite): "
    ).strip()

    # --------------------------------------------------------
    # QUERY
    # --------------------------------------------------------

    query = input(
        "\nEnter your question: "
    ).strip()

    # --------------------------------------------------------
    # OPTIONAL DOCUMENT ID
    # --------------------------------------------------------

    document_input = input(
        "\nDocument ID(s) "
        "(optional, comma separated): "
    ).strip()

    document_ids = None

    if document_input:

        document_ids = [
            item.strip()
            for item in document_input.split(",")
            if item.strip()
        ]

    # --------------------------------------------------------
    # OPTIONAL CATEGORY
    # --------------------------------------------------------

    category = input(
        "\nCategory "
        "(technical/onsite/common, optional): "
    ).strip()

    if not category:

        category = None

    # --------------------------------------------------------
    # RETRIEVE
    # --------------------------------------------------------

    try:

        results = retrieve_documents(

            query=query,

            user_role=user_role,

            document_ids=document_ids,

            category=category

        )

        print_results(
            results
        )

    except ValueError as error:

        print(
            f"\nError: {error}"
        )

    except Exception as error:

        print(
            f"\nRetrieval error: {error}"
        )