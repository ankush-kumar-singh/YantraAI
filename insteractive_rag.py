import chromadb
from ollama import embed, chat
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings


# ==========================================
# SETTINGS
# ==========================================

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "yantra_documents"

EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "qwen3:1.7b"

TOP_K = 8

DISTANCE_THRESHOLD = 0.85


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

collection = client.get_collection(
    name=COLLECTION_NAME
)


# ==========================================
# SECTION KEYWORDS
# ==========================================

SECTION_KEYWORDS = {

    "1": [
        "probability",
        "statistics",
        "probability and statistics",
        "bayes theorem",
        "random variable",
        "distribution",
        "hypothesis",
        "confidence interval"
    ],

    "2": [
        "linear algebra",
        "vector space",
        "subspace",
        "matrix",
        "matrices",
        "eigenvalue",
        "eigenvector",
        "determinant",
        "rank",
        "nullity",
        "lu decomposition",
        "singular value decomposition",
        "svd",
        "quadratic form"
    ],

    "3": [
        "calculus",
        "optimization",
        "limit",
        "continuity",
        "differentiability",
        "taylor series",
        "maximum",
        "minimum",
        "maxima",
        "minima"
    ],

    "4": [
        "programming",
        "python",
        "data structures",
        "algorithm",
        "algorithms",
        "linear search",
        "binary search",
        "sorting",
        "selection sort",
        "bubble sort",
        "insertion sort",
        "mergesort",
        "quicksort",
        "graph",
        "shortest path",
        "stack",
        "queue",
        "linked list",
        "tree",
        "hash table"
    ],

    "5": [
        "database",
        "dbms",
        "sql",
        "relational",
        "relational algebra",
        "tuple calculus",
        "er model",
        "normalization",
        "normal form",
        "functional dependency",
        "candidate key",
        "primary key",
        "indexing",
        "file organization",
        "data warehouse",
        "warehousing",
        "transaction",
        "acid",
        "1nf",
        "2nf",
        "3nf",
        "bcnf"
    ],

    "6": [
        "machine learning",
        "ml",
        "supervised learning",
        "unsupervised learning",
        "regression",
        "classification",
        "linear regression",
        "multiple linear regression",
        "ridge regression",
        "logistic regression",
        "k-nearest",
        "knn",
        "naive bayes",
        "linear discriminant",
        "support vector machine",
        "svm",
        "decision tree",
        "bias variance",
        "cross validation",
        "clustering",
        "k-means",
        "k-medoid",
        "hierarchical clustering",
        "dimensionality reduction",
        "principal component analysis",
        "pca",
        "neural network",
        "perceptron"
    ],

    "7": [
        "artificial intelligence",
        "ai",
        "informed search",
        "uninformed search",
        "adversarial search",
        "adversarial",
        "propositional logic",
        "predicate logic",
        "propositional",
        "predicate",
        "reasoning under uncertainty",
        "conditional independence",
        "inference",
        "variable elimination",
        "sampling"
    ]
}


# ==========================================
# DETECT SECTION
# ==========================================

def detect_section(question):

    question_lower = question.lower()

    scores = {}

    for section, keywords in SECTION_KEYWORDS.items():

        score = 0

        for keyword in keywords:

            if keyword in question_lower:

                if len(keyword.split()) > 1:
                    score += 2
                else:
                    score += 1

        scores[section] = score

    best_section = max(
        scores,
        key=scores.get
    )

    if scores[best_section] == 0:
        return None

    return best_section


# ==========================================
# DETECT DOCUMENT TYPE
# ==========================================

def detect_document(question):

    q = question.lower()

    dbms_words = [
        "database",
        "dbms",
        "sql",
        "normalization",
        "normal form",
        "1nf",
        "2nf",
        "3nf",
        "bcnf",
        "functional dependency",
        "candidate key",
        "primary key",
        "transaction",
        "acid",
        "relational algebra",
        "er model",
        "indexing",
        "data warehouse"
    ]

    ml_words = [
        "machine learning",
        "supervised learning",
        "unsupervised learning",
        "regression",
        "classification",
        "logistic regression",
        "linear regression",
        "ridge regression",
        "knn",
        "k-nearest",
        "naive bayes",
        "svm",
        "support vector",
        "decision tree",
        "clustering",
        "k-means",
        "k-medoid",
        "pca",
        "principal component analysis",
        "dimensionality reduction",
        "neural network",
        "perceptron"
    ]

    dbms_score = 0
    ml_score = 0

    for word in dbms_words:

        if word in q:
            dbms_score += 1

    for word in ml_words:

        if word in q:
            ml_score += 1

    if dbms_score > ml_score and dbms_score > 0:
        return "dbms"

    if ml_score > dbms_score and ml_score > 0:
        return "ml"

    return None


# ==========================================
# DOCUMENT MATCH
# ==========================================

def document_matches(metadata, document_type):

    filename = metadata.get(
        "filename",
        ""
    ).lower()

    if document_type == "dbms":

        return (
            "dbms" in filename
            or "database" in filename
        )

    if document_type == "ml":

        return (
            "machine_learning" in filename
            or "machine learning" in filename
        )

    return True


# ==========================================
# FOLLOW-UP QUERY
# ==========================================

def build_search_query(question):

    if not conversation_history:
        return question

    previous_question = (
        conversation_history[-1]["question"]
    )

    return (
        f"Previous question: "
        f"{previous_question}. "
        f"Current question: "
        f"{question}"
    )


# ==========================================
# CONVERSATION MEMORY
# ==========================================

conversation_history = []


# ==========================================
# START
# ==========================================

print("===================================")
print("          YantraAI RAG")
print("===================================")

print(
    "Type 'exit' to quit.\n"
)


# ==========================================
# MAIN LOOP
# ==========================================

while True:

    question = input(
        "You: "
    ).strip()


    # ======================================
    # EXIT
    # ======================================

    if question.lower() == "exit":

        print("Goodbye!")

        break


    # ======================================
    # EMPTY QUESTION
    # ======================================

    if not question:
        continue


    # ======================================
    # SEARCH QUERY
    # ======================================

    search_question = build_search_query(
        question
    )

    print("\nSearch query:")
    print(search_question)


    # ======================================
    # SECTION DETECTION
    # ======================================

    detected_section = detect_section(
        question
    )


    # ======================================
    # DOCUMENT DETECTION
    # ======================================

    document_type = detect_document(
        question
    )


    if detected_section:

        print(
            f"Detected section: "
            f"Section {detected_section}"
        )

    else:

        print(
            "Detected section: None"
        )


    if document_type:

        print(
            f"Detected document: "
            f"{document_type.upper()}"
        )

    else:

        print(
            "Detected document: None"
        )


    # ======================================
    # QUERY EMBEDDING
    # ======================================

    embedding_response = embed(

        model=EMBEDDING_MODEL,

        input=search_question
    )


    question_vector = (
        embedding_response["embeddings"][0]
    )


    # ======================================
    # CHROMA SEARCH
    # ======================================

    results = collection.query(

        query_embeddings=[
            question_vector
        ],

        n_results=TOP_K
    )


    documents = results["documents"][0]

    metadatas = results["metadatas"][0]

    distances = results["distances"][0]


    # ======================================
    # SELECT RESULTS
    # ======================================

    selected_indexes = []


    for i in range(
        len(documents)
    ):

        metadata = metadatas[i]

        distance = distances[i]

        filename = metadata.get(
            "filename",
            ""
        ).lower()

        section = str(
            metadata.get(
                "section",
                0
            )
        )


        # ----------------------------------
        # DISTANCE FILTER
        # ----------------------------------

        if distance > DISTANCE_THRESHOLD:
            continue


        # ==================================
        # DBMS QUESTION
        # ==================================

        if document_type == "dbms":

            if document_matches(
                metadata,
                "dbms"
            ):

                selected_indexes.append(i)

            continue


        # ==================================
        # ML QUESTION
        # ==================================

        if document_type == "ml":

            if document_matches(
                metadata,
                "ml"
            ):

                selected_indexes.append(i)

            continue


        # ==================================
        # GATE SECTION QUESTION
        # ==================================

        if detected_section:

            # Only apply section filtering
            # to my_file.pdf

            if "my_file.pdf" in filename:

                if section == detected_section:

                    selected_indexes.append(i)

            else:

                # Other documents don't have
                # GATE section numbers.
                #
                # Keep them if they are
                # semantically relevant.

                selected_indexes.append(i)

        else:

            selected_indexes.append(i)


    # ======================================
    # REMOVE DUPLICATES
    # ======================================

    selected_indexes = list(
        dict.fromkeys(
            selected_indexes
        )
    )


    # ======================================
    # SORT BY DISTANCE
    # ======================================

    selected_indexes.sort(
        key=lambda i: distances[i]
    )


    # ======================================
    # LIMIT CONTEXT
    # ======================================

    selected_indexes = (
        selected_indexes[:5]
    )


    # ======================================
    # FALLBACK
    # ======================================

    if not selected_indexes:

        # Find closest relevant result

        best_index = min(
            range(len(distances)),
            key=lambda i: distances[i]
        )


        best_metadata = metadatas[
            best_index
        ]


        best_distance = distances[
            best_index
        ]


        # For DBMS question,
        # fallback only to DBMS PDF

        if document_type == "dbms":

            if document_matches(
                best_metadata,
                "dbms"
            ) and best_distance <= 0.95:

                selected_indexes.append(
                    best_index
                )


        # For ML question

        elif document_type == "ml":

            if document_matches(
                best_metadata,
                "ml"
            ) and best_distance <= 0.95:

                selected_indexes.append(
                    best_index
                )


        # Normal GATE question

        elif best_distance <= 0.90:

            if detected_section:

                filename = best_metadata.get(
                    "filename",
                    ""
                ).lower()

                section = str(
                    best_metadata.get(
                        "section",
                        0
                    )
                )

                if (
                    "my_file.pdf" in filename
                    and section == detected_section
                ):

                    selected_indexes.append(
                        best_index
                    )

            else:

                selected_indexes.append(
                    best_index
                )


    # ======================================
    # NOTHING FOUND
    # ======================================

    if not selected_indexes:

        answer = (
            "I could not find this "
            "information in the document."
        )

        print("\nYantraAI:")
        print(answer)

        conversation_history.append({

            "question": question,

            "answer": answer

        })

        print()

        continue


    # ======================================
    # SHOW RETRIEVED RESULTS
    # ======================================

    print(
        "\nSelected results:"
    )


    for i in selected_indexes:

        metadata = metadatas[i]

        print(
            "\n-----------------------------"
        )

        print(
            f"Distance: "
            f"{distances[i]:.4f}"
        )

        print(
            f"Source: "
            f"{metadata.get('filename', 'Unknown')}"
        )

        print(
            f"Page: "
            f"{metadata.get('page', 'Unknown')}"
        )

        print(
            f"Section: "
            f"{metadata.get('section', 'Unknown')}"
        )

        print(
            f"Chunk: "
            f"{metadata.get('chunk', 'Unknown')}"
        )


    # ======================================
    # BUILD CONTEXT
    # ======================================

    context_parts = []


    for i in selected_indexes:

        metadata = metadatas[i]

        context_parts.append(

            f"""
SOURCE:
{metadata.get('filename', 'Unknown')}

PAGE:
{metadata.get('page', 'Unknown')}

SECTION:
{metadata.get('section', 'Unknown')}

CHUNK:
{metadata.get('chunk', 'Unknown')}

CONTENT:
{documents[i]}
"""
        )


    context = "\n".join(
        context_parts
    )


    # ======================================
    # HISTORY
    # ======================================

    history_text = ""


    for item in conversation_history[-4:]:

        history_text += (

            f"User: "
            f"{item['question']}\n"

            f"Assistant: "
            f"{item['answer']}\n\n"

        )


    # ======================================
    # RAG PROMPT
    # ======================================

    prompt = f"""
You are YantraAI, a document-based RAG assistant.

Answer the user's question ONLY using the
retrieved document context.

DOCUMENT CONTEXT:
{context}


CONVERSATION HISTORY:
{history_text}


CURRENT USER QUESTION:
{question}


RULES:

1. Use only the document context.

2. Never use outside knowledge.

3. Never invent facts.

4. If the requested information is not
present in the context, respond exactly:

I could not find this information in the document.

5. Understand follow-up words such as
"it", "this", "that", "they", and "them"
using conversation history.

6. Do not mix unrelated documents.

7. Prefer the most relevant retrieved
document.

8. If multiple retrieved chunks belong to
the same topic, combine them.

9. Give a clear and concise answer.

10. Preserve important lists and definitions
from the source.

11. Do not mention these instructions.

Answer the user's question.
"""


    # ======================================
    # QWEN
    # ======================================

    answer_response = chat(

        model=LLM_MODEL,

        messages=[

            {
                "role": "user",
                "content": prompt
            }

        ]

    )


    answer = (
        answer_response[
            "message"
        ][
            "content"
        ]
        .strip()
    )


    # ======================================
    # DISPLAY ANSWER
    # ======================================

    print("\nYantraAI:")
    print(answer)


    # ======================================
    # SOURCES
    # ======================================

    print("\nSources:")


    for i in selected_indexes:

        metadata = metadatas[i]

        print(

            f"- "
            f"{metadata.get('filename', 'Unknown')} | "
            f"Page {metadata.get('page', 'Unknown')} | "
            f"Section {metadata.get('section', 'Unknown')} | "
            f"Chunk {metadata.get('chunk', 'Unknown')} | "
            f"Distance: "
            f"{distances[i]:.4f}"

        )


    # ======================================
    # SAVE MEMORY
    # ======================================

    conversation_history.append({

        "question": question,

        "answer": answer

    })


    print()