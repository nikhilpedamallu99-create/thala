from fastapi import APIRouter
import datetime

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Knowledge Base Search (RAG) API",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
