// src/components/admin/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AdminThemeProvider, useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };

const navItems = [
  {
    to: '/admin', exact: true, label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
      </svg>
    ),
  },
  {
    to: '/admin/products', label: 'Products',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    to: '/admin/orders', label: 'Orders',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: '/admin/inventory', label: 'Inventory',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: '/admin/team', label: 'Team',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function SunIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function SidebarNav({ pathname, onNavigate, session, onSignOut }) {
  const { theme, t, toggleTheme } = useAdminTheme();

  const isActive = (item) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + '/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.sidebarBg }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid ${t.border}` }}>
        <Link to="/admin" onClick={onNavigate} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ ...HEADING, fontSize: '22px', letterSpacing: '0.04em' }}>
              <span style={{ color: '#FF4500' }}>NØ</span>
              <span style={{ color: t.text }}>IRÉ</span>
            </span>
            <span style={{
              fontSize: '9px', color: t.textMuted, fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              border: `1px solid ${t.border2}`, padding: '2px 5px', borderRadius: '3px',
            }}>
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '10px', color: t.navLabel, textTransform: 'uppercase',
          letterSpacing: '0.14em', fontFamily: 'monospace', padding: '4px 10px 8px', margin: 0,
        }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '9px 10px', borderRadius: '7px', marginBottom: '1px',
                color: active ? '#FF4500' : t.navItem,
                background: active ? 'rgba(255,69,0,0.07)' : 'transparent',
                borderLeft: `2px solid ${active ? '#FF4500' : 'transparent'}`,
                textDecoration: 'none', fontSize: '14px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = t.navHover; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = t.navItem; }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${t.border}` }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '8px 10px', color: t.bottomAction,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', borderRadius: '6px', textAlign: 'left',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = t.bottomHover}
          onMouseLeave={e => e.currentTarget.style.color = t.bottomAction}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', color: t.bottomAction, textDecoration: 'none',
            fontSize: '13px', borderRadius: '6px', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = t.bottomHover}
          onMouseLeave={e => e.currentTarget.style.color = t.bottomAction}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Store
        </Link>
        {session && (
          <button
            onClick={onSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '8px 10px', color: t.bottomAction,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', borderRadius: '6px', textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
            onMouseLeave={e => e.currentTarget.style.color = t.bottomAction}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}

function AdminLayoutContent({ children }) {
  const { t } = useAdminTheme();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.pageBg, color: t.text }}>
      {/* Desktop sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        borderRight: `1px solid ${t.border}`,
        background: t.sidebarBg,
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto', display: 'none',
      }} className="lg-sidebar">
        <SidebarNav pathname={pathname} onNavigate={() => {}} session={session} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 40 }}
          />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
            zIndex: 50, background: t.sidebarBg, borderRight: `1px solid ${t.border}`,
          }}>
            <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} session={session} onSignOut={handleSignOut} />
          </aside>
        </>
      )}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: `1px solid ${t.border}`, background: t.sidebarBg,
        }} className="mobile-topbar">
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer', padding: '4px' }}
            aria-label="Open menu"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span style={{ ...HEADING, fontSize: '18px', color: t.text }}>
            <span style={{ color: '#FF4500' }}>NØ</span>IRÉ Admin
          </span>
          <div style={{ width: '28px' }} />
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: block !important; }
          .mobile-topbar { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
