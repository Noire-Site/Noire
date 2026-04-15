// src/pages/admin/PromosPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };
const MONO = { fontFamily: 'monospace' };

// ── Helpers ────────────────────────────────────────────────────────────────

function isExpired(promo) {
  return promo.expires_at && new Date(promo.expires_at) < new Date();
}

function promoStatus(promo) {
  if (isExpired(promo)) return 'expired';
  if (!promo.is_active) return 'inactive';
  return 'active';
}

function discountLabel(promo) {
  return promo.discount_type === 'percentage'
    ? `${promo.discount_value}%`
    : `₹${promo.discount_value}`;
}

function toDatetimeLocal(iso) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ promo }) {
  const status = promoStatus(promo);
  const styles = {
    active:   { bg: '#0A1F0A', color: '#4ADE80', border: '#4ADE8033' },
    inactive: { bg: '#1A1A1A', color: '#6A6661', border: '#6A666133' },
    expired:  { bg: '#1F0A0A', color: '#F87171', border: '#F8717133' },
  };
  const s = styles[status];
  return (
    <span style={{
      ...MONO, fontSize: '10px', fontWeight: 600,
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: '999px',
      border: `1px solid ${s.border}`,
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: '36px', height: '20px', borderRadius: '999px',
        background: checked ? '#FF4500' : '#3A3A3A',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s',
        padding: 0, flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: '2px',
        left: checked ? '18px' : '2px',
        width: '16px', height: '16px',
        borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', display: 'block',
      }} />
    </button>
  );
}

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      background: type === 'error' ? '#2A0A0A' : '#0A1F0A',
      color: type === 'error' ? '#F87171' : '#4ADE80',
      border: `1px solid ${type === 'error' ? '#F8717133' : '#4ADE8033'}`,
      borderRadius: '8px', padding: '12px 18px', fontSize: '13px',
      animation: 'toastIn 0.2s ease',
    }}>
      {message}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  code: '', discount_type: 'percentage', discount_value: '',
  min_order_value: '', max_uses: '', is_active: true,
  show_on_store: false, expires_at: '',
};

// ── Main page ──────────────────────────────────────────────────────────────

export default function PromosPage() {
  const { t } = useAdminTheme();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // promo object or null
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null); // { message, type }
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPromos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  // ── Form helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      min_order_value: promo.min_order_value != null ? String(promo.min_order_value) : '',
      max_uses: promo.max_uses != null ? String(promo.max_uses) : '',
      is_active: promo.is_active,
      show_on_store: promo.show_on_store,
      expires_at: toDatetimeLocal(promo.expires_at),
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormError('');
  };

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) { setFormError('Code is required.'); return; }
    if (!form.discount_value || isNaN(Number(form.discount_value))) {
      setFormError('Discount value must be a number.'); return;
    }
    if (Number(form.discount_value) <= 0) {
      setFormError('Discount value must be greater than 0.'); return;
    }
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) {
      setFormError('Percentage cannot exceed 100.'); return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: form.min_order_value !== '' ? Number(form.min_order_value) : null,
      max_uses: form.max_uses !== '' ? Number(form.max_uses) : null,
      is_active: form.is_active,
      show_on_store: form.show_on_store,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('promo_codes').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('promo_codes').insert(payload));
    }

    setSaving(false);

    if (error) {
      setFormError(error.message.includes('unique') ? 'A code with that name already exists.' : error.message);
      return;
    }

    closeForm();
    await fetchPromos();
    showToast(editing ? 'Promo code updated.' : 'Promo code created.');
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code? This cannot be undone.')) return;
    setDeletingId(id);
    await supabase.from('promo_codes').delete().eq('id', id);
    setDeletingId(null);
    await fetchPromos();
    showToast('Promo code deleted.');
  };

  // ── Inline toggle ────────────────────────────────────────────────────────

  const handleToggle = async (promo, field) => {
    const newValue = !promo[field];
    setTogglingId(`${promo.id}-${field}`);
    await supabase.from('promo_codes').update({ [field]: newValue }).eq('id', promo.id);
    setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, [field]: newValue } : p));
    setTogglingId(null);
  };

  // ── Input style helper ───────────────────────────────────────────────────

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: '7px', color: t.text, fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', color: t.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    ...MONO, marginBottom: '6px',
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Marketing</p>
          <h1 style={{ ...HEADING, fontSize: '40px', margin: '4px 0 0', color: t.text }}>PROMO CODES</h1>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FF4500', color: '#fff', border: 'none',
            padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#CC3700'}
          onMouseLeave={e => e.currentTarget.style.background = '#FF4500'}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Promo Code
        </button>
      </div>

      {/* Table */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Status', 'Active', 'Show on Store', 'Expires', 'Actions'].map(h => (
                  <th key={h} style={{
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
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${t.border3}` }}>
                    {[...Array(10)].map((__, j) => (
                      <td key={j} style={{ padding: '14px' }}>
                        <div style={{ height: '12px', background: t.shimmer, borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: t.textFaint, fontSize: '14px', margin: '0 0 12px' }}>No promo codes yet.</p>
                    <button
                      onClick={openAdd}
                      style={{
                        ...MONO, fontSize: '12px', color: '#FF4500',
                        background: 'none', border: '1px solid #FF450044',
                        padding: '6px 16px', borderRadius: '6px', cursor: 'pointer',
                      }}
                    >
                      + Create your first code
                    </button>
                  </td>
                </tr>
              ) : (
                promos.map(promo => {
                  const isToggling = togglingId?.startsWith(promo.id);
                  const isDeleting = deletingId === promo.id;
                  return (
                    <tr key={promo.id}
                      style={{ borderBottom: `1px solid ${t.border3}`, transition: 'background 0.12s', opacity: isDeleting ? 0.4 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = t.hover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Code */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ ...MONO, fontSize: '13px', fontWeight: 700, color: '#FF4500' }}>
                          {promo.code}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ ...MONO, fontSize: '11px', color: t.textSub, textTransform: 'uppercase' }}>
                          {promo.discount_type}
                        </span>
                      </td>

                      {/* Value */}
                      <td style={{ padding: '12px 14px', ...MONO, fontWeight: 600, color: t.text }}>
                        {discountLabel(promo)}
                      </td>

                      {/* Min Order */}
                      <td style={{ padding: '12px 14px', ...MONO, fontSize: '12px', color: t.textSub }}>
                        {promo.min_order_value ? `₹${promo.min_order_value}` : '—'}
                      </td>

                      {/* Uses */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ ...MONO, fontSize: '12px', color: t.textSub }}>
                          {promo.uses_count}
                          {promo.max_uses != null && (
                            <span style={{ color: t.textFaint }}> / {promo.max_uses}</span>
                          )}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <StatusBadge promo={promo} />
                      </td>

                      {/* Active toggle */}
                      <td style={{ padding: '12px 14px' }}>
                        <ToggleSwitch
                          checked={promo.is_active}
                          onChange={() => handleToggle(promo, 'is_active')}
                          disabled={isToggling}
                        />
                      </td>

                      {/* Show on store toggle */}
                      <td style={{ padding: '12px 14px' }}>
                        <ToggleSwitch
                          checked={promo.show_on_store}
                          onChange={() => handleToggle(promo, 'show_on_store')}
                          disabled={isToggling}
                        />
                      </td>

                      {/* Expires */}
                      <td style={{ padding: '12px 14px', ...MONO, fontSize: '11px', color: isExpired(promo) ? '#F87171' : t.textMuted, whiteSpace: 'nowrap' }}>
                        {promo.expires_at
                          ? new Date(promo.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEdit(promo)}
                            style={{
                              ...MONO, fontSize: '11px', padding: '4px 10px',
                              background: t.surface2, border: `1px solid ${t.border2}`,
                              borderRadius: '5px', color: t.textSub, cursor: 'pointer',
                              transition: 'color 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = t.textSub; }}
                            onMouseLeave={e => { e.currentTarget.style.color = t.textSub; e.currentTarget.style.borderColor = t.border2; }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            disabled={isDeleting}
                            style={{
                              ...MONO, fontSize: '11px', padding: '4px 10px',
                              background: 'transparent', border: '1px solid #F8717133',
                              borderRadius: '5px', color: '#F87171', cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#2A0A0A'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            Delete
                          </button>
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

      {/* ── Form modal ── */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeForm}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />

          {/* Panel */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%', maxWidth: '480px', maxHeight: '90vh',
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: '12px', zIndex: 101,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${t.border}` }}>
              <h2 style={{ ...HEADING, fontSize: '24px', color: t.text, margin: 0 }}>
                {editing ? 'EDIT CODE' : 'NEW PROMO CODE'}
              </h2>
              <button
                onClick={closeForm}
                style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '4px', lineHeight: 0 }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Code */}
              <div>
                <label style={labelStyle}>Code</label>
                <input
                  value={form.code}
                  onChange={e => setField('code', e.target.value.toUpperCase())}
                  placeholder="e.g. NOIRE20"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
                  onBlur={e => e.currentTarget.style.borderColor = t.inputBorder}
                />
              </div>

              {/* Discount type + value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setField('discount_type', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
                    onBlur={e => e.currentTarget.style.borderColor = t.inputBorder}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    {form.discount_type === 'percentage' ? 'Value (%)' : 'Value (₹)'}
                  </label>
                  <input
                    type="number" min="0"
                    value={form.discount_value}
                    onChange={e => setField('discount_value', e.target.value)}
                    placeholder={form.discount_type === 'percentage' ? '20' : '200'}
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
                    onBlur={e => e.currentTarget.style.borderColor = t.inputBorder}
                  />
                </div>
              </div>

              {/* Min order + max uses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Min Order (₹) <span style={{ color: t.textFaint }}>optional</span></label>
                  <input
                    type="number" min="0"
                    value={form.min_order_value}
                    onChange={e => setField('min_order_value', e.target.value)}
                    placeholder="500"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
                    onBlur={e => e.currentTarget.style.borderColor = t.inputBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Uses <span style={{ color: t.textFaint }}>optional</span></label>
                  <input
                    type="number" min="0"
                    value={form.max_uses}
                    onChange={e => setField('max_uses', e.target.value)}
                    placeholder="Unlimited"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
                    onBlur={e => e.currentTarget.style.borderColor = t.inputBorder}
                  />
                </div>
              </div>

              {/* Expires at */}
              <div>
                <label style={labelStyle}>Expires At <span style={{ color: t.textFaint }}>optional</span></label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => setField('expires_at', e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#FF4500'}
                  onBlur={e => e.currentTarget.style.borderColor = t.inputBorder}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', color: t.text, fontWeight: 500 }}>Active</p>
                    <p style={{ margin: '2px 0 0', ...MONO, fontSize: '11px', color: t.textMuted }}>Code can be applied by customers</p>
                  </div>
                  <ToggleSwitch checked={form.is_active} onChange={v => setField('is_active', v)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', color: t.text, fontWeight: 500 }}>Show on Store</p>
                    <p style={{ margin: '2px 0 0', ...MONO, fontSize: '11px', color: t.textMuted }}>Display as a banner on the cart page</p>
                  </div>
                  <ToggleSwitch checked={form.show_on_store} onChange={v => setField('show_on_store', v)} />
                </div>
              </div>

              {/* Error */}
              {formError && (
                <p style={{ margin: 0, fontSize: '12px', color: '#F87171', background: '#2A0A0A', padding: '8px 12px', borderRadius: '6px', border: '1px solid #F8717133' }}>
                  {formError}
                </p>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.border}`, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeForm}
                style={{
                  padding: '9px 20px', background: 'none',
                  border: `1px solid ${t.border2}`, borderRadius: '7px',
                  color: t.textSub, cursor: 'pointer', fontSize: '13px',
                  fontFamily: 'inherit', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = t.text}
                onMouseLeave={e => e.currentTarget.style.color = t.textSub}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '9px 24px',
                  background: saving ? '#CC3700' : '#FF4500',
                  border: 'none', borderRadius: '7px',
                  color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                  transition: 'background 0.15s', opacity: saving ? 0.8 : 1,
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#CC3700'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#FF4500'; }}
              >
                {saving ? 'Saving…' : editing ? 'Update Code' : 'Create Code'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
