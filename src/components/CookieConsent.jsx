/* TEAM 5 — CookieConsent: Dismissable cookie banner stored in localStorage */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('noire_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type) => {
    localStorage.setItem(
      'noire_cookie_consent',
      JSON.stringify({ consent: type, date: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6" role="alert">
      <div className="max-w-4xl mx-auto bg-brand-black dark:bg-white text-brand-offwhite dark:text-brand-black rounded-card shadow-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up border border-[#2A2A2A] dark:border-gray-200">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Nøiré uses cookies</p>
          <p className="text-xs text-gray-400 dark:text-brand-gray">
            We use cookies to improve your experience, analyse traffic, and serve you the freshest drops.{' '}
            <Link to="/cookies" className="text-brand-orange hover:underline">
              Cookie Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => accept('all')}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-medium px-5 py-2 rounded-pill transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={() => accept('essential')}
            className="text-sm text-gray-400 dark:text-brand-gray hover:text-brand-offwhite dark:hover:text-brand-black border border-[#3A3A3A] dark:border-gray-300 px-4 py-2 rounded-pill transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
