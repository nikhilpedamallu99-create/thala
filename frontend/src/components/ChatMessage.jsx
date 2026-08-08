import React from 'react';
import { User, Bot, BookOpen, Copy, Check } from 'lucide-react';
import SourceBadge from './SourceBadge';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
      isUser ? 'bg-slate-900/40 border border-slate-800/60' : 'glass-panel border border-cyan-500/10'
    }`}>
      {/* Avatar */}
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
        isUser
          ? 'bg-slate-800 text-slate-300 border border-slate-700'
          : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-cyan-500/20'
      }`}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? 'You' : 'Knowledge AI Assistant'}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800"
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* Message text */}
        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
          {message.message}
        </div>

        {/* Sources Section */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <BookOpen className="h-4 w-4" />
              <span>Retrieved Knowledge Sources ({message.sources.length})</span>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2">
              {message.sources.map((source, idx) => (
                <SourceBadge key={idx} source={source} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
