import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, CheckCircle2, HelpCircle, Activity, UploadCloud, Search, 
  ArrowRight, RefreshCw, FileText, Layers 
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import DocumentCard from '../components/DocumentCard';
import { getStatsSummary, getDocuments } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_documents: 0,
    processed_documents: 0,
    questions_asked: 0,
    kb_status: 'Empty',
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, docsData] = await Promise.all([
        getStatsSummary(),
        getDocuments(),
      ]);
      setStats(statsData);
      setRecentDocs(docsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time overview of your indexed knowledge base</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
            title="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/knowledge"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md flex items-center gap-2 transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Quick Upload</span>
          </Link>
          <Link
            to="/chat"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 glass-card border border-slate-700 hover:bg-slate-800 flex items-center gap-2 transition-all"
          >
            <Search className="h-4 w-4 text-cyan-400" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Documents"
          value={stats.total_documents}
          subtext="Uploaded file archives"
          icon={Database}
          color="cyan"
        />
        <StatsCard
          title="Processed Ready"
          value={stats.processed_documents}
          subtext="Indexed in ChromaDB"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Questions Asked"
          value={stats.questions_asked}
          subtext="RAG Queries executed"
          icon={HelpCircle}
          color="indigo"
        />
        <StatsCard
          title="KB Status"
          value={stats.kb_status}
          subtext="Vector store health"
          icon={Activity}
          color={stats.kb_status === 'Active' ? 'emerald' : 'purple'}
        />
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Knowledge Documents</h2>
            <p className="text-xs text-slate-400">Latest uploaded files and indexing status</p>
          </div>
          <Link
            to="/knowledge"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All ({stats.total_documents})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-xs">
            Loading dashboard metrics...
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel text-center space-y-3 border border-slate-800">
            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">No documents uploaded yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload your first PDF or text document to enable RAG question answering.
            </p>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all mt-2"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDeleteSuccess={(deletedId) => {
                  setRecentDocs(recentDocs.filter((d) => d.id !== deletedId));
                  fetchData();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
