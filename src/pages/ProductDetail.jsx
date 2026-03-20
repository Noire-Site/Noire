/* TEAM 2/3 — Product Detail Page: Gallery, size/color pickers, add to cart, related products */
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductsContext';
import ProductCard from '../components/ProductCard';
import SizeGuideModal from '../components/SizeGuideModal';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export default function ProductDetail() {
  const { products } = useProducts();
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeAlert, setSizeAlert] = useState(false);

  useEffect(() => {
    if (!sizeAlert) return;
    const t = setTimeout(() => setSizeAlert(false), 3000);
    return () => clearTimeout(t);
  }, [sizeAlert]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-4xl mb-4">PRODUCT NOT FOUND</h1>
        <Link to="/shop" className="text-brand-orange hover:text-brand-orange-hover transition-colors">← Back to shop</Link>
      </main>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const images = [product.images.primary, product.images.hover];
  const price = product.salePrice || product.price;
  const lowStock = product.stock < 5;

  const handleAdd = () => {
    if (!selectedSize) { setSizeAlert(true); return; }
    const color = selectedColor || product.colors[0].name;
    addItem(product, selectedSize, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-gray mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-orange transition-colors">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-brand-orange transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-brand-black dark:text-brand-offwhite">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div
            className="aspect-[3/4] rounded-card overflow-hidden group cursor-crosshair relative"
            style={{ background: images[imageIndex] }}
          >
            <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-500" style={{ background: images[imageIndex] }} />
            {/* Badges */}
            {product.tags[0] && (
              <span className={`absolute top-4 left-4 z-10 text-[10px] font-mono font-bold px-3 py-1 rounded-pill uppercase tracking-wider ${
                product.tags[0] === 'New Drop' ? 'bg-brand-orange text-white' :
                product.tags[0] === 'Sale' ? 'bg-brand-black text-white' :
                'border border-brand-orange text-brand-orange'
              }`}>
                {product.tags[0]}
              </span>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImageIndex(i)}
                className={`w-20 h-24 rounded-md overflow-hidden border-2 transition-all ${imageIndex === i ? 'border-brand-orange' : 'border-transparent opacity-60 hover:opacity-100'}`}
                aria-label={`View image ${i + 1}`}
              >
                <div className="w-full h-full" style={{ background: img }} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:py-4">
          <p className="text-sm text-brand-gray uppercase tracking-wider mb-2">{product.category}</p>
          <h1 className="font-heading text-4xl sm:text-5xl mb-4">{product.name.toUpperCase()}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-2xl font-bold text-brand-orange">₹{price}</span>
            {product.salePrice && (
              <span className="font-mono text-lg text-brand-gray line-through">₹{product.price}</span>
            )}
            {product.salePrice && (
              <span className="bg-brand-orange text-white text-xs font-mono font-bold px-2 py-0.5 rounded-pill">
                -{Math.round((1 - product.salePrice / product.price) * 100)}%
              </span>
            )}
          </div>

          <p className="text-brand-gray leading-relaxed mb-8">{product.description}</p>

          {/* Color picker */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">
              Color: <span className="text-brand-gray">{selectedColor || product.colors[0].name}</span>
            </h3>
            <div className="flex gap-3">
              {product.colors.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    (selectedColor || product.colors[0].name) === c.name ? 'border-brand-orange scale-110' : 'border-brand-gray-light dark:border-[#2A2A2A]'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Select color ${c.name}`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Size</h3>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="text-xs text-brand-orange hover:text-brand-orange-hover transition-colors underline"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-sm font-mono rounded-pill border transition-all ${
                    selectedSize === size
                      ? 'bg-brand-orange text-white border-brand-orange'
                      : 'border-brand-gray-light dark:border-[#2A2A2A] hover:border-brand-orange hover:text-brand-orange'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock indicator */}
          {lowStock && (
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse-dot" />
              <span className="text-sm text-brand-orange font-medium">Only {product.stock} left!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAdd}
              className={`flex-1 py-4 rounded-pill font-medium text-white transition-all duration-300 ${
                added ? 'bg-green-600' : 'bg-brand-orange hover:bg-brand-orange-hover hover:-translate-y-0.5'
              }`}
            >
              {added ? '✓ Added to Bag' : 'Add to Bag'}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-4 rounded-full border-2 transition-all ${
                wishlisted
                  ? 'border-brand-orange bg-brand-orange text-white'
                  : 'border-brand-gray-light dark:border-[#2A2A2A] hover:border-brand-orange hover:text-brand-orange'
              }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-brand-gray">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Free shipping on orders over ₹5000
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-gray">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Easy returns within 30 days
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <h2 className="font-heading text-3xl sm:text-4xl mb-8">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Size toast */}
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-black dark:bg-[#1A1A1A] border border-brand-orange text-white text-sm font-medium shadow-lg pointer-events-none transition-all duration-300"
        style={{
          opacity: sizeAlert ? 1 : 0,
          transform: sizeAlert ? 'translateY(0)' : 'translateY(8px)',
        }}
        role="status"
        aria-live="polite"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
        Please select a size
      </div>
    </main>
  );
}
