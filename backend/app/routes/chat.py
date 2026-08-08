import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatMessageModel
from app.schemas import ChatQueryRequest, ChatQueryResponse, ChatMessageResponse, SourceSchema
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatQueryResponse)
def ask_question(query: ChatQueryRequest, db: Session = Depends(get_db)):
    if not query.question or not query.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    user_text = query.question.strip()

    # 1. Save User Message to DB
    user_msg = ChatMessageModel(
        sender="user",
        message=user_text,
        sources=None
    )
    db.add(user_msg)
    db.commit()

    # 2. Run RAG Pipeline
    rag_result = rag_engine.answer_question(user_text)
    answer_text = rag_result["answer"]
    raw_sources = rag_result["sources"]

    # 3. Format sources
    formatted_sources = []
    for src in raw_sources:
        formatted_sources.append(SourceSchema(
            document_id=src["document_id"],
            document_name=src["document_name"],
            page=src["page"],
            snippet=src["snippet"],
            score=src.get("score")
        ))

    # 4. Save Assistant Response to DB
    sources_json = json.dumps([s.model_dump() for s in formatted_sources]) if formatted_sources else None
    assistant_msg = ChatMessageModel(
        sender="assistant",
        message=answer_text,
        sources=sources_json
    )
    db.add(assistant_msg)
    db.commit()

    return ChatQueryResponse(
        answer=answer_text,
        sources=formatted_sources
    )

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(db: Session = Depends(get_db)):
    messages = db.query(ChatMessageModel).order_by(ChatMessageModel.created_at.asc()).all()
    
    response_list = []
    for msg in messages:
        sources_obj = None
        if msg.sources:
            try:
                raw_list = json.loads(msg.sources)
                sources_obj = [SourceSchema(**s) for s in raw_list]
            except Exception:
                sources_obj = None

        response_list.append(ChatMessageResponse(
            id=msg.id,
            sender=msg.sender,
            message=msg.message,
            sources=sources_obj,
            created_at=msg.created_at
        ))

    return response_list

@router.delete("/history", status_code=status.HTTP_200_OK)
def clear_chat_history(db: Session = Depends(get_db)):
    db.query(ChatMessageModel).delete()
    db.commit()
    return {"message": "Chat history cleared successfully"}
