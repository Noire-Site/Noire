import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, name, email, phone, shippingAddress, items, total } = req.body;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;">${item.name}${item.size ? ` — Size ${item.size}` : ''}${item.color ? ` / ${item.color}` : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;text-align:right;">₹${(item.price * item.quantity).toFixed(0)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="background:#0a0a0a;color:#e5e5e5;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;border-radius:12px;">
      <h1 style="font-size:28px;margin:0 0 4px;letter-spacing:0.08em;">NØIRÉ</h1>
      <p style="color:#8a8a8a;margin:0 0 28px;font-size:13px;">New Order Received</p>

      <div style="background:#141414;border:1px solid #222;border-radius:8px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:12px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em;">Order ID</p>
        <p style="margin:0;font-family:monospace;font-size:18px;color:#ff4500;">${orderId}</p>
      </div>

      <div style="display:grid;gap:12px;margin-bottom:20px;">
        <div style="background:#141414;border:1px solid #222;border-radius:8px;padding:16px;">
          <p style="margin:0 0 10px;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em;">Customer</p>
          <p style="margin:0 0 4px;font-weight:500;">${name}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#aaa;">${email}</p>
          <p style="margin:0;font-size:13px;color:#aaa;">${phone || '—'}</p>
        </div>
        <div style="background:#141414;border:1px solid #222;border-radius:8px;padding:16px;">
          <p style="margin:0 0 10px;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em;">Shipping Address</p>
          <p style="margin:0;font-size:13px;line-height:1.6;">${shippingAddress}</p>
        </div>
      </div>

      <div style="background:#141414;border:1px solid #222;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <p style="margin:0;padding:12px 16px;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #222;">Items</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#1a1a1a;">
              <th style="padding:8px 12px;text-align:left;color:#8a8a8a;font-weight:500;">Item</th>
              <th style="padding:8px 12px;text-align:center;color:#8a8a8a;font-weight:500;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#8a8a8a;font-weight:500;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="padding:14px 12px;border-top:1px solid #333;text-align:right;">
          <span style="font-size:16px;font-weight:700;color:#ff4500;">Total: ₹${Number(total).toFixed(0)}</span>
        </div>
      </div>

      <p style="font-size:12px;color:#555;text-align:center;margin:0;">
        Reply to this email or WhatsApp the customer to confirm their order.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Nøiré Orders <orders@noire.co.in>',
      to: 'support@noire.co.in',
      subject: `New Order ${orderId} — ${name}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
