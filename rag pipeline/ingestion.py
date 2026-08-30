# ============================================================
# YantraAI RAG - Document Ingestion
# Multi-Format Document Ingestion
# ============================================================

import os
import re
import csv
import json
import hashlib

import pymupdf
import chromadb

from docx import Document
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
# DOCUMENT AUDIENCE / CATEGORIES
# ============================================================

TECHNICAL = "technical"
ONSITE = "onsite"
COMMON = "common"

VALID_AUDIENCES = {
    TECHNICAL,
    ONSITE,
    COMMON
}


# ============================================================
# USER ROLES
# ============================================================

ADMIN_ROLE = "admin"
TECHNICAL_ROLE = "technical"
ONSITE_ROLE = "onsite"


# ============================================================
# DOCUMENT ID
# ============================================================

def create_document_id(filepath):
    """
    Create a stable unique document ID.

    Same file -> same document_id
    Different file -> different document_id
    """

    absolute_path = os.path.abspath(filepath)

    file_hash = hashlib.sha256(
        absolute_path.encode("utf-8")
    ).hexdigest()[:8].upper()

    return f"DOC_{file_hash}"


# ============================================================
# EXTRACT SECTIONS
# ============================================================

def extract_sections(text):

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
    document_id,
    page,
    section,
    chunk_number,
    text
):

    raw_text = (
        f"{document_id}|"
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
    document_id,
    filename,
    file_type,
    page,
    section,
    chunk_number,
    text,
    audience,
    uploader="system"
):

    if audience not in VALID_AUDIENCES:
        raise ValueError(
            f"Invalid document audience: {audience}"
        )

    chunk_id = create_chunk_id(
        document_id,
        page,
        section,
        chunk_number,
        text
    )

    collection.upsert(
        ids=[chunk_id],

        documents=[text],

        metadatas=[{

            # Document identity
            "document_id": document_id,
            "filename": filename,
            "file_type": file_type,

            # Access metadata
            "category": audience,
            "audience": audience,
            "uploader": uploader,

            # Location metadata
            "page": page,
            "section": section,
            "chunk": chunk_number

        }]
    )


# ============================================================
# PROCESS TEXT
# ============================================================

def process_text(
    text,
    document_id,
    filename,
    file_type,
    page,
    audience,
    uploader="system"
):

    text = text.strip()

    if not text:
        return 0

    sections = extract_sections(text)

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
                    document_id,
                    filename,
                    file_type,
                    page,
                    section_number,
                    chunk_number,
                    chunk_text,
                    audience,
                    uploader
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
                document_id,
                filename,
                file_type,
                page,
                0,
                chunk_number,
                chunk_text,
                audience,
                uploader
            )

            total_chunks += 1

    return total_chunks


# ============================================================
# PDF
# ============================================================

def ingest_pdf(
    filepath,
    audience,
    uploader="system"
):

    filename = os.path.basename(filepath)

    document_id = create_document_id(
        filepath
    )

    print("\n===================================")
    print(f"Processing : {filename}")
    print(f"Document ID: {document_id}")
    print(f"Category   : {audience}")
    print("===================================")

    document = pymupdf.open(filepath)

    total_chunks = 0

    for page_number, page in enumerate(
        document,
        start=1
    ):

        text = page.get_text("text")

        page_chunks = process_text(
            text,
            document_id,
            filename,
            "pdf",
            page_number,
            audience,
            uploader
        )

        total_chunks += page_chunks

        print(
            f"Page {page_number}: "
            f"{page_chunks} chunks"
        )

    document.close()

    print(
        f"Total chunks: {total_chunks}"
    )

    return total_chunks


# ============================================================
# DOCX
# ============================================================

def ingest_docx(
    filepath,
    audience,
    uploader="system"
):

    filename = os.path.basename(filepath)

    document_id = create_document_id(
        filepath
    )

    print("\n===================================")
    print(f"Processing : {filename}")
    print(f"Document ID: {document_id}")
    print(f"Category   : {audience}")
    print("===================================")

    document = Document(filepath)

    paragraphs = []

    for paragraph in document.paragraphs:

        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    full_text = "\n".join(paragraphs)

    total_chunks = process_text(
        full_text,
        document_id,
        filename,
        "docx",
        1,
        audience,
        uploader
    )

    print(
        f"Total chunks: {total_chunks}"
    )

    return total_chunks


# ============================================================
# TXT
# ============================================================

def ingest_txt(
    filepath,
    audience,
    uploader="system"
):

    filename = os.path.basename(filepath)

    document_id = create_document_id(
        filepath
    )

    print("\n===================================")
    print(f"Processing : {filename}")
    print(f"Document ID: {document_id}")
    print(f"Category   : {audience}")
    print("===================================")

    with open(
        filepath,
        "r",
        encoding="utf-8"
    ) as file:

        text = file.read()

    total_chunks = process_text(
        text,
        document_id,
        filename,
        "txt",
        1,
        audience,
        uploader
    )

    print(
        f"Total chunks: {total_chunks}"
    )

    return total_chunks


# ============================================================
# JSON
# ============================================================

def ingest_json(
    filepath,
    audience,
    uploader="system"
):

    filename = os.path.basename(filepath)

    document_id = create_document_id(
        filepath
    )

    print("\n===================================")
    print(f"Processing : {filename}")
    print(f"Document ID: {document_id}")
    print(f"Category   : {audience}")
    print("===================================")

    with open(
        filepath,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    text = json.dumps(
        data,
        indent=2,
        ensure_ascii=False
    )

    total_chunks = process_text(
        text,
        document_id,
        filename,
        "json",
        1,
        audience,
        uploader
    )

    print(
        f"Total chunks: {total_chunks}"
    )

    return total_chunks


# ============================================================
# CSV
# ============================================================

def ingest_csv(
    filepath,
    audience,
    uploader="system"
):

    filename = os.path.basename(filepath)

    document_id = create_document_id(
        filepath
    )

    print("\n===================================")
    print(f"Processing : {filename}")
    print(f"Document ID: {document_id}")
    print(f"Category   : {audience}")
    print("===================================")

    rows = []

    with open(
        filepath,
        "r",
        encoding="utf-8",
        newline=""
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:

            row_text = " | ".join(
                f"{key}: {value}"
                for key, value in row.items()
            )

            rows.append(row_text)

    text = "\n".join(rows)

    total_chunks = process_text(
        text,
        document_id,
        filename,
        "csv",
        1,
        audience,
        uploader
    )

    print(
        f"Total chunks: {total_chunks}"
    )

    return total_chunks


# ============================================================
# DETERMINE DOCUMENT CATEGORY
# ============================================================

def get_document_audience(filename):

    name = filename.lower()

    if (
        "technical" in name
        or "tech" in name
    ):
        return TECHNICAL

    if (
        "onsite" in name
        or "on_site" in name
    ):
        return ONSITE

    if "common" in name:
        return COMMON

    print("\n===================================")
    print(f"Document: {filename}")
    print("Select document category:")
    print("1. Technical")
    print("2. Onsite")
    print("3. Common")
    print("===================================")

    choice = input(
        "Enter choice (1/2/3): "
    ).strip()

    if choice == "1":
        return TECHNICAL

    if choice == "2":
        return ONSITE

    if choice == "3":
        return COMMON

    raise ValueError(
        "Invalid choice. "
        "Please select 1, 2 or 3."
    )


# ============================================================
# PROCESS FILE
# ============================================================

def ingest_file(
    filepath,
    audience,
    uploader="system"
):

    extension = os.path.splitext(
        filepath
    )[1].lower()

    if extension == ".pdf":
        return ingest_pdf(
            filepath,
            audience,
            uploader
        )

    if extension == ".docx":
        return ingest_docx(
            filepath,
            audience,
            uploader
        )

    if extension == ".txt":
        return ingest_txt(
            filepath,
            audience,
            uploader
        )

    if extension == ".json":
        return ingest_json(
            filepath,
            audience,
            uploader
        )

    if extension == ".csv":
        return ingest_csv(
            filepath,
            audience,
            uploader
        )

    print(
        f"Skipping unsupported file: "
        f"{os.path.basename(filepath)}"
    )

    return 0


# ============================================================
# FIND SUPPORTED DOCUMENTS
# ============================================================

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".json",
    ".csv"
}


def get_document_files():

    if not os.path.exists(
        DOCUMENTS_FOLDER
    ):

        os.makedirs(
            DOCUMENTS_FOLDER
        )

    files = []

    for filename in os.listdir(
        DOCUMENTS_FOLDER
    ):

        extension = os.path.splitext(
            filename
        )[1].lower()

        if extension in SUPPORTED_EXTENSIONS:

            files.append(filename)

    return files


# ============================================================
# INGEST ALL DOCUMENTS
# ============================================================

def ingest_documents():

    document_files = get_document_files()

    if not document_files:

        print(
            "No supported documents found."
        )

        print(
            f"Put PDF/DOCX/TXT/JSON/CSV files "
            f"inside: {DOCUMENTS_FOLDER}"
        )

        return

    print(
        f"\nFound {len(document_files)} "
        f"document(s).\n"
    )

    total_chunks = 0

    for document_file in document_files:

        filepath = os.path.join(
            DOCUMENTS_FOLDER,
            document_file
        )

        audience = get_document_audience(
            document_file
        )

        chunks = ingest_file(
            filepath,
            audience
        )

        total_chunks += chunks

    print("\n===================================")
    print("      Ingestion completed!")
    print("===================================")

    print(
        "Embedding model:",
        EMBEDDING_MODEL
    )

    print(
        "Total documents:",
        len(document_files)
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