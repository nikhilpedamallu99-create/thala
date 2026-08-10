import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import AISearch from './pages/AISearch';
import Login from './pages/Login';
import Logout from './pages/Logout';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 gap-6">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/knowledge" element={<KnowledgeBase />} />
                <Route path="/search" element={<AISearch />} />
                <Route path="/chat" element={<AISearch />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
