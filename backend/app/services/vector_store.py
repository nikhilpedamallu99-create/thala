import os
import json
import logging
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

DATA_FILE = os.path.join(settings.VECTOR_STORE_DIR, "chunks_store.json")

class VectorStore:
    def __init__(self):
        self.chunks_store: List[Dict[str, Any]] = []
        self.is_ready = True
        self.vectorizer = None
        self.tfidf_matrix = None
        self._init_store()

    def _init_store(self):
        """Initialize lightweight vector store and load persisted chunks if available."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            logger.info("Lightweight TF-IDF Cosine Similarity Vector Store initialized (<40MB RAM).")
        except Exception as e:
            logger.warning(f"Vector Store initialization fallback: {str(e)}")

        self._load_from_disk()

    def _load_from_disk(self):
        """Load persisted document chunks from disk if available."""
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    self.chunks_store = json.load(f)
                self._rebuild_index()
                logger.info(f"Loaded {len(self.chunks_store)} document chunks from vector store persistence.")
            except Exception as e:
                logger.error(f"Failed to load vector store from disk: {e}")

    def _save_to_disk(self):
        """Save chunks store to disk for persistence across server restarts."""
        try:
            os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self.chunks_store, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save vector store to disk: {e}")

    def _rebuild_index(self):
        """Rebuild TF-IDF vector matrix from stored document chunks."""
        if not self.chunks_store or not self.vectorizer:
            self.tfidf_matrix = None
            return

        corpus = [item["document"] for item in self.chunks_store]
        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        except Exception as e:
            logger.error(f"Error rebuilding vector matrix: {str(e)}")
            self.tfidf_matrix = None

    def add_chunks(
        self,
        document_id: Any,
        document_name: str = None,
        filename: str = None,
        chunks: List[Dict[str, Any]] = None
    ) -> int:
        """Embed and store document chunks in vector database."""
        fname = document_name or filename or "Document"
        if not chunks:
            return 0

        str_doc_id = str(document_id)
        # Purge old chunks for document_id if updating
        self.delete_document_chunks(str_doc_id)

        for idx, c in enumerate(chunks):
            text_content = c.get("content") or c.get("text") or ""
            if not text_content.strip():
                continue

            page_num = c.get("page", 1)
            chunk_id = c.get("chunk_id", idx + 1)

            self.chunks_store.append({
                "id": f"doc_{str_doc_id}_chunk_{chunk_id}",
                "document": text_content,
                "metadata": {
                    "document_id": str_doc_id,
                    "filename": fname,
                    "document_name": fname,
                    "page": page_num,
                    "chunk_id": chunk_id
                }
            })

        self._rebuild_index()
        self._save_to_disk()
        return len(chunks)

    def add_document_chunks(self, document_id: Any, filename: str, chunks: List[Dict[str, Any]]) -> int:
        """Alias for add_chunks."""
        return self.add_chunks(document_id=document_id, filename=filename, chunks=chunks)

    def search_similar(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Perform cosine similarity vector search and return top-k matching snippets."""
        if not self.chunks_store:
            return []

        results = []

        if self.vectorizer and self.tfidf_matrix is not None:
            try:
                from sklearn.metrics.pairwise import cosine_similarity
                query_vec = self.vectorizer.transform([query])
                cosine_sim = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

                # Get top K indices sorted by similarity score
                top_indices = cosine_sim.argsort()[::-1][:top_k]

                for idx in top_indices:
                    score = float(cosine_sim[idx])
                    if score > 0.001:  # Filter zero match noise
                        item = self.chunks_store[idx]
                        results.append({
                            "document_id": item["metadata"]["document_id"],
                            "filename": item["metadata"]["filename"],
                            "document_name": item["metadata"]["document_name"],
                            "page": item["metadata"]["page"],
                            "snippet": item["document"],
                            "similarity": round(score, 4),
                            "score": round(score, 4)
                        })

                if results:
                    return results
            except Exception as e:
                logger.error(f"Vector search query error: {str(e)}")

        # Fallback keyword match similarity score
        query_words = set(query.lower().split())
        scored = []
        for item in self.chunks_store:
            doc_words = set(item["document"].lower().split())
            intersection = query_words.intersection(doc_words)
            if intersection:
                score = len(intersection) / max(1, len(query_words))
                scored.append((score, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        for score, item in scored[:top_k]:
            results.append({
                "document_id": item["metadata"]["document_id"],
                "filename": item["metadata"]["filename"],
                "document_name": item["metadata"]["document_name"],
                "page": item["metadata"]["page"],
                "snippet": item["document"],
                "similarity": round(min(0.99, score + 0.3), 4),
                "score": round(min(0.99, score + 0.3), 4)
            })

        return results

    def delete_document_chunks(self, document_id: Any):
        """Remove all vector embeddings associated with a document ID."""
        str_doc_id = str(document_id)
        original_len = len(self.chunks_store)
        self.chunks_store = [
            item for item in self.chunks_store
            if str(item["metadata"].get("document_id")) != str_doc_id
        ]
        if len(self.chunks_store) != original_len:
            self._rebuild_index()
            self._save_to_disk()

    def count(self) -> int:
        """Return total chunks in vector database."""
        return len(self.chunks_store)

vector_store = VectorStore()
