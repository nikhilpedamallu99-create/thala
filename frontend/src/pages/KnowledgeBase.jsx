import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, Layers, FileText } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import DocumentCard from '../components/DocumentCard';
import { getDocuments } from '../services/api';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    const interval = setInterval(fetchDocs, 10000); // Polling status every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Knowledge Base Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Upload and manage documents indexed in ChromaDB vector store</p>
        </div>
        <button
          onClick={fetchDocs}
          className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* File Upload Container */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-400" />
          <span>Upload New Knowledge Document</span>
        </h2>
        <FileUploader onUploadSuccess={() => fetchDocs()} />
      </div>

      {/* Document List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Indexed Documents</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-cyan-400 border border-slate-700">
              {documents.length}
            </span>
          </h2>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {loading && documents.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-xs">
            Loading knowledge base documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel text-center space-y-2 border border-slate-800">
            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">No documents found</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? `No files matching "${searchQuery}"` : 'Upload files above to build your vector knowledge base.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDeleteSuccess={(deletedId) => {
                  setDocuments(documents.filter((d) => d.id !== deletedId));
                }}
                onReprocessSuccess={() => fetchDocs()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
