import chromadb
from chromadb.utils import embedding_functions
from app.config import settings

class VectorStoreManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.VECTOR_STORE_DIR)
        # Using sentence-transformers all-MiniLM-L6-v2 embedding function
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self.collection = self.client.get_or_create_collection(
            name="knowledge_base",
            embedding_function=self.embedding_fn
        )

    def add_chunks(self, document_id: str, document_name: str, chunks: list):
        """
        chunks: list of dicts [{"page": int, "content": str, "chunk_id": int}]
        """
        if not chunks:
            return
        
        ids = []
        documents = []
        metadatas = []
        
        for idx, chunk in enumerate(chunks):
            chunk_unique_id = f"{document_id}_{idx}"
            ids.append(chunk_unique_id)
            documents.append(chunk["content"])
            metadatas.append({
                "document_id": document_id,
                "document_name": document_name,
                "page": chunk.get("page", 1),
                "chunk_id": idx
            })
            
        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

    def search_similar(self, query: str, top_k: int = 5):
        if self.collection.count() == 0:
            return []
        
        results = self.collection.query(
            query_texts=[query],
            n_results=min(top_k, self.collection.count())
        )
        
        retrieved = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results and results["distances"] else [0.0] * len(docs)
            
            for doc_text, meta, dist in zip(docs, metas, distances):
                # Distance to similarity score conversion (Chroma L2 or cosine distance)
                score = round(max(0.0, 1.0 - (dist / 2.0)), 3) if dist is not None else 0.85
                retrieved.append({
                    "document_id": meta.get("document_id", ""),
                    "document_name": meta.get("document_name", "Document"),
                    "page": meta.get("page", 1),
                    "snippet": doc_text,
                    "score": score
                })
        return retrieved

    def delete_document_chunks(self, document_id: str):
        try:
            self.collection.delete(
                where={"document_id": document_id}
            )
        except Exception as e:
            print(f"Error deleting chunks for document {document_id}: {e}")

vector_store = VectorStoreManager()
