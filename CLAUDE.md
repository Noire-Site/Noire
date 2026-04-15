# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No test suite is configured.

## Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
```

The `api/send-order-email.js` Vercel serverless function also requires `RESEND_API_KEY` (set in Vercel dashboard, not in `.env.local`).

## Architecture

**Nøiré** is a React 18 + Vite SPA (no SSR). Routing is handled by React Router v6 with a flat route tree in `src/App.jsx`.

### Data flow

- **Products** — fetched once from Supabase `products` table inside `ProductsContext`, normalized from snake_case DB columns to camelCase (`sale_price` → `salePrice`, `image_primary`/`image_hover` → wrapped as CSS `url(...)` strings). All pages consume `useProducts()`.
- **Cart** — `CartContext` manages cart state in `localStorage`. Cart items keyed by `${productId}-${size}-color`. Promo code `NOIRE20` hardcoded for 20% discount.
- **Wishlist** — `WishlistContext`, also persisted to `localStorage`.
- **Theme** — `ThemeContext` drives dark/light mode via Tailwind's `darkMode: 'class'`.

### Auth split

There are **two separate auth systems**:

1. **Clerk** (`@clerk/react`) — customer-facing auth on the storefront. `useAuth()` / `useUser()` from Clerk used in Checkout, Account, Wishlist.
2. **Supabase Auth** — admin panel only. `AdminGuard` checks Supabase session and validates against `admin_users` table. Admin routes at `/admin/*` bypass site chrome (Navbar/Footer/CartDrawer).

### Checkout / Order flow

Checkout (`src/pages/Checkout.jsx`) is a 3-step form (Details → Shipping → Payment). On submit it:
1. Saves the order to Supabase `orders` table
2. Calls `POST /api/send-order-email` (Vercel serverless function) to email `support@noire.co.in` via Resend
3. Generates a UPI QR code for payment
4. Sends a WhatsApp confirmation link to hardcoded number `919877432199`

Orders are **not payment-gated** — the UPI payment is manual/offline.

### Supabase imports

Two different import paths are used in the codebase for the Supabase client:
- `src/lib/supabase.js` — primary client used by contexts and admin pages
- `src/utils/supabase` — alias used by some pages (e.g. Checkout)

Both point to the same Supabase project. Prefer `src/lib/supabase.js` for new code.

### Design system

Tailwind config (`tailwind.config.js`) defines the brand tokens:
- Colors: `brand-orange` (#FF4500), `brand-black`, `brand-offwhite`, `brand-gray`
- Fonts: `font-heading` (Bebas Neue), `font-body` (DM Sans), `font-mono` (Space Mono)
- Border radius: `rounded-card` (12px), `rounded-pill` (99px)
- Custom animations: `fade-in-up`, `slide-in-right/out`, `marquee`, `float`

### Vercel config

`vercel.json` rewrites all non-`/api/` paths to `/index.html` (SPA fallback). The `api/` directory contains Vercel serverless functions.

### Admin panel

Located at `/admin/*`. Protected by `AdminGuard` (Supabase session + `admin_users` table check). Includes: Dashboard, Products CRUD (`ProductForm`), Orders, Inventory, Team management. Uses a separate `AdminThemeContext` from the storefront theme.


# Knowledge Base Schema

## What This Is
A personal knowledge base about Nøiré — an Indian youth streetwear brand.

## How It's Organized
- `raw/` contains unprocessed source material. Never modify these files.
- `wiki/` contains the organized wiki. AI maintains this entirely.
- `outputs/` contains generated reports, answers, and analyses.

## Wiki Rules
- Every topic gets its own .md file in wiki/
- Every wiki file starts with a one-paragraph summary
- Link related topics using [[topic-name]] format
- Maintain an INDEX.md that lists every topic
- When new raw sources are added, update wiki articles

## My Interests
- Brand identity and design direction
- Product development and drops
- Business and legal setup (LLP registration, payments, shipping)
- Marketing and growth strategy
- Website and tech infrastructure