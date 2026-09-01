import re
from pypdf import PdfReader
from ollama import embed
import math


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

question = "Does the GATE syllabus contain Bayes theorem?"


# -----------------------------
# 5. Create Question Embedding
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

    magnitude_a = math.sqrt(sum(x * x for x in a))
    magnitude_b = math.sqrt(sum(y * y for y in b))

    return dot_product / (magnitude_a * magnitude_b)


# -----------------------------
# 7. Compare Question
#    with every section
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


# -----------------------------
# 8. Sort by similarity
# -----------------------------

results.sort(
    key=lambda x: x["score"],
    reverse=True
)


# -----------------------------
# 9. Display Results
# -----------------------------

print("\nQUESTION:")
print(question)

print("\nSIMILARITY RESULTS:")

for result in results:

    print(
        f"Section {result['section']} "
        f"→ Score: {result['score']:.4f}"
    )

print("\nMOST RELEVANT SECTION:")
print(results[0]["text"])