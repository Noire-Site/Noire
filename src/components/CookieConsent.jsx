/* TEAM 5 — CookieConsent: Dismissable cookie banner stored in localStorage */
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('td-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('td-cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6" role="alert">
      <div className="max-w-4xl mx-auto bg-brand-black dark:bg-white text-brand-offwhite dark:text-brand-black rounded-card shadow-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Nøiré uses cookies 🍪</p>
          <p className="text-xs text-gray-400 dark:text-brand-gray">
            Nøiré uses cookies to improve your experience, analyze traffic, and serve you the freshest drops. 
            By continuing, you agree to our cookie policy.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={accept}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-medium px-5 py-2 rounded-pill transition-colors"
          >
            Accept
          </button>
          <button
            onClick={accept}
            className="text-sm text-gray-400 dark:text-brand-gray hover:text-brand-offwhite dark:hover:text-brand-black transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
