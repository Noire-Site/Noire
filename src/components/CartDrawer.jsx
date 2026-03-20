/* TEAM 4 — CartDrawer: Slide-out cart with items, quantities, subtotal */
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  // Trap focus & close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-brand-offwhite dark:bg-brand-black shadow-xl animate-slide-in-right flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-light dark:border-[#2A2A2A]">
          <h2 className="font-heading text-2xl">YOUR BAG ({itemCount})</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] rounded-full transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-brand-gray-light dark:text-[#2A2A2A] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-brand-gray mb-4">Your bag is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-brand-orange hover:text-brand-orange-hover font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.key} className="flex gap-4 bg-white dark:bg-[#1A1A1A] p-3 rounded-card">
                  {/* Image */}
                  <div
                    className="w-20 h-24 rounded-md shrink-0"
                    style={{ background: item.image }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-brand-gray mt-0.5">{item.size} / {item.color}</p>
                    <p className="font-mono text-sm font-bold mt-1">₹{item.price}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 border border-brand-gray-light dark:border-[#2A2A2A] rounded-pill">
                        <button
                          onClick={() => updateQuantity(item.key, -1)}
                          className="px-2.5 py-1 text-sm hover:text-brand-orange transition-colors"
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="text-sm font-mono w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, 1)}
                          className="px-2.5 py-1 text-sm hover:text-brand-orange transition-colors"
                          aria-label="Increase quantity"
                        >+</button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-brand-gray hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] px-6 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-brand-gray">Subtotal</span>
              <span className="font-mono font-bold text-lg">₹{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-brand-gray">Shipping & taxes calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-brand-orange hover:bg-brand-orange-hover text-white py-3.5 rounded-pill font-medium transition-colors"
            >
              Checkout
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full text-center text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite py-2 text-sm transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
