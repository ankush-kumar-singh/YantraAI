import os
import re
import hashlib
import fitz
import chromadb
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings


# ==========================================
# SETTINGS
# ==========================================

DOCUMENTS_FOLDER = "./documents"
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "yantra_documents"

EMBEDDING_MODEL = "nomic-embed-text"

MAX_WORDS_PER_CHUNK = 180


# ==========================================
# OLLAMA EMBEDDING FUNCTION
# ==========================================

class OllamaEmbeddingFunction(EmbeddingFunction):

    def __init__(self, model_name):
        self.model_name = model_name

    def __call__(
        self,
        input: Documents
    ) -> Embeddings:

        from ollama import embed

        response = embed(
            model=self.model_name,
            input=input
        )

        return response["embeddings"]


embedding_function = OllamaEmbeddingFunction(
    EMBEDDING_MODEL
)


# ==========================================
# CHROMADB
# ==========================================

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_function
)


# ==========================================
# EXTRACT SECTIONS
# ==========================================

def extract_sections(text):

    pattern = r"(Section\s+\d+\s*:.*?)(?=Section\s+\d+\s*:|$)"

    sections = re.findall(
        pattern,
        text,
        re.DOTALL | re.IGNORECASE
    )

    return [
        section.strip()
        for section in sections
        if section.strip()
    ]


# ==========================================
# CREATE CHUNKS
# ==========================================

def create_chunks(
    text,
    max_words=MAX_WORDS_PER_CHUNK
):

    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        max_words
    ):

        chunk = " ".join(
            words[i:i + max_words]
        )

        if chunk.strip():
            chunks.append(chunk.strip())

    return chunks


# ==========================================
# DETECT SECTION NUMBER FROM TEXT
# ==========================================

def get_section_number(section_text):

    match = re.search(
        r"Section\s+(\d+)",
        section_text,
        re.IGNORECASE
    )

    if match:
        return int(match.group(1))

    return 0


# ==========================================
# PROCESS PDF
# ==========================================

def process_pdf(pdf_path):

    filename = os.path.basename(pdf_path)

    print("\n===================================")
    print(f"Processing: {filename}")
    print("===================================")

    doc = fitz.open(pdf_path)

    total_chunks = 0

    # --------------------------------------
    # PROCESS EVERY PAGE
    # --------------------------------------

    for page_number, page in enumerate(
        doc,
        start=1
    ):

        text = page.get_text("text").strip()

        if not text:
            continue

        sections = extract_sections(text)

        # ==================================
        # SECTIONS FOUND
        # ==================================

        if sections:

            for section_text in sections:

                section_number = get_section_number(
                    section_text
                )

                chunks = create_chunks(
                    section_text
                )

                for chunk_index, chunk in enumerate(
                    chunks,
                    start=1
                ):

                    chunk_id = hashlib.md5(

                        (
                            f"{filename}|"
                            f"{page_number}|"
                            f"{section_number}|"
                            f"{chunk_index}|"
                            f"{chunk}"
                        ).encode("utf-8")

                    ).hexdigest()

                    collection.upsert(

                        ids=[chunk_id],

                        documents=[chunk],

                        metadatas=[

                            {
                                "filename": filename,
                                "page": page_number,
                                "section": section_number,
                                "chunk": chunk_index
                            }

                        ]

                    )

                    total_chunks += 1

        # ==================================
        # NO SECTION FOUND
        # ==================================

        else:

            chunks = create_chunks(text)

            for chunk_index, chunk in enumerate(
                chunks,
                start=1
            ):

                chunk_id = hashlib.md5(

                    (
                        f"{filename}|"
                        f"{page_number}|"
                        f"0|"
                        f"{chunk_index}|"
                        f"{chunk}"
                    ).encode("utf-8")

                ).hexdigest()

                collection.upsert(

                    ids=[chunk_id],

                    documents=[chunk],

                    metadatas=[

                        {
                            "filename": filename,
                            "page": page_number,
                            "section": 0,
                            "chunk": chunk_index
                        }

                    ]

                )

                total_chunks += 1

        print(
            f"Page {page_number}: processed"
        )

    doc.close()

    print(
        f"Total chunks from {filename}: "
        f"{total_chunks}"
    )


# ==========================================
# MAIN
# ==========================================

print("\n===================================")
print("      YantraAI Document Ingestion")
print("===================================\n")


# ==========================================
# CREATE DOCUMENTS FOLDER
# ==========================================

if not os.path.exists(
    DOCUMENTS_FOLDER
):

    os.makedirs(
        DOCUMENTS_FOLDER
    )


# ==========================================
# FIND PDFs
# ==========================================

pdf_files = [

    file

    for file in os.listdir(
        DOCUMENTS_FOLDER
    )

    if file.lower().endswith(".pdf")

]


if not pdf_files:

    print("No PDF files found.")

    print(
        f"Put PDFs inside: "
        f"{DOCUMENTS_FOLDER}"
    )

    exit()


print(
    f"Found {len(pdf_files)} PDF(s).\n"
)


# ==========================================
# PROCESS ALL PDFs
# ==========================================

for pdf_file in pdf_files:

    pdf_path = os.path.join(
        DOCUMENTS_FOLDER,
        pdf_file
    )

    process_pdf(
        pdf_path
    )


# ==========================================
# FINAL OUTPUT
# ==========================================

print("\n===================================")
print("      Ingestion completed!")
print("===================================")

print(
    "Embedding model:",
    EMBEDDING_MODEL
)

print(
    "Expected dimensions: 768"
)

print(
    "Total documents:",
    len(pdf_files)
)

print(
    "Total chunks in database:",
    collection.count()
)