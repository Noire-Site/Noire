/* TEAM 5 — Contact Page: Form with validation, social links, FAQ accordion */
import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { supabase } from '../utils/supabase';

function FadeIn({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

const faqs = [
  { q: 'How long does shipping take?', a: 'Standard shipping is 4-7 business days. Express is 2-3 business days. Free shipping on orders over ₹5000.' },
  { q: 'What\'s your return policy?', a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to over 40 countries. International shipping is calculated at checkout.' },
  { q: 'How do I track my order?', a: 'You\'ll receive a tracking number via email once your order ships. You can also check your order status on our website.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 2 hours of placement. After that, we can\'t guarantee changes.' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Send contact form to your inbox
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: 'agamjot@noire.co.in',
          subject: `Contact Form: ${form.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2 style="font-size: 20px;">New Contact Message</h2>
              <p><strong>From:</strong> ${form.name} (${form.email})</p>
              <p><strong>Subject:</strong> ${form.subject}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
              <p style="white-space: pre-wrap;">${form.message}</p>
            </div>
          `,
        },
      });

      // Auto-reply to the customer
      await supabase.functions.invoke('send-email', {
        body: {
          to: form.email,
          subject: 'We got your message — Nøiré',
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2 style="font-size: 20px;">Thanks for reaching out, ${form.name}!</h2>
              <p>We've received your message and will get back to you within 24 hours.</p>
              <p style="color: #666; margin-top: 24px;">— Nøiré Team</p>
            </div>
          `,
        },
      });
    } catch (e) {
      console.error('Email send failed:', e);
    }

    setSubmitted(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <FadeIn>
        <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Get in touch</span>
        <h1 className="font-heading text-5xl sm:text-6xl mt-2 mb-4">CONTACT US</h1>
        <p className="text-brand-gray max-w-xl mb-12">Got a question, feedback, or just want to say what's up? We're all ears.</p>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Form */}
        <FadeIn>
          {submitted ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl mb-2">MESSAGE SENT!</h2>
              <p className="text-brand-gray">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Name', field: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'Email', field: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Subject', field: 'subject', type: 'text', placeholder: 'What\'s this about?' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setErrors(prev => ({ ...prev, [field]: '' })); }}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border rounded-card placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all ${errors[field] ? 'border-red-500' : 'border-brand-gray-light dark:border-[#2A2A2A]'}`}
                  />
                  {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => { setForm(prev => ({ ...prev, message: e.target.value })); setErrors(prev => ({ ...prev, message: '' })); }}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border rounded-card placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all resize-none ${errors.message ? 'border-red-500' : 'border-brand-gray-light dark:border-[#2A2A2A]'}`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-3.5 rounded-pill font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                Send Message
              </button>
            </form>
          )}

          {/* Social Links */}
          <div className="mt-8 pt-8 border-t border-brand-gray-light dark:border-[#2A2A2A]">
            <p className="text-sm text-brand-gray mb-4">Or find us on social:</p>
            <div className="flex gap-4">
              {['Instagram', 'Twitter / X', 'TikTok'].map(platform => (
                <a key={platform} href="#" className="text-sm text-brand-gray hover:text-brand-orange transition-colors">
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* FAQ */}
        <FadeIn>
          <h2 className="font-heading text-3xl mb-6">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-brand-gray-light dark:border-[#2A2A2A] rounded-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-gray-lighter dark:hover:bg-[#1A1A1A] transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-brand-gray leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
