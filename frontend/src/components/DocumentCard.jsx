import React, { useState } from 'react';
import { FileText, Trash2, CheckCircle2, Clock, AlertTriangle, Layers, RefreshCw } from 'lucide-react';
import { deleteDocument, reprocessDocument } from '../services/api';

export default function DocumentCard({ doc, onDeleteSuccess, onReprocessSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${doc.filename}" and its vector embeddings?`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteDocument(doc.id);
      if (onDeleteSuccess) onDeleteSuccess(doc.id);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      await reprocessDocument(doc.id);
      if (onReprocessSuccess) onReprocessSuccess(doc.id);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reprocess document');
    } finally {
      setReprocessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            Processing
          </span>
        );
      case 'Uploading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="h-3.5 w-3.5" />
            Uploading
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 rounded-xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-100 truncate max-w-sm" title={doc.filename}>
            {doc.filename}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              {doc.chunk_count} Chunks
            </span>
            <span>•</span>
            <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
          </div>
          {doc.error_message && (
            <p className="text-xs text-rose-400 mt-1">{doc.error_message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-800/80">
        {getStatusBadge(doc.status)}
        {doc.status === 'Failed' && (
          <button
            onClick={handleReprocess}
            disabled={reprocessing}
            className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-all text-xs flex items-center gap-1 font-medium disabled:opacity-50"
            title="Retry processing document"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-50"
          title="Delete document and vector embeddings"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
