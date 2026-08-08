import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, Database, Search, FileText, Layers, Cpu, Sparkles, 
  ArrowRight, ShieldCheck, Zap, BookOpen, MessageSquare
} from 'lucide-react';

export default function Home() {
  const steps = [
    { num: '01', title: 'Upload Documents', desc: 'Support for PDF, TXT, DOCX, and MD files.' },
    { num: '02', title: 'Text Extraction & Chunking', desc: 'Split into 800–1000 character overlapping chunks.' },
    { num: '03', title: 'Embeddings & ChromaDB', desc: '384-dim vectors via all-MiniLM-L6-v2 stored persistently.' },
    { num: '04', title: 'Similarity Search', desc: 'Cosine/L2 distance search retrieving top 4–5 context chunks.' },
    { num: '05', title: 'Contextual LLM Generation', desc: 'Grounded response generation with strict zero-hallucination rules.' }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="relative rounded-3xl glass-panel p-8 sm:p-12 overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-950/80 to-slate-950">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Retrieval-Augmented Generation (RAG) Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ask Anything About Your <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Documents</span> With AI Precision
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Upload your lecture notes, PDFs, or research papers and get immediate, verified answers backed by source citations. Built using FastAPI, ChromaDB vector store, and Sentence Transformers embeddings.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/knowledge"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
            >
              <Database className="h-4 w-4" />
              <span>Upload Documents</span>
            </Link>

            <Link
              to="/chat"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 glass-card hover:bg-slate-800 flex items-center gap-2 transition-all border border-slate-700"
            >
              <Search className="h-4 w-4 text-cyan-400" />
              <span>Ask AI Question</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* RAG Interactive Architecture Diagram */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white tracking-tight">How the RAG Pipeline Works</h2>
          <p className="text-sm text-slate-400 mt-1">
            Student-friendly step-by-step breakdown of document indexing and similarity retrieval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3 relative group hover:border-cyan-500/30">
              <span className="text-2xl font-black text-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                {step.num}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Core System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-3 border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Multi-Format Extractor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parses PDF pages, DOCX paragraphs, and UTF-8 TXT files into clean character chunks.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3 border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Sentence Transformers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses <code className="text-cyan-300">all-MiniLM-L6-v2</code> for fast 384-dimensional vector embedding generation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3 border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Zero Hallucination Guard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              System explicitly returns standard fallback when question answers are absent from context.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
