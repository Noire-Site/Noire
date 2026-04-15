-- ============================================================
-- Security fixes -- Noire
-- Addresses issues raised by Supabase Security Advisor
-- ============================================================

-- 1. waitlist -- enable RLS
-- Anyone may join the waitlist (public signup).
-- No SELECT / UPDATE / DELETE policy = anon clients cannot read entries.
-- Admin access via service role key only.

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can join waitlist"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- 2. admin_users -- enable RLS
-- Authenticated Supabase users (i.e. admins) can read the table so
-- AdminGuard can verify their status. No write policies: admin
-- provisioning is done via the Supabase dashboard / service role.

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can verify their own status"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. orders -- restrict DELETE and UPDATE to admins only
-- The INSERT policy ("Anyone can insert orders") stays as-is:
-- the storefront checkout uses the anon key and has no Supabase session.
-- DELETE and UPDATE should only be performed by logged-in admins.

DROP POLICY IF EXISTS "Allow delete" ON public.orders;
CREATE POLICY "Admins can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. increment_promo_uses -- fix mutable search_path
-- SECURITY DEFINER functions must pin search_path to prevent
-- search-path hijacking attacks.

ALTER FUNCTION public.increment_promo_uses(uuid)
  SET search_path = public;
