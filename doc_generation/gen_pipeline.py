# ============================================================
# YantraAI - Universal Document Generation Pipeline
# ============================================================
#
# Flow:
#
# User Prompt
#      ↓
# Qwen3 8B via Ollama
#      ↓
# Dynamic JSON
#      ↓
# Save JSON
#      ↓
# Detect requested format
#      ↓
# DOCX / XLSX / PDF
#
# Run ONLY this file.
# ============================================================

import json
import re
import requests
from pathlib import Path


# ============================================================
# CONFIG
# ============================================================

MODEL = "qwen3:1.7b"

OLLAMA_URL = "http://localhost:11434/api/chat"

BASE_DIR = Path(__file__).resolve().parent

JSON_DIR = BASE_DIR / "json_output"
DOCX_DIR = BASE_DIR / "docx_output"
EXCEL_DIR = BASE_DIR / "excel_output"
PDF_DIR = BASE_DIR / "pdf_output"


# Create folders automatically
JSON_DIR.mkdir(parents=True, exist_ok=True)
DOCX_DIR.mkdir(parents=True, exist_ok=True)
EXCEL_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# GENERATORS
# ============================================================

from adaptive_docx_generator import generate_docx_from_json
from adaptive_excel_generator import generate_excel_from_json
from adaptive_pdf_generator import generate_pdf_from_json


# ============================================================
# QWEN SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are YantraAI's document generation engine.

Convert the user's request into a complete structured JSON.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT return Markdown.
3. Do NOT use ```json.
4. Do NOT write explanations outside JSON.
5. Do not invent information.
6. Use null when information is unavailable.
7. Generate the complete document structure.
8. The structure must be dynamic and adaptive.

REQUIRED JSON STRUCTURE:

{
    "document_name": "document_name",
    "document_type": "document_type",
    "metadata": {},
    "content": {}
}

CONTENT CAN CONTAIN:

"sections": [
    {
        "section_title": "Section Name",
        "content": {}
    }
]

"tables": [
    {
        "table_title": "Table Name",
        "columns": [],
        "rows": []
    }
]

"lists": []

Additional fields may be added whenever required.

IMPORTANT:

Do not generate file paths.
Do not generate Python code.
Do not generate DOCX/XLSX/PDF files yourself.

Only generate the structured JSON representation.
"""


# ============================================================
# FILENAME CLEANER
# ============================================================

def safe_filename(name):

    name = str(
        name or "document"
    )

    # Remove invalid Windows filename characters
    name = re.sub(
        r'[<>:"/\\|?*]',
        "_",
        name
    )

    # Replace spaces with underscore
    name = re.sub(
        r"\s+",
        "_",
        name
    )

    # Remove unnecessary dots/spaces
    name = name.strip(
        " ._"
    )

    if not name:
        name = "document"

    return name


# ============================================================
# FORMAT DETECTION
# ============================================================

def detect_format(prompt):

    """
    Detect requested output format directly
    from the user's prompt.

    Returns:
        docx
        xlsx
        pdf
    """

    prompt = prompt.lower().strip()

    # --------------------------------------------------------
    # EXCEL
    # --------------------------------------------------------

    excel_patterns = [
        r"\bexcel\b",
        r"\bxlsx\b",
        r"\bspreadsheet\b",
        r"\bexcel sheet\b",
        r"\bexcel file\b",
        r"\bmicrosoft excel\b"
    ]

    for pattern in excel_patterns:

        if re.search(
            pattern,
            prompt
        ):

            return "xlsx"

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    pdf_patterns = [
        r"\bpdf\b",
        r"\bpdf file\b",
        r"\bportable document\b"
    ]

    for pattern in pdf_patterns:

        if re.search(
            pattern,
            prompt
        ):

            return "pdf"

    # --------------------------------------------------------
    # WORD / DOCX
    # --------------------------------------------------------

    word_patterns = [
        r"\bword\b",
        r"\bdocx\b",
        r"\bword document\b",
        r"\bmicrosoft word\b"
    ]

    for pattern in word_patterns:

        if re.search(
            pattern,
            prompt
        ):

            return "docx"

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return "docx"


# ============================================================
# GENERATE UNIQUE PATH
# ============================================================

def unique_path(
    directory,
    filename,
    extension
):

    directory = Path(
        directory
    )

    filename = safe_filename(
        filename
    )

    path = (
        directory
        / f"{filename}{extension}"
    )

    counter = 1

    while path.exists():

        path = (
            directory
            / f"{filename}_{counter}{extension}"
        )

        counter += 1

    return path


# ============================================================
# SAVE JSON
# ============================================================

def save_json(data):

    document_name = safe_filename(
        data.get(
            "document_name",
            "document"
        )
    )

    json_path = unique_path(
        JSON_DIR,
        document_name,
        ".json"
    )

    with open(
        json_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )

    return json_path


# ============================================================
# GENERATE FINAL FILE
# ============================================================

def generate_file(
    json_path,
    data,
    output_format
):

    document_name = safe_filename(
        data.get(
            "document_name",
            "document"
        )
    )

    # --------------------------------------------------------
    # DOCX
    # --------------------------------------------------------

    if output_format == "docx":

        output_path = unique_path(
            DOCX_DIR,
            document_name,
            ".docx"
        )

        return generate_docx_from_json(
            json_path,
            output_path
        )

    # --------------------------------------------------------
    # EXCEL
    # --------------------------------------------------------

    elif output_format == "xlsx":

        output_path = unique_path(
            EXCEL_DIR,
            document_name,
            ".xlsx"
        )

        return generate_excel_from_json(
            json_path,
            output_path
        )

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    elif output_format == "pdf":

        output_path = unique_path(
            PDF_DIR,
            document_name,
            ".pdf"
        )

        return generate_pdf_from_json(
            json_path,
            output_path
        )

    else:

        raise ValueError(
            f"Unsupported format: "
            f"{output_format}"
        )


# ============================================================
# OLLAMA CHECK
# ============================================================

def check_ollama():

    try:

        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=5
        )

        response.raise_for_status()

        return True

    except Exception:

        return False


# ============================================================
# DOCUMENT PIPELINE
# ============================================================

class DocumentPipeline:

    def __init__(self):

        # Continuous conversation
        self.messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]

    # ========================================================
    # CALL QWEN
    # ========================================================

    def ask_qwen(
        self,
        prompt
    ):

        self.messages.append(
            {
                "role": "user",
                "content": prompt
            }
        )

        payload = {

            "model": MODEL,

            "messages": self.messages,

            "stream": False,

            "format": "json",

            "options": {
                "temperature": 0.2
            }
        }

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=600
        )

        response.raise_for_status()

        result = response.json()

        if "message" not in result:

            raise RuntimeError(
                "Invalid response from Ollama."
            )

        content = result[
            "message"
        ].get(
            "content",
            ""
        )

        if not content:

            raise RuntimeError(
                "Qwen returned an empty response."
            )

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:

            data = json.loads(
                content
            )

        except json.JSONDecodeError:

            # Try extracting JSON object
            match = re.search(
                r"\{.*\}",
                content,
                re.DOTALL
            )

            if not match:

                raise RuntimeError(
                    "Qwen returned invalid JSON."
                )

            data = json.loads(
                match.group(0)
            )

        # ----------------------------------------------------
        # Validate basic structure
        # ----------------------------------------------------

        if not isinstance(
            data,
            dict
        ):

            raise RuntimeError(
                "Generated JSON is not an object."
            )

        if "document_name" not in data:

            data[
                "document_name"
            ] = "document"

        if "document_type" not in data:

            data[
                "document_type"
            ] = "general"

        if "metadata" not in data:

            data[
                "metadata"
            ] = {}

        if "content" not in data:

            data[
                "content"
            ] = {}

        # ----------------------------------------------------
        # Save assistant response to memory
        # ----------------------------------------------------

        self.messages.append(
            {
                "role": "assistant",
                "content": json.dumps(
                    data,
                    ensure_ascii=False
                )
            }
        )

        return data

    # ========================================================
    # GENERATE
    # ========================================================

    def generate(
        self,
        prompt
    ):

        print()
        print(
            "=" * 60
        )

        print(
            "Generating document..."
        )

        print(
            "=" * 60
        )

        # ----------------------------------------------------
        # 1. Ask Qwen
        # ----------------------------------------------------

        print(
            "\n[1/4] Qwen3 8B processing..."
        )

        data = self.ask_qwen(
            prompt
        )

        # ----------------------------------------------------
        # 2. Detect format
        # ----------------------------------------------------

        output_format = detect_format(
            prompt
        )

        print(
            f"[2/4] Output format: "
            f"{output_format.upper()}"
        )

        # ----------------------------------------------------
        # 3. Save JSON
        # ----------------------------------------------------

        print(
            "[3/4] Saving JSON..."
        )

        json_path = save_json(
            data
        )

        print(
            f"      {json_path}"
        )

        # ----------------------------------------------------
        # 4. Generate requested file
        # ----------------------------------------------------

        print(
            f"[4/4] Generating "
            f"{output_format.upper()}..."
        )

        output_path = generate_file(
            json_path,
            data,
            output_format
        )

        print()
        print(
            "=" * 60
        )

        print(
            "SUCCESS"
        )

        print(
            "=" * 60
        )

        print(
            f"JSON :  {json_path}"
        )

        print(
            f"FILE :  {output_path}"
        )

        print(
            "=" * 60
        )

        return {
            "json": json_path,
            "output": output_path,
            "format": output_format,
            "data": data
        }

    # ========================================================
    # RESET
    # ========================================================

    def reset(self):

        self.messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]

        print(
            "\nConversation reset."
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print(
        "=" * 60
    )

    print(
        "                 YantraAI"
    )

    print(
        "       Universal Document Generator"
    )

    print(
        "=" * 60
    )

    print(
        f"\nModel : {MODEL}"
    )

    print(
        "Engine: Ollama"
    )

    # --------------------------------------------------------
    # Check Ollama
    # --------------------------------------------------------

    if not check_ollama():

        print()
        print(
            "[ERROR] Ollama is not running."
        )

        print(
            "Start Ollama first."
        )

        return

    print(
        "Status: Connected"
    )

    print()
    print(
        "Formats supported:"
    )

    print(
        "  - Word / DOCX"
    )

    print(
        "  - Excel / XLSX"
    )

    print(
        "  - PDF"
    )

    print()
    print(
        "Commands:"
    )

    print(
        "  reset  -> reset conversation"
    )

    print(
        "  exit   -> close pipeline"
    )

    print()
    print(
        "-" * 60
    )

    pipeline = DocumentPipeline()

    # ========================================================
    # CONTINUOUS CHAT
    # ========================================================

    while True:

        try:

            prompt = input(
                "\nYou: "
            ).strip()

        except (
            KeyboardInterrupt,
            EOFError
        ):

            print(
                "\n\nExiting YantraAI..."
            )

            break

        if not prompt:

            continue

        # ----------------------------------------------------
        # EXIT
        # ----------------------------------------------------

        if prompt.lower() in {
            "exit",
            "quit"
        }:

            print(
                "\nYantraAI stopped."
            )

            break

        # ----------------------------------------------------
        # RESET
        # ----------------------------------------------------

        if prompt.lower() == "reset":

            pipeline.reset()

            continue

        # ----------------------------------------------------
        # GENERATE
        # ----------------------------------------------------

        try:

            pipeline.generate(
                prompt
            )

        except requests.exceptions.ConnectionError:

            print(
                "\n[ERROR] Cannot connect to Ollama."
            )

        except requests.exceptions.Timeout:

            print(
                "\n[ERROR] Qwen request timed out."
            )

        except requests.exceptions.HTTPError as error:

            print(
                f"\n[ERROR] Ollama error: {error}"
            )

        except json.JSONDecodeError:

            print(
                "\n[ERROR] Invalid JSON generated."
            )

        except Exception as error:

            print(
                f"\n[ERROR] {error}"
            )


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    main()