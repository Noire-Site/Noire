/* TEAM 3 — Wishlist Page: View and manage wishlisted products */
import products from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../contexts/WishlistContext';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const wishlisted = products.filter(p => wishlist.includes(p.id));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="font-heading text-4xl sm:text-5xl mb-2">YOUR WISHLIST</h1>
      <p className="text-brand-gray mb-8">{wishlisted.length} item{wishlisted.length !== 1 ? 's' : ''} saved</p>

      {wishlisted.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-brand-gray-light dark:text-[#2A2A2A] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="font-heading text-2xl mb-2">NOTHING HERE YET</p>
          <p className="text-brand-gray mb-6">Tap the heart icon on any product to save it.</p>
          <Link to="/shop" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-pill font-medium transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlisted.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
