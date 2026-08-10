import React, { useState, useEffect } from 'react';
import { X, Search, Layers, Copy, Check, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { getDocumentChunks } from '../services/api';

export default function ChunkViewerModal({ doc, onClose }) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const fetchChunks = async () => {
      if (!doc?.id) return;
      setLoading(true);
      setError('');
      try {
        const data = await getDocumentChunks(doc.id);
        setChunks(data.chunks || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load document chunks.');
      } finally {
        setLoading(false);
      }
    };

    fetchChunks();
  }, [doc]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredChunks = chunks.filter(c =>
    (c.content || c.text || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white truncate" title={doc.filename}>
                {doc.filename}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Vector Embeddings & Chunks</span>
                <span>•</span>
                <span className="text-cyan-400 font-medium">{chunks.length} Total Chunks</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search content within chunks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Modal Body - Scrollable Chunks List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Layers className="w-8 h-8 text-cyan-400 animate-bounce mx-auto" />
              <p className="text-xs">Loading chunk embeddings...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : filteredChunks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No matching chunks found</p>
              <p className="text-[11px] text-slate-500">
                {searchQuery ? `No chunk matching "${searchQuery}"` : 'No chunks stored for this document.'}
              </p>
            </div>
          ) : (
            filteredChunks.map((chunk, idx) => {
              const textContent = chunk.content || chunk.text || '';
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/30 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 text-[11px]">
                        Chunk #{chunk.chunk_id || idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                        Page {chunk.page || 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">{textContent.length} chars</span>
                      <button
                        onClick={() => handleCopy(textContent, idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 text-[11px]"
                        title="Copy chunk text"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded-xl border border-slate-800/40">
                    {textContent}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Indexed in Cosine Similarity Vector Store</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
