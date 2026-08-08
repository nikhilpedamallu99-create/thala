import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Database, Search, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Home', icon: Home, description: 'RAG Explainer & Overview' },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Metrics & Quick Actions' },
    { path: '/knowledge', label: 'Knowledge Base', icon: Database, description: 'Document Management' },
    { path: '/chat', label: 'AI Search', icon: Search, description: 'RAG Query & Sources' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 bg-slate-950/60 hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Navigation
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">{item.description}</span>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-xl glass-card border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles className="h-16 w-16 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-indigo-400 mb-2 font-semibold text-xs uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            <span>RAG Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Chunking 800-1000 chars, similarity search top-5 in ChromaDB, MiniLM-L6-v2 embeddings.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-3 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span>College RAG Project</span>
        <span className="text-cyan-400 font-semibold">FastAPI + React</span>
      </div>
    </aside>
  );
}
