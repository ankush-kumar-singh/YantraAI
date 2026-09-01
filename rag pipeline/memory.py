# ============================================================
# YantraAI RAG - Memory
# Conversation Memory
# ============================================================

conversation_memory = []


# ============================================================
# ADD USER MESSAGE
# ============================================================

def add_user_message(message):

    if not message:
        return

    conversation_memory.append({

        "role": "user",

        "content": message.strip()

    })


# ============================================================
# ADD ASSISTANT MESSAGE
# ============================================================

def add_assistant_message(message):

    if not message:
        return

    conversation_memory.append({

        "role": "assistant",

        "content": message.strip()

    })


# ============================================================
# GET CONVERSATION HISTORY
# ============================================================

def get_conversation_history():

    if not conversation_memory:

        return ""

    history_parts = []

    for message in conversation_memory:

        role = message.get(
            "role",
            ""
        )

        content = message.get(
            "content",
            ""
        )

        if role == "user":

            history_parts.append(
                f"User: {content}"
            )

        elif role == "assistant":

            history_parts.append(
                f"Assistant: {content}"
            )

    return "\n".join(
        history_parts
    )


# ============================================================
# CLEAR MEMORY
# ============================================================

def clear_memory():

    conversation_memory.clear()


# ============================================================
# GET MEMORY
# ============================================================

def get_memory():

    return conversation_memory.copy()