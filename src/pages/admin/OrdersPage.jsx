// src/pages/admin/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };
const MONO = { fontFamily: 'monospace' };

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLE = {
  pending:    { bg: '#1C1200', color: '#F59E0B' },
  confirmed:  { bg: '#001428', color: '#38BDF8' },
  processing: { bg: '#1A0C00', color: '#FF4500' },
  shipped:    { bg: '#160B2E', color: '#A78BFA' },
  delivered:  { bg: '#0A1F0A', color: '#4ADE80' },
  cancelled:  { bg: '#1F0A0A', color: '#F87171' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: '#1A1A1A', color: '#8A8681' };
  return (
    <span style={{
      ...MONO, fontSize: '10px', fontWeight: 600,
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: '999px',
      border: `1px solid ${s.color}33`,
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const { t } = useAdminTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch {
      setSupported(false);
    }
    setLoading(false);
  }

  // Field helpers — support both old and new schema
  const orderId = (o) => o.order_id || o.order_number || '—';
  const orderTotal = (o) => o.total_amount ?? o.total ?? 0;
  const orderStatus = (o) => o.status || o.fulfillment_status || 'pending';
  const orderPhone = (o) => o.customer_phone || '—';

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || orderStatus(o) === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || orderId(o).toLowerCase().includes(q) || (o.customer_name || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = ALL_STATUSES.reduce((acc, s) => ({
    ...acc, [s]: orders.filter(o => orderStatus(o) === s).length,
  }), {});

  if (!supported) {
    return (
      <div>
        <h1 style={{ ...HEADING, fontSize: '40px', marginBottom: '16px', color: t.text }}>ORDERS</h1>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: t.textMuted, marginBottom: '12px' }}>Orders table not found in Supabase.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Manage</p>
        <h1 style={{ ...HEADING, fontSize: '40px', margin: '4px 0 0', color: t.text }}>ORDERS</h1>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Order ID or customer name…"
          style={{
            width: '100%', maxWidth: '400px', padding: '9px 14px',
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: '8px', color: t.text, fontSize: '13px',
            outline: 'none', boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
          onBlur={e => e.currentTarget.style.borderColor = t.border}
        />
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')}
          style={{
            ...MONO, fontSize: '11px', padding: '5px 14px', borderRadius: '999px',
            background: filterStatus === 'all' ? '#FF4500' : t.surface2,
            color: filterStatus === 'all' ? 'white' : t.textSub,
            border: `1px solid ${filterStatus === 'all' ? '#FF4500' : t.border2}`,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
          All ({orders.length})
        </button>
        {ALL_STATUSES.map(s => {
          const active = filterStatus === s;
          const sc = STATUS_STYLE[s];
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{
                ...MONO, fontSize: '11px', padding: '5px 14px', borderRadius: '999px',
                background: active ? `${sc.color}22` : t.surface2,
                color: active ? sc.color : t.textMuted,
                border: `1px solid ${active ? `${sc.color}55` : t.border}`,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
              {s} ({counts[s] ?? 0})
            </button>
          );
        })}
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['Order ID', 'Customer', 'Phone', 'Total', 'Status', 'Date'].map((h, i) => (
                  <th key={h + i} style={{
                    ...MONO, padding: '11px 14px', textAlign: 'left',
                    fontSize: '10px', color: t.textMuted, textTransform: 'uppercase',
                    letterSpacing: '0.1em', fontWeight: 500, whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${t.border3}` }}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} style={{ padding: '14px' }}>
                        <div style={{ height: '12px', background: t.shimmer, borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '56px', textAlign: 'center' }}>
                    <p style={{ color: t.textFaint, fontSize: '14px', margin: 0 }}>
                      {search ? 'No orders match your search.' : filterStatus === 'all' ? 'No orders yet.' : `No ${filterStatus} orders.`}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    style={{ borderBottom: `1px solid ${t.border3}`, cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = t.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ ...MONO, fontSize: '12px', color: '#FF4500' }}>
                        {orderId(order)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ margin: 0, color: t.text }}>{order.customer_name}</p>
                      <p style={{ margin: '2px 0 0', ...MONO, fontSize: '11px', color: t.textMuted }}>{order.customer_email}</p>
                    </td>
                    <td style={{ padding: '12px 14px', ...MONO, fontSize: '12px', color: t.textSub }}>
                      {orderPhone(order)}
                    </td>
                    <td style={{ padding: '12px 14px', ...MONO, color: t.text, fontWeight: 600 }}>
                      ₹{Number(orderTotal(order)).toFixed(0)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusBadge status={orderStatus(order)} />
                    </td>
                    <td style={{ padding: '12px 14px', ...MONO, fontSize: '11px', color: t.textMuted, whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
