import os
import json
import logging
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.chunks_store: List[Dict[str, Any]] = []
        self.is_ready = True
        self.vectorizer = None
        self.tfidf_matrix = None
        self._init_store()

    def _init_store(self):
        """Initialize lightweight vector store."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            logger.info("Lightweight TF-IDF Cosine Similarity Vector Store initialized (<40MB RAM).")
        except Exception as e:
            logger.warning(f"Vector Store initialization fallback: {str(e)}")

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

    def add_document_chunks(self, document_id: int, filename: str, chunks: List[Dict[str, Any]]) -> int:
        """Embed and store document chunks in vector database."""
        if not chunks:
            return 0

        # Purge old chunks for document_id if updating
        self.delete_document_chunks(document_id)

        for c in chunks:
            self.chunks_store.append({
                "id": f"doc_{document_id}_chunk_{c['chunk_id']}",
                "document": c["text"],
                "metadata": {
                    "document_id": document_id,
                    "filename": filename,
                    "page": c["page"],
                    "chunk_id": c["chunk_id"]
                }
            })

        self._rebuild_index()
        return len(chunks)

    def search_similar(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
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
                    if score > 0.01:  # Filter zero match noise
                        item = self.chunks_store[idx]
                        results.append({
                            "document_id": item["metadata"]["document_id"],
                            "filename": item["metadata"]["filename"],
                            "page": item["metadata"]["page"],
                            "snippet": item["document"],
                            "similarity": round(score, 4)
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
                "page": item["metadata"]["page"],
                "snippet": item["document"],
                "similarity": round(min(0.99, score + 0.3), 4)
            })

        return results

    def delete_document_chunks(self, document_id: int):
        """Remove all vector embeddings associated with a document ID."""
        self.chunks_store = [
            item for item in self.chunks_store if item["metadata"]["document_id"] != document_id
        ]
        self._rebuild_index()

    def count(self) -> int:
        """Return total chunks in vector database."""
        return len(self.chunks_store)

vector_store = VectorStore()
