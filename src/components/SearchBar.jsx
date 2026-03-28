/* TEAM 3 — SearchBar: Spotlight-style modal search */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductsContext';

function Highlight({ text, query }) {
  if (!query || query.length < 2) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <span key={i} style={{ color: '#FF4500', fontWeight: 700 }}>{part}</span>
          : part
      )}
    </>
  );
}

function ResultRow({ product, query, isLast, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onSelect(product.slug)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 20px',
        background: hovered ? '#1A1A1A' : 'transparent',
        border: 'none',
        borderLeft: `2px solid ${hovered ? '#FF4500' : 'transparent'}`,
        borderBottom: isLast ? 'none' : '1px solid #1C1C1C',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '8px',
        background: product.images.primary,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 600,
          color: '#F5F2EE',
          fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif",
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          <Highlight text={product.name} query={query} />
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#5A5651' }}>
          <Highlight text={product.category} query={query} />
          {' · '}
          <span style={{ fontFamily: 'monospace' }}>₹{product.salePrice ?? product.price}</span>
        </p>
      </div>
      <svg
        width="14" height="14" fill="none" viewBox="0 0 24 24"
        stroke={hovered ? '#FF4500' : '#3A3A3A'} strokeWidth={2}
        style={{ flexShrink: 0, transition: 'stroke 0.15s ease' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default function SearchBar({ onClose }) {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Focus input + lock body scroll on mount
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Live search
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 8)
    );
  }, [query, products]);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleSelect = (slug) => {
    navigate(`/product/${slug}`);
    handleClose();
  };

  // Esc key
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closing]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleClose();
  };

  const showEmpty = query.trim().length >= 2 && results.length === 0;
  const hasContent = results.length > 0 || showEmpty;

  return (
    <>
      <style>{`
        @keyframes _bIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes _bOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes _mIn  { from { opacity: 0; transform: scale(0.96) translateY(-10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes _mOut { from { opacity: 1; transform: scale(1) translateY(0) } to { opacity: 0; transform: scale(0.96) translateY(-10px) } }
        .search-results::-webkit-scrollbar { width: 4px; }
        .search-results::-webkit-scrollbar-track { background: transparent; }
        .search-results::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '12vh',
          paddingLeft: '16px',
          paddingRight: '16px',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: `${closing ? '_bOut' : '_bIn'} 0.2s ease forwards`,
        }}
      >
        {/* Modal card */}
        <div
          ref={modalRef}
          style={{
            width: '100%',
            maxWidth: '600px',
            background: '#141414',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(255,69,0,0.08), 0 24px 60px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            animation: `${closing ? '_mOut' : '_mIn'} 0.2s ease forwards`,
          }}
        >
          {/* Input row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: hasContent ? '1px solid #1F1F1F' : 'none',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#5A5651" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#F5F2EE',
                fontSize: '17px',
                letterSpacing: '-0.01em',
              }}
              className="placeholder:text-[#383838]"
            />

            <kbd style={{
              fontSize: '11px',
              color: '#5A5651',
              background: '#1E1E1E',
              border: '1px solid #282828',
              borderRadius: '5px',
              padding: '2px 7px',
              fontFamily: 'monospace',
              flexShrink: 0,
              letterSpacing: '0.04em',
            }}>
              esc
            </kbd>
          </div>

          {/* Results */}
          {hasContent && (
            <div className="search-results" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {showEmpty ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#2A2A2A" strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p style={{ color: '#5A5651', fontSize: '14px', margin: 0 }}>
                    No results for{' '}
                    <span style={{ color: '#F5F2EE' }}>"{query}"</span>
                  </p>
                </div>
              ) : (
                results.map((product, i) => (
                  <ResultRow
                    key={product.id}
                    product={product}
                    query={query}
                    isLast={i === results.length - 1}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
