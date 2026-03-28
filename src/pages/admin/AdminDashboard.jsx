// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const HEADING = { fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" };
const MONO = { fontFamily: 'monospace' };

function MetricCard({ label, value, sub, accent, loading }) {
  const { t } = useAdminTheme();
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: '10px',
      padding: '18px 20px',
      boxShadow: accent === '#FF4500' ? '0 0 20px rgba(255,69,0,0.06)' : 'none',
    }}>
      <p style={{ ...MONO, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
        {label}
      </p>
      {loading ? (
        <div style={{ height: '36px', background: t.shimmer, borderRadius: '6px', marginTop: '10px', animation: 'shimmer 1.5s infinite' }} />
      ) : (
        <p style={{ ...HEADING, fontSize: '36px', margin: '6px 0 0', color: t.text, lineHeight: 1 }}>
          {value}
        </p>
      )}
      {sub && !loading && (
        <p style={{ fontSize: '12px', color: t.textMuted, marginTop: '4px' }}>{sub}</p>
      )}
    </div>
  );
}

function RevenueChart({ data, loading }) {
  const { t } = useAdminTheme();
  if (loading) {
    return <div style={{ height: '120px', background: t.surface2, borderRadius: '8px', animation: 'shimmer 1.5s infinite' }} />;
  }
  if (!data.length || data.every(d => d.revenue === 0)) {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: t.textFaint, fontSize: '13px' }}>No revenue data yet</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  const H = 80, barW = 24, gap = 6;
  const totalW = data.length * (barW + gap);

  return (
    <svg viewBox={`0 0 ${totalW} ${H + 24}`} style={{ width: '100%', overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = Math.max((d.revenue / maxVal) * H, d.revenue > 0 ? 3 : 0);
        return (
          <g key={i}>
            <rect x={i * (barW + gap)} y={H - barH} width={barW} height={barH || 2}
              fill={d.revenue > 0 ? '#FF4500' : t.border} rx={3} opacity={0.85} />
            {i % 3 === 0 && (
              <text x={i * (barW + gap) + barW / 2} y={H + 17}
                textAnchor="middle" fill={t.textFaint}
                fontSize="9" fontFamily="monospace">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:    { bg: '#1C1200', color: '#F59E0B', label: 'Pending' },
    processing: { bg: '#001C2E', color: '#38BDF8', label: 'Processing' },
    shipped:    { bg: '#0A1F0A', color: '#4ADE80', label: 'Shipped' },
    delivered:  { bg: '#0F1A0F', color: '#86EFAC', label: 'Delivered' },
    paid:       { bg: '#0A1F0A', color: '#4ADE80', label: 'Paid' },
    refunded:   { bg: '#1F0A0A', color: '#F87171', label: 'Refunded' },
  };
  const s = map[status] ?? { bg: '#1A1A1A', color: '#8A8681', label: status };
  return (
    <span style={{
      ...MONO, fontSize: '10px', fontWeight: 600,
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: '999px',
      border: `1px solid ${s.color}22`,
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

export default function AdminDashboard() {
  const { t } = useAdminTheme();
  const [metrics, setMetrics] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersSupported, setOrdersSupported] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ count: productCount }, { data: lowStockData }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('id').lt('stock', 5),
    ]);

    let orderCount = 0, revenue = 0, recentOrderRows = [];
    try {
      const [{ count }, { data: orders }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      orderCount = count ?? 0;
      recentOrderRows = orders ?? [];

      const { data: chartOrders } = await supabase
        .from('orders').select('created_at, total')
        .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString());

      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return { date: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, revenue: 0 };
      });
      (chartOrders ?? []).forEach(o => {
        const entry = days.find(d => d.date === o.created_at.slice(0, 10));
        if (entry) entry.revenue += o.total ?? 0;
      });
      setChartData(days);

      const { data: allRevData } = await supabase.from('orders').select('total');
      revenue = (allRevData ?? []).reduce((s, o) => s + (o.total ?? 0), 0);

      const counts = {};
      recentOrderRows.forEach(o => {
        (o.items ?? []).forEach(item => {
          counts[item.name] = (counts[item.name] ?? 0) + (item.quantity ?? 1);
        });
      });
      setTopProducts(
        Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, units]) => ({ name, units }))
      );
    } catch {
      setOrdersSupported(false);
    }

    setMetrics({ products: productCount ?? 0, orders: orderCount, revenue, lowStock: (lowStockData ?? []).length });
    setRecentOrders(recentOrderRows);
    setLoading(false);
  }

  const fmt = (n) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ ...MONO, fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Overview</p>
        <h1 style={{ ...HEADING, fontSize: '40px', margin: 0, color: t.text }}>DASHBOARD</h1>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Link to="/admin/products/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: '#FF4500', color: 'white', padding: '9px 18px',
          borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
        }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add Product
        </Link>
        {[{ to: '/admin/orders', label: 'View All Orders' }, { to: '/admin/products', label: 'View All Products' }].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: t.surface2, color: t.textSub, padding: '9px 18px',
            borderRadius: '7px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
            border: `1px solid ${t.border2}`,
          }}>
            {label}
          </Link>
        ))}
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <MetricCard label="Total Products" value={metrics.products} accent="#FF4500" loading={loading} />
        <MetricCard label="Total Orders" value={metrics.orders} accent="#38BDF8" loading={loading}
          sub={!ordersSupported ? 'Set up orders table' : null} />
        <MetricCard label="Revenue (All Time)" value={loading ? '—' : fmt(metrics.revenue)} accent="#4ADE80" loading={loading} />
        <MetricCard label="Low Stock Alerts" value={metrics.lowStock}
          accent={metrics.lowStock > 0 ? '#F59E0B' : t.border2} loading={loading}
          sub={metrics.lowStock > 0 ? 'items below 5 units' : 'all good'} />
      </div>

      {/* Chart + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '28px' }} className="dashboard-grid">
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...HEADING, fontSize: '20px', margin: 0, color: t.text }}>REVENUE — LAST 14 DAYS</p>
            {!loading && (
              <p style={{ ...MONO, fontSize: '11px', color: t.textMuted }}>
                {fmt(chartData.reduce((s, d) => s + d.revenue, 0))} total
              </p>
            )}
          </div>
          {!ordersSupported ? (
            <div style={{ height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: t.textFaint, fontSize: '13px' }}>Create the orders table to see chart data</p>
            </div>
          ) : (
            <RevenueChart data={chartData} loading={loading} />
          )}
        </div>

        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '20px' }}>
          <p style={{ ...HEADING, fontSize: '20px', margin: '0 0 14px', color: t.text }}>TOP SELLING</p>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '14px', background: t.shimmer, borderRadius: '4px', marginBottom: '10px', animation: 'shimmer 1.5s infinite' }} />
            ))
          ) : topProducts.length === 0 ? (
            <p style={{ color: t.textFaint, fontSize: '13px', marginTop: '8px' }}>No orders yet</p>
          ) : (
            topProducts.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < topProducts.length - 1 ? `1px solid ${t.border3}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ ...MONO, fontSize: '11px', color: t.textFaint, width: '14px' }}>{i + 1}</span>
                  <p style={{ margin: 0, fontSize: '13px', color: t.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                </div>
                <span style={{ ...MONO, fontSize: '12px', color: '#FF4500', flexShrink: 0, marginLeft: '8px' }}>{p.units} sold</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ ...HEADING, fontSize: '22px', margin: 0, color: t.text }}>RECENT ORDERS</p>
          <Link to="/admin/orders" style={{ fontSize: '12px', color: '#FF4500', textDecoration: 'none' }}>View all →</Link>
        </div>

        {!ordersSupported ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: t.textMuted, fontSize: '14px', margin: 0 }}>Run the SQL below to enable orders tracking.</p>
            <pre style={{
              ...MONO, fontSize: '11px', color: t.textSub,
              background: t.surface2, padding: '12px 16px',
              borderRadius: '8px', margin: '12px auto', maxWidth: '560px',
              textAlign: 'left', overflowX: 'auto', border: `1px solid ${t.border}`,
            }}>
{`CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'paid',
  fulfillment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "read orders" ON orders FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "update orders" ON orders FOR UPDATE
  TO authenticated USING (true);`}
            </pre>
          </div>
        ) : loading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                  {[...Array(5)].map((__, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div style={{ height: '12px', background: t.shimmer, borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke={t.border2} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ color: t.textFaint, fontSize: '14px', margin: 0 }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ ...MONO, padding: '10px 16px', textAlign: 'left', fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}
                    style={{ borderBottom: `1px solid ${t.border3}`, transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = t.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/admin/orders/${order.id}`} style={{ ...MONO, fontSize: '12px', color: '#FF4500', textDecoration: 'none' }}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: t.text }}>{order.customer_name}</td>
                    <td style={{ padding: '12px 16px', color: t.textMuted }}>{(order.items ?? []).length} item{(order.items ?? []).length !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '12px 16px', ...MONO, color: t.text }}>₹{order.total?.toFixed(0)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={order.fulfillment_status} /></td>
                    <td style={{ padding: '12px 16px', ...MONO, fontSize: '11px', color: t.textMuted }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
