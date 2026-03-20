/* TEAM 2 — Footer: Site footer with links, newsletter, and branding */
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-brand-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center mb-4 overflow-visible leading-[1.2]" aria-label="Nøiré home">
              <span style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Arial Unicode MS', sans-serif" }} className="text-3xl tracking-wide">
                <span className="text-brand-orange">NØ</span>
                <span className="text-brand-offwhite">IRÉ</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bold streetwear for the next generation. Wear the Nøiré.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-brand-orange transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" aria-label="Twitter / X" className="text-gray-400 hover:text-brand-orange transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="TikTok" className="text-gray-400 hover:text-brand-orange transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-lg mb-4 tracking-wide">SHOP</h4>
            <ul className="space-y-2.5">
              <li><Link to="/shop?category=Men" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Men</Link></li>
              <li><Link to="/shop?category=Women" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Women</Link></li>
              <li><Link to="/shop?category=Unisex" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Unisex</Link></li>
              <li><Link to="/shop?tag=Sale" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-heading text-lg mb-4 tracking-wide">INFO</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Contact</Link></li>
              <li><Link to="/returns" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" className="text-sm text-gray-400 hover:text-brand-orange transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-lg mb-4 tracking-wide">STAY IN THE LOOP</h4>
            <p className="text-sm text-gray-400 mb-4">Get early access to drops, exclusive deals, and zero spam. Promise.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-pill text-brand-offwhite placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-hover text-white px-5 py-2.5 rounded-pill text-sm font-medium transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2025 Nøiré. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-brand-orange transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-brand-orange transition-colors">Terms</Link>
            <Link to="/cookies" className="text-xs text-gray-500 hover:text-brand-orange transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
