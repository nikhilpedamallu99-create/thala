from pydantic import BaseModel, Field, EmailStr
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

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    id_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    google_id: Optional[str] = None
    picture: Optional[str] = None

class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
