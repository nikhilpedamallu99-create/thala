import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DocumentModel, ChatMessageModel
from app.schemas import DocumentResponse, StatsResponse
from app.config import settings
from app.services.document_processor import process_document_file
from app.services.vector_store import vector_store

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".doc", ".md"}

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' not supported. Allowed extensions: PDF, TXT, DOCX, MD"
        )

    document_id = str(uuid.uuid4())
    safe_filename = f"{document_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # Save uploaded file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Create database entry
    doc_model = DocumentModel(
        id=document_id,
        filename=file.filename,
        file_path=file_path,
        file_type=ext.lstrip("."),
        file_size=file_size,
        status="Uploading",
        chunk_count=0
    )
    db.add(doc_model)
    db.commit()
    db.refresh(doc_model)

    # Trigger background parsing & embedding indexing
    background_tasks.add_task(process_document_file, document_id, db)

    return doc_model

@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentModel).order_by(DocumentModel.upload_date.desc()).all()
    return docs

@router.get("/stats/summary", response_model=StatsResponse)
def get_stats_summary(db: Session = Depends(get_db)):
    total_documents = db.query(DocumentModel).count()
    processed_documents = db.query(DocumentModel).filter(DocumentModel.status == "Ready").count()
    questions_asked = db.query(ChatMessageModel).filter(ChatMessageModel.sender == "user").count()
    
    kb_status = "Empty"
    if processed_documents > 0:
        kb_status = "Active"
    elif total_documents > 0:
        kb_status = "Processing"

    return StatsResponse(
        total_documents=total_documents,
        processed_documents=processed_documents,
        questions_asked=questions_asked,
        kb_status=kb_status
    )

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
def reprocess_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = "Processing"
    doc.error_message = None
    db.commit()

    background_tasks.add_task(process_document_file, document_id, db)
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 1. Delete chunks from ChromaDB / TF-IDF vector store
    vector_store.delete_document_chunks(document_id)

    # 2. Remove file from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            print(f"Failed to remove file {doc.file_path}: {e}")

    # 3. Remove DB record
    db.delete(doc)
    db.commit()

    return {"message": "Document and associated embeddings deleted successfully", "id": document_id}
