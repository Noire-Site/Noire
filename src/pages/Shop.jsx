/* TEAM 2/3 — Shop Page: Filterable, sortable product catalog */
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import products from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';

const allCategories = ['Men', 'Women', 'Unisex', 'Accessories'];
const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const allColors = [...new Map(products.flatMap(p => p.colors).map(c => [c.hex, c])).values()];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Filters from URL
  const activeCategory = searchParams.get('category') || '';
  const activeTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeCategory, activeTag, searchQuery]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory) result = result.filter(p => p.category === activeCategory);
    if (activeTag) result = result.filter(p => p.tags.includes(activeTag));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedSizes.length > 0) result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    if (selectedColors.length > 0) result = result.filter(p => p.colors.some(c => selectedColors.includes(c.hex)));
    result = result.filter(p => {
      const price = p.salePrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sort) {
      case 'price-asc': result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price-desc': result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      default: break; // newest = default order
    }

    return result;
  }, [activeCategory, activeTag, searchQuery, selectedSizes, selectedColors, priceRange, sort]);

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat); else params.delete('category');
    params.delete('tag');
    params.delete('search');
    setSearchParams(params);
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (hex) => {
    setSelectedColors(prev => prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]);
  };

  const clearAll = () => {
    setSearchParams({});
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 15000]);
    setSort('newest');
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-heading text-lg mb-3">CATEGORY</h3>
        <div className="space-y-2">
          <button
            onClick={() => setCategory('')}
            className={`block text-sm transition-colors ${!activeCategory ? 'text-brand-orange font-medium' : 'text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite'}`}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`block text-sm transition-colors ${activeCategory === cat ? 'text-brand-orange font-medium' : 'text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-heading text-lg mb-3">SIZE</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-xs font-mono rounded-pill border transition-all ${
                selectedSizes.includes(size)
                  ? 'bg-brand-orange text-white border-brand-orange'
                  : 'border-brand-gray-light dark:border-[#2A2A2A] text-brand-gray hover:border-brand-orange hover:text-brand-orange'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-heading text-lg mb-3">COLOR</h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map(color => (
            <button
              key={color.hex}
              onClick={() => toggleColor(color.hex)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.hex) ? 'border-brand-orange scale-110' : 'border-brand-gray-light dark:border-[#2A2A2A]'
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Filter by ${color.name}`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-heading text-lg mb-3">PRICE</h3>
        <input
          type="range"
          min="0"
          max="15000"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full accent-brand-orange"
          aria-label="Maximum price"
        />
        <div className="flex justify-between text-xs font-mono text-brand-gray mt-1">
          <span>₹0</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={clearAll}
        className="text-sm text-brand-orange hover:text-brand-orange-hover transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl">
            {activeCategory ? activeCategory.toUpperCase() : activeTag ? activeTag.toUpperCase() : searchQuery ? `RESULTS FOR "${searchQuery.toUpperCase()}"` : 'ALL PRODUCTS'}
          </h1>
          <p className="text-sm text-brand-gray mt-1">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-medium border border-brand-gray-light dark:border-[#2A2A2A] px-4 py-2 rounded-pill hover:border-brand-orange transition-colors"
            aria-label="Open filters"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm bg-transparent border border-brand-gray-light dark:border-[#2A2A2A] px-4 py-2 rounded-pill focus:outline-none focus:ring-2 focus:ring-brand-orange"
            aria-label="Sort products"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
          <FilterPanel />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-heading text-3xl mb-2">NO DROPS FOUND</p>
              <p className="text-brand-gray mb-6">Try adjusting your filters or search.</p>
              <button onClick={clearAll} className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-3 rounded-pill font-medium transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-brand-offwhite dark:bg-brand-black shadow-xl p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl">FILTERS</h2>
              <button onClick={() => setMobileFilters(false)} className="p-2 hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] rounded-full" aria-label="Close filters">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </main>
  );
}
