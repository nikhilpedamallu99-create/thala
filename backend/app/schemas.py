from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

class SourceSchema(BaseModel):
    document_id: str
    document_name: str
    page: int
    snippet: str
    score: Optional[float] = None

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int
    upload_date: datetime.datetime
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class ChatQueryRequest(BaseModel):
    question: str = Field(..., min_length=1, example="What is this document about?")

class ChatQueryResponse(BaseModel):
    answer: str
    sources: List[SourceSchema]

class ChatMessageResponse(BaseModel):
    id: str
    sender: str
    message: str
    sources: Optional[List[SourceSchema]] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_documents: int
    processed_documents: int
    questions_asked: int
    kb_status: str
