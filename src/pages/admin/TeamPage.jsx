// src/pages/admin/TeamPage.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };
const MONO = { fontFamily: 'monospace' };

const SETUP_SQL = `-- Run this in your Supabase SQL editor:
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Mark yourself as the primary admin:
UPDATE admin_users SET is_primary = TRUE WHERE email = 'your@email.com';`;

function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    success: { bg: '#0A1F0A', color: '#4ADE80', border: '#4ADE8044' },
    error:   { bg: '#1F0A0A', color: '#F87171', border: '#F8717144' },
    warning: { bg: '#1C1200', color: '#F59E0B', border: '#F59E0B44' },
  };
  const c = colors[toast.type] ?? colors.success;
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      padding: '12px 20px', borderRadius: '8px',
      ...MONO, fontSize: '13px',
      zIndex: 1000,
      animation: 'toastIn 0.2s ease',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      maxWidth: '360px',
    }}>
      {toast.message}
    </div>
  );
}

export default function TeamPage() {
  const { t } = useAdminTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrimary, setIsPrimary] = useState(null); // null=checking, true, false
  const [needsMigration, setNeedsMigration] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(null); // email being removed
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentEmail(session.user.email);

      const { data: me, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error) {
        setLoading(false);
        return;
      }

      // If is_primary column doesn't exist, the field will be undefined
      if (!('is_primary' in (me ?? {}))) {
        setNeedsMigration(true);
        setLoading(false);
        return;
      }

      setIsPrimary(!!me?.is_primary);

      if (me?.is_primary) {
        await fetchAdmins();
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchAdmins() {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true });
    setAdmins(data ?? []);
    setLoading(false);
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    const password = invitePassword.trim();
    if (!email) return;
    if (!password) { showToast('Password is required', 'error'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    if (admins.some(a => a.email === email)) {
      showToast(`${email} is already an admin`, 'warning');
      return;
    }

    setInviting(true);
    try {
      // Create the Supabase Auth account via edge function
      const { error: fnError } = await supabase.functions.invoke('invite-admin', {
        body: { email, password },
      });
      if (fnError) throw new Error(fnError.message);

      // Add to admin_users whitelist
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({ email });
      if (insertError) throw new Error(insertError.message);

      showToast(`Account created for ${email} ✓`);
      setInviteEmail('');
      setInvitePassword('');
      await fetchAdmins();
    } catch (err) {
      showToast(err.message || 'Failed to create admin', 'error');
    }
    setInviting(false);
  };

  const handleRemove = async (email) => {
    setRemoving(email);
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('email', email);

    if (error) {
      showToast('Failed to remove admin', 'error');
    } else {
      setAdmins(prev => prev.filter(a => a.email !== email));
      showToast(`${email} removed`);
    }
    setRemoving(null);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div style={{ height: '40px', width: '200px', background: t.shimmer, borderRadius: '6px', marginBottom: '28px', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '200px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', animation: 'shimmer 1.5s infinite' }} />
      </div>
    );
  }

  // ── Migration needed ──────────────────────────────────────────────────────
  if (needsMigration) {
    return (
      <div>
        <h1 style={{ ...HEADING, fontSize: '40px', margin: '0 0 8px', color: t.text }}>TEAM</h1>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '32px' }}>
          <p style={{ color: '#F59E0B', fontWeight: 500, marginBottom: '12px' }}>Database migration required</p>
          <p style={{ color: t.textMuted, fontSize: '14px', marginBottom: '16px' }}>
            The <code style={{ color: t.textSub, background: t.surface2, padding: '2px 6px', borderRadius: '4px' }}>admin_users</code> table needs additional columns. Run this SQL in your Supabase dashboard:
          </p>
          <pre style={{
            ...MONO, fontSize: '12px', color: t.textSub,
            background: t.surface2, border: `1px solid ${t.border}`,
            padding: '16px', borderRadius: '8px', overflowX: 'auto', margin: 0,
          }}>
            {SETUP_SQL}
          </pre>
        </div>
      </div>
    );
  }

  // ── Access denied ─────────────────────────────────────────────────────────
  if (isPrimary === false) {
    return (
      <div>
        <h1 style={{ ...HEADING, fontSize: '40px', margin: '0 0 24px', color: t.text }}>TEAM</h1>
        <div style={{
          background: t.surface, border: `1px solid #EF444433`,
          borderLeft: '3px solid #EF4444',
          borderRadius: '10px', padding: '32px', textAlign: 'center',
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p style={{ color: '#EF4444', fontWeight: 500, margin: '0 0 8px' }}>Access Denied</p>
          <p style={{ color: t.textMuted, fontSize: '14px', margin: 0 }}>Only the primary admin can manage the team.</p>
        </div>
      </div>
    );
  }

  // ── Full Team Page (primary admin only) ───────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>
          Access Control
        </p>
        <h1 style={{ ...HEADING, fontSize: '40px', margin: 0, color: t.text }}>TEAM</h1>
      </div>

      {/* Invite form */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <p style={{ ...MONO, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 14px' }}>
          Create Admin Account
        </p>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="colleague@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            style={{
              flex: '1', minWidth: '200px',
              background: t.inputBg, border: `1px solid ${t.inputBorder}`,
              borderRadius: '999px', color: t.text,
              padding: '10px 18px', fontSize: '14px', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = t.inputBorder}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={invitePassword}
            onChange={e => setInvitePassword(e.target.value)}
            required
            style={{
              flex: '1', minWidth: '180px',
              background: t.inputBg, border: `1px solid ${t.inputBorder}`,
              borderRadius: '999px', color: t.text,
              padding: '10px 18px', fontSize: '14px', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = t.inputBorder}
          />
          <button
            type="submit"
            disabled={inviting}
            style={{
              background: '#FF4500', color: 'white', border: 'none',
              borderRadius: '999px', padding: '10px 24px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              opacity: inviting ? 0.6 : 1, transition: 'background 0.15s, opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!inviting) e.currentTarget.style.background = '#CC3700'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#FF4500'}
          >
            {inviting ? 'Creating…' : '+ Create Account'}
          </button>
        </form>
        <p style={{ ...MONO, fontSize: '11px', color: t.textFaint, margin: '10px 0 0' }}>
          The account is created immediately — share the credentials directly so they can log in.
        </p>
      </div>

      {/* Admin users table */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}` }}>
          <p style={{ ...MONO, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Admin Users ({admins.length})
          </p>
        </div>

        {admins.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: t.textFaint, fontSize: '14px', margin: 0 }}>No admins found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['Email', 'Date Added', 'Role', ''].map((h, i) => (
                  <th key={h + i} style={{
                    ...MONO, padding: '11px 20px',
                    textAlign: i === 3 ? 'right' : 'left',
                    fontSize: '10px', color: t.textMuted,
                    textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isSelf = admin.email === currentEmail;
                const isPrimaryRow = !!admin.is_primary;
                return (
                  <tr
                    key={admin.email}
                    style={{ borderBottom: `1px solid ${t.border3}`, transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = t.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Email */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: isPrimaryRow ? 'rgba(255,69,0,0.12)' : t.surface2,
                          border: `1px solid ${isPrimaryRow ? '#FF450033' : t.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '13px', color: isPrimaryRow ? '#FF4500' : t.textSub }}>
                            {admin.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span style={{ color: t.text, fontWeight: 500 }}>{admin.email}</span>
                        {isSelf && (
                          <span style={{ ...MONO, fontSize: '10px', color: t.textMuted, background: t.surface2, padding: '1px 7px', borderRadius: '999px', border: `1px solid ${t.border2}` }}>
                            you
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date Added */}
                    <td style={{ padding: '14px 20px', ...MONO, fontSize: '12px', color: t.textMuted }}>
                      {admin.created_at
                        ? new Date(admin.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 20px' }}>
                      {isPrimaryRow ? (
                        <span style={{
                          ...MONO, fontSize: '10px', fontWeight: 600,
                          background: 'rgba(255,69,0,0.08)', color: '#FF4500',
                          padding: '2px 10px', borderRadius: '999px',
                          border: '1px solid rgba(255,69,0,0.2)',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          Primary
                        </span>
                      ) : (
                        <span style={{
                          ...MONO, fontSize: '10px', fontWeight: 600,
                          background: t.surface2, color: t.textSub,
                          padding: '2px 10px', borderRadius: '999px',
                          border: `1px solid ${t.border2}`,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          Admin
                        </span>
                      )}
                    </td>

                    {/* Remove */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRemove(admin.email)}
                        disabled={isSelf || isPrimaryRow || removing === admin.email}
                        title={isSelf ? "Can't remove yourself" : isPrimaryRow ? "Can't remove primary admin" : `Remove ${admin.email}`}
                        style={{
                          ...MONO, fontSize: '12px',
                          color: (isSelf || isPrimaryRow) ? t.textFaint : '#EF4444',
                          background: 'none', border: `1px solid ${(isSelf || isPrimaryRow) ? t.border : '#EF444433'}`,
                          borderRadius: '6px', padding: '5px 14px', cursor: (isSelf || isPrimaryRow) ? 'not-allowed' : 'pointer',
                          opacity: removing === admin.email ? 0.5 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelf && !isPrimaryRow) { e.currentTarget.style.background = '#1F0A0A'; e.currentTarget.style.borderColor = '#EF4444'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = (isSelf || isPrimaryRow) ? t.border : '#EF444433'; }}
                      >
                        {removing === admin.email ? '…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
