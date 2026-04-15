// src/pages/admin/OrderDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
      ...MONO, fontSize: '11px', fontWeight: 600,
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '999px',
      border: `1px solid ${s.color}33`,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {status}
    </span>
  );
}

function CopyAddressButton({ label, t }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(label).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        ...MONO, fontSize: '11px', padding: '6px 14px', borderRadius: '6px',
        background: copied ? '#0A1F0A' : t.surface2,
        color: copied ? '#4ADE80' : t.textSub,
        border: `1px solid ${copied ? '#4ADE8044' : t.border2}`,
        cursor: 'pointer', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: '6px',
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Address
        </>
      )}
    </button>
  );
}

function Section({ title, children }) {
  const { t } = useAdminTheme();
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}` }}>
        <p style={{ ...MONO, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

export default function OrderDetail() {
  const { t } = useAdminTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { fetchOrder(); }, [id]);

  async function fetchOrder() {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error || !data) { setNotFound(true); setLoading(false); return; }
    setOrder(data);
    setLoading(false);
  }

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) setOrder(prev => ({ ...prev, status: newStatus }));
    setUpdatingStatus(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) {
      navigate('/admin/orders');
    } else {
      console.error('Delete error:', error);
      setDeleteError(error.message || error.code || 'Delete failed');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Field helpers — support both old and new schema
  const orderId = (o) => o.order_id || o.order_number || '—';
  const orderTotal = (o) => o.total_amount ?? o.total ?? 0;
  const orderStatus = (o) => o.status || o.fulfillment_status || 'pending';
  const orderPhone = (o) => o.customer_phone || '—';

  if (loading) {
    return (
      <div>
        <div style={{ height: '36px', width: '200px', background: t.shimmer, borderRadius: '6px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: '120px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', marginBottom: '16px', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: t.textMuted, marginBottom: '16px' }}>Order not found.</p>
        <Link to="/admin/orders" style={{ color: '#FF4500', fontSize: '14px' }}>← Back to Orders</Link>
      </div>
    );
  }

  const currentStatus = orderStatus(order);

  // Build structured address from new columns; fall back to legacy shipping_address string
  const hasStructured = order.flat_number || order.street;
  const formattedAddress = hasStructured
    ? [
        order.flat_number,
        order.apartment,
        order.landmark ? `Near ${order.landmark}` : null,
        order.street,
        order.city && order.state ? `${order.city}, ${order.state}` : (order.city || order.state),
        order.pincode,
      ].filter(Boolean).join('\n')
    : (typeof order.shipping_address === 'string'
        ? order.shipping_address
        : [order.shipping_address?.street, order.shipping_address?.city, order.shipping_address?.postal].filter(Boolean).join(', '));

  const shippingLabelText = hasStructured
    ? [
        order.customer_name,
        order.flat_number,
        order.apartment,
        order.landmark ? `Near ${order.landmark}` : null,
        order.street,
        order.city && order.state ? `${order.city}, ${order.state} - ${order.pincode}` : null,
        order.customer_phone,
      ].filter(Boolean).join('\n')
    : `${order.customer_name}\n${formattedAddress}\n${order.customer_phone || ''}`;

  return (
    <div>
      {/* Breadcrumb + header */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/admin/orders" style={{ ...MONO, fontSize: '12px', color: t.textMuted, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Orders
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ ...HEADING, fontSize: '36px', margin: 0, color: t.text }}>{orderId(order)}</h1>
            <p style={{ ...MONO, fontSize: '12px', color: t.textMuted, marginTop: '4px' }}>
              {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              {' · '}{order.customer_email}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {deleteError && (
              <span style={{ ...MONO, fontSize: '11px', color: '#F87171' }}>{deleteError}</span>
            )}
            <StatusBadge status={currentStatus} />
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  ...MONO, fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
                  background: 'transparent', color: '#F87171',
                  border: '1px solid #F8717144', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1F0A0A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Delete Order
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ ...MONO, fontSize: '11px', color: '#F87171' }}>Sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    ...MONO, fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
                    background: '#F87171', color: 'white', border: 'none',
                    cursor: 'pointer', opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    ...MONO, fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
                    background: t.surface2, color: t.textSub, border: `1px solid ${t.border2}`,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status updater */}
      <Section title="Order Status">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <select
            value={currentStatus}
            onChange={e => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            style={{
              padding: '9px 14px', borderRadius: '8px',
              background: t.surface2, color: t.text,
              border: `1px solid ${t.border2}`, fontSize: '13px',
              cursor: 'pointer', outline: 'none',
              opacity: updatingStatus ? 0.6 : 1,
              fontFamily: 'inherit',
            }}
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ALL_STATUSES.map(s => <StatusBadge key={s} status={s} />)}
          </div>
        </div>
        {updatingStatus && <p style={{ ...MONO, fontSize: '12px', color: t.textMuted, marginTop: '8px' }}>Saving…</p>}
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="detail-grid">
        <Section title="Customer">
          <p style={{ color: t.text, fontWeight: 500, margin: '0 0 4px' }}>{order.customer_name}</p>
          <p style={{ ...MONO, fontSize: '12px', color: t.textSub, margin: '0 0 4px' }}>{order.customer_email}</p>
          <p style={{ ...MONO, fontSize: '12px', color: t.textSub, margin: 0 }}>{orderPhone(order)}</p>
        </Section>
        <Section title="Shipping Address">
          {hasStructured ? (
            <div>
              {order.flat_number && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ ...MONO, fontSize: '11px', color: t.textMuted, width: '90px', flexShrink: 0 }}>FLAT / HOUSE</span>
                  <span style={{ fontSize: '14px', color: t.text }}>{order.flat_number}</span>
                </div>
              )}
              {order.apartment && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ ...MONO, fontSize: '11px', color: t.textMuted, width: '90px', flexShrink: 0 }}>APARTMENT</span>
                  <span style={{ fontSize: '14px', color: t.text }}>{order.apartment}</span>
                </div>
              )}
              {order.landmark && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ ...MONO, fontSize: '11px', color: t.textMuted, width: '90px', flexShrink: 0 }}>LANDMARK</span>
                  <span style={{ fontSize: '14px', color: t.text }}>{order.landmark}</span>
                </div>
              )}
              {order.street && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ ...MONO, fontSize: '11px', color: t.textMuted, width: '90px', flexShrink: 0 }}>STREET</span>
                  <span style={{ fontSize: '14px', color: t.text }}>{order.street}</span>
                </div>
              )}
              {(order.city || order.state || order.pincode) && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ ...MONO, fontSize: '11px', color: t.textMuted, width: '90px', flexShrink: 0 }}>CITY / PIN</span>
                  <span style={{ fontSize: '14px', color: t.text }}>
                    {[order.city, order.state].filter(Boolean).join(', ')}
                    {order.pincode ? ` — ${order.pincode}` : ''}
                  </span>
                </div>
              )}
              <CopyAddressButton label={shippingLabelText} t={t} />
            </div>
          ) : (
            <div>
              <p style={{ color: t.text, lineHeight: 1.7, margin: '0 0 12px', fontSize: '14px' }}>{formattedAddress || '—'}</p>
              {formattedAddress && <CopyAddressButton label={shippingLabelText} t={t} />}
            </div>
          )}
        </Section>
      </div>

      {/* Order items */}
      <Section title={`Items (${(order.items ?? []).length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(order.items ?? []).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: t.surface2, borderRadius: '8px' }}>
              {item.image ? (
                <div style={{ width: '48px', height: '56px', borderRadius: '6px', background: item.image, flexShrink: 0 }} />
              ) : (
                <div style={{ width: '48px', height: '56px', borderRadius: '6px', background: t.border, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: t.text, fontWeight: 500, fontSize: '14px' }}>{item.name}</p>
                <p style={{ margin: '3px 0 0', ...MONO, fontSize: '12px', color: t.textMuted }}>
                  {item.size && `Size ${item.size}`}{item.size && item.color && ' · '}
                  {item.color}
                  {' · '}qty {item.quantity ?? 1}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ ...MONO, color: t.text, margin: 0 }}>₹{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(0)}</p>
                {(item.quantity ?? 1) > 1 && (
                  <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, margin: '2px 0 0' }}>₹{item.price} each</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ borderTop: `1px solid ${t.border}`, marginTop: '16px', paddingTop: '16px' }}>
          {order.subtotal != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: t.textMuted, fontSize: '13px' }}>Subtotal</span>
              <span style={{ ...MONO, fontSize: '13px', color: t.textSub }}>₹{Number(order.subtotal).toFixed(0)}</span>
            </div>
          )}
          {order.shipping != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: t.textMuted, fontSize: '13px' }}>Shipping</span>
              <span style={{ ...MONO, fontSize: '13px', color: t.textSub }}>₹{Number(order.shipping).toFixed(0)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: t.textMuted, fontSize: '13px' }}>Discount</span>
              <span style={{ ...MONO, fontSize: '13px', color: '#4ADE80' }}>-₹{Number(order.discount).toFixed(0)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: `1px solid ${t.border}`, marginTop: '4px' }}>
            <span style={{ ...HEADING, fontSize: '20px', color: t.text }}>TOTAL</span>
            <span style={{ ...MONO, fontSize: '18px', fontWeight: 700, color: '#FF4500' }}>₹{Number(orderTotal(order)).toFixed(0)}</span>
          </div>
        </div>
      </Section>

      <style>{`
        @media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
