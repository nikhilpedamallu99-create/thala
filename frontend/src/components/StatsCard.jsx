import React from 'react';

export default function StatsCard({ title, value, subtext, icon: Icon, color = 'cyan' }) {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      text: 'text-cyan-400',
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      text: 'text-indigo-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      text: 'text-emerald-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      text: 'text-purple-400',
    },
  }[color] || {
    border: 'border-slate-700',
    iconBg: 'bg-slate-800 text-slate-300',
    text: 'text-slate-200',
  };

  return (
    <div className={`p-5 rounded-2xl glass-card border transition-all duration-300 ${colorStyles.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles.iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
