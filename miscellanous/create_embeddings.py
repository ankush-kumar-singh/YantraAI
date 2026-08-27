import re
from pypdf import PdfReader
from ollama import embed

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
# 3. Create Embeddings
# -----------------------------

embeddings = []

for i, section in enumerate(sections):

    response = embed(
        model="nomic-embed-text",
        input=section
    )

    vector = response["embeddings"][0]

    embeddings.append({
        "section": i + 1,
        "text": section,
        "embedding": vector
    })


# -----------------------------
# 4. Check Results
# -----------------------------

print("Total sections:", len(embeddings))

for item in embeddings:

    print("\n" + "=" * 50)
    print("Section:", item["section"])
    print("Embedding dimensions:", len(item["embedding"]))
    print("First 5 values:", item["embedding"][:5])