import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, Sparkles, Loader2, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { askQuestion, getChatHistory, clearChatHistory } from '../services/api';

export default function AISearch() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const sampleQuestions = [
    'What is this document about?',
    'Summarize the important points.',
    'Explain this topic in simple words.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setFetchingHistory(true);
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText = input) => {
    const text = typeof questionText === 'string' ? questionText.trim() : input.trim();
    if (!text || loading) return;

    setInput('');

    // Append user message optimism
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await askQuestion(text);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: response.answer,
        sources: response.sources,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: 'Failed to communicate with RAG engine. Please ensure backend is running.',
        sources: [],
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setClearingHistory(true);
    try {
      await clearChatHistory();
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] pb-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-1 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">AI Knowledge Search</h1>
            <p className="text-xs text-slate-400">Contextual answers generated exclusively from your documents</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={clearingHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all disabled:opacity-50"
          >
            {clearingHistory ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {fetchingHistory ? (
          <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-6 max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Start Asking Questions</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Our RAG pipeline will retrieve relevant document chunks from ChromaDB and synthesize precise answers with page citations.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-4 p-4 rounded-2xl glass-panel border border-cyan-500/10 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-3 text-xs text-cyan-400 font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching vector database & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Always Visible Quick Example Prompts */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-2">
          <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
          <span>Quick Example Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl glass-card border border-slate-800 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>"{q}"</span>
              <Sparkles className="h-3 w-3 text-cyan-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Area */}
      <div className="shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask a question about your uploaded documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/80 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none shadow-xl transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 shadow-md transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          RAG Engine strictly answers using retrieved context snippets from your uploaded documents.
        </p>
      </div>
    </div>
  );
}
