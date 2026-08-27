# ============================================================
# YantraAI RAG - Conversation Memory
# ============================================================

# ============================================================
# CONVERSATION STORAGE
# ============================================================

conversation_history = []


# ============================================================
# ADD USER MESSAGE
# ============================================================

def add_user_message(
    message
):
    """
    Store a user message.
    """

    conversation_history.append({

        "role": "user",

        "content": message

    })


# ============================================================
# ADD ASSISTANT MESSAGE
# ============================================================

def add_assistant_message(
    message
):
    """
    Store an assistant response.
    """

    conversation_history.append({

        "role": "assistant",

        "content": message

    })


# ============================================================
# GET HISTORY
# ============================================================

def get_history():
    """
    Return the complete conversation history.
    """

    return conversation_history


# ============================================================
# GET RECENT HISTORY
# ============================================================

def get_recent_history(
    max_messages=6
):
    """
    Return only the most recent messages.
    """

    return conversation_history[
        -max_messages:
    ]


# ============================================================
# CLEAR MEMORY
# ============================================================

def clear_memory():
    """
    Clear the current conversation.
    """

    conversation_history.clear()


# ============================================================
# FORMAT HISTORY FOR LLM
# ============================================================

def format_history(
    max_messages=6
):
    """
    Convert conversation history into
    text that can be provided to the LLM.
    """

    recent_messages = get_recent_history(
        max_messages
    )


    if not recent_messages:

        return ""


    formatted_history = []


    for message in recent_messages:

        role = message["role"]

        content = message["content"]


        if role == "user":

            formatted_history.append(
                f"User: {content}"
            )

        else:

            formatted_history.append(
                f"YantraAI: {content}"
            )


    return "\n".join(
        formatted_history
    )


# ============================================================
# DISPLAY MEMORY
# ============================================================

def print_memory():

    print(
        "\n==================================="
    )

    print(
        "        CONVERSATION MEMORY"
    )

    print(
        "==================================="
    )


    if not conversation_history:

        print(
            "\nMemory is empty."
        )

        return


    for index, message in enumerate(
        conversation_history,
        start=1
    ):

        print(
            f"\n{index}. "
            f"{message['role'].upper()}"
        )

        print(
            message["content"]
        )


# ============================================================
# TEST MEMORY
# ============================================================

if __name__ == "__main__":

    print(
        "\nYantraAI Memory Test"
    )


    add_user_message(
        "What is supervised learning?"
    )


    add_assistant_message(
        "Supervised learning uses labeled data."
    )


    add_user_message(
        "Give me some examples."
    )


    print_memory()


    print(
        "\n==================================="
    )

    print(
        "FORMATTED HISTORY"
    )

    print(
        "==================================="
    )


    print(
        format_history()
    )