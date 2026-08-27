# ============================================================
# YantraAI RAG - Document Ingestion
# ============================================================

import os
import re
import hashlib

import pymupdf
import chromadb

from chromadb.api.types import (
    EmbeddingFunction,
    Documents,
    Embeddings
)

from ollama import embed

from config import (
    DOCUMENTS_FOLDER,
    CHROMA_PATH,
    COLLECTION_NAME,
    EMBEDDING_MODEL,
    MAX_WORDS_PER_CHUNK
)


# ============================================================
# OLLAMA EMBEDDING FUNCTION
# ============================================================

class OllamaEmbeddingFunction(EmbeddingFunction):

    def __init__(self, model_name):

        self.model_name = model_name

    def __call__(
        self,
        input: Documents
    ) -> Embeddings:

        response = embed(
            model=self.model_name,
            input=input
        )

        return response["embeddings"]


# ============================================================
# CHROMADB
# ============================================================

embedding_function = OllamaEmbeddingFunction(
    EMBEDDING_MODEL
)

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_function
)


# ============================================================
# EXTRACT SECTIONS
# ============================================================

def extract_sections(text):
    """
    Extract sections such as:

    Section 1: Probability and Statistics
    Section 2: Linear Algebra
    """

    pattern = (
        r"(Section\s+\d+\s*:.*?"
        r"(?=Section\s+\d+\s*:|$))"
    )

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


# ============================================================
# CREATE CHUNKS
# ============================================================

def create_chunks(
    text,
    max_words=MAX_WORDS_PER_CHUNK
):
    """
    Split text into smaller chunks.
    """

    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        max_words
    ):

        chunk = " ".join(
            words[i:i + max_words]
        ).strip()

        if chunk:

            chunks.append(chunk)

    return chunks


# ============================================================
# CREATE CHUNK ID
# ============================================================

def create_chunk_id(
    filename,
    page,
    section,
    chunk_number,
    text
):
    """
    Create a unique and stable ID
    for every document chunk.
    """

    raw_text = (
        f"{filename}|"
        f"{page}|"
        f"{section}|"
        f"{chunk_number}|"
        f"{text}"
    )

    return hashlib.md5(
        raw_text.encode("utf-8")
    ).hexdigest()


# ============================================================
# STORE CHUNK
# ============================================================

def store_chunk(
    filename,
    page,
    section,
    chunk_number,
    text
):
    """
    Store one chunk in ChromaDB.
    """

    chunk_id = create_chunk_id(
        filename,
        page,
        section,
        chunk_number,
        text
    )

    collection.upsert(
        ids=[chunk_id],

        documents=[text],

        metadatas=[{
            "filename": filename,
            "page": page,
            "section": section,
            "chunk": chunk_number
        }]
    )


# ============================================================
# PROCESS ONE PAGE
# ============================================================

def process_page(
    page,
    filename,
    page_number
):
    """
    Extract text from one page
    and store its chunks.
    """

    text = page.get_text(
        "text"
    ).strip()

    if not text:

        return 0


    sections = extract_sections(
        text
    )

    total_chunks = 0


    # --------------------------------------------------------
    # SECTIONS FOUND
    # --------------------------------------------------------

    if sections:

        for section_number, section_text in enumerate(
            sections,
            start=1
        ):

            chunks = create_chunks(
                section_text
            )

            for chunk_number, chunk_text in enumerate(
                chunks,
                start=1
            ):

                store_chunk(

                    filename,

                    page_number,

                    section_number,

                    chunk_number,

                    chunk_text

                )

                total_chunks += 1


    # --------------------------------------------------------
    # NO SECTION FOUND
    # --------------------------------------------------------

    else:

        chunks = create_chunks(
            text
        )

        for chunk_number, chunk_text in enumerate(
            chunks,
            start=1
        ):

            store_chunk(

                filename,

                page_number,

                0,

                chunk_number,

                chunk_text

            )

            total_chunks += 1


    return total_chunks


# ============================================================
# PROCESS ONE PDF
# ============================================================

def ingest_pdf(pdf_path):
    """
    Process a complete PDF.
    """

    filename = os.path.basename(
        pdf_path
    )

    print("\n===================================")
    print(f"Processing: {filename}")
    print("===================================")

    document = pymupdf.open(
        pdf_path
    )

    total_chunks = 0


    for page_number, page in enumerate(
        document,
        start=1
    ):

        page_chunks = process_page(

            page,

            filename,

            page_number

        )

        total_chunks += page_chunks

        print(
            f"Page {page_number}: "
            f"{page_chunks} chunks"
        )


    document.close()


    print(
        f"Total chunks from "
        f"{filename}: {total_chunks}"
    )

    return total_chunks


# ============================================================
# FIND PDF FILES
# ============================================================

def get_pdf_files():

    if not os.path.exists(
        DOCUMENTS_FOLDER
    ):

        os.makedirs(
            DOCUMENTS_FOLDER
        )

    return [

        file

        for file in os.listdir(
            DOCUMENTS_FOLDER
        )

        if file.lower().endswith(
            ".pdf"
        )

    ]


# ============================================================
# INGEST ALL DOCUMENTS
# ============================================================

def ingest_documents():
    """
    Process every PDF inside
    the documents folder.
    """

    pdf_files = get_pdf_files()


    if not pdf_files:

        print(
            "No PDF files found."
        )

        print(
            f"Put PDFs inside: "
            f"{DOCUMENTS_FOLDER}"
        )

        return


    print(
        f"\nFound {len(pdf_files)} PDF(s).\n"
    )


    total_chunks = 0


    for pdf_file in pdf_files:

        pdf_path = os.path.join(

            DOCUMENTS_FOLDER,

            pdf_file

        )

        total_chunks += ingest_pdf(
            pdf_path
        )


    print("\n===================================")
    print("      Ingestion completed!")
    print("===================================")

    print(
        "Embedding model:",
        EMBEDDING_MODEL
    )

    print(
        "Total documents:",
        len(pdf_files)
    )

    print(
        "Chunks processed:",
        total_chunks
    )

    print(
        "Database count:",
        collection.count()
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    ingest_documents()