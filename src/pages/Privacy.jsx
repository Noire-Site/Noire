/* Privacy Policy Page */
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

function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto mt-3 mb-3 rounded-lg border border-brand-gray-light dark:border-[#2A2A2A]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-gray-lighter dark:bg-[#1A1A1A]">
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-brand-black dark:text-brand-offwhite border-b border-brand-gray-light dark:border-[#2A2A2A]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-[#111111]' : 'bg-brand-gray-lighter dark:bg-[#161616]'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-brand-gray dark:text-gray-300 border-b border-brand-gray-light dark:border-[#2A2A2A] last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrangeLink({ href, children }) {
  return (
    <a href={href} className="text-brand-orange hover:underline">
      {children}
    </a>
  );
}

export default function Privacy() {
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
          <h1 className="font-heading text-4xl sm:text-5xl mt-2 mb-3 text-brand-black dark:text-brand-offwhite">PRIVACY POLICY</h1>
          <p className="text-sm text-brand-gray font-mono">Last updated: March 2025</p>
        </div>

        <p className="text-[15px] leading-[1.7] text-brand-gray dark:text-gray-300 mb-10">
          Nøiré Apparel Private Limited ("Nøiré", "we", "our", or "us") is committed to protecting your personal
          information. This Privacy Policy explains what data we collect, how we use it, and your rights over it
          when you visit noire.co.in or place an order with us.
        </p>

        <Section title="1. WHO WE ARE">
          <p>
            Nøiré Apparel Private Limited is a clothing brand registered in India. Our website is noire.co.in
            and you can contact us at{' '}
            <OrangeLink href="mailto:support@noire.co.in">support@noire.co.in</OrangeLink>{' '}
            for any privacy-related queries.
          </p>
        </Section>

        <Section title="2. WHAT INFORMATION WE COLLECT">
          <p className="font-medium text-brand-black dark:text-brand-offwhite">Information You Give Us:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Full name, email address, phone number</li>
            <li>Shipping and billing address</li>
            <li>Payment information (processed securely via Razorpay — we never store your card details)</li>
            <li>Size preferences and order history</li>
            <li>Messages you send us via contact forms or email</li>
          </ul>
          <p className="font-medium text-brand-black dark:text-brand-offwhite mt-4">Information We Collect Automatically:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>IP address and approximate location</li>
            <li>Browser type and device information</li>
            <li>Pages you visit and time spent on them</li>
            <li>How you arrived at our website (e.g. Google, Instagram)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
          <p className="font-medium text-brand-black dark:text-brand-offwhite mt-4">Information From Third Parties:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>If you sign in via Google, we receive your name and email</li>
            <li>If you contact us via Instagram DM, we receive your Instagram username</li>
          </ul>
        </Section>

        <Section title="3. HOW WE USE YOUR INFORMATION">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Process and fulfil your orders</li>
            <li>Send order confirmation and shipping update emails</li>
            <li>Respond to customer service queries</li>
            <li>Send marketing emails if you have subscribed (you can unsubscribe any time)</li>
            <li>Improve our website and product offerings</li>
            <li>Prevent fraud and keep our platform secure</li>
            <li>Comply with legal obligations under Indian law</li>
          </ul>
          <p>We do not sell your personal information to any third party.</p>
        </Section>

        <Section title="4. WHO WE SHARE YOUR INFORMATION WITH">
          <DataTable
            headers={['Recipient', 'Purpose']}
            rows={[
              ['Razorpay', 'Payment processing'],
              ['Shiprocket / Delivery partners', 'Order fulfilment and shipping'],
              ['Qikink', 'Print-on-demand production'],
              ['Supabase', 'Secure database storage'],
              ['Resend', 'Transactional email delivery'],
              ['Google Analytics', 'Website traffic analysis'],
              ['Indian tax authorities', 'GST compliance if legally required'],
            ]}
          />
          <p>
            All third-party partners are contractually required to protect your data and use it only for
            the purpose it was shared.
          </p>
        </Section>

        <Section title="5. DATA STORAGE AND SECURITY">
          <p>
            Your data is stored securely on Supabase servers (Singapore region). We use HTTPS/TLS encryption
            for all data transmission. Payment data is handled entirely by Razorpay and never stored on our
            servers. We retain order data for 7 years as required under Indian GST law.
          </p>
        </Section>

        <Section title="6. YOUR RIGHTS">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and personal data (subject to legal retention requirements)</li>
            <li>Opt out of marketing emails at any time via the unsubscribe link</li>
            <li>Withdraw consent where we rely on consent to process your data</li>
          </ul>
          <p>
            To exercise any of these rights, email{' '}
            <OrangeLink href="mailto:support@noire.co.in">support@noire.co.in</OrangeLink>.
          </p>
        </Section>

        <Section title="7. COOKIES">
          <p>
            We use cookies to improve your experience. See our Cookie Policy at{' '}
            <Link to="/cookies" className="text-brand-orange hover:underline">noire.co.in/cookies</Link>{' '}
            for full details.
          </p>
        </Section>

        <Section title="8. CHILDREN'S PRIVACY">
          <p>
            Our website and products are not directed at anyone under the age of 13. We do not knowingly
            collect data from children under 13. If you believe a child has provided us personal information,
            contact us and we will delete it.
          </p>
        </Section>

        <Section title="9. CHANGES TO THIS POLICY">
          <p>
            We may update this Privacy Policy from time to time. When we do we will update the "Last updated"
            date at the top.
          </p>
        </Section>

        <Section title="10. CONTACT US">
          <p>
            Email: <OrangeLink href="mailto:support@noire.co.in">support@noire.co.in</OrangeLink>
            {' '}| Website: noire.co.in
          </p>
        </Section>
      </div>
    </main>
  );
}
