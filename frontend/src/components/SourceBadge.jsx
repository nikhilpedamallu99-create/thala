import React, { useState } from 'react';
import { BookOpen, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function SourceBadge({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  const scorePercentage = source.score ? Math.round(source.score * 100) : null;

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden text-xs">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center h-5 w-5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold text-[10px] shrink-0 border border-indigo-500/30">
            {index + 1}
          </span>
          <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-medium text-slate-200 truncate">{source.document_name}</span>
          <span className="text-slate-400 shrink-0">pg. {source.page}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {scorePercentage !== null && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {scorePercentage}% match
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/60 text-slate-300 font-mono text-[11px] leading-relaxed">
          <p className="text-slate-400 mb-1 font-sans text-[10px] uppercase tracking-wider">Relevant Snippet Chunk:</p>
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 whitespace-pre-wrap">
            "{source.snippet}"
          </div>
        </div>
      )}
    </div>
  );
}
