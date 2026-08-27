from pypdf import PdfReader
import re

pdf_path = "documents/my_file.pdf"

reader = PdfReader(pdf_path)

text = ""

for page in reader.pages:
    text += page.extract_text() + "\n"

# Chunking
# chunk_size = 500
# chunks = []

# for i in range(0, len(text), chunk_size):
#     chunk = text[i:i + chunk_size]
#     chunks.append(chunk)

# print("Total chunks:", len(chunks))

# for i, chunk in enumerate(chunks):
#     print(f"\n--- Chunk {i + 1} ---")
#     print(chunk)

# Split at Section headings
sections = re.findall(
    r'(Section \d+:.*?)(?=Section \d+:|$)',
    text,
    re.DOTALL
)


sections = [section.strip() for section in sections if section.strip()]

print("Total sections:", len(sections))

for i, section in enumerate(sections):
    print(f"\n{'='*50}")
    print(f"SECTION {i + 1}")
    print(f"{'='*50}")
    print(section)
