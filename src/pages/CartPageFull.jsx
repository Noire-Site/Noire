import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

export default function CartPage() {
  const {
    items, removeItem, updateQuantity,
    subtotal, discount, total, itemCount,
    promoCode, promoData, applyPromo, removePromo,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);
  const [banners, setBanners] = useState([]);

  // Fetch any active show_on_store codes for the banner
  useEffect(() => {
    supabase
      .from('promo_codes')
      .select('code, discount_type, discount_value')
      .eq('is_active', true)
      .eq('show_on_store', true)
      .then(({ data }) => setBanners(data ?? []));
  }, []);

  const handlePromo = async () => {
    setPromoApplying(true);
    const result = await applyPromo(promoInput.trim());
    setPromoMsg(result.message);
    if (result.success) setPromoInput('');
    setPromoApplying(false);
  };

  const promoLabel = promoData
    ? promoData.discount_type === 'percentage'
      ? `${promoData.discount_value}% off`
      : `₹${promoData.discount_value} off`
    : '';

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-4xl mb-4">YOUR BAG IS EMPTY</h1>
        <p className="text-brand-gray mb-8">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-pill font-medium transition-colors"
        >
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="font-heading text-4xl sm:text-5xl mb-6">
        YOUR BAG <span className="text-brand-gray text-2xl font-body font-normal">({itemCount})</span>
      </h1>

      {/* Show-on-store promo banners */}
      {banners.length > 0 && !promoCode && (
        <div className="space-y-2 mb-6">
          {banners.map(b => {
            const label = b.discount_type === 'percentage'
              ? `${b.discount_value}% off`
              : `₹${b.discount_value} off`;
            return (
              <div
                key={b.code}
                className="flex items-center justify-between bg-brand-orange/10 border border-brand-orange/30 rounded-card px-4 py-3"
              >
                <p className="text-sm">
                  Use code{' '}
                  <button
                    onClick={() => setPromoInput(b.code)}
                    className="font-mono font-bold text-brand-orange hover:underline"
                  >
                    {b.code}
                  </button>
                  {' '}for <strong>{label}</strong>
                </p>
                <button
                  onClick={() => setPromoInput(b.code)}
                  className="text-xs font-medium text-brand-orange hover:text-brand-orange-hover transition-colors shrink-0 ml-4"
                >
                  Apply →
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

        {/* ─── Items ─── */}
        <div className="lg:col-span-3 space-y-4">
          {items.map(item => (
            <div
              key={item.key}
              className="flex gap-4 bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-4"
            >
              <div
                className="w-24 h-28 rounded-md shrink-0"
                style={{ background: item.image }}
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-brand-gray mt-0.5">{item.size} / {item.color}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-brand-gray-light dark:border-[#2A2A2A] rounded-pill overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.key, -1)}
                      className="px-3 py-1.5 text-base hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors"
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="px-3 text-sm font-mono font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, 1)}
                      className="px-3 py-1.5 text-base hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
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
            </div>
          ))}
        </div>

        {/* ─── Summary ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-6 sticky top-24 space-y-5">
            <h2 className="font-heading text-xl">ORDER SUMMARY</h2>

            {/* Promo code */}
            <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] pt-4">
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2 rounded-md">
                  <span className="text-sm font-mono text-green-700 dark:text-green-400">
                    {promoCode} — {promoLabel}
                  </span>
                  <button
                    onClick={() => { removePromo(); setPromoMsg(''); }}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value); setPromoMsg(''); }}
                      onKeyDown={e => e.key === 'Enter' && !promoApplying && handlePromo()}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 text-sm bg-transparent border border-brand-gray-light dark:border-[#2A2A2A] rounded-md focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                    <button
                      onClick={handlePromo}
                      disabled={promoApplying}
                      className="text-sm font-medium text-brand-orange hover:text-brand-orange-hover transition-colors px-1 disabled:opacity-50"
                    >
                      {promoApplying ? '…' : 'Apply'}
                    </button>
                  </div>
                  {promoMsg && (
                    <p className={`text-xs ${promoMsg.includes('applied') ? 'text-green-600' : 'text-red-500'}`}>
                      {promoMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] pt-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray">Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount ({promoCode})</span>
                  <span className="font-mono">−₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                <span>Total</span>
                <span className="font-mono">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/checkout"
              className="block w-full text-center bg-brand-orange hover:bg-brand-orange-hover text-white py-3.5 rounded-pill font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/shop"
              className="block w-full text-center text-sm text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors py-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
