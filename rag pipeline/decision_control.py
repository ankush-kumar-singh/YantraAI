# ============================================================
# YantraAI - Decision Control
# FINAL VERSION
# ============================================================

import re

from memory import get_conversation_history


VALID_ROLES = {
    "admin",
    "technical",
    "onsite"
}

VALID_CATEGORIES = {
    "common",
    "technical",
    "onsite"
}


# ============================================================
# HELPERS
# ============================================================

def clean_query(query):
    if not query:
        return ""

    query = query.strip()

    while query.lower().startswith("you:"):
        query = query[4:].strip()

    return query


def extract_document_ids(query):
    """
    Detect document IDs such as:

    DOC_3E9F5184
    DOC_F719A442
    """

    if not query:
        return []

    matches = re.findall(
        r"\bDOC_[A-Za-z0-9_-]+\b",
        query,
        flags=re.IGNORECASE
    )

    result = []

    for item in matches:

        item = item.upper()

        if item not in result:
            result.append(item)

    return result


def extract_category(query):
    """
    Detect category only when explicitly mentioned.
    """

    if not query:
        return None

    text = query.lower()

    # Explicit category wording
    patterns = [
        r"\bcategory\s*[:=]?\s*(common|technical|onsite)\b",
        r"\bfrom\s+(common|technical|onsite)\s+documents?\b",
        r"\b(common|technical|onsite)\s+documents?\b",
        r"\b(common|technical|onsite)\s+document\b",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text
        )

        if match:
            return match.group(1)

    return None


def is_follow_up(query):
    """
    Detect conversational follow-ups.

    This is intentionally conservative.
    """

    text = query.lower().strip()

    follow_up_patterns = [

        "explain it",
        "explain this",
        "explain that",
        "explain in simple words",
        "explain simply",
        "simplify it",
        "simplify this",

        "give examples",
        "give an example",
        "example",
        "examples",

        "what are its types",
        "what are its normal forms",
        "what are the types",
        "what are the normal forms",

        "what about it",
        "what about this",
        "tell me more",
        "more about it",
        "more details",
        "explain further",
        "elaborate",

        "advantages",
        "disadvantages",
        "benefits",
        "limitations",

        "how does it work",
        "why is it used",
        "where is it used",
    ]

    for pattern in follow_up_patterns:

        if pattern in text:
            return True

    # Very short contextual questions
    if len(text.split()) <= 6:

        contextual_words = [
            "its",
            "it",
            "this",
            "that",
            "these",
            "those"
        ]

        if any(
            word in text.split()
            for word in contextual_words
        ):
            return True

    return False


def build_search_query(
    query,
    follow_up,
    root_question
):

    if not follow_up:
        return query

    if not root_question:
        return query

    return (
        f"{root_question}. "
        f"Follow-up request: {query}"
    )


# ============================================================
# ANALYZE QUERY
# ============================================================

def analyze_query(
    query,
    user_role
):

    query = clean_query(query)

    if user_role not in VALID_ROLES:

        raise ValueError(
            "Invalid user role."
        )

    history = get_conversation_history()

    previous_messages = history.strip()

    # --------------------------------------------------------
    # FOLLOW-UP
    # --------------------------------------------------------

    follow_up = is_follow_up(
        query
    )

    # --------------------------------------------------------
    # ROOT QUESTION
    # --------------------------------------------------------

    root_question = None

    if follow_up:

        # Try to recover root question from memory.
        #
        # Memory format is expected to contain
        # previous user messages.

        lines = previous_messages.splitlines()

        for line in lines:

            stripped = line.strip()

            if stripped.lower().startswith(
                "user:"
            ):

                candidate = (
                    stripped[5:]
                    .strip()
                )

                if candidate:
                    root_question = candidate
                    break

    # If no root was recovered, current query
    # becomes the root.
    if not root_question:

        root_question = query

    # --------------------------------------------------------
    # EXPLICIT DOCUMENT SCOPE
    # --------------------------------------------------------

    document_ids = extract_document_ids(
        query
    )

    # --------------------------------------------------------
    # EXPLICIT CATEGORY
    # --------------------------------------------------------

    category = extract_category(
        query
    )

    # --------------------------------------------------------
    # BUILD SEARCH QUERY
    # --------------------------------------------------------

    search_query = build_search_query(

        query=query,

        follow_up=follow_up,

        root_question=root_question

    )

    return {

        "original_query": query,

        "search_query": search_query,

        "user_role": user_role,

        "follow_up": follow_up,

        "root_question": root_question,

        "document_ids": (
            document_ids
            if document_ids
            else None
        ),

        "category": category,

        "conversation_history": (
            previous_messages
        )

    }


# ============================================================
# PRINT DECISION
# ============================================================

def print_decision(
    decision
):

    print(
        "\n==================================="
    )

    print(
        "        DECISION CONTROL"
    )

    print(
        "==================================="
    )

    print(
        "\nOriginal Query:"
    )

    print(
        decision["original_query"]
    )

    print(
        "\nSearch Query:"
    )

    print(
        decision["search_query"]
    )

    print(
        "\nUser Role:"
    )

    print(
        decision["user_role"]
    )

    print(
        "\nFollow-up Query:"
    )

    print(
        decision["follow_up"]
    )

    print(
        "\nRoot Question:"
    )

    print(
        decision["root_question"]
    )

    if decision.get("document_ids"):

        print(
            "\nDocument Scope:"
        )

        print(
            decision["document_ids"]
        )

    if decision.get("category"):

        print(
            "\nCategory Scope:"
        )

        print(
            decision["category"]
        )