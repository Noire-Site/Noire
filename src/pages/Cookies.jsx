/* Cookie Policy Page */
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

function CookieTable({ headers, rows }) {
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
                <td key={j} className="px-4 py-3 text-brand-gray dark:text-gray-300 border-b border-brand-gray-light dark:border-[#2A2A2A] last:border-b-0 font-mono text-xs">
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

export default function Cookies() {
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
          <h1 className="font-heading text-4xl sm:text-5xl mt-2 mb-3 text-brand-black dark:text-brand-offwhite">COOKIE POLICY</h1>
          <p className="text-sm text-brand-gray font-mono">Last updated: March 2025</p>
        </div>

        <p className="text-[15px] leading-[1.7] text-brand-gray dark:text-gray-300 mb-10">
          This Cookie Policy explains what cookies are, what cookies we use on noire.co.in, and how you can
          control them.
        </p>

        <Section title="1. WHAT ARE COOKIES">
          <p>
            Cookies are small text files placed on your device when you visit a website. They help the
            website remember your preferences, keep you logged in, and understand how you use the site.
          </p>
        </Section>

        <Section title="2. WHAT COOKIES WE USE">
          <p className="font-medium text-brand-black dark:text-brand-offwhite">Essential Cookies (cannot be disabled):</p>
          <CookieTable
            headers={['Cookie', 'Purpose', 'Duration']}
            rows={[
              ['noire_session', 'Keeps you logged in to your account', 'Session'],
              ['noire_cart', 'Saves your shopping cart between visits', '30 days'],
              ['noire_cookie_consent', 'Remembers your cookie preferences', '1 year'],
            ]}
          />

          <p className="font-medium text-brand-black dark:text-brand-offwhite mt-4">Analytics Cookies:</p>
          <CookieTable
            headers={['Cookie', 'Provider', 'Purpose', 'Duration']}
            rows={[
              ['_ga', 'Google Analytics', 'Tracks website visits and behaviour', '2 years'],
              ['_ga*', 'Google Analytics', 'Persists session state', '2 years'],
            ]}
          />

          <p className="font-medium text-brand-black dark:text-brand-offwhite mt-4">Marketing Cookies:</p>
          <CookieTable
            headers={['Cookie', 'Provider', 'Purpose', 'Duration']}
            rows={[
              ['_fbp', 'Meta (Instagram/Facebook)', 'Tracks conversions from Instagram ads', '3 months'],
              ['_gcl_au', 'Google Ads', 'Tracks conversions from Google ads', '3 months'],
            ]}
          />
        </Section>

        <Section title="3. THIRD-PARTY COOKIES">
          <p>
            Razorpay, Google Analytics, and Meta Pixel all set their own cookies during your visit.
            These third parties have their own privacy and cookie policies.
          </p>
        </Section>

        <Section title="4. HOW TO CONTROL COOKIES">
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Via our banner: </span>
            When you first visit noire.co.in you can choose to accept all cookies or only essential cookies.
          </p>
          <p className="font-medium text-brand-black dark:text-brand-offwhite">Via your browser:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Chrome: Settings → Privacy and Security → Cookies</li>
            <li>Safari: Settings → Privacy → Manage Website Data</li>
            <li>Firefox: Settings → Privacy and Security → Cookies and Site Data</li>
          </ul>
          <p className="text-sm italic">
            Note: Disabling cookies may affect your cart and login functionality.
          </p>
          <p>
            <span className="font-medium text-brand-black dark:text-brand-offwhite">Opt out of Google Analytics: </span>
            Install the Google Analytics Opt-out Add-on at{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              className="text-brand-orange hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
          </p>
        </Section>

        <Section title="5. META PIXEL">
          <p>
            We use the Meta Pixel to measure Instagram/Facebook ad effectiveness. This pixel may link your
            visit to your Facebook/Instagram account. You can opt out through your Facebook/Instagram ad settings.
          </p>
        </Section>

        <Section title="6. CHANGES TO THIS POLICY">
          <p>
            We may update this Cookie Policy from time to time. When we do we will update the "Last updated"
            date at the top.
          </p>
        </Section>

        <Section title="7. CONTACT US">
          <p>
            Email:{' '}
            <a href="mailto:support@noire.co.in" className="text-brand-orange hover:underline">
              support@noire.co.in
            </a>
            {' '}| Website: noire.co.in
          </p>
        </Section>
      </div>
    </main>
  );
}
