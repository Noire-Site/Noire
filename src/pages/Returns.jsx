/* TEAM 4 — Returns & Exchanges Page: Clean policy layout */
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';

function FadeIn({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

export default function Returns() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <FadeIn>
        <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Policies</span>
        <h1 className="font-heading text-5xl sm:text-6xl mt-2 mb-8">RETURNS & EXCHANGES</h1>
      </FadeIn>

      <div className="space-y-8">
        <FadeIn>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
            <h2 className="font-heading text-2xl mb-3">RETURN POLICY</h2>
            <div className="space-y-3 text-sm text-brand-gray leading-relaxed">
              <p>Not feeling it? No hard feelings. We accept returns within <strong className="text-brand-black dark:text-brand-offwhite">30 days</strong> of delivery.</p>
              <p>Items must be:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Unworn and unwashed</li>
                <li>In original packaging with tags attached</li>
                <li>Free of perfume, deodorant, or pet hair</li>
              </ul>
              <p>Sale items are <strong className="text-brand-black dark:text-brand-offwhite">final sale</strong> and cannot be returned.</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
            <h2 className="font-heading text-2xl mb-3">HOW TO RETURN</h2>
            <ol className="space-y-3 text-sm text-brand-gray leading-relaxed">
              <li className="flex gap-3">
                <span className="font-mono font-bold text-brand-orange shrink-0">01</span>
                <span>Email us at <span className="text-brand-orange">returns@nøiré.com</span> with your order number and reason for return.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono font-bold text-brand-orange shrink-0">02</span>
                <span>We'll send you a prepaid shipping label within 24 hours.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono font-bold text-brand-orange shrink-0">03</span>
                <span>Pack it up, drop it off, and we'll process your refund within 5-7 business days.</span>
              </li>
            </ol>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
            <h2 className="font-heading text-2xl mb-3">EXCHANGES</h2>
            <div className="space-y-3 text-sm text-brand-gray leading-relaxed">
              <p>Need a different size or color? We've got you.</p>
              <p>Email us at <span className="text-brand-orange">exchanges@nøiré.com</span> and we'll sort it out. Exchanges are subject to availability — our drops are limited, so act fast.</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
            <h2 className="font-heading text-2xl mb-3">DAMAGED OR DEFECTIVE?</h2>
            <div className="space-y-3 text-sm text-brand-gray leading-relaxed">
              <p>If your item arrived damaged or defective, we'll replace it or give you a full refund — no questions asked. Just hit us up within 7 days of delivery with photos of the issue.</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="text-center pt-8">
            <p className="text-brand-gray mb-4">Still have questions?</p>
            <Link to="/contact" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-pill font-medium transition-colors">
              Contact Us
            </Link>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
