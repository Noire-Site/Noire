/* TEAM 4 — Checkout: Multi-step form with promo code, order summary, confirmation */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../utils/supabase';

const InputField = ({ label, field, type = 'text', placeholder, form, errors, update }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    <input
      type={type}
      value={form[field]}
      onChange={(e) => update(field, e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${
        errors[field] ? 'border-red-500' : 'border-brand-gray-light dark:border-[#2A2A2A]'
      }`}
    />
    {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
  </div>
);

const steps = ['Details', 'Shipping', 'Payment'];

export default function Checkout() {
  const { items, subtotal, discount, total, promoCode, applyPromo, removePromo, clearCart, itemCount } = useCart();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', country: '', postal: '',
    cardNumber: '', expiry: '', cvv: '',
  });

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Pre-fill form with user data from Clerk/Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedIn || !user) return;
      
      // Pre-fill name and email from Clerk
      setForm(prev => ({
        ...prev,
        name: prev.name || user.fullName || '',
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
      }));

      // Load saved address from Supabase
      try {
        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .limit(1);

        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          setForm(prev => ({
            ...prev,
            phone: prev.phone || addr.phone || '',
            address: prev.address || addr.street || '',
            city: prev.city || addr.city || '',
            country: prev.country || addr.country || '',
            postal: prev.postal || addr.postal || '',
          }));
        }
      } catch (e) {
        console.error('Failed to load saved address:', e);
      }
    };

    loadUserData();
  }, [isSignedIn, user]);

  // Save user info to Supabase after they complete shipping step
  const saveUserAddress = async () => {
    if (!isSignedIn || !user) return;
    
    try {
      // Check if address already exists
      const { data: existing } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('street', form.address)
        .eq('city', form.city)
        .eq('postal', form.postal)
        .limit(1);

      if (existing && existing.length > 0) return; // Already saved

      // Save new address
      await supabase.from('addresses').insert({
        user_id: user.id,
        name: form.name,
        phone: form.phone,
        street: form.address,
        city: form.city,
        country: form.country,
        postal: form.postal,
        is_default: true,
      });

      // Set other addresses as non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('street', form.address);
    } catch (e) {
      console.error('Failed to save address:', e);
    }
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.name.trim()) errs.name = 'Name is required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
      if (!form.phone.trim()) errs.phone = 'Phone is required';
    }
    if (step === 1) {
      if (!form.address.trim()) errs.address = 'Address is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.country.trim()) errs.country = 'Country is required';
      if (!form.postal.trim()) errs.postal = 'PIN code is required';
    }
    if (step === 2) {
      if (!form.cardNumber.trim() || form.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Valid card number is required';
      if (!form.expiry.trim() || !/^\d{2}\/\d{2}$/.test(form.expiry)) errs.expiry = 'MM/YY format required';
      if (!form.cvv.trim() || form.cvv.length < 3) errs.cvv = 'Valid CVV is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    // Require login before proceeding to payment (after shipping step)
    if (step === 1 && !isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    
    // Save address when moving from shipping to payment
    if (step === 1 && isSignedIn) {
      saveUserAddress();
    }
    
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    const num = 'NR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderNumber(num);

    // Send order confirmation email
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: form.email,
          subject: `Order Confirmed — ${num}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="font-size: 24px;">Order Confirmed ✓</h1>
              <p>Hi ${form.name},</p>
              <p>Thanks for shopping with <strong>Nøiré</strong>. Your order <strong>${num}</strong> has been confirmed.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; color: #666;">Items</td>
                  <td style="padding: 8px 0; text-align: right;">${items.length} item${items.length > 1 ? 's' : ''}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; color: #666;">Total</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Shipping to</td>
                  <td style="padding: 8px 0; text-align: right;">${form.address}, ${form.city} ${form.postal}</td>
                </tr>
              </table>
              <p style="color: #666; font-size: 14px;">We'll send you a tracking number once your order ships.</p>
              <p style="margin-top: 24px;">— Nøiré Team</p>
            </div>
          `,
        },
      });
    } catch (e) {
      console.error('Email send failed:', e);
    }

    clearCart();
  };

  const handlePromo = () => {
    const result = applyPromo(promoInput);
    setPromoMsg(result.message);
  };

  // Empty cart redirect
  if (items.length === 0 && !orderNumber) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-4xl mb-4">YOUR BAG IS EMPTY</h1>
        <p className="text-brand-gray mb-6">Add some items before checking out.</p>
        <Link to="/shop" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-pill font-medium transition-colors">
          Shop Now
        </Link>
      </main>
    );
  }

  // Order confirmation
  if (orderNumber) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl mb-2">ORDER CONFIRMED</h1>
          <p className="text-brand-gray">Thanks for shopping with Nøiré.</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6 mb-8">
          <p className="text-sm text-brand-gray mb-1">Order Number</p>
          <p className="font-mono text-2xl font-bold text-brand-orange">{orderNumber}</p>
          <p className="text-sm text-brand-gray mt-4">We'll send a confirmation email to <strong>{form.email}</strong></p>
        </div>
        <Link to="/shop" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-pill font-medium transition-colors">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <>
      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative bg-brand-offwhite dark:bg-brand-black rounded-2xl shadow-2xl max-w-md w-full p-8">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-brand-black dark:text-brand-offwhite mb-2">
                Sign In to Continue
              </h2>
              <p className="text-brand-gray mb-6">
                Please sign in or create an account to complete your purchase. We'll save your details for faster checkout next time.
              </p>

              <div className="space-y-3">
                <SignInButton mode="modal">
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-medium rounded-pill transition-colors"
                  >
                    Sign In
                  </button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="w-full py-3 px-4 border-2 border-brand-black dark:border-brand-offwhite text-brand-black dark:text-brand-offwhite font-medium rounded-pill hover:bg-brand-black hover:text-brand-offwhite dark:hover:bg-brand-offwhite dark:hover:text-brand-black transition-colors"
                  >
                    Create Account
                  </button>
                </SignUpButton>
              </div>

              <p className="mt-6 text-xs text-brand-gray">
                Your cart and details will be saved.
              </p>
            </div>
          </div>
        </div>
      )}

    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/shop" className="text-sm text-brand-gray hover:text-brand-orange transition-colors mb-6 inline-block">← Continue Shopping</Link>
      <h1 className="font-heading text-4xl sm:text-5xl mb-8">CHECKOUT</h1>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Progress */}
          <div className="flex items-center mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-mono font-bold transition-colors ${
                  i <= step ? 'bg-brand-orange text-white' : 'bg-brand-gray-light dark:bg-[#2A2A2A] text-brand-gray'
                }`}>
                  {i + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${i <= step ? 'text-brand-black dark:text-brand-offwhite' : 'text-brand-gray'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-12 sm:w-20 h-px mx-3 ${i < step ? 'bg-brand-orange' : 'bg-brand-gray-light dark:bg-[#2A2A2A]'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 0 && (
            <div className="space-y-4">
              <InputField label="Full Name" field="name" placeholder="John Doe" form={form} errors={errors} update={update} />
              <InputField label="Email" field="email" type="email" placeholder="john@email.com" form={form} errors={errors} update={update} />
              <InputField label="Phone" field="phone" type="tel" placeholder="+91 98765 43210" form={form} errors={errors} update={update} />
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 1 && (
            <div className="space-y-4">
              <InputField label="Street Address" field="address" placeholder="123 Main St" form={form} errors={errors} update={update} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="City" field="city" placeholder="New York" form={form} errors={errors} update={update} />
                <InputField label="Country" field="country" placeholder="India" form={form} errors={errors} update={update} />
              </div>
              <InputField label="PIN Code" field="postal" placeholder="110001" form={form} errors={errors} update={update} />
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-4 mb-4">
                <p className="text-xs text-brand-gray font-mono uppercase tracking-wider mb-2">💳 This is a demo — no real payment will be processed</p>
              </div>
              <InputField label="Card Number" field="cardNumber" placeholder="4242 4242 4242 4242" form={form} errors={errors} update={update} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Expiry" field="expiry" placeholder="12/28" form={form} errors={errors} update={update} />
                <InputField label="CVV" field="cvv" placeholder="123" form={form} errors={errors} update={update} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-brand-gray-light dark:border-[#2A2A2A] rounded-pill font-medium hover:border-brand-orange transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white py-3 rounded-pill font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              {step === 2 ? 'Place Order' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6 sticky top-24">
            <h2 className="font-heading text-xl mb-4">ORDER SUMMARY</h2>
            <div className="space-y-3 mb-6">
              {items.map(item => (
                <div key={item.key} className="flex gap-3">
                  <div className="w-12 h-14 rounded-md shrink-0" style={{ background: item.image }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-brand-gray">{item.size} / {item.color} × {item.quantity}</p>
                  </div>
                  <p className="font-mono text-sm font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] pt-4 mb-4">
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                  <span className="text-sm font-mono text-green-700 dark:text-green-400">{promoCode} applied</span>
                  <button onClick={removePromo} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 text-sm bg-transparent border border-brand-gray-light dark:border-[#2A2A2A] rounded-md focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      aria-label="Promo code"
                    />
                    <button onClick={handlePromo} className="text-sm font-medium text-brand-orange hover:text-brand-orange-hover transition-colors">Apply</button>
                  </div>
                  <p className="text-xs text-brand-gray mt-1">Try NOIRE20 for 20% off.</p>
                </div>
              )}
              {promoMsg && !promoCode && <p className="text-xs text-red-500 mt-1">{promoMsg}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-brand-gray-light dark:border-[#2A2A2A] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray">Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount (20%)</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray">Shipping</span>
                <span className="font-mono">{subtotal >= 5000 ? 'Free' : '₹499'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                <span>Total</span>
                <span className="font-mono">₹{(total + (subtotal >= 5000 ? 0 : 499)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
