/* TEAM 2/3/5 — Homepage: Hero, marquee, featured products, categories, lifestyle grid, newsletter */

import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductsContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { useInView } from '../hooks/useInView';

/* Fade-in wrapper */
function FadeIn({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const { products, loading } = useProducts();
  const featured = products.slice(0, 8);
  const categories = ['Men', 'Women', 'Unisex'];

  return (
    <main>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-brand-orange/5 to-transparent dark:from-brand-orange/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 py-20">
          {/* Left — Copy */}
          <div className="flex flex-col justify-center">
            <span className="inline-block font-mono text-xs uppercase tracking-widest text-brand-orange mb-4 animate-fade-in-up">
              SS26 Collection
            </span>
            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl xl:text-[6.5rem] leading-[0.95] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              WEAR THE<br />
              <span style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Arial Unicode MS', sans-serif" }} className="text-brand-orange">NØ</span>
              <span style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Arial Unicode MS', sans-serif" }}>IRÉ</span>
            </h1>
            <p className="text-lg text-brand-gray max-w-md mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Nøiré delivers limited-edition streetwear straight to your door. No restocks. No compromises. Just the freshest fits.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3.5 rounded-pill font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border-2 border-brand-black dark:border-brand-offwhite text-brand-black dark:text-brand-offwhite px-8 py-3.5 rounded-pill font-medium hover:bg-brand-black hover:text-white dark:hover:bg-brand-offwhite dark:hover:text-brand-black transition-all duration-300 hover:-translate-y-0.5"
              >
                View Lookbook
              </Link>
            </div>
          </div>

          {/* Right — Floating product card */}
          {products[7] && (
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="absolute w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl" />
            <div className="relative animate-float">
              <div className="w-72 bg-white dark:bg-[#1A1A1A] rounded-card shadow-xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[3/4]" style={{ background: products[7].images.primary }} />
                <div className="p-4">
                  <p className="text-xs text-brand-gray uppercase tracking-wider">{products[7].category}</p>
                  <p className="font-medium mt-1">{products[7].name}</p>
                  <p className="font-mono font-bold text-brand-orange mt-1">₹{products[7].price}</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* ===== STATS ROW ===== */}
      <FadeIn>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '12K+', label: 'Happy Customers' },
              { value: '2-4 Days', label: 'Fast Shipping' },
              { value: 'SS26', label: 'Latest Season' },
            ].map(stat => (
              <div key={stat.label} className="py-4">
                <p className="font-heading text-3xl sm:text-4xl text-brand-orange">{stat.value}</p>
                <p className="text-xs sm:text-sm text-brand-gray mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ===== MARQUEE TICKER ===== */}
      <section className="bg-brand-orange py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mr-8">
              {['NEW DROPS WEEKLY', '★', 'FREE SHIPPING OVER ₹5000', '★', 'WEAR THE NØIRÉ', '★', 'NØIRÉ EXCLUSIVE', '★', 'SS26 COLLECTION', '★'].map((text, j) => (
                <span key={j} className="font-heading text-lg text-white tracking-wider">{text}</span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">What's hot</span>
              <h2 className="font-heading text-4xl sm:text-5xl mt-1">FEATURED DROPS</h2>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange transition-colors">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </FadeIn>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(p => (
              <FadeIn key={p.id}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <FadeIn>
          <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Browse</span>
          <h2 className="font-heading text-4xl sm:text-5xl mt-1 mb-8">SHOP BY CATEGORY</h2>
        </FadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, i) => {
            const gradients = [
              'linear-gradient(135deg, #2D2D2D 0%, #FF4500 100%)',
              'linear-gradient(135deg, #191970 0%, #DE9E9E 100%)',
              'linear-gradient(135deg, #0D0D0D 0%, #5A5651 100%)',
              'linear-gradient(135deg, #0D0D0D 0%, #FF4500 100%)',
            ];
            return (
              <FadeIn key={cat}>
                <Link
                  to={`/shop?category=${cat}`}
                  className="group relative aspect-[3/4] rounded-card overflow-hidden block"
                >
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    style={{ background: gradients[i] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="font-heading text-2xl sm:text-3xl text-white">{cat.toUpperCase()}</h3>
                    <p className="text-sm text-gray-300 mt-1 group-hover:text-brand-orange transition-colors">
                      Shop {cat} →
                    </p>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ===== LIFESTYLE GRID ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <FadeIn>
          <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">@nøiré</span>
          <h2 className="font-heading text-4xl sm:text-5xl mt-1 mb-8">THE LOOK</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { bg: 'linear-gradient(135deg, #FF4500 0%, #0D0D0D 80%)', span: 'md:col-span-2 md:row-span-2' },
            { bg: 'linear-gradient(135deg, #2D2D2D 0%, #C2B280 100%)', span: '' },
            { bg: 'linear-gradient(135deg, #191970 0%, #B57EDC 100%)', span: '' },
            { bg: 'linear-gradient(135deg, #556B2F 0%, #FFFDD0 100%)', span: '' },
            { bg: 'linear-gradient(135deg, #9E9E9E 0%, #FF4500 100%)', span: '' },
          ].map((item, i) => (
            <FadeIn key={i} className={item.span}>
              <div
                className="aspect-square rounded-card overflow-hidden group cursor-pointer"
                style={{ background: item.bg }}
              >
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="bg-brand-black dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <FadeIn>
            <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Don't miss a drop</span>
            <h2 className="font-heading text-4xl sm:text-5xl text-brand-offwhite mt-2 mb-4">JOIN THE LIST</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Early access to new drops, exclusive deals, behind-the-scenes content. No spam, ever.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('You\'re in!'); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 bg-[#1A1A1A] dark:bg-[#2A2A2A] border border-[#2A2A2A] dark:border-[#3A3A3A] rounded-pill text-brand-offwhite placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3.5 rounded-pill font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
