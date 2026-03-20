# Nøiré

Bold, youth-driven streetwear store — built with React, Supabase, and Clerk.

## Tech Stack

- **React 18** + **Vite** — frontend framework and build tool
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling with custom brand tokens
- **Supabase** — product database and image storage
- **Clerk** — user authentication
- **Vercel** — deployment, analytics, and speed insights

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Database Setup

Run the SQL script in your Supabase SQL Editor to create and seed the `products` table with RLS policies. The schema includes:

- `id`, `name`, `slug`, `price`, `sale_price`
- `category`, `colors` (JSONB), `sizes` (text[])
- `image_primary`, `image_hover` — Supabase Storage URLs
- `description`, `details` (JSONB), `badge`

## Project Structure

```
src/
├── components/       # Navbar, Footer, ProductCard, CartDrawer, etc.
├── contexts/         # CartContext, WishlistContext, ProductsContext, ThemeContext
├── hooks/            # useInView
├── lib/              # supabase.js client
├── pages/            # Home, Shop, ProductDetail, Cart, Wishlist, Account, etc.
└── utils/            # ScrollToTop
```

## Contact

support@noire.co.in
