/* Auth Prompt Modal — Shows login/signup prompt on first visit for signed-out users */
import { useState, useEffect } from 'react';
import { useAuth, SignInButton, SignUpButton } from '@clerk/react';

export default function AuthPromptModal() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Don't show if user is signed in
    if (isSignedIn) return;
    
    // Check if user has dismissed the popup before
    const dismissed = sessionStorage.getItem('authPromptDismissed');
    if (dismissed) return;
    
    // Show popup after a short delay for better UX
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('authPromptDismissed', 'true');
  };

  // Don't render anything if not open or still loading
  if (!isLoaded || isSignedIn || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-brand-offwhite dark:bg-brand-black rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6">
            <span style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Arial Unicode MS', sans-serif" }} className="text-4xl tracking-wide">
              <span className="text-brand-orange">NØ</span>
              <span className="text-brand-black dark:text-brand-offwhite">IRÉ</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-brand-black dark:text-brand-offwhite mb-2">
            Welcome to Nøiré
          </h2>
          <p className="text-brand-gray mb-8">
            Sign in to save your wishlist, track orders, and get personalized recommendations.
          </p>

          {/* Auth buttons */}
          <div className="space-y-3">
            <SignInButton mode="modal">
              <button 
                onClick={handleClose}
                className="w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-medium rounded-pill transition-colors"
              >
                Sign In
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button 
                onClick={handleClose}
                className="w-full py-3 px-4 border-2 border-brand-black dark:border-brand-offwhite text-brand-black dark:text-brand-offwhite font-medium rounded-pill hover:bg-brand-black hover:text-brand-offwhite dark:hover:bg-brand-offwhite dark:hover:text-brand-black transition-colors"
              >
                Create Account
              </button>
            </SignUpButton>
          </div>

          {/* Skip link */}
          <button
            onClick={handleClose}
            className="mt-6 text-sm text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
