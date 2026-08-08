# AI Knowledge Base Search (RAG) 🚀

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-FF4F00?style=for-the-badge&logo=databricks&logoColor=white)](https://www.trychroma.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A full-stack, college-level AI Knowledge Base search system using **Retrieval-Augmented Generation (RAG)**. Users can upload PDF, TXT, DOCX, and MD documents, which are automatically chunked, embedded using `all-MiniLM-L6-v2`, and indexed into a **ChromaDB** vector database. Users can ask natural language questions and receive accurate answers grounded exclusively in document context with verified source citations.

---

## 📌 Problem Statement

Traditional keyword-based document search fails to understand semantic context or synthesize direct answers from multiple pages. Large Language Models (LLMs) solved question-answering but suffer from **hallucinations** and lack access to private or recent custom documents. 

**Retrieval-Augmented Generation (RAG)** solves both problems by retrieving relevant text snippets from custom vector stores before asking the LLM to generate an answer based *only* on that retrieved context.

---

## 🎯 Project Objectives

1. **End-to-End RAG Pipeline**: Build a transparent, working RAG architecture from document ingestion to citation-backed response generation.
2. **Multi-Format Extraction**: Extract and split text from PDF, TXT, DOCX, and Markdown files into overlapping chunks.
3. **Local Vector Storage**: Store 384-dimensional dense vector embeddings using `sentence-transformers/all-MiniLM-L6-v2` and ChromaDB.
4. **Zero-Hallucination Guardrails**: Strictly enforce that answers are derived only from retrieved context, returning a clear fallback message if information is missing.
5. **Modern AI SaaS UI**: Provide an intuitive React dashboard, file management hub, and ChatGPT-style chat interface.

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework**: React.js 18 + Vite
* **Styling**: Tailwind CSS v4 + Vanilla CSS utilities
* **Icons & Components**: Lucide React
* **Networking**: Axios
* **Routing**: React Router v6

### **Backend**
* **Framework**: Python 3.11 + FastAPI
* **Server**: Uvicorn
* **Database**: SQLite (SQLAlchemy ORM) for document metadata & chat history

### **AI & Vector DB**
* **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
* **Vector Database**: ChromaDB (Persistent storage)
* **Document Extractors**: `pypdf`, `python-docx`, `utf-8` text reader
* **LLM Engine**: Multi-provider support (`openai`, `google-gemini`, `groq`, `ollama`) + Zero-config local extractive fallback engine.

---

## 🧠 RAG Architecture & Pipeline (College Presentation Guide)

During a project viva or presentation, explain the pipeline using these **8 key stages**:

```text
Upload Document (PDF/TXT/DOCX)
      ↓
Extract Raw Text & Page Numbers
      ↓
Split Text into Chunks (800–1000 Chars, 150–200 Overlap)
      ↓
Generate Embeddings (all-MiniLM-L6-v2 -> 384-dim Vectors)
      ↓
Store Chunks + Metadata in ChromaDB
      ↓
User Asks Question -> Convert Question to Vector
      ↓
Cosine Similarity Search -> Retrieve Top 4-5 Relevant Chunks
      ↓
Send Formatted Context + Prompt to LLM -> Generate Answer + Sources
```

### **1. Document Ingestion & Chunking**
Documents are uploaded and parsed into structured text pages. Raw text is split into chunks of **800–1000 characters** with an overlap of **150–200 characters** to ensure semantic continuity across boundaries.

### **2. Vector Embedding Generation**
Each chunk passes through `all-MiniLM-L6-v2` (SentenceTransformer), which converts textual meaning into a **384-element numerical vector**. Similar sentences produce vectors close to each other in high-dimensional vector space.

### **3. Similarity Retrieval**
When a user asks a question, the query is converted into a vector using the exact same embedding model. ChromaDB calculates cosine/L2 distance to retrieve the **Top 4–5 most relevant text chunks**.

### **4. Grounded Prompting & Generation**
The retrieved chunks and user question are injected into a strict system prompt:
> *"Answer using ONLY the provided document context snippets. If the context does not contain the answer, state: 'I couldn't find enough information in the uploaded knowledge base to answer this question.'"*

---

## 📁 Directory Structure

```text
ai-knowledge-base/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── documents.py      # Upload, list, status, delete endpoints
│   │   │   ├── chat.py           # RAG chat & message history
│   │   │   └── health.py         # Health check endpoint
│   │   ├── services/
│   │   │   ├── document_processor.py # PDF/DOCX parsing & text splitter
│   │   │   ├── vector_store.py       # ChromaDB + SentenceTransformers
│   │   │   └── rag_engine.py         # Multi-provider LLM & fallback engine
│   │   ├── config.py             # Settings & env loading
│   │   ├── database.py           # SQLite connection
│   │   ├── models.py             # SQLAlchemy models
│   │   └── schemas.py            # Pydantic schemas
│   ├── uploads/                  # Uploaded file store
│   ├── vector_store/             # ChromaDB persistent directory
│   ├── main.py                   # FastAPI application entry
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation header & health indicator
│   │   │   ├── Sidebar.jsx       # App layout sidebar
│   │   │   ├── StatsCard.jsx     # Dashboard metric widgets
│   │   │   ├── DocumentCard.jsx  # File item & delete handler
│   │   │   ├── FileUploader.jsx  # Drag-and-drop file uploader
│   │   │   ├── ChatMessage.jsx   # Message bubble & citation cards
│   │   │   └── SourceBadge.jsx   # Expandable snippet viewer
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page & interactive RAG diagram
│   │   │   ├── Dashboard.jsx     # Analytics & quick actions
│   │   │   ├── KnowledgeBase.jsx # Document management hub
│   │   │   └── AISearch.jsx      # ChatGPT-style search interface
│   │   ├── services/
│   │   │   └── api.js            # Axios backend API client
│   │   ├── App.jsx               # Router & App layout
│   │   ├── main.jsx              # React DOM mounting
│   │   └── index.css             # Tailwind CSS & custom styles
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚡ Installation & Setup Instructions

### **1. Prerequisites**
* Python 3.10+
* Node.js v18+ & npm

---

### **2. Backend Setup**

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Activate on Windows:
   venv\Scripts\activate
   # Activate on Mac/Linux:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```env
   LLM_API_KEY=your_optional_api_key
   LLM_PROVIDER=mock
   LLM_MODEL=gemini-1.5-flash
   DATABASE_URL=sqlite:///./knowledge_base.db
   UPLOAD_DIR=./uploads
   VECTOR_STORE_DIR=./vector_store
   HOST=0.0.0.0
   PORT=8000
   ```
   *(Note: Setting `LLM_PROVIDER=mock` enables zero-config local RAG testing without an external API key!)*

5. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will be available at: `http://localhost:8000` (API Interactive Docs at `http://localhost:8000/docs`).

---

### **3. Frontend Setup**

1. Navigate to the `frontend/` directory in a new terminal window:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The React web interface will open at: `http://localhost:5173`.

---

## 📡 Backend API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check API server health status |
| `POST` | `/api/documents/upload` | Upload PDF/TXT/DOCX document for chunking & indexing |
| `GET` | `/api/documents` | List all documents and statuses |
| `GET` | `/api/documents/stats/summary` | Get Dashboard analytics and KB health status |
| `GET` | `/api/documents/{id}` | Get specific document details |
| `DELETE` | `/api/documents/{id}` | Delete document file, DB record, and ChromaDB embeddings |
| `POST` | `/api/chat` | Execute RAG similarity search and generate answer with sources |
| `GET` | `/api/chat/history` | Fetch chat message history |
| `DELETE` | `/api/chat/history` | Clear chat message history |

---

## 🧪 End-to-End Verification Test Flow

Follow this 12-step test sequence to verify full functionality:

1. **Start Backend**: Launch `uvicorn main:app --reload --port 8000`.
2. **Start Frontend**: Launch `npm run dev` in `frontend/`.
3. **Open App**: Navigate to `http://localhost:5173` and verify the green `API: Connected` badge in the header.
4. **Navigate to Knowledge Base**: Click **Knowledge Base** on the sidebar.
5. **Upload Document**: Drag & drop a PDF or TXT file into the upload dropzone.
6. **Verify Processing**: Observe document status change from `Uploading` ➔ `Processing` ➔ `Ready`.
7. **Verify Vector Store**: Confirm that chunk count (e.g. `12 Chunks`) is displayed.
8. **Navigate to AI Search**: Open **AI Search** page.
9. **Ask Relevant Question**: Type a question answered inside your document (e.g. *"What is the main topic of this document?"*).
10. **Verify Answer & Sources**: Confirm answer generation and click on the retrieved **Source Badge** to view matching text snippet, page number, and similarity score.
11. **Ask Unrelated Question**: Type an out-of-domain question (e.g. *"What is the formula for quantum gravity?"*). Confirm system returns:
    > *"I couldn't find enough information in the uploaded knowledge base to answer this question."*
12. **Delete Document**: Return to Knowledge Base and click the **Delete Trash Icon**. Verify the file and its vector store embeddings are completely removed.

---

## 🚀 Future Enhancements

* **Hybrid Search**: Combine dense vector retrieval with BM25 sparse keyword search.
* **OCR Support**: Integrate Tesseract OCR for scanned image PDFs.
* **Multi-Modal Embeddings**: Support images, diagrams, and tables inside documents.
* **Role-Based Access**: User accounts and private knowledge base spaces.
