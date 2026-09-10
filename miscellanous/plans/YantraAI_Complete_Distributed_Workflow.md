🔥 YantraAI — Complete Distributed Workflow

Sabse pehle ek simple rule yaad rakho:

Riya sabko kaam degi. Har banda apne specialized kaam ka expert hoga. Riya sabke results ko combine karke user ko final answer degi.

👥 TEAM KA BASIC KAAM
1. Riya → 🧠 Brain / Master

Kaam: Decide karegi ki user ke request ke liye kya-kya karna hai aur kis worker ko karna hai.

2. Ankush → 📚 RAG / Knowledge

Kaam: Internal PDFs, manuals, documents se relevant information nikalna.

3. Sakshi → 👁️ Vision

Kaam: Images, scanned PDFs, screenshots, diagrams ko samajhna.

4. AmarDeep → 🛠️ Tools

Kaam: Actual kaam karna — Excel, Word, PDF, PPT, data processing, etc.

5. Sumit → 🧪 Coding / Sandbox

Kaam: AI-generated Python/code ko run karke verify karna.

6. Anish → 🏗️ Architecture / Integration

Kaam: Poore system ko connect karna, APIs, routing, LangGraph workflow, architecture.

🚨 AB EK BADA EXAMPLE LEKE POORA SYSTEM SAMJHO

User YantraAI mein bolta hai:

"Maine ek scanned machine maintenance report upload ki hai. Isko analyse karo, machine ki condition batao, hamare internal maintenance manuals mein check karo ki is condition mein kya action recommended hai, temperature readings ka average calculate karo, Python se calculation verify karo aur mujhe ek professional Word report bana ke do."

Ab dekho ek single user request mein kitne kaam hain.

User ke request mein:
Scanned document read karna
Image/document samajhna
Machine condition identify karna
Internal manual search karna
Relevant information retrieve karna
Temperature calculate karna
Python se calculation verify karna
Sab information combine karna
Recommendation banana
Word report banana
User ko final answer dena

Agar ek hi laptop sab karega → heavy ho jayega.

Isliye distributed system.

🧠 STEP 1 — RIYA REQUEST RECEIVE KAREGI

User ka request sabse pehle Riya ke paas jayega.

Riya sochegi:

"Is request mein kaun-kaunse capabilities chahiye?"

Woh identify karegi:

Vision + RAG + Calculation + Tool + Final Reasoning

Ab Riya task ko divide karegi.

User
 ↓
Riya
 ↓
Task breakdown
 ↓
 ├── Vision → Sakshi
 ├── Knowledge → Ankush
 ├── Calculation → Sumit
 └── Report → AmarDeep

Yahi Riya ka main kaam hai.

❤️ RIYA KO "BRAIN" KYUN BOL RAHE HAIN?

Riya ka kaam khud har cheez karna nahi hai.

Uska kaam hai:

"Kaun kya karega?"

Example:

User:

"Image mein machine ka temperature kya hai?"

Riya:

"Ye vision task hai → Sakshi."

User:

"Manual mein iska solution kya diya hai?"

Riya:

"Ye knowledge task hai → Ankush."

User:

"Is calculation ko Python se verify karo."

Riya:

"Ye execution task hai → Sumit."

User:

"Iska Word report bana do."

Riya:

"Ye tool task hai → AmarDeep."

👁️ STEP 2 — SAKSHI DOCUMENT DEKHEGI

Suppose uploaded PDF scanned hai.

Normal PDF parser ko text properly nahi mil raha.

Riya Sakshi ko bhejegi:

"Is document ko analyse karo."

Sakshi ka worker:

Scanned PDF
     ↓
PDF pages/images
     ↓
OCR
     ↓
Vision Model
     ↓
Structured Information

Suppose document mein hai:

Machine: Pump P-102

Temperature:

82°C
85°C
91°C
88°C
94°C

Condition:

Repeated overheating

Sakshi ye information structured form mein Riya ko bhejegi.

Example:

Machine: Pump P-102
Temperatures: 82, 85, 91, 88, 94
Condition: Repeated overheating
Sakshi kya nahi karegi?

Sakshi ye decide nahi karegi:

"Bearing kharab hai, machine shutdown karo."

Woh visual information extract karegi.

Final reasoning Riya karegi.

📚 STEP 3 — ANKUSH KA RAG KAAM KAREGA

Ab Riya ke paas Sakshi se information aa gayi:

Pump P-102 repeatedly overheating.

Ab Riya ko internal maintenance manual check karna hai.

Ye tumhara kaam hai.

Riya tumhare RAG worker ko query degi:

"Find maintenance instructions related to repeated overheating of Pump P-102."

Tumhara RAG:

Query
 ↓
Embedding
 ↓
ChromaDB
 ↓
Relevant chunks
 ↓
Reranking
 ↓
Best chunks
 ↓
Qwen3 8B
 ↓
Grounded response
📚 TUMHARA RAG ACTUALLY KYA KAREGA?

Suppose manual mein likha hai:

Repeated high temperature requires inspection.

Possible causes include bearing-related problems.

Equipment should be safely shut down before inspection.

Tumhara RAG ye relevant information retrieve karega.

Riya ko result:

Relevant manual:
- Repeated overheating requires inspection.
- Bearing problems may be a possible cause.
- Equipment should be safely shut down before inspection.

dega.

Important:

Tumhara RAG knowledge provider hai.

Riya ko:

"Manual ke according kya information hai?"

ka answer dega.

🧪 STEP 4 — SUMIT CALCULATION VERIFY KAREGA

Ab Sakshi ne temperature readings di:

82
85
91
88
94

User ne bola:

"Average calculate karo aur Python se verify karo."

Riya Sumit ko task degi.

Sumit ke paas coding model + sandbox hoga.

Model code generate karega:

temperatures = [82, 85, 91, 88, 94]

average = sum(temperatures) / len(temperatures)

print(average)

But important part:

AI ke answer par blindly trust nahi karna.

Code sandbox mein run hoga.

Code
 ↓
Sandbox
 ↓
Python execution
 ↓
Result
 ↓
Validation

Result:

Average = 88°C

Ab Riya ke paas verified calculation hai.

🛠️ STEP 5 — AMARDEEP ACTUAL REPORT BANAYEGA

Ab user ne bola:

"Professional Word report bana do."

Riya AmarDeep ko data degi.

AmarDeep ke paas actual Python tools honge.

For example:

Word

python-docx

Excel

openpyxl

PowerPoint

python-pptx

PDF

reportlab

Ab AmarDeep:

Riya se data
      ↓
python-docx
      ↓
Professional Word document
      ↓
.docx file

Report mein:

PUMP P-102 MAINTENANCE REPORT

1. Machine Information

2. Observed Condition

3. Temperature Readings

4. Average Temperature

5. Internal Manual Evidence

6. Analysis

7. Recommendation

8. Sources

AmarDeep actual .docx file return karega.

🧠 STEP 6 — RIYA SABKO COMBINE KAREGI

Ab Riya ke paas:

Sakshi se:
Machine = Pump P-102
Condition = Repeated overheating
Temperature readings = 82,85,91,88,94
Ankush se:
Manual:
Repeated overheating requires inspection.
Possible bearing-related issue.
Safe shutdown before inspection.
Sumit se:
Average = 88°C
Python execution = SUCCESS
AmarDeep se:
Word report = CREATED

Ab Riya final reasoning karegi.

🧠 RIYA FINAL ANSWER BANAYEGI

Final answer kuch aisa ho sakta hai:

Pump P-102 shows repeated overheating. The recorded temperature readings have an average of 88°C. The internal maintenance manual recommends inspection for repeated high-temperature conditions and identifies bearing-related issues as a possible cause. The equipment should be safely shut down before inspection. A detailed Word report has also been generated.

User ko bas ek final answer milega.

Usko ye pata hone ki zarurat nahi:

"Sakshi ke laptop pe kya hua?"

"Ankush ke laptop pe kya hua?"

"Sumit ne kya run kiya?"

Ye sab backend mein hoga.

🔥 POORA FLOW EK BAAR
                     USER
                       |
                       ↓
               ┌───────────────┐
               │     RIYA      │
               │ MASTER/BRAIN  │
               └───────┬───────┘
                       |
                 Task Breakdown
                       |
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
    SAKSHI          ANKUSH           SUMIT
    Vision           RAG             Sandbox
       ↓               ↓               ↓
     OCR           ChromaDB        Python
     VL 2B         Retrieval        Testing
       |               |               |
       └───────────────┼───────────────┘
                       ↓
                     RIYA
                Final Reasoning
                       |
                       ↓
                  AMARDEEP
                  Tool Layer
                       |
                  Word/PDF/etc.
                       |
                       ↓
                     RIYA
                       |
                       ↓
                     USER
👨‍💻 AB HAR BANDE KO EXACTLY KYA BANANA HAI?
🧠 RIYA
Main responsibility:

Master Server

Banayegi:

FastAPI
LangGraph
Router
Worker registry
Health checking
Task planning
Worker calls
Result aggregation
Final answer
APIs:
/health
/ask
/route
Simple language:

Riya poore system ki manager hai.

📚 ANKUSH — TUMHARA KAAM

Tumne already RAG bana rakha hai.

Tumhe:

Document ingestion
Chunking
Embedding
ChromaDB
Retriever
Reranker
LLM generation
Source tracking
/rag/query
/health

maintain karna hai.

Tumhara worker:
Riya
 ↓
"Manual mein answer dhundo"
 ↓
Ankush
 ↓
RAG
 ↓
Relevant evidence
 ↓
Riya
Tumhara focus:

RAG accuracy + speed + reliable retrieval.

👁️ SAKSHI
Main responsibility:

Vision Worker

Banayegi:

OCR
Image processing
PDF page processing
Vision model
Structured extraction

API:

/vision/analyze
/vision/document
/health
Simple language:

Sakshi ko jo aankhon se dekhna hai, woh Sakshi karegi.

🛠️ AMARDEEP

Ye banda important hai.

Isko sirf:

"Word file banani hai"

wala role mat do.

Iska module:

TOOL EXECUTION LAYER

Isme:

Python tools
Excel
Word
PPT
PDF
Data processing
File operations

ho sakte hain.

Example:

User:

"Excel report bana do."

Riya → AmarDeep

AmarDeep:

Data
 ↓
Python/openpyxl
 ↓
Excel
 ↓
File

User:

"Word report bana do."

Data
 ↓
python-docx
 ↓
Word
Simple language:

AmarDeep AI ke decision ko real action mein convert karega.

🧪 SUMIT
Main responsibility:

Code execution + Sandbox + Testing

Example:

User:

"Calculate this using Python."

Riya → Sumit

Sumit:

Coder model
 ↓
Code
 ↓
Sandbox
 ↓
Execute
 ↓
Validate
 ↓
Result
Simple language:

Sumit AI ke generated code ko actual machine par safely test karta hai.

🏗️ ANISH

Anish ka laptop abhi kharab hai.

Isliye usko runtime system ka mandatory dependency mat banao.

Filhaal uska kaam:

Architecture + Integration

He can handle:

System architecture
LangGraph design
API contracts
Routing logic
Worker communication
Failure handling
Documentation
Integration testing

Laptop repair hone ke baad uske hardware ke according runtime worker assign kar sakte ho.

Simple language:

Anish ensure karega ki sab workers properly ek doosre se connect ho rahe hain.

🔗 SAB WORKERS AAPAS MEIN KAISE BAAT KARENGE?

HTTP APIs.

Example:

Riya
192.168.x.x:8000

Ankush
192.168.x.x:8001

Sakshi
192.168.x.x:8002

AmarDeep
192.168.x.x:8003

Sumit
192.168.x.x:8004

Actual IPs tumhare network ke honge.

Riya:

POST /rag/query

Ankush:

Answer → Riya

Riya:

POST /vision/document

Sakshi:

Information → Riya

etc.

⚡ PARALLEL KAAM BHI HO SAKTA HAI

Ye distributed architecture ka bada benefit hai.

Suppose user:

"Image analyse karo aur manual mein bhi check karo."

Vision aur RAG independent hain.

Toh Riya:

             RIYA
              |
       +------+------+
       |             |
       ↓             ↓
    SAKSHI        ANKUSH
    Vision          RAG
       |             |
       +------+------+
              |
              ↓
             RIYA

Dono simultaneously kaam kar sakte hain.

Isse system faster ho sakta hai.

🚨 AGAR KOI LAPTOP BAND HO JAYE?

Suppose Sakshi ka laptop disconnect ho gaya.

Riya health check karegi:

Sakshi
  ↓
/health
  ↓
OFFLINE

Riya ko system freeze nahi karna chahiye.

Instead:

Worker unavailable
       ↓
Retry
       ↓
Fallback
       ↓
Alternative capability
       ↓
Continue

Ya user ko clearly bataye:

"Vision worker currently unavailable."

Whole YantraAI crash nahi hona chahiye.

⏱️ TIMEOUT BHI HONA CHAHIYE

Suppose Riya ne Sumit ko request bheji.

Sumit response nahi de raha.

System forever wait nahi karega.

Riya → Sumit
       ↓
     timeout
       ↓
retry/fallback

Ye stability ke liye bahut important hai.

📊 LOGGING

Har request ka record rakhna useful hai:

Request ID
Worker
Model
Start time
End time
Status
Error

Example:

REQ-1024

Sakshi
Vision
3.4 sec
SUCCESS

Ankush
RAG
8.5 sec
SUCCESS

Sumit
Python
1.2 sec
SUCCESS

AmarDeep
Word
0.9 sec
SUCCESS

Demo mein ye dikhaoge toh judges ko clearly samajh aayega ki distributed system actually work kar raha hai.

🎯 SABSE SIMPLE WAY MEIN YAAD KARO
RIYA = 🧠 BRAIN

"Kya karna hai?"

SAKSHI = 👁️ EYES

"Kya dikh raha hai?"

ANKUSH = 📚 KNOWLEDGE

"Manual/document mein kya likha hai?"

SUMIT = 🧪 VERIFICATION

"Is calculation/code ko actual mein run karke check karo."

AMARDEEP = 🛠️ HANDS

"Ab actual file/action bana do."

ANISH = 🏗️ ARCHITECT

"Sabko properly connect kaise karna hai?"

🏆 FINAL SYSTEM
                     YANTRAAI
                         |
                         ↓
                  🧠 RIYA
               MASTER/BRAIN
                         |
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       👁️ SAKSHI      📚 ANKUSH       🧪 SUMIT
        VISION           RAG          SANDBOX
          |              |              |
          └──────────────┼──────────────┘
                         ↓
                      🧠 RIYA
                  FINAL REASONING
                         |
                         ↓
                    🛠️ AMARDEEP
                    TOOL ENGINE
                         |
                         ↓
                  FILE / ACTION
                         |
                         ↓
                       USER

Is architecture mein tumhara RAG already bana hua hai, toh tumhe apna poora system rewrite nahi karna. Tumhara existing RAG ek independent worker/service banega, jise Riya API ke through call karegi.

Aur AmarDeep ka role definitely useful hai — usko Tool Execution Layer do, jisse project sirf chatbot nahi rahega; AI reason → retrieve → execute → verify → generate output kar sakega.
