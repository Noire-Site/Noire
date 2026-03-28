// src/pages/admin/ProductsPage.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };
const MONO = { fontFamily: 'monospace' };

function SkeletonRow() {
  const { t } = useAdminTheme();
  return (
    <tr style={{ borderBottom: `1px solid ${t.border3}` }}>
      {[56, 180, 80, 90, 60, 90].map((w, i) => (
        <td key={i} style={{ padding: '14px 14px' }}>
          <div style={{ height: '12px', width: w, background: t.shimmer, borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

function StockCell({ product, onUpdate }) {
  const { t } = useAdminTheme();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.stock ?? 0);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const stockColor = (product.stock ?? 0) === 0 ? '#EF4444' : (product.stock ?? 0) < 5 ? '#F59E0B' : t.textMuted;

  const save = async () => {
    const newVal = Math.max(0, value);
    if (newVal === (product.stock ?? 0)) { setEditing(false); return; }
    setSaving(true);
    const { error } = await supabase.from('products').update({ stock: newVal }).eq('id', product.id);
    if (!error) onUpdate(product.id, newVal);
    setSaving(false);
    setEditing(false);
  };

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (saving) {
    return <div style={{ width: '16px', height: '16px', border: `1.5px solid ${t.textMuted}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number" value={value} min={0}
        onChange={e => setValue(parseInt(e.target.value) || 0)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        style={{
          width: '64px', background: t.inputBg, border: '1px solid #FF4500',
          borderRadius: '5px', color: t.text, padding: '3px 8px',
          fontSize: '13px', outline: 'none', ...MONO,
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit stock"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: stockColor, ...MONO, fontSize: '13px',
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '2px 6px', borderRadius: '5px', transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = t.surface2}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {product.stock ?? 0}
      {(product.stock ?? 0) === 0 && (
        <span style={{ fontSize: '10px', background: '#1F0A0A', color: '#EF4444', padding: '1px 5px', borderRadius: '999px', border: '1px solid #EF444433' }}>OUT</span>
      )}
      {(product.stock ?? 0) > 0 && (product.stock ?? 0) < 5 && (
        <span style={{ fontSize: '10px', background: '#1C1200', color: '#F59E0B', padding: '1px 5px', borderRadius: '999px', border: '1px solid #F59E0B33' }}>LOW</span>
      )}
      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke={t.textFaint} strokeWidth={2} style={{ opacity: 0.6 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
  );
}

export default function ProductsPage() {
  const { t } = useAdminTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteState, setDeleteState] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  const getDS = (id) => deleteState[id] ?? 'idle';
  const setDS = (id, s) => setDeleteState(prev => ({ ...prev, [id]: s }));

  const handleDelete = async (id) => {
    setDS(id, 'deleting');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { setDS(id, 'error'); setTimeout(() => setDS(id, 'idle'), 3000); }
    else setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleStockUpdate = (id, newStock) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const filtered = filter === 'all' ? products
    : filter === 'low' ? products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5)
    : products.filter(p => (p.stock ?? 0) === 0);

  const lowCount = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5).length;
  const outCount = products.filter(p => (p.stock ?? 0) === 0).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Manage</p>
          <h1 style={{ ...HEADING, fontSize: '40px', margin: '4px 0 0', color: t.text }}>PRODUCTS</h1>
        </div>
        <Link to="/admin/products/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: '#FF4500', color: 'white', padding: '10px 20px',
          borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
        }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: `All (${products.length})` },
          { key: 'low', label: `Low Stock (${lowCount})`, color: '#F59E0B' },
          { key: 'out', label: `Out of Stock (${outCount})`, color: '#EF4444' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              ...MONO, fontSize: '11px', padding: '5px 12px', borderRadius: '999px',
              background: filter === f.key ? (f.color ?? '#FF4500') : t.surface2,
              color: filter === f.key ? 'white' : (f.color ?? t.textSub),
              border: `1px solid ${filter === f.key ? (f.color ?? '#FF4500') : t.border2}`,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map((h, i) => (
                  <th key={h + i} style={{
                    ...MONO, padding: '11px 14px', textAlign: i === 5 ? 'right' : 'left',
                    fontSize: '10px', color: t.textMuted, textTransform: 'uppercase',
                    letterSpacing: '0.1em', fontWeight: 500,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: t.textFaint }}>
                    {products.length === 0 ? (
                      <>No products yet. <Link to="/admin/products/new" style={{ color: '#FF4500' }}>Add the first one.</Link></>
                    ) : 'No products match this filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const ds = getDS(product.id);
                  const rowBg = (product.stock ?? 0) === 0 ? 'rgba(239,68,68,0.03)'
                    : (product.stock ?? 0) < 5 ? 'rgba(245,158,11,0.03)' : 'transparent';
                  return (
                    <tr key={product.id}
                      style={{ borderBottom: `1px solid ${t.border3}`, background: rowBg, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = t.hover}
                      onMouseLeave={e => e.currentTarget.style.background = rowBg}
                    >
                      <td style={{ padding: '10px 14px', width: '52px' }}>
                        {product.image_primary ? (
                          <img src={product.image_primary} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: t.shimmer, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textFaint, fontSize: '10px' }}>—</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: t.text, fontWeight: 500 }}>{product.name}</td>
                      <td style={{ padding: '10px 14px', color: t.textMuted }}>{product.category}</td>
                      <td style={{ padding: '10px 14px', ...MONO, fontSize: '12px', color: t.textSub }}>
                        {product.sale_price ? (
                          <>
                            <span style={{ color: t.text }}>₹{product.sale_price}</span>
                            <span style={{ textDecoration: 'line-through', marginLeft: '6px', fontSize: '11px' }}>₹{product.price}</span>
                          </>
                        ) : `₹${product.price}`}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <StockCell product={product} onUpdate={handleStockUpdate} />
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                          {ds === 'error' && <span style={{ color: '#EF4444', fontSize: '11px' }}>Failed</span>}
                          {ds === 'confirm' && (
                            <>
                              <button onClick={() => handleDelete(product.id)} style={{ color: '#EF4444', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Confirm?</button>
                              <button onClick={() => setDS(product.id, 'idle')} style={{ color: t.textMuted, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            </>
                          )}
                          {ds === 'deleting' && <div style={{ width: '14px', height: '14px', border: `1.5px solid ${t.textMuted}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
                          {(ds === 'idle' || ds === 'error') && (
                            <>
                              <Link to={`/admin/products/${product.id}`}
                                style={{ fontSize: '12px', color: t.textSub, textDecoration: 'none', border: `1px solid ${t.border2}`, padding: '4px 12px', borderRadius: '5px', transition: 'all 0.12s' }}
                                onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = t.textFaint; }}
                                onMouseLeave={e => { e.currentTarget.style.color = t.textSub; e.currentTarget.style.borderColor = t.border2; }}
                              >
                                Edit
                              </Link>
                              <button onClick={() => setDS(product.id, 'confirm')}
                                style={{ fontSize: '12px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.12s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#FCA5A5'}
                                onMouseLeave={e => e.currentTarget.style.color = '#EF4444'}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
