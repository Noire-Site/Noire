/* Terms & Conditions Page */
import { Link } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-xl sm:text-2xl mb-4 pl-4 border-l-4 border-brand-orange text-brand-black dark:text-brand-offwhite tracking-wide">
        {title}
      </h2>
      <div className="text-[15px] leading-[1.7] text-brand-gray dark:text-gray-300 space-y-3 pl-4">
        {children}
      </div>
    </section>
  );
}

function OrangeLink({ href, children }) {
  return (
    <a href={href} className="text-brand-orange hover:underline">
      {children}
    </a>
  );
}

export default function Terms() {
  return (
    <main className="bg-brand-offwhite dark:bg-brand-black min-h-screen py-12 sm:py-20 transition-colors duration-300">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-brand-gray hover:text-brand-orange transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Nøiré
        </Link>

        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Legal</span>
          <h1 className="font-heading text-4xl sm:text-5xl mt-2 mb-3 text-brand-black dark:text-brand-offwhite">TERMS &amp; CONDITIONS</h1>
          <p className="text-sm text-brand-gray font-mono">Last updated: March 2025</p>
        </div>

        <p className="text-[15px] leading-[1.7] text-brand-gray dark:text-gray-300 mb-10">
          Please read these Terms and Conditions carefully before using noire.co.in or placing an order.
          By using our website or purchasing from us, you agree to these terms.
        </p>

        <Section title="1. ABOUT US">
          <p>
            Nøiré Apparel Private Limited is a clothing brand registered in India, operating under Indian law.
          </p>
        </Section>

        <Section title="2. USING OUR WEBSITE">
          <p>By accessing noire.co.in you agree to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use the website only for lawful purposes</li>
            <li>Not attempt to hack, disrupt, or interfere with our website or servers</li>
            <li>Not scrape, copy, or reproduce our content without written permission</li>
            <li>Provide accurate information when creating an account or placing an order</li>
            <li>Keep your account password secure and not share it with others</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate your access at any time if you violate these terms.
          </p>
        </Section>

        <Section title="3. PLACING AN ORDER">
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Order Acceptance: </span>
            Your order is only accepted once you receive an order confirmation email from us. We reserve
            the right to refuse or cancel any order at our discretion.
          </p>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Pricing: </span>
            All prices are listed in Indian Rupees (₹) and are inclusive of GST. The price at the time
            of your order confirmation is the price you pay.
          </p>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Payment: </span>
            We accept payments via Razorpay including UPI, credit/debit cards, netbanking, and wallets.
            We do not store your payment information.
          </p>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Order Cancellation: </span>
            You may cancel your order within 24 hours of placing it by emailing{' '}
            <OrangeLink href="mailto:support@noire.co.in">support@noire.co.in</OrangeLink>.
            Once your order has been dispatched it cannot be cancelled.
          </p>
        </Section>

        <Section title="4. SHIPPING AND DELIVERY">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>We ship across India via our logistics partners</li>
            <li>Estimated delivery: 2–7 business days depending on your location</li>
            <li>Delivery times are estimates and not guarantees</li>
            <li>We are not responsible for delays caused by courier partners or circumstances beyond our control</li>
            <li>
              You are responsible for providing an accurate delivery address. We are not liable for orders
              sent to an incorrect address provided by you
            </li>
          </ul>
        </Section>

        <Section title="5. RETURNS AND EXCHANGES">
          <p className="font-medium text-brand-black dark:text-brand-offwhite">Eligibility:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Exchange requests must be made within 7 days of delivery</li>
            <li>Items must be unworn, unwashed, and in original condition with tags intact</li>
            <li>Sale items are not eligible for return or exchange</li>
            <li>Defective or incorrect items are eligible for full return or replacement</li>
          </ul>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Process: </span>
            Email <OrangeLink href="mailto:support@noire.co.in">support@noire.co.in</OrangeLink> with
            your order number and photos of the item. We will arrange a reverse pickup within 2–3 business
            days of approval.
          </p>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Refunds: </span>
            Processed within 7–10 business days of receiving the returned item.
          </p>
        </Section>

        <Section title="6. PRODUCTS">
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Print on Demand: </span>
            Minor variations in colour, print placement (±0.5 inch), and fabric texture may occur between
            orders. These are inherent to the print-on-demand process and do not constitute a defect.
          </p>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Size: </span>
            Please refer to our{' '}
            <Link to="/size-guide" className="text-brand-orange hover:underline">Size Guide</Link>{' '}
            before ordering. We are not responsible for incorrect sizing if you ordered using the measurements
            provided in our Size Guide.
          </p>
        </Section>

        <Section title="7. INTELLECTUAL PROPERTY">
          <p>
            All content on noire.co.in including our logo, brand name "Nøiré", product designs, graphics,
            text, and images are the intellectual property of Nøiré Apparel Private Limited. You may not
            reproduce or use any of our content without written permission.
          </p>
        </Section>

        <Section title="8. LIMITATION OF LIABILITY">
          <p>
            Our liability for any claim is limited to the value of the order in question. We are not liable
            for indirect, incidental, or consequential damages. We are not liable for losses caused by events
            beyond our control including courier delays, natural disasters, or payment gateway outages.
          </p>
        </Section>

        <Section title="9. GOVERNING LAW">
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of the courts in India.
          </p>
        </Section>

        <Section title="10. CHANGES TO THESE TERMS">
          <p>
            We may update these Terms from time to time. Continued use of our website after changes are
            posted constitutes your acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="11. CONTACT US">
          <p>
            Email: <OrangeLink href="mailto:support@noire.co.in">support@noire.co.in</OrangeLink>
            {' '}| Website: noire.co.in
          </p>
        </Section>
      </div>
    </main>
  );
}
