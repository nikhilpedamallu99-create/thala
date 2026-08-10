import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle({
        email: 'google.user@example.com',
        full_name: 'Google User',
        picture: 'https://lh3.googleusercontent.com/a/default-user'
      });
      if (res.success) {
        setSuccessMsg('Signed in with Google! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 600);
      } else {
        setError('Google sign in failed.');
      }
    } catch (err) {
      setError('An error occurred during Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signup(fullName, email, password);
        if (res.success) {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setError(res.error);
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMsg('Signed in successfully! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 800);
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const res = await login('demo@example.com', 'demo123');
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 mb-2">
            <BrainCircuit className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp 
              ? 'Join THALA RAG to start indexing and querying your knowledge base' 
              : 'Sign in to access your document vector store and AI search workspace'}
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                !isSignUp 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                isSignUp 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error / Success Toast Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {!isSignUp && (
                  <span className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0f172a] px-3 text-[10px] uppercase font-semibold text-slate-500 absolute">
              or quick access
            </span>
          </div>

          {/* Quick Access Buttons */}
          <div className="space-y-2.5">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all flex items-center justify-center space-x-3 shadow-md hover:shadow-lg group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>1-Click Instant Demo Login</span>
            </button>
          </div>
        </div>

        {/* Security Badge Footer */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Session & Grounded Knowledge Protection</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
