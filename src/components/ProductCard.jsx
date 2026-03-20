/* TEAM 3 — ProductCard: Card with hover effects, badges, quick-add, wishlist */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0], product.colors[0].name);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const badge = product.tags[0];

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-white dark:bg-[#1A1A1A] rounded-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className="absolute inset-0 transition-all duration-500 group-hover:scale-105"
            style={{ background: hovered ? product.images.hover : product.images.primary }}
          />

          {/* Badge */}
          {badge && (
            <span className={`absolute top-3 left-3 z-10 text-[10px] font-mono font-bold px-2.5 py-1 rounded-pill uppercase tracking-wider ${
              badge === 'New Drop' ? 'bg-brand-orange text-white' :
              badge === 'Sale' ? 'bg-brand-black dark:bg-brand-offwhite text-white dark:text-brand-black' :
              'border border-brand-orange text-brand-orange bg-white/80 dark:bg-brand-black/80'
            }`}>
              {badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
              hovered || wishlisted ? 'opacity-100' : 'opacity-0'
            } ${wishlisted ? 'bg-brand-orange text-white' : 'bg-white/80 dark:bg-brand-black/80 text-brand-black dark:text-brand-offwhite hover:bg-brand-orange hover:text-white'}`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick Add */}
          <div className={`absolute bottom-3 left-3 right-3 z-10 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button
              onClick={handleQuickAdd}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-medium py-2.5 rounded-pill transition-colors"
            >
              Quick Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-brand-gray uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="text-sm font-medium text-brand-black dark:text-brand-offwhite mb-2 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="font-mono text-sm font-bold text-brand-orange">₹{product.salePrice}</span>
                <span className="font-mono text-sm text-brand-gray line-through">₹{product.price}</span>
              </>
            ) : (
              <span className="font-mono text-sm font-bold text-brand-black dark:text-brand-offwhite">₹{product.price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
