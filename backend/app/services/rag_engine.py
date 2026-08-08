import os
import requests
from app.config import settings
from app.services.vector_store import vector_store

NO_INFO_RESPONSE = "I couldn't find enough information in the uploaded knowledge base to answer this question."

class RAGEngine:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model_name = settings.LLM_MODEL

    def answer_question(self, question: str) -> dict:
        # 1. Retrieve top relevant chunks from ChromaDB
        retrieved_chunks = vector_store.search_similar(question, top_k=5)
        
        if not retrieved_chunks:
            return {
                "answer": NO_INFO_RESPONSE,
                "sources": []
            }

        # Filter out very low relevance scores if score is available (e.g. < 0.1)
        valid_sources = [c for c in retrieved_chunks if c.get("score", 1.0) >= 0.1]
        
        if not valid_sources:
            return {
                "answer": NO_INFO_RESPONSE,
                "sources": []
            }

        # 2. Build Context String
        context_blocks = []
        for i, source in enumerate(valid_sources):
            context_blocks.append(
                f"[Source {i+1} - Doc: {source['document_name']}, Page: {source['page']}]\n{source['snippet']}"
            )
        
        context_str = "\n\n".join(context_blocks)

        system_prompt = (
            "You are an AI Knowledge Base Assistant answering questions using ONLY the provided document context below.\n"
            "STRICT RULES:\n"
            "1. Answer ONLY using the facts present in the provided context snippets.\n"
            "2. If the context does not contain enough clear information to answer the question, you MUST respond exactly:\n"
            f'"{NO_INFO_RESPONSE}"\n'
            "3. Do not invent, hallucinate, or assume facts not found in the context.\n"
            "4. Keep your answer clear, informative, and formatted cleanly in markdown.\n\n"
            f"--- CONTEXT SNIPPETS ---\n{context_str}\n-----------------------\n\n"
            f"USER QUESTION: {question}"
        )

        # 3. Call configured LLM Provider
        answer = None

        if self.provider == "gemini" and self.api_key:
            answer = self._call_gemini(system_prompt, question)
        elif self.provider == "openai" and self.api_key:
            answer = self._call_openai(system_prompt, question)
        elif self.provider == "groq" and self.api_key:
            answer = self._call_groq(system_prompt, question)
        elif self.provider == "ollama":
            answer = self._call_ollama(system_prompt, question)

        # Fallback to local intelligent synthesizer if provider is 'mock' or if call failed/no key
        if not answer:
            answer = self._synthesize_local_fallback(question, valid_sources)

        return {
            "answer": answer,
            "sources": valid_sources
        }

    def _call_gemini(self, prompt: str, question: str) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name or "gemini-1.5-flash")
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
        return None

    def _call_openai(self, prompt: str, question: str) -> str:
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model=self.model_name or "gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            if response.choices:
                return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API error: {e}")
        return None

    def _call_groq(self, prompt: str, question: str) -> str:
        try:
            import openai
            client = openai.OpenAI(
                api_key=self.api_key,
                base_url="https://api.groq.com/openai/v1"
            )
            response = client.chat.completions.create(
                model=self.model_name or "llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            if response.choices:
                return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq API error: {e}")
        return None

    def _call_ollama(self, prompt: str, question: str) -> str:
        try:
            res = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": self.model_name or "llama2",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30
            )
            if res.status_code == 200:
                return res.json().get("response", "").strip()
        except Exception as e:
            print(f"Ollama API error: {e}")
        return None

    def _synthesize_local_fallback(self, question: str, sources: list) -> str:
        """
        Extractive RAG engine fallback when no remote LLM API key is provided.
        Checks for keyword relevance and formats context sentences into a comprehensive answer.
        """
        q_words = set(w.lower() for w in question.split() if len(w) > 2)
        
        matching_sentences = []
        for s in sources:
            text = s["snippet"]
            # Split into sentences
            sentences = [sentence.strip() for sentence in text.replace("\n", " ").split(".") if sentence.strip()]
            for sentence in sentences:
                s_words = set(w.lower() for w in sentence.split())
                overlap = q_words.intersection(s_words)
                if overlap or len(sentences) <= 3:
                    matching_sentences.append(sentence)

        if not matching_sentences:
            return NO_INFO_RESPONSE

        # Deduplicate while preserving order
        seen = set()
        unique_sentences = []
        for sent in matching_sentences:
            if sent not in seen:
                seen.add(sent)
                unique_sentences.append(sent)

        # Build clean informative answer
        bullet_points = "\n".join([f"• {sent}." if not sent.endswith(".") else f"• {sent}" for sent in unique_sentences[:6]])
        
        return (
            f"Based on the retrieved document context:\n\n"
            f"{bullet_points}\n\n"
            f"*(Generated from retrieved knowledge base sources)*"
        )

rag_engine = RAGEngine()
