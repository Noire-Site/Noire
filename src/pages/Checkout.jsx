/* TEAM 4 — Checkout: Multi-step form with promo code, order summary, confirmation */
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../utils/supabase';

const WHATSAPP_NUMBER = '918826359848';

function generateOrderId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NR-${date}-${rand}`;
}

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

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const steps = ['Details', 'Shipping', 'Payment'];

export default function Checkout() {
  const { items, subtotal, discount, total, promoCode, promoData, applyPromo, removePromo, incrementPromoUses, clearCart, itemCount } = useCart();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);

  const shippingCost = 0;
  const orderTotal = useMemo(() => total, [total]);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    flat_number: '', apartment: '', landmark: '', street: '', city: '', state: '', pincode: '',
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
            phone:       prev.phone       || addr.phone       || '',
            flat_number: prev.flat_number || addr.flat_number || '',
            apartment:   prev.apartment   || addr.apartment   || '',
            landmark:    prev.landmark    || addr.landmark    || '',
            street:      prev.street      || addr.street      || '',
            city:        prev.city        || addr.city        || '',
            state:       prev.state       || addr.state       || '',
            pincode:     prev.pincode     || addr.pincode     || '',
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
        .eq('street', form.street)
        .eq('city', form.city)
        .eq('pincode', form.pincode)
        .limit(1);

      if (existing && existing.length > 0) return;

      // Save new address
      await supabase.from('addresses').insert({
        user_id:     user.id,
        name:        form.name,
        phone:       form.phone,
        flat_number: form.flat_number,
        apartment:   form.apartment,
        landmark:    form.landmark,
        street:      form.street,
        city:        form.city,
        state:       form.state,
        pincode:     form.pincode,
        is_default:  true,
      });

      // Set other addresses as non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('street', form.street);
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
      if (!form.flat_number.trim()) errs.flat_number = 'Flat / House Number is required';
      if (!form.street.trim()) errs.street = 'Street / Area is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.state) errs.state = 'State is required';
      if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = 'Pincode must be exactly 6 digits';
    }
    // Step 2 (Payment) — no validation needed, QR is auto-generated
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
    setPlacing(true);
    setSaveError('');

    const orderId = generateOrderId();
    const shippingText = [
      form.flat_number,
      form.apartment,
      form.landmark,
      form.street,
      form.city,
      form.state,
      form.pincode,
    ].filter(Boolean).join(', ');

    const { error } = await supabase.from('orders').insert({
      order_id:         orderId,
      customer_name:    form.name,
      customer_email:   form.email,
      customer_phone:   form.phone,
      shipping_address: shippingText,
      flat_number:      form.flat_number,
      apartment:        form.apartment   || null,
      landmark:         form.landmark    || null,
      street:           form.street,
      city:             form.city,
      state:            form.state,
      pincode:          form.pincode,
      items: items.map(item => ({
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount:     orderTotal,
      status:           'pending',
      promo_code:       promoCode || null,
      discount_amount:  discount || 0,
    });

    if (error) {
      console.error('Supabase order insert error:', error);
      setSaveError(`Error: ${error.message || error.code || 'Unknown error'}`);
      setPlacing(false);
      return;
    }

    // Atomically increment the promo code's uses_count
    await incrementPromoUses();

    // Fire order notification email (non-blocking — don't fail checkout if email fails)
    fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        shippingAddress: shippingText,
        flat_number: form.flat_number,
        apartment: form.apartment,
        landmark: form.landmark,
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        items: items.map(item => ({ name: item.name, size: item.size, color: item.color, quantity: item.quantity, price: item.price })),
        total: orderTotal,
      }),
    }).catch(err => console.warn('Email notification failed:', err));

    clearCart();
    setOrderNumber(orderId);
    setPlacing(false);
  };

  const handlePromo = async () => {
    const result = await applyPromo(promoInput);
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
    const waMessage = `Hi, my Order ID is ${orderNumber}`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-5xl sm:text-6xl mb-2 text-brand-black dark:text-brand-offwhite">ALMOST THERE</h1>
        <p className="text-brand-gray mb-8">To confirm your order, message us on WhatsApp.</p>

        {/* Order ID box */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-6 mb-8">
          <p className="text-xs text-brand-gray font-mono uppercase tracking-widest mb-2">Order ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold text-brand-orange">{orderNumber}</span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md bg-brand-gray-light dark:bg-[#2A2A2A] hover:bg-brand-orange/10 transition-colors"
              title="Copy Order ID"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* WhatsApp QR */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-6 mb-4">
          <div className="bg-white p-3 rounded-xl inline-block mb-4">
            <QRCodeSVG value={waUrl} size={180} level="M" />
          </div>
          <p className="text-sm text-brand-gray mb-5 leading-relaxed">
            Scan this QR code or click the button below to send us your Order ID on WhatsApp to confirm your order.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3 rounded-pill font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.522 5.828L0 24l6.336-1.5A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.869 9.869 0 01-5.031-1.378l-.361-.214-3.741.885.939-3.619-.235-.373A9.865 9.865 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/>
            </svg>
            Message us on WhatsApp
          </a>
        </div>

        {/* Apology note */}
        <div className="bg-white/5 dark:bg-[#1A1A1A]/50 border border-brand-gray-light/30 dark:border-[#2A2A2A] rounded-card px-5 py-4 mb-8 text-left">
          <p className="text-xs text-brand-gray leading-relaxed">
            We apologize for the inconvenience — we're currently setting up payments on our website. In the meantime, please send us your Order ID on WhatsApp and we'll confirm your order manually as soon as possible. Thank you for your patience.
          </p>
        </div>

        <Link to="/shop" className="text-sm text-brand-gray hover:text-brand-orange transition-colors">
          ← Continue Shopping
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
                {i < steps.length - 1 && <div className={`w-12 sm:w-20 h-px mx-3 transition-colors duration-500 ${i < step ? 'bg-brand-orange' : 'bg-brand-gray-light dark:bg-[#2A2A2A]'}`} />}
              </div>
            ))}
          </div>

          {/* Step content — keyed so it re-mounts on step change, triggering animate-step-in */}
          <div key={step} className="animate-step-in">

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
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Flat / House Number *" field="flat_number" placeholder="B-204" form={form} errors={errors} update={update} />
                <InputField label="Apartment / Building Name" field="apartment" placeholder="Sunshine Heights" form={form} errors={errors} update={update} />
              </div>
              <InputField label="Landmark" field="landmark" placeholder="Near City Mall" form={form} errors={errors} update={update} />
              <InputField label="Street / Area *" field="street" placeholder="MG Road, Koramangala" form={form} errors={errors} update={update} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="City *" field="city" placeholder="Bengaluru" form={form} errors={errors} update={update} />
                <div>
                  <label className="block text-sm font-medium mb-1.5">State *</label>
                  <select
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border rounded-card text-brand-black dark:text-brand-offwhite focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${
                      errors.state ? 'border-red-500' : 'border-brand-gray-light dark:border-[#2A2A2A]'
                    }`}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
              </div>
              <InputField label="Pincode *" field="pincode" type="number" placeholder="560001" form={form} errors={errors} update={update} />
            </div>
          )}

          {/* Step 3: Review & Place */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-5">
                <p className="text-xs font-mono uppercase tracking-widest text-brand-gray mb-3">Delivering to</p>
                <p className="text-sm font-medium">{form.name}</p>
                <p className="text-sm text-brand-gray">
                  {[form.flat_number, form.apartment].filter(Boolean).join(', ')}
                </p>
                {form.landmark && <p className="text-sm text-brand-gray">Near {form.landmark}</p>}
                <p className="text-sm text-brand-gray">
                  {form.street}, {form.city}, {form.state} – {form.pincode}
                </p>
                <p className="text-sm text-brand-gray">{form.phone}</p>
              </div>
              <div className="bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card p-5 space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-brand-gray mb-1">Items</p>
                {items.map(item => (
                  <div key={item.key} className="flex justify-between items-center text-sm">
                    <span className="text-brand-gray line-clamp-1 flex-1 mr-4">{item.name} <span className="text-xs">× {item.quantity}</span></span>
                    <span className="font-mono font-medium shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="font-mono text-brand-orange">₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-brand-gray text-center">After placing, you'll receive a WhatsApp link to confirm your order with us.</p>
            </div>
          )}

          </div>{/* end keyed step content */}

          {/* Navigation */}
          {saveError && (
            <p className="mt-6 text-sm text-red-500 text-center">{saveError}</p>
          )}
          <div className="flex gap-3 mt-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={placing}
                className="px-6 py-3 border-2 border-brand-gray-light dark:border-[#2A2A2A] rounded-pill font-medium hover:border-brand-orange transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={placing}
              className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white py-3 rounded-pill font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100"
            >
              {placing ? 'Placing Order…' : step === 2 ? 'Place Order' : 'Continue'}
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
                <div className="flex items-center justify-between bg-brand-orange/10 px-3 py-2 rounded-md">
                  <span className="text-sm font-mono text-brand-orange">{promoCode} applied</span>
                  <button onClick={removePromo} className="text-xs text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors">Remove</button>
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
                  <span>Discount ({promoCode})</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                <span>Total</span>
                <span className="font-mono">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
