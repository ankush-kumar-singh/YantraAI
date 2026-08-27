import re
from pypdf import PdfReader

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
# 3. Create Chunks
# -----------------------------

chunks = []

chunk_size = 500
overlap = 100

for section in sections:

    words = section.split()

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk_words = words[start:end]

        chunk = " ".join(chunk_words)

        chunks.append(chunk)

        start = end - overlap


# -----------------------------
# 4. Display Results
# -----------------------------

print("Total sections:", len(sections))
print("Total chunks:", len(chunks))

for i, chunk in enumerate(chunks):

    print("\n" + "=" * 60)
    print(f"CHUNK {i + 1}")
    print("=" * 60)

    print(chunk)