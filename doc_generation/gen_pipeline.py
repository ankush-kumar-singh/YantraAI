# ============================================================
# YantraAI - Dynamic Document Generation Pipeline
# Model: Qwen3 8B via Ollama
# Output: Structured JSON
# ============================================================

import json
import requests
from typing import Dict, Any, Optional


# ============================================================
# CONFIGURATION
# ============================================================

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen3:8b"

REQUEST_TIMEOUT = 300


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are YantraAI's Document Generation Engine.

Your job is to convert user requirements into structured JSON
that can later be converted into PDF, DOCX, Excel or other
document formats.

IMPORTANT RULES:

1. ALWAYS return valid JSON.
2. NEVER return Markdown.
3. NEVER wrap JSON inside ```json blocks.
4. Do not add explanations outside JSON.
5. Preserve all information provided by the user.
6. If information is missing, use null instead of inventing data.
7. Keep the JSON dynamic and logically structured.
8. Use meaningful field names.
9. Maintain the same document structure during follow-up modifications.
10. When the user asks to modify something, modify only the
    requested part unless explicitly asked otherwise.

Recommended structure:

{
    "document_type": "...",
    "metadata": {},
    "content": {},
    "tables": [],
    "sections": [],
    "formatting": {}
}

The JSON must contain enough information for another program
to generate PDF, DOCX or Excel output.
"""


# ============================================================
# DOCUMENT GENERATION PIPELINE
# ============================================================

class DocumentGenerationPipeline:

    def __init__(
        self,
        model: str = MODEL_NAME,
        ollama_url: str = OLLAMA_URL
    ):
        self.model = model
        self.ollama_url = ollama_url

        # Continuous conversation memory
        self.messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]

    # --------------------------------------------------------
    # CHECK OLLAMA
    # --------------------------------------------------------

    def check_connection(self) -> bool:

        try:
            response = requests.get(
                "http://localhost:11434/api/tags",
                timeout=10
            )

            return response.status_code == 200

        except requests.RequestException:
            return False

    # --------------------------------------------------------
    # CLEAN MODEL OUTPUT
    # --------------------------------------------------------

    def clean_json(self, text: str) -> str:

        text = text.strip()

        # Remove accidental markdown fences
        if text.startswith("```"):
            lines = text.splitlines()

            if lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            text = "\n".join(lines)

        return text.strip()

    # --------------------------------------------------------
    # VALIDATE JSON
    # --------------------------------------------------------

    def validate_json(self, text: str) -> Dict[str, Any]:

        text = self.clean_json(text)

        try:
            return json.loads(text)

        except json.JSONDecodeError as error:
            raise ValueError(
                f"Model returned invalid JSON: {error}"
            )

    # --------------------------------------------------------
    # SEND REQUEST TO QWEN
    # --------------------------------------------------------

    def _send_to_model(self) -> str:

        payload = {
            "model": self.model,
            "messages": self.messages,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2
            }
        }

        response = requests.post(
            self.ollama_url,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )

        response.raise_for_status()

        result = response.json()

        return result["message"]["content"]

    # --------------------------------------------------------
    # GENERATE DOCUMENT JSON
    # --------------------------------------------------------

    def generate(
        self,
        user_request: str
    ) -> Dict[str, Any]:

        if not self.check_connection():
            raise ConnectionError(
                "Ollama is not running. Start Ollama first."
            )

        self.messages.append(
            {
                "role": "user",
                "content": user_request
            }
        )

        try:

            raw_output = self._send_to_model()

            document_json = self.validate_json(raw_output)

            self.messages.append(
                {
                    "role": "assistant",
                    "content": json.dumps(
                        document_json,
                        ensure_ascii=False
                    )
                }
            )

            return document_json

        except Exception:

            # Remove failed user message from memory
            if self.messages and self.messages[-1]["role"] == "user":
                self.messages.pop()

            raise

    # --------------------------------------------------------
    # MODIFY EXISTING DOCUMENT
    # --------------------------------------------------------

    def modify(
        self,
        instruction: str
    ) -> Dict[str, Any]:

        modification_prompt = f"""
Modify the previously generated document according to this
instruction:

{instruction}

Return the COMPLETE updated document as valid JSON.
Do not return only the changed field.
"""

        return self.generate(modification_prompt)

    # --------------------------------------------------------
    # RESET CONVERSATION
    # --------------------------------------------------------

    def reset(self):

        self.messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]

    # --------------------------------------------------------
    # SAVE JSON
    # --------------------------------------------------------

    def save_json(
        self,
        data: Dict[str, Any],
        filename: str
    ):

        with open(
            filename,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                data,
                file,
                indent=4,
                ensure_ascii=False
            )


# ============================================================
# EXAMPLE USAGE
# ============================================================

if __name__ == "__main__":

    pipeline = DocumentGenerationPipeline()

    print("\nYantraAI Document Generation Pipeline")
    print("-------------------------------------")

    if not pipeline.check_connection():

        print(
            "\nERROR: Ollama is not running."
            "\nStart Ollama and make sure qwen3:8b is available."
        )

        exit(1)

    print("Connected to Ollama.")
    print("Model:", MODEL_NAME)

    print("\nEnter document requirements.")
    print("Type 'exit' to stop.")
    print()

    while True:

        user_input = input("You: ").strip()

        if user_input.lower() == "exit":
            break

        if not user_input:
            continue

        try:

            result = pipeline.generate(user_input)

            print("\nGenerated JSON:\n")

            print(
                json.dumps(
                    result,
                    indent=4,
                    ensure_ascii=False
                )
            )

            print()

        except Exception as error:

            print("\nERROR:", error)
            print()