import os
import pypdf
import docx
from sqlalchemy.orm import Session
from app.models import DocumentModel
from app.services.vector_store import vector_store

def split_text_into_chunks(text_pages: list, chunk_size: int = 900, chunk_overlap: int = 180) -> list:
    """
    text_pages: list of dicts [{"page": int, "text": str}]
    Returns list of dicts: [{"page": int, "content": str}]
    """
    chunks = []
    
    for page_info in text_pages:
        page_num = page_info["page"]
        text = page_info["text"]
        if not text or not text.strip():
            continue
            
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk_content = text[start:end].strip()
            
            if chunk_content:
                chunks.append({
                    "page": page_num,
                    "content": chunk_content
                })
                
            start += (chunk_size - chunk_overlap)
            if start >= text_len:
                break
                
    return chunks

def extract_text_from_pdf(file_path: str) -> list:
    text_pages = []
    reader = pypdf.PdfReader(file_path)
    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        text_pages.append({
            "page": idx + 1,
            "text": page_text
        })
    return text_pages

def extract_text_from_docx(file_path: str) -> list:
    doc = docx.Document(file_path)
    full_text = [para.text for para in doc.paragraphs if para.text.strip()]
    combined = "\n\n".join(full_text)
    return [{"page": 1, "text": combined}]

def extract_text_from_txt(file_path: str) -> list:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    return [{"page": 1, "text": content}]

def process_document_file(document_id: str, db: Session):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        return
    
    try:
        doc.status = "Processing"
        db.commit()

        file_path = doc.file_path
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            pages = extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            pages = extract_text_from_docx(file_path)
        elif ext in [".txt", ".md"]:
            pages = extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

        chunks = split_text_into_chunks(pages, chunk_size=900, chunk_overlap=180)

        if not chunks:
            raise ValueError("No readable text extracted from document.")

        # Save embeddings into ChromaDB vector store
        vector_store.add_chunks(
            document_id=doc.id,
            document_name=doc.filename,
            chunks=chunks
        )

        doc.chunk_count = len(chunks)
        doc.status = "Ready"
        doc.error_message = None
        db.commit()

    except Exception as e:
        doc.status = "Failed"
        doc.error_message = str(e)
        db.commit()
        print(f"Error processing document {document_id}: {e}")
