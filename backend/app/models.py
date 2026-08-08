import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String, default="Uploading") # Uploading, Processing, Ready, Failed
    chunk_count = Column(Integer, default=0)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    error_message = Column(Text, nullable=True)

class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    sender = Column(String, nullable=False) # user, assistant
    message = Column(Text, nullable=False)
    sources = Column(Text, nullable=True) # JSON array string of sources
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
