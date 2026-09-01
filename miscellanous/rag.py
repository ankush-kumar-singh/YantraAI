import re
import math

from pypdf import PdfReader
from ollama import embed, chat


# -----------------------------
# 1. Read PDF
# -----------------------------

pdf_path = "documents/my_file.pdf"

reader = PdfReader(pdf_path)

text = ""

for page in reader.pages:
    page_text = page.extract_text()

    if page_text:
        text += page_text + "\n"


# -----------------------------
# 2. Extract Sections
# -----------------------------

sections = re.findall(
    r'(Section \d+:.*?)(?=Section \d+:|$)',
    text,
    re.DOTALL
)

sections = [
    section.strip()
    for section in sections
    if section.strip()
]


# -----------------------------
# 3. Create Document Embeddings
# -----------------------------

documents = []

for i, section in enumerate(sections):

    response = embed(
        model="nomic-embed-text",
        input=section
    )

    documents.append({
        "section": i + 1,
        "text": section,
        "embedding": response["embeddings"][0]
    })


# -----------------------------
# 4. User Question
# -----------------------------

question = "what topics are covered under machine learning"


# -----------------------------
# 5. Embed Question
# -----------------------------

response = embed(
    model="nomic-embed-text",
    input=question
)

question_vector = response["embeddings"][0]


# -----------------------------
# 6. Cosine Similarity
# -----------------------------

def cosine_similarity(a, b):

    dot_product = sum(x * y for x, y in zip(a, b))

    magnitude_a = math.sqrt(
        sum(x * x for x in a)
    )

    magnitude_b = math.sqrt(
        sum(y * y for y in b)
    )

    return dot_product / (magnitude_a * magnitude_b)


# -----------------------------
# 7. Find Relevant Section
# -----------------------------

results = []

for document in documents:

    score = cosine_similarity(
        question_vector,
        document["embedding"]
    )

    results.append({
        "section": document["section"],
        "score": score,
        "text": document["text"]
    })


results.sort(
    key=lambda x: x["score"],
    reverse=True
)

# -----------------------------
# 8. Get Top-K Results
# -----------------------------

top_k = 3

top_results = results[:top_k]

print("\nTOP RELEVANT SECTIONS:")

for result in top_results:
    print(
        f"Section {result['section']} "
        f"→ Similarity: {result['score']:.4f}"
    )


# -----------------------------
# 9. Combine Retrieved Context
# -----------------------------

context = "\n\n".join(
    result["text"]
    for result in top_results
)


# -----------------------------
# 10. Send Context to Qwen
# -----------------------------

prompt = f"""
You are a helpful assistant.

Answer the user's question using ONLY the
provided document context.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

If the answer is not present in the context,
say:

"I could not find this information in the document."

Answer clearly and briefly.
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


print("\nANSWER:")
print(response["message"]["content"])