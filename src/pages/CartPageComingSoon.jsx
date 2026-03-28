/* ===================================================
   TEMP: Coming Soon cart page — shown until payments are live.
   Swap this out in App.jsx when CartPageFull is ready.
   =================================================== */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function CartPageComingSoon() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | duplicate
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    // Check for duplicate first
    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', trimmed)
      .maybeSingle();

    if (existing) {
      setStatus('duplicate');
      return;
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: trimmed });

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 py-20">
      <div
        className="flex flex-col items-center text-center max-w-xl w-full"
        style={{ animation: 'fadeInUp 0.6s ease-out forwards', opacity: 0 }}
      >
        {/* Orange label */}
        <span className="inline-block text-brand-orange font-mono text-xs tracking-[0.2em] uppercase mb-6">
          Coming Soon
        </span>

        {/* Main heading */}
        <h1 className="font-heading text-6xl md:text-7xl text-brand-offwhite leading-none mb-6">
          Ordering Is On Its Way
        </h1>

        {/* Subtext */}
        <p className="text-brand-gray text-sm md:text-base leading-relaxed mb-10 max-w-md">
          We&apos;re setting up payments and shipping. Drop your email and we&apos;ll
          notify you the moment we go live.
        </p>

        {/* Email form */}
        {status !== 'success' ? (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder="your@email.com"
              disabled={status === 'loading'}
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] border-r-0 text-brand-offwhite placeholder:text-[#5A5651] text-sm px-5 py-3 rounded-l-pill focus:outline-none focus:border-brand-orange transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-body font-semibold text-sm px-6 py-3 rounded-r-pill transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Sending…' : 'Notify Me'}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-sm text-brand-offwhite bg-[#1A1A1A] border border-[#2A2A2A] px-6 py-3 rounded-pill">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#FF4500" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            You&apos;re on the list — we&apos;ll let you know!
          </div>
        )}

        {/* Inline feedback messages */}
        {status === 'error' && (
          <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
        )}
        {status === 'duplicate' && (
          <p className="mt-3 text-xs text-brand-gray">You&apos;re already on the list.</p>
        )}

        {/* Continue Shopping */}
        <Link
          to="/shop"
          className="mt-10 text-xs text-[#5A5651] hover:text-brand-offwhite tracking-[0.15em] uppercase transition-colors"
        >
          ← Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
