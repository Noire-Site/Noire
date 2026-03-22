// src/components/admin/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLayout({ children }) {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-1">
          <span
            style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
            className="text-2xl tracking-wide"
          >
            <span className="text-[#FF4500]">NØ</span>
            <span className="text-white">IRÉ</span>
          </span>
          <span className="ml-3 text-xs font-mono text-[#5A5651] uppercase tracking-widest border border-[#2A2A2A] px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
        {hasSession && (
          <button
            onClick={handleSignOut}
            className="text-sm text-[#5A5651] hover:text-white transition-colors"
          >
            Sign out
          </button>
        )}
      </header>
      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
