# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected `/admin` dashboard for managing products — gated by Supabase Auth + an `admin_users` email whitelist — styled to match the Nøiré dark aesthetic.

**Architecture:** `AdminGuard` wraps each protected route and checks both the Supabase session and the `admin_users` table before rendering. `AdminLayout` provides the outer shell (logo + sign-out). The form (`ProductForm`) handles both create and edit via a `:id` route param; sub-components (`TagInput`, `ColorPicker`) are isolated, reusable, and receive value + onChange props.

**Tech Stack:** Vite + React 18 + React Router v6 + `@supabase/supabase-js` v2 + Tailwind CSS (existing config). No test runner exists in the project — verification steps use the Vite dev server.

**Spec:** `docs/superpowers/specs/2026-03-23-admin-dashboard-design.md`

---

## File Map

**Create:**
- `src/components/admin/AdminGuard.jsx` — async auth + whitelist gate; shows spinner while checking; redirects if not allowed
- `src/components/admin/AdminLayout.jsx` — outer black shell: NØIRE logo, sign-out button (shown only when session exists)
- `src/components/admin/TagInput.jsx` — Enter/comma adds tag pill; × removes; value + onChange props
- `src/components/admin/ColorPicker.jsx` — add hex colors via color picker + text input; swatch display with × remove; value + onChange props
- `src/pages/admin/AdminLogin.jsx` — Supabase Auth email + password sign-in form
- `src/pages/admin/AdminDashboard.jsx` — products table with Edit + two-step inline Delete
- `src/pages/admin/ProductForm.jsx` — full create/edit form; fetches product by `:id` on mount; uploads images to Supabase Storage

**Modify:**
- `src/App.jsx` — add `/admin/*` routes wrapped in `AdminLayout` + `AdminGuard`

---

## Task 1: AdminLayout + AdminGuard

**Files:**
- Create: `src/components/admin/AdminLayout.jsx`
- Create: `src/components/admin/AdminGuard.jsx`

- [ ] **Step 1: Create `AdminLayout.jsx`**

```jsx
// src/components/admin/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLayout({ children }) {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-1">
          <span
            style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
            className="text-2xl tracking-wide"
          >
            <span className="text-[#FF4500]">NØ</span>
            <span className="text-white">IRÉ</span>
          </span>
          <span className="ml-3 text-xs font-mono text-[#5A5651] uppercase tracking-widest border border-[#2A2A2A] px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
        {hasSession && (
          <button
            onClick={handleSignOut}
            className="text-sm text-[#5A5651] hover:text-white transition-colors"
          >
            Sign out
          </button>
        )}
      </header>
      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create `AdminGuard.jsx`**

```jsx
// src/components/admin/AdminGuard.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminGuard({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'no-session' | 'denied'

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('no-session'); return; }

      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', session.user.email)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        setStatus('denied');
      } else {
        setStatus('allowed');
      }
    }
    check();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === 'no-session') return <Navigate to="/admin/login" replace />;
  if (status === 'denied') return <Navigate to="/" replace />;
  return children;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminLayout.jsx src/components/admin/AdminGuard.jsx
git commit -m "feat(admin): add AdminLayout shell and AdminGuard auth gate"
```

---

## Task 2: AdminLogin page

**Files:**
- Create: `src/pages/admin/AdminLogin.jsx`

- [ ] **Step 1: Create `AdminLogin.jsx`**

```jsx
// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check whitelist
    const { data } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single();

    if (!data) {
      await supabase.auth.signOut();
      setError('Access denied. This email is not authorised.');
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  const inputClass =
    'w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 text-white placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors text-sm';

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm">
        <h1
          style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
          className="text-4xl mb-8 text-center"
        >
          ADMIN LOGIN
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded font-medium transition-colors text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/AdminLogin.jsx
git commit -m "feat(admin): add AdminLogin page with Supabase Auth and whitelist check"
```

---

## Task 3: Register admin routes in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add imports to `App.jsx`**

At the top of `src/App.jsx`, add these imports after the existing page imports:

```jsx
import AdminLayout from './components/admin/AdminLayout';
import AdminGuard from './components/admin/AdminGuard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductForm from './pages/admin/ProductForm';
```

- [ ] **Step 2: Add the admin routes inside `<Routes>` in `App.jsx`**

The admin routes must render **outside** the site's `<Navbar>` / `<Footer>`. The cleanest approach is to add a wildcard `/admin/*` branch that returns early, before the main layout. Replace the existing `return (` block structure:

Find this block in `App.jsx`:
```jsx
  return (
    <ThemeProvider>
      <ProductsProvider>
      <CartProvider>
        <WishlistProvider>
```

Before that entire return block, add:

```jsx
  // Admin routes — no site chrome
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLayout><AdminLogin /></AdminLayout>} />
        <Route path="/admin" element={<AdminLayout><AdminGuard><AdminDashboard /></AdminGuard></AdminLayout>} />
        <Route path="/admin/products/new" element={<AdminLayout><AdminGuard><ProductForm /></AdminGuard></AdminLayout>} />
        <Route path="/admin/products/:id" element={<AdminLayout><AdminGuard><ProductForm /></AdminGuard></AdminLayout>} />
      </Routes>
    );
  }
```

- [ ] **Step 3: Update the `document.title` useEffect to handle admin routes**

In the existing `useEffect` that sets the title, add before the existing `if` chain:

```js
    if (pathname.startsWith('/admin')) { document.title = 'Nøiré — Admin'; return; }
```

- [ ] **Step 4: Create placeholder `AdminDashboard.jsx` and `ProductForm.jsx` so the import resolves**

```jsx
// src/pages/admin/AdminDashboard.jsx  (temporary placeholder)
export default function AdminDashboard() {
  return <p className="text-white">Dashboard coming soon</p>;
}
```

```jsx
// src/pages/admin/ProductForm.jsx  (temporary placeholder)
export default function ProductForm() {
  return <p className="text-white">Form coming soon</p>;
}
```

- [ ] **Step 5: Start the dev server and verify**

```bash
npm run dev
```

- Visit `http://localhost:5173/admin` → should redirect to `/admin/login` (AdminGuard fires)
- Visit `http://localhost:5173/admin/login` → should show the ADMIN LOGIN form on black background with NØIRE logo in header
- Try signing in with wrong credentials → should show Supabase error message
- Confirm site navbar/footer does NOT appear on `/admin/*` routes

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/pages/admin/AdminDashboard.jsx src/pages/admin/ProductForm.jsx
git commit -m "feat(admin): register admin routes in App.jsx"
```

---

## Task 4: TagInput component

**Files:**
- Create: `src/components/admin/TagInput.jsx`

The component receives `value` (string[]) and `onChange` (fn). It manages its own input state internally.

- [ ] **Step 1: Create `TagInput.jsx`**

```jsx
// src/components/admin/TagInput.jsx
import { useState, useRef } from 'react';

export default function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) { setInput(''); return; }
    onChange([...value, tag]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div
      className="flex flex-wrap gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 min-h-[44px] cursor-text focus-within:border-[#FF4500] transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-[#2A2A2A] text-white text-xs px-2.5 py-1 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="text-[#5A5651] hover:text-white leading-none"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={value.length === 0 ? 'Add tags — Enter or comma to add' : ''}
        className="flex-1 min-w-[140px] bg-transparent text-white text-sm placeholder-[#5A5651] outline-none"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TagInput manually**

In `AdminDashboard.jsx` placeholder, temporarily render:
```jsx
import { useState } from 'react';
import TagInput from '../../components/admin/TagInput';
export default function AdminDashboard() {
  const [tags, setTags] = useState([]);
  return (
    <div className="max-w-md p-4">
      <TagInput value={tags} onChange={setTags} />
      <pre className="text-white text-xs mt-4">{JSON.stringify(tags)}</pre>
    </div>
  );
}
```
Visit `/admin` (after signing in), type a tag, press Enter → pill appears. Press comma → adds another. Backspace on empty input → removes last. Duplicate → not added.
Remove the temporary test code after verifying.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/TagInput.jsx
git commit -m "feat(admin): add TagInput component"
```

---

## Task 5: ColorPicker component

**Files:**
- Create: `src/components/admin/ColorPicker.jsx`

The component receives `value` (array of `{hex}` objects) and `onChange` (fn). Stores up to 10 colors.

- [ ] **Step 1: Create `ColorPicker.jsx`**

```jsx
// src/components/admin/ColorPicker.jsx
import { useState, useRef } from 'react';

function isValidHex(str) {
  return /^#[0-9A-Fa-f]{6}$/.test(str);
}

export default function ColorPicker({ value = [], onChange }) {
  const [hex, setHex] = useState('#FF4500');
  const [error, setError] = useState('');
  const nativeRef = useRef(null);

  const addColor = () => {
    const normalized = hex.trim().toUpperCase();
    if (!isValidHex(normalized)) { setError('Enter a valid 6-digit hex e.g. #FF4500'); return; }
    if (value.some((c) => c.hex.toUpperCase() === normalized)) { setError('Color already added'); return; }
    if (value.length >= 10) { setError('Maximum 10 colors'); return; }
    onChange([...value, { hex: normalized }]);
    setError('');
  };

  const removeColor = (hexToRemove) => onChange(value.filter((c) => c.hex !== hexToRemove));

  const handleNativePick = (e) => {
    setHex(e.target.value.toUpperCase());
    setError('');
  };

  return (
    <div className="space-y-3">
      {/* Existing swatches */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((c) => (
            <div key={c.hex} className="relative group">
              <div
                className="w-9 h-9 rounded-full border-2 border-[#2A2A2A]"
                style={{ backgroundColor: c.hex }}
                title={c.hex}
              />
              <button
                type="button"
                onClick={() => removeColor(c.hex)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[#5A5651] hover:text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${c.hex}`}
              >
                ×
              </button>
              <span className="block text-[9px] text-[#5A5651] font-mono text-center mt-0.5">{c.hex}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add row */}
      {value.length < 10 && (
        <div className="flex items-center gap-2">
          {/* Native color picker */}
          <div
            className="relative w-10 h-10 rounded overflow-hidden border border-[#2A2A2A] cursor-pointer shrink-0"
            style={{ backgroundColor: hex }}
            onClick={() => nativeRef.current?.click()}
          >
            <input
              ref={nativeRef}
              type="color"
              value={hex}
              onChange={handleNativePick}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          {/* Hex text input */}
          <input
            type="text"
            value={hex}
            onChange={(e) => { setHex(e.target.value); setError(''); }}
            placeholder="#FF4500"
            maxLength={7}
            className="w-28 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm font-mono placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors"
          />
          <button
            type="button"
            onClick={addColor}
            className="px-4 py-2 text-sm border border-[#3A3A3A] text-white rounded hover:bg-[#2A2A2A] transition-colors"
          >
            Add
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/ColorPicker.jsx
git commit -m "feat(admin): add ColorPicker component"
```

---

## Task 6: AdminDashboard — product list

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx` (replace placeholder)

- [ ] **Step 1: Replace `AdminDashboard.jsx` with full implementation**

```jsx
// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

function SkeletonRow() {
  return (
    <tr className="border-b border-[#1A1A1A]">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteState, setDeleteState] = useState({}); // { [id]: 'idle' | 'confirm' | 'deleting' | 'error' }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  const getDeleteState = (id) => deleteState[id] ?? 'idle';
  const setDeleteStateFor = (id, state) => setDeleteState((prev) => ({ ...prev, [id]: state }));

  const handleDeleteClick = (id) => {
    if (getDeleteState(id) === 'idle') {
      setDeleteStateFor(id, 'confirm');
    }
  };

  const handleDeleteCancel = (id) => setDeleteStateFor(id, 'idle');

  const handleDeleteConfirm = async (id) => {
    setDeleteStateFor(id, 'deleting');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setDeleteStateFor(id, 'error');
      setTimeout(() => setDeleteStateFor(id, 'idle'), 3000);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteStateFor(id, 'idle');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1
          style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
          className="text-4xl"
        >
          PRODUCTS
        </h1>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#FF4500] hover:bg-[#CC3700] text-white px-5 py-2.5 rounded text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add Product
        </Link>
      </div>

      <div className="border border-[#2A2A2A] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-[#5A5651] text-xs uppercase tracking-widest font-mono">
              <th className="text-left py-3 px-4 w-14">Img</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Price</th>
              <th className="text-left py-3 px-4">Stock</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#5A5651]">
                  No products yet.{' '}
                  <Link to="/admin/products/new" className="text-[#FF4500] hover:underline">
                    Add the first one.
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const dState = getDeleteState(product.id);
                const price = product.sale_price
                  ? `$${product.sale_price} (was $${product.price})`
                  : `$${product.price}`;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors"
                  >
                    <td className="py-3 px-4">
                      {product.image_primary ? (
                        <img
                          src={product.image_primary}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#2A2A2A] rounded flex items-center justify-center text-[#5A5651] text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{product.name}</td>
                    <td className="py-3 px-4 text-[#5A5651]">{product.category}</td>
                    <td className="py-3 px-4 text-[#5A5651] font-mono text-xs">{price}</td>
                    <td className="py-3 px-4 text-[#5A5651]">{product.stock}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {dState === 'error' && (
                          <span className="text-red-400 text-xs">Delete failed</span>
                        )}
                        {dState === 'confirm' && (
                          <>
                            <button
                              onClick={() => handleDeleteConfirm(product.id)}
                              className="text-red-400 hover:text-red-300 text-xs transition-colors"
                            >
                              Confirm?
                            </button>
                            <button
                              onClick={() => handleDeleteCancel(product.id)}
                              className="text-[#5A5651] hover:text-white text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {dState === 'deleting' && (
                          <div className="w-4 h-4 border border-[#5A5651] border-t-transparent rounded-full animate-spin" />
                        )}
                        {(dState === 'idle' || dState === 'error') && (
                          <>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="text-[#5A5651] hover:text-white text-xs border border-[#3A3A3A] px-3 py-1 rounded hover:bg-[#2A2A2A] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              className="text-red-400 hover:text-red-300 text-xs transition-colors"
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
  );
}
```

- [ ] **Step 2: Verify**

Visit `/admin` after signing in. Confirm:
- Table renders with skeleton rows while loading
- Products appear (or "No products yet" empty state)
- Edit button navigates to `/admin/products/:id`
- Delete → button text changes to "Confirm?" + "Cancel" link → Confirm deletes the row → Cancel resets

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat(admin): implement AdminDashboard product list with inline delete"
```

---

## Task 7: ProductForm — full create/edit form

**Files:**
- Modify: `src/pages/admin/ProductForm.jsx` (replace placeholder)

This is the largest task. The form handles both create (no `:id`) and edit (`:id` present). Image upload is in Task 8; for now the image fields are plain URL text inputs that will be upgraded in Task 8.

- [ ] **Step 1: Replace `ProductForm.jsx` with full implementation**

```jsx
// src/pages/admin/ProductForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TagInput from '../../components/admin/TagInput';
import ColorPicker from '../../components/admin/ColorPicker';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const CATEGORIES = ['Men', 'Women', 'Unisex'];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const inputClass =
  'w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 text-white placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors text-sm';

const labelClass = 'block text-xs uppercase tracking-widest text-[#5A5651] font-mono mb-1.5';

function Field({ label, children, error }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const slugLocked = useRef(isEdit); // locked in edit mode; false in create mode

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'Men',
    price: '',
    sale_price: '',
    tags: [],
    sizes: [],
    colors: [],
    image_primary: '',
    image_hover: '',
    stock: '',
    description: '',
  });

  // Fetch existing product in edit mode
  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) { navigate('/admin'); return; }
      setForm({
        name: data.name ?? '',
        slug: data.slug ?? '',
        category: data.category ?? 'Men',
        price: data.price ?? '',
        sale_price: data.sale_price ?? '',
        tags: data.tags ?? [],
        sizes: data.sizes ?? [],
        colors: data.colors ?? [],
        image_primary: data.image_primary ?? '',
        image_hover: data.image_hover ?? '',
        stock: data.stock ?? '',
        description: data.description ?? '',
      });
      setLoadingProduct(false);
    }
    load();
  }, [id, isEdit, navigate]);

  // Auto-generate slug from name
  useEffect(() => {
    if (slugLocked.current) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, [form.name]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSize = (size) => {
    set('sizes', form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size]
    );
  };

  const handleSlugChange = (e) => {
    slugLocked.current = e.target.value !== '';
    set('slug', e.target.value);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.slug.trim()) errs.slug = 'Required';
    if (form.price === '' || isNaN(Number(form.price))) errs.price = 'Required — enter a number';
    if (form.stock === '' || isNaN(Number(form.stock))) errs.stock = 'Required — enter a number';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category,
      price: Number(form.price),
      sale_price: form.sale_price !== '' ? Number(form.sale_price) : null,
      tags: form.tags,
      sizes: form.sizes,
      colors: form.colors,
      image_primary: form.image_primary.trim() || null,
      image_hover: form.image_hover.trim() || null,
      stock: Number(form.stock),
      description: form.description.trim() || null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('products').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('products').insert([payload]));
    }

    setSaving(false);

    if (error) {
      if (error.message?.includes('slug')) {
        setFieldErrors({ slug: 'This slug is already taken — please choose another.' });
      } else {
        setFormError(error.message);
      }
      return;
    }

    navigate('/admin');
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="text-[#5A5651] hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <h1
          style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
          className="text-4xl"
        >
          {isEdit ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <Field label="Name *" error={fieldErrors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Shadow Hoodie"
            className={inputClass}
          />
        </Field>

        {/* Slug */}
        <Field label="Slug *" error={fieldErrors.slug}>
          <input
            type="text"
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="e.g. shadow-hoodie"
            className={inputClass}
          />
          <p className="text-[#5A5651] text-xs mt-1">Auto-generated from name. Clear this field to reset.</p>
        </Field>

        {/* Category */}
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Price + Sale Price */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price *" error={fieldErrors.price}>
            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </Field>
          <Field label="Sale Price (optional)">
            <input
              type="number"
              min="0"
              step="1"
              value={form.sale_price}
              onChange={(e) => set('sale_price', e.target.value)}
              placeholder="—"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Tags */}
        <Field label="Tags">
          <TagInput value={form.tags} onChange={(v) => set('tags', v)} />
          <p className="text-[#5A5651] text-xs mt-1">e.g. Sale, New Drop, Nøiré Exclusive</p>
        </Field>

        {/* Sizes */}
        <Field label="Sizes Available">
          <div className="flex flex-wrap gap-2 mt-1">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  form.sizes.includes(size)
                    ? 'bg-[#FF4500] border-[#FF4500] text-white'
                    : 'border-[#2A2A2A] text-[#5A5651] hover:border-[#5A5651] hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </Field>

        {/* Colors */}
        <Field label="Colors">
          <ColorPicker value={form.colors} onChange={(v) => set('colors', v)} />
        </Field>

        {/* Image Primary */}
        <Field label="Image URL">
          <input
            type="text"
            value={form.image_primary}
            onChange={(e) => set('image_primary', e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          {form.image_primary && (
            <img src={form.image_primary} alt="preview" className="mt-2 h-24 w-auto rounded object-cover" />
          )}
        </Field>

        {/* Image Hover */}
        <Field label="Hover Image URL (optional)">
          <input
            type="text"
            value={form.image_hover}
            onChange={(e) => set('image_hover', e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          {form.image_hover && (
            <img src={form.image_hover} alt="hover preview" className="mt-2 h-24 w-auto rounded object-cover" />
          )}
        </Field>

        {/* Stock */}
        <Field label="Stock *" error={fieldErrors.stock}>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Product description…"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* Submit */}
        {formError && <p className="text-red-400 text-sm">{formError}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded font-medium transition-colors text-sm"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
          <Link
            to="/admin"
            className="text-sm text-[#5A5651] hover:text-white border border-[#3A3A3A] px-6 py-3 rounded hover:bg-[#2A2A2A] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify create flow**

Visit `/admin/products/new`. Confirm:
- All fields render
- Typing in Name auto-populates Slug; manually editing Slug locks it; clearing Slug re-enables auto-gen
- Size buttons toggle orange highlight
- TagInput and ColorPicker work inline
- Submitting with empty required fields shows inline errors
- Valid submit inserts product into Supabase and redirects to `/admin`

- [ ] **Step 3: Verify edit flow**

Click Edit on an existing product. Confirm:
- Form pre-fills all fields from Supabase
- Slug field is locked (does not update when name changes)
- Saving updates the record in Supabase and redirects to `/admin`

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/ProductForm.jsx
git commit -m "feat(admin): implement full ProductForm with create/edit and validation"
```

---

## Task 8: File upload to Supabase Storage

**Files:**
- Modify: `src/pages/admin/ProductForm.jsx` — upgrade image fields from URL inputs to file uploads

**Prerequisite:** Create a public Supabase Storage bucket named `product-images` in the Supabase dashboard (Storage → New bucket → name: `product-images` → Public: on). Add RLS policy: authenticated users can INSERT and UPDATE; public can SELECT.

- [ ] **Step 1: Add an `ImageUpload` helper component inside `ProductForm.jsx`**

Add this component above the `ProductForm` export in the same file:

```jsx
function ImageUpload({ label, currentUrl, onUpload, optional = false }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `products/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false });

    if (error) {
      setUploadError('Upload failed — try again');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    onUpload(urlData.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <label className={labelClass}>
        {label}{optional ? ' (optional)' : ' *'}
      </label>
      <div className="space-y-2">
        {currentUrl ? (
          <div className="relative inline-block">
            <img src={currentUrl} alt="preview" className="h-24 w-auto rounded object-cover border border-[#2A2A2A]" />
            <button
              type="button"
              onClick={() => { onUpload(''); inputRef.current.value = ''; }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[#5A5651] hover:text-white text-xs flex items-center justify-center"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm border border-[#3A3A3A] text-white px-4 py-2 rounded hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : currentUrl ? 'Replace' : 'Choose File'}
          </button>
          {uploading && (
            <div className="w-4 h-4 border border-[#FF4500] border-t-transparent rounded-full animate-spin" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the two text-input image fields in `ProductForm` with `ImageUpload`**

Find the `{/* Image Primary */}` block and replace it with:

```jsx
        {/* Image Primary */}
        <ImageUpload
          label="Image"
          currentUrl={form.image_primary}
          onUpload={(url) => set('image_primary', url)}
        />
```

Find the `{/* Image Hover */}` block and replace it with:

```jsx
        {/* Image Hover */}
        <ImageUpload
          label="Hover Image"
          currentUrl={form.image_hover}
          onUpload={(url) => set('image_hover', url)}
          optional
        />
```

- [ ] **Step 3: Wire `ImageUpload` error state into `ProductForm` submit guard**

`ImageUpload` must expose whether it is in an error state so the parent form can block submission. Make these changes:

In `ImageUpload`, add an `onError` prop and call it when an upload fails / clears:

```jsx
function ImageUpload({ label, currentUrl, onUpload, onError, optional = false }) {
  // ... existing state ...

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    onError?.(false); // clear error on parent
    setUploading(true);
    // ... upload logic ...
    if (error) {
      setUploadError('Upload failed — try again');
      onError?.(true); // notify parent of error
      setUploading(false);
      return;
    }
    onUpload(urlData.publicUrl);
    onError?.(false);
    setUploading(false);
  };
  // ...
}
```

In `ProductForm`, add state to track the primary image error:

```jsx
const [imagePrimaryError, setImagePrimaryError] = useState(false);
```

Pass it to the `ImageUpload` for `image_primary`:

```jsx
<ImageUpload
  label="Image"
  currentUrl={form.image_primary}
  onUpload={(url) => set('image_primary', url)}
  onError={setImagePrimaryError}
/>
```

In the submit button, disable it when the primary image upload has errored:

```jsx
<button
  type="submit"
  disabled={saving || imagePrimaryError}
  className="bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded font-medium transition-colors text-sm"
>
```

This ensures a failed `image_primary` upload blocks the form from being submitted, as required by the spec. `image_hover` errors are shown inline but do not set `imagePrimaryError`, so they do not block submission.

- [ ] **Step 4: Verify file uploads**

Visit `/admin/products/new`. Click "Choose File" for Image. Select an image. Confirm:
- Upload spinner appears
- Thumbnail preview appears after upload
- Clicking × removes the preview (resets URL in state)
- Clicking "Replace" replaces with a new file
- Submit stores the public URL in `image_primary` column in Supabase

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/ProductForm.jsx
git commit -m "feat(admin): add Supabase Storage file upload to ProductForm"
```

---

## Task 9: Final wiring and smoke test

- [ ] **Step 1: Full end-to-end walkthrough**

1. Visit `http://localhost:5173/admin` → redirected to `/admin/login`
2. Sign in with a Supabase Auth account whose email is in `admin_users` → lands on product list
3. Click "Add Product" → fill all fields → upload images → submit → product appears in list
4. Click "Edit" on the product → form pre-fills → change name → save → updated in list and on storefront
5. Click "Delete" → confirm → product removed from list and from storefront
6. Sign out → session ends → visiting `/admin` redirects to `/admin/login`
7. Sign in with an email NOT in `admin_users` → signed out immediately → redirected to `/`
8. Visit `/admin` in a new incognito window → redirects to `/admin/login`
9. Confirm site homepage, shop, and product pages load normally (no regression)

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat(admin): complete admin dashboard — auth, product list, create/edit/delete, file uploads"
```
