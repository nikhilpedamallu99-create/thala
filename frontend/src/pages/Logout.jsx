import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, CheckCircle2, LogIn, Home, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Logout = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    // Perform logout action on page load
    logout();
  }, []);

  useEffect(() => {
    if (!autoRedirect) return;

    if (countdown <= 0) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, autoRedirect, navigate]);

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute bottom-12 right-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        {/* Logout Visual Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
          
          {/* Animated Icon Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-30 blur-md animate-pulse" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-700/80 shadow-inner flex items-center justify-center">
              <LogOut className="w-10 h-10 text-cyan-400 transform -translate-x-0.5" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-950 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
            </div>
          </div>

          {/* Header text */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Successfully Logged Out
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your session has been terminated safely and your local auth tokens have been cleared.
            </p>
          </div>

          {/* Security Notification Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center space-x-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Session memory & cache cleared securely</span>
          </div>

          {/* Auto Redirect Banner */}
          {autoRedirect && (
            <div className="py-2.5 px-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Redirecting to login in <strong className="text-white font-bold">{countdown}s</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setAutoRedirect(false)}
                className="text-[11px] underline text-indigo-400 hover:text-indigo-200 font-medium ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 group"
            >
              <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Log In Again</span>
            </Link>

            <Link
              to="/"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center space-x-2 group"
            >
              <Home className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Return to Home Overview</span>
            </Link>
          </div>
        </div>

        {/* Footer brand snippet */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Knowledge RAG AI Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Logout;
