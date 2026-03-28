// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check whitelist
    const { data } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single();

    if (!data) {
      await supabase.auth.signOut();
      setError('Access denied. This email is not authorised.');
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  const inputClass =
    'w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 text-white placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors text-sm';

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.04em' }}>
          <span style={{ color: '#FF4500' }}>NØ</span>IRÉ
        </span>
      </div>
    <div className="flex items-center justify-center" style={{ width: '100%' }}>
      <div className="w-full max-w-sm">
        <h1
          style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
          className="text-4xl mb-8 text-center"
        >
          ADMIN LOGIN
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded font-medium transition-colors text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
