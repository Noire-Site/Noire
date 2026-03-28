/* ===================================================
   UPI Checkout — accessible at /upi only by direct URL.
   NOT linked from anywhere on the site.
   Flow inspired by QuickUPI Android app:
     EnterAmountScreen → ShowQrScreen
   =================================================== */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../utils/supabase';

const UPI_ID   = import.meta.env.VITE_UPI_ID   || 'singhagamjot@fam';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'NOIRE';

/* TEMP: dummy items shown when cart is empty — remove when real orders flow in */
const DUMMY_ITEMS = [
  { key: 'dummy-1', id: 'd1', name: 'Shadow Oversized Hoodie', price: 2499, quantity: 1, size: 'L', color: 'Onyx Black', image: '#1A1A1A' },
  { key: 'dummy-2', id: 'd2', name: 'Void Drop-Shoulder Tee',  price: 1299, quantity: 2, size: 'M', color: 'Ash Grey',   image: '#2A2A2A' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

/* Build UPI deeplink — keep @ unencoded so UPI apps accept it */
function buildUpiLink(upiId, name, amount, note) {
  const params = new URLSearchParams();
  params.set('pa', upiId);
  if (name) params.set('pn', name);
  if (amount > 0) params.set('am', amount.toFixed(2));
  params.set('cu', 'INR');
  if (note) params.set('tn', note);
  return `upi://pay?${params.toString().replace(/%40/g, '@')}`;
}

/* ─── tiny helpers ─── */
const inputClass =
  'w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#F5F2EE] placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors text-sm';
const labelClass = 'block text-xs uppercase tracking-widest text-[#5A5651] font-mono mb-1.5';

function Field({ label, error, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function FormInput({ field, type = 'text', placeholder, value, onChange, error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      placeholder={placeholder}
      className={`${inputClass} ${error ? 'border-red-500' : ''}`}
    />
  );
}

/* ─── UPI block: Enter Amount → Show QR ─── */
function UPIBlock({ defaultAmount }) {
  const [step, setStep] = useState('enter'); // 'enter' | 'show'
  const [amountInput, setAmountInput] = useState(defaultAmount > 0 ? String(defaultAmount) : '');
  const [note, setNote] = useState('Noire Order');

  const parsedAmount = parseFloat(amountInput);
  const isAmountValid = amountInput === '' || (parsedAmount > 0 && !isNaN(parsedAmount));
  const isAmountError = amountInput !== '' && !isAmountValid;
  const displayAmount = isAmountValid && parsedAmount > 0 ? parsedAmount : 0;

  const upiLink = buildUpiLink(UPI_ID, UPI_NAME, displayAmount, note);

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'Pay NØIRÉ',
        text: `Pay${displayAmount > 0 ? ` ₹${displayAmount.toFixed(2)}` : ''} to ${UPI_ID}`,
        url: upiLink,
      });
    } catch { /* user cancelled */ }
  };

  /* ── Show QR screen ── */
  if (step === 'show') {
    return (
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 flex flex-col items-center gap-5">
        <p className="text-xs font-mono text-[#5A5651] uppercase tracking-widest text-center">
          Show this code to receive payment
        </p>

        <div className="bg-white p-3 rounded-xl shadow-lg">
          <QRCodeSVG value={upiLink} size={200} level="M" marginSize={0} />
        </div>

        <div className="text-center space-y-1">
          {displayAmount > 0 ? (
            <p className="text-[#F5F2EE] font-mono text-3xl font-bold tracking-tight">
              ₹{displayAmount.toFixed(2)}
            </p>
          ) : (
            <p className="text-[#F5F2EE] font-mono text-xl font-bold">Scan to Pay</p>
          )}
          <p className="text-[#5A5651] text-xs font-mono">{UPI_ID}</p>
          {note && <p className="text-[#5A5651] text-xs">{note}</p>}
        </div>

        <p className="text-[#5A5651] text-xs text-center leading-relaxed max-w-xs">
          Open any UPI app — GPay, PhonePe, Paytm — scan this code and pay the exact amount above.
        </p>

        <div className="flex gap-3 w-full">
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#2A2A2A] text-[#F5F2EE] py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-colors"
            >
              Share QR
            </button>
          )}
          <button
            type="button"
            onClick={() => setStep('enter')}
            className="flex-1 border border-[#2A2A2A] text-[#5A5651] hover:text-[#F5F2EE] hover:border-[#5A5651] py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-colors"
          >
            Edit Amount
          </button>
        </div>
      </div>
    );
  }

  /* ── Enter Amount screen ── */
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 space-y-5">
      <p className="text-xs font-mono text-[#5A5651] uppercase tracking-widest">Generate QR Code</p>

      {/* Amount */}
      <div>
        <label className={labelClass}>Amount (Optional)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5651] font-mono text-sm select-none">₹</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="0.00"
            className={`${inputClass} pl-8 pr-10 ${isAmountError ? 'border-red-500' : ''}`}
          />
          {amountInput && (
            <button
              type="button"
              onClick={() => setAmountInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5651] hover:text-[#F5F2EE] text-xl leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>
        {isAmountError && <p className="text-red-400 text-xs mt-1">Enter a valid amount greater than 0</p>}
      </div>

      {/* Quick amount chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setAmountInput(String(amt))}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              amountInput === String(amt)
                ? 'bg-[#FF4500] border-[#FF4500] text-white'
                : 'border-[#2A2A2A] text-[#5A5651] hover:border-[#FF4500] hover:text-[#F5F2EE]'
            }`}
          >
            ₹{amt}
          </button>
        ))}
      </div>

      {/* Note */}
      <div>
        <label className={labelClass}>Note (Optional)</label>
        <div className="relative">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Noire Order"
            className={`${inputClass} pr-10`}
          />
          {note && (
            <button
              type="button"
              onClick={() => setNote('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5651] hover:text-[#F5F2EE] text-xl leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep('show')}
        disabled={isAmountError}
        className="w-full bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-full font-medium text-sm transition-colors"
      >
        Generate QR Code
      </button>
    </div>
  );
}

/* ─── Confirmation screen ─── */
function Confirmation({ orderNumber, email }) {
  return (
    <div
      className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 py-20 text-center"
      style={{ animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
    >
      <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 14l6 6 10-10" stroke="#FF4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className="text-xs font-mono text-[#FF4500] tracking-[0.2em] uppercase mb-3">Order Received</p>

      <h1
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        className="text-5xl md:text-6xl text-[#F5F2EE] leading-none mb-4"
      >
        We&apos;ve Got Your Order
      </h1>

      <p className="text-[#5A5651] text-sm leading-relaxed max-w-md mb-8">
        Your payment is being verified. Once confirmed (usually within a few hours), you'll get an update at{' '}
        <span className="text-[#F5F2EE]">{email}</span>.
      </p>

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl px-8 py-5 mb-10">
        <p className="text-xs text-[#5A5651] font-mono uppercase tracking-widest mb-1">Order Reference</p>
        <p className="font-mono text-2xl font-bold text-[#FF4500]">{orderNumber}</p>
      </div>

      <Link
        to="/shop"
        className="text-xs text-[#5A5651] hover:text-[#F5F2EE] tracking-[0.15em] uppercase transition-colors"
      >
        ← Continue Shopping
      </Link>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Main page ─── */
export default function UPICheckout() {
  const { items: cartItems, subtotal: cartSubtotal, discount, total: cartTotal, clearCart } = useCart();

  /* Use dummy data when cart is empty (for testing) */
  const usingDummy = cartItems.length === 0;
  const items    = usingDummy ? DUMMY_ITEMS : cartItems;
  const subtotal = usingDummy ? DUMMY_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0) : cartSubtotal;
  const total    = usingDummy ? subtotal : cartTotal;

  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', country: 'India', postal: '',
    utr: '',
  });

  const shippingCost = subtotal >= 5000 ? 0 : 499;
  const orderTotal = useMemo(() => total + shippingCost, [total, shippingCost]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim())   e.phone   = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim())    e.city    = 'Required';
    if (!form.country.trim()) e.country = 'Required';
    if (!form.postal.trim())  e.postal  = 'Required';
    if (!form.utr.trim())                e.utr = 'Enter the UTR / transaction reference number after paying';
    else if (form.utr.trim().length < 8) e.utr = 'UTR looks too short — double-check';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');

    const orderNumber = 'NR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const { error } = await supabase.from('orders').insert({
        order_number:     orderNumber,
        customer_name:    form.name.trim(),
        customer_email:   form.email.trim(),
        customer_phone:   form.phone.trim(),
        shipping_address: {
          address: form.address.trim(),
          city:    form.city.trim(),
          country: form.country.trim(),
          postal:  form.postal.trim(),
        },
        items: items.map((item) => ({
          id: item.id, name: item.name, price: item.price,
          quantity: item.quantity, size: item.size,
          color: item.color, image: item.image,
        })),
        subtotal,
        shipping:         shippingCost,
        discount,
        total:            orderTotal,
        payment_method:   'upi',
        utr_number:       form.utr.trim(),
        payment_status:   'pending_verification',
        fulfillment_status: 'pending',
      });

      if (error) throw error;

      clearCart();
      setConfirmed({ orderNumber, email: form.email.trim() });
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── empty cart ── */
  if (items.length === 0 && !confirmed) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-5xl text-[#F5F2EE] mb-4">
          Your Bag Is Empty
        </h1>
        <p className="text-[#5A5651] text-sm mb-8">Add some items before checking out.</p>
        <Link
          to="/shop"
          className="bg-[#FF4500] hover:bg-[#CC3700] text-white px-8 py-3 rounded-full font-medium transition-colors text-sm"
        >
          Shop Now
        </Link>
      </main>
    );
  }

  /* ── confirmation ── */
  if (confirmed) return <Confirmation orderNumber={confirmed.orderNumber} email={confirmed.email} />;

  /* ── checkout ── */
  return (
    <main className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono text-[#FF4500] tracking-[0.2em] uppercase mb-2">Nøiré</p>
          <h1
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-5xl sm:text-6xl text-[#F5F2EE] leading-none"
          >
            Pay with UPI
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

            {/* ── Left: QR + details ── */}
            <div className="lg:col-span-3 space-y-8">

              {/* UPI QR — enter amount → show QR */}
              <UPIBlock defaultAmount={orderTotal} />

              {/* UTR field */}
              <Field label="UPI Transaction Reference (UTR) *" error={errors.utr}>
                <FormInput
                  field="utr"
                  placeholder="e.g. 403618XXXXXXXXX"
                  value={form.utr}
                  onChange={update}
                  error={errors.utr}
                />
                <p className="text-[#5A5651] text-xs mt-1.5">
                  Find this in your UPI app under transaction history after paying.
                </p>
              </Field>

              <div className="border-t border-[#1E1E1E]" />

              {/* Contact */}
              <div className="space-y-4">
                <p className="text-xs font-mono text-[#5A5651] uppercase tracking-widest">Contact</p>
                <Field label="Full Name *" error={errors.name}>
                  <FormInput field="name" placeholder="Your name" value={form.name} onChange={update} error={errors.name} />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <FormInput field="email" type="email" placeholder="you@email.com" value={form.email} onChange={update} error={errors.email} />
                </Field>
                <Field label="Phone *" error={errors.phone}>
                  <FormInput field="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update} error={errors.phone} />
                </Field>
              </div>

              {/* Shipping */}
              <div className="space-y-4">
                <p className="text-xs font-mono text-[#5A5651] uppercase tracking-widest">Shipping Address</p>
                <Field label="Street Address *" error={errors.address}>
                  <FormInput field="address" placeholder="123, Street Name, Area" value={form.address} onChange={update} error={errors.address} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City *" error={errors.city}>
                    <FormInput field="city" placeholder="Mumbai" value={form.city} onChange={update} error={errors.city} />
                  </Field>
                  <Field label="PIN Code *" error={errors.postal}>
                    <FormInput field="postal" placeholder="400001" value={form.postal} onChange={update} error={errors.postal} />
                  </Field>
                </div>
                <Field label="Country *" error={errors.country}>
                  <FormInput field="country" placeholder="India" value={form.country} onChange={update} error={errors.country} />
                </Field>
              </div>

              {submitError && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-full font-medium text-sm transition-colors"
              >
                {submitting ? 'Placing Order…' : 'Confirm Order'}
              </button>

              <p className="text-[#5A5651] text-xs text-center leading-relaxed">
                Your order will be confirmed once we verify your payment (usually within a few hours).
              </p>
            </div>

            {/* ── Right: order summary ── */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 sticky top-24">
                <p className="text-xs font-mono text-[#5A5651] uppercase tracking-widest mb-5">Order Summary</p>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-3">
                      <div
                        className="w-12 h-14 rounded-md shrink-0 border border-[#2A2A2A]"
                        style={{ background: item.image?.startsWith('http') ? `url(${item.image}) center/cover` : item.image }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F5F2EE] font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-[#5A5651] mt-0.5">{item.size} / {item.color} × {item.quantity}</p>
                      </div>
                      <p className="font-mono text-sm text-[#F5F2EE] font-bold shrink-0">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#2A2A2A] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A5651]">Subtotal</span>
                    <span className="font-mono text-[#F5F2EE]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount</span>
                      <span className="font-mono text-green-400">−₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A5651]">Shipping</span>
                    <span className="font-mono text-[#F5F2EE]">
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-3 border-t border-[#2A2A2A]">
                    <span className="text-[#F5F2EE]">Total</span>
                    <span className="font-mono text-[#FF4500] text-lg">₹{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </main>
  );
}
