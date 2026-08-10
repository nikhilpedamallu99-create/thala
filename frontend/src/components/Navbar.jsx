import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Database, Sparkles, Activity, User, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { checkHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [healthStatus, setHealthStatus] = useState('connecting');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const verifyHealth = async () => {
      try {
        const data = await checkHealth();
        if (data.status?.toLowerCase() === 'healthy') {
          setHealthStatus('connected');
        } else {
          setHealthStatus('error');
        }
      } catch (err) {
        setHealthStatus('offline');
      }
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    navigate('/logout');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg group-hover:shadow-cyan-500/25 transition-all">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Knowledge RAG
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI Knowledge Base Search System</p>
          </div>
        </Link>

        {/* Quick Nav & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* API Health Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`h-2 w-2 rounded-full ${
              healthStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
              healthStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-500'
            }`} />
            <span className="text-slate-300 capitalize font-medium hidden sm:inline">
              API: {healthStatus}
            </span>
          </div>

          <Link
            to="/search"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-lg hover:from-cyan-400 hover:to-indigo-500 shadow-md hover:shadow-cyan-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </Link>

          {/* User Profile / Login Action */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden md:inline max-w-[100px] truncate">
                  {user.full_name || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 py-2 rounded-2xl glass-panel border border-slate-800 shadow-2xl z-50">
                  <div className="px-4 py-2 border-b border-slate-800/80">
                    <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Log In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
