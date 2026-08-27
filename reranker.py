from ollama import chat


def rerank(question, documents, metadatas):

    candidates = []

    for i, document in enumerate(documents):

        candidates.append(
            f"""
DOCUMENT {i + 1}

Section: {metadatas[i]['section']}

Content:
{document}
"""
        )

    candidates_text = "\n".join(candidates)

    prompt = f"""
You are a relevance evaluator.

USER QUESTION:
{question}

DOCUMENTS:
{candidates_text}

Task:

Determine which documents actually contain
information useful for answering the question.

Return ONLY the document numbers that are relevant.

Example:

1,3

If only document 2 is relevant:

2

If none are relevant:

NONE
"""

    response = chat(
        model="qwen3:1.7b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = response["message"]["content"].strip()

    if result.upper() == "NONE":
        return []

    relevant = []

    for number in result.split(","):

        try:

            index = int(number.strip()) - 1

            if 0 <= index < len(documents):

                relevant.append(index)

        except ValueError:

            pass

    return relevant