// src/components/admin/AdminGuard.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminGuard({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'no-session' | 'denied'

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('no-session'); return; }

      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', session.user.email)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        setStatus('denied');
      } else {
        setStatus('allowed');
      }
    }
    check();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === 'no-session') return <Navigate to="/admin/login" replace />;
  if (status === 'denied') return <Navigate to="/" replace />;
  return children;
}
