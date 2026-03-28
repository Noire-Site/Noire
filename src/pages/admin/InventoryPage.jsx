// src/pages/admin/InventoryPage.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };
const MONO = { fontFamily: 'monospace' };

function StockAdjuster({ product, onUpdate }) {
  const { t } = useAdminTheme();
  const [stock, setStock] = useState(product.stock ?? 0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const inputRef = useRef(null);

  const adjust = (delta) => { setStock(prev => Math.max(0, prev + delta)); setDirty(true); };
  const handleInput = (e) => { setStock(Math.max(0, parseInt(e.target.value) || 0)); setDirty(true); };

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    const { error } = await supabase.from('products').update({ stock }).eq('id', product.id);
    if (!error) { onUpdate(product.id, stock); setDirty(false); }
    setSaving(false);
  };

  const stockColor = stock === 0 ? '#EF4444' : stock < 5 ? '#F59E0B' : '#4ADE80';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => adjust(-1)} disabled={stock === 0 || saving}
        style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: t.surface2, border: `1px solid ${t.border2}`,
          color: t.textSub, cursor: 'pointer', fontSize: '16px', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s', opacity: stock === 0 ? 0.4 : 1,
        }}
        onMouseEnter={e => { if (stock > 0) { e.currentTarget.style.borderColor = '#FF4500'; e.currentTarget.style.color = '#FF4500'; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border2; e.currentTarget.style.color = t.textSub; }}
      >−</button>

      <input ref={inputRef} type="number" value={stock} min={0}
        onChange={handleInput} onBlur={save}
        onKeyDown={e => e.key === 'Enter' && save()}
        style={{
          width: '56px', textAlign: 'center', ...MONO,
          background: t.inputBg, border: `1px solid ${dirty ? '#FF4500' : t.border}`,
          borderRadius: '6px', color: stockColor, padding: '4px 6px',
          fontSize: '14px', fontWeight: 600, outline: 'none', transition: 'border-color 0.15s',
        }}
      />

      <button onClick={() => adjust(1)} disabled={saving}
        style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: t.surface2, border: `1px solid ${t.border2}`,
          color: t.textSub, cursor: 'pointer', fontSize: '16px', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4ADE80'; e.currentTarget.style.color = '#4ADE80'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border2; e.currentTarget.style.color = t.textSub; }}
      >+</button>

      {dirty && (
        <button onClick={save} disabled={saving}
          style={{
            ...MONO, fontSize: '11px', padding: '4px 10px', borderRadius: '5px',
            background: '#FF4500', color: 'white', border: 'none', cursor: 'pointer',
            opacity: saving ? 0.6 : 1, transition: 'opacity 0.15s',
          }}
        >
          {saving ? '…' : 'Save'}
        </button>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const { t } = useAdminTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { if (!loading) fetchProducts(); }, [threshold]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, category, stock, image_primary')
      .lt('stock', threshold + 1)
      .order('stock', { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }

  const handleUpdate = (id, newStock) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const outOfStock = products.filter(p => (p.stock ?? 0) === 0);
  const lowStock   = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5);
  const moderate   = products.filter(p => (p.stock ?? 0) >= 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Stock Management</p>
          <h1 style={{ ...HEADING, fontSize: '40px', margin: '4px 0 0', color: t.text }}>INVENTORY</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ ...MONO, fontSize: '11px', color: t.textMuted }}>Show items below</span>
          <select value={threshold} onChange={e => setThreshold(Number(e.target.value))}
            style={{
              background: t.surface2, border: `1px solid ${t.border2}`, color: t.text,
              padding: '6px 10px', borderRadius: '6px', fontSize: '13px', ...MONO, cursor: 'pointer',
            }}
          >
            {[5, 10, 15, 20, 50].map(v => <option key={v} value={v}>{v} units</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Out of Stock',       count: outOfStock.length, color: '#EF4444', bg: '#1F0A0A' },
          { label: 'Low Stock (< 5)',    count: lowStock.length,   color: '#F59E0B', bg: '#1C1200' },
          { label: `Below ${threshold} units`, count: products.length, color: '#38BDF8', bg: '#001C2E' },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}22`, borderRadius: '10px', padding: '16px 18px' }}>
            <p style={{ ...MONO, fontSize: '10px', color: card.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px', opacity: 0.8 }}>
              {card.label}
            </p>
            <p style={{ ...HEADING, fontSize: '32px', margin: 0, color: card.color }}>{card.count}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: `1px solid ${t.border3}` }}>
              <div style={{ width: '40px', height: '40px', background: t.shimmer, borderRadius: '6px', flexShrink: 0, animation: 'shimmer 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '13px', width: '160px', background: t.shimmer, borderRadius: '4px', marginBottom: '6px', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ height: '11px', width: '80px', background: t.shimmer, borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '60px 20px', textAlign: 'center' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke={t.border2} strokeWidth={1} style={{ margin: '0 auto 14px', display: 'block' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p style={{ color: '#4ADE80', fontSize: '14px', margin: '0 0 4px' }}>All products well stocked</p>
          <p style={{ color: t.textFaint, fontSize: '12px', margin: 0 }}>No items below {threshold} units</p>
        </div>
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          {outOfStock.length > 0 && (
            <>
              <div style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.06)', borderBottom: `1px solid ${t.border}` }}>
                <span style={{ ...MONO, fontSize: '10px', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ✕ Out of Stock ({outOfStock.length})
                </span>
              </div>
              {outOfStock.map(p => <ProductRow key={p.id} product={p} onUpdate={handleUpdate} />)}
            </>
          )}
          {lowStock.length > 0 && (
            <>
              <div style={{ padding: '10px 20px', background: 'rgba(245,158,11,0.06)', borderBottom: `1px solid ${t.border}`, borderTop: outOfStock.length > 0 ? `1px solid ${t.border}` : 'none' }}>
                <span style={{ ...MONO, fontSize: '10px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ⚠ Low Stock — below 5 ({lowStock.length})
                </span>
              </div>
              {lowStock.map(p => <ProductRow key={p.id} product={p} onUpdate={handleUpdate} />)}
            </>
          )}
          {moderate.length > 0 && (
            <>
              <div style={{ padding: '10px 20px', background: t.surface2, borderBottom: `1px solid ${t.border}`, borderTop: (outOfStock.length > 0 || lowStock.length > 0) ? `1px solid ${t.border}` : 'none' }}>
                <span style={{ ...MONO, fontSize: '10px', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Running Low — below {threshold} ({moderate.length})
                </span>
              </div>
              {moderate.map(p => <ProductRow key={p.id} product={p} onUpdate={handleUpdate} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onUpdate }) {
  const { t } = useAdminTheme();
  const stockColor = (product.stock ?? 0) === 0 ? '#EF4444' : (product.stock ?? 0) < 5 ? '#F59E0B' : t.textSub;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 20px', borderBottom: `1px solid ${t.border3}`,
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = t.hover}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {product.image_primary ? (
        <img src={product.image_primary} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '40px', height: '40px', background: t.surface2, borderRadius: '6px', flexShrink: 0 }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, color: t.text, fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </p>
        <p style={{ margin: '2px 0 0', ...MONO, fontSize: '11px', color: t.textMuted }}>{product.category}</p>
      </div>

      <div style={{ textAlign: 'right', marginRight: '16px', flexShrink: 0 }}>
        <p style={{ ...MONO, fontSize: '20px', fontWeight: 700, color: stockColor, margin: 0, lineHeight: 1 }}>
          {product.stock ?? 0}
        </p>
        <p style={{ ...MONO, fontSize: '10px', color: t.textFaint, margin: '2px 0 0' }}>in stock</p>
      </div>

      <StockAdjuster product={product} onUpdate={onUpdate} />

      <Link to={`/admin/products/${product.id}`}
        style={{ ...MONO, fontSize: '11px', color: t.textMuted, textDecoration: 'none', flexShrink: 0, transition: 'color 0.12s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
        onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
      >
        Edit
      </Link>
    </div>
  );
}
