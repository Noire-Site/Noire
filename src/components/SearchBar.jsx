/* TEAM 3 — SearchBar: Live product search with dropdown suggestions */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductsContext';

export default function SearchBar({ onClose }) {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matched = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 5);
    setResults(matched);
  }, [query]);

  const handleSelect = (slug) => {
    navigate(`/product/${slug}`);
    onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card shadow-lg overflow-hidden z-50">
          {results.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelect(product.slug)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-gray-lighter dark:hover:bg-[#2A2A2A] transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-md shrink-0"
                style={{ background: product.images.primary }}
              />
              <div>
                <p className="text-sm font-medium text-brand-black dark:text-brand-offwhite">{product.name}</p>
                <p className="text-xs text-brand-gray">{product.category} · <span className="font-mono">₹{product.salePrice || product.price}</span></p>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
