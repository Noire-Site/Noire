-- ============================================================
-- Promo Codes — Nøiré
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. promo_codes table
create table if not exists public.promo_codes (
  id               uuid        default gen_random_uuid() primary key,
  code             text        not null unique,
  discount_type    text        not null check (discount_type in ('percentage', 'fixed')),
  discount_value   numeric     not null,
  min_order_value  numeric,
  max_uses         integer,
  uses_count       integer     not null default 0,
  is_active        boolean     not null default true,
  show_on_store    boolean     not null default false,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

-- 2. Row-level security
alter table public.promo_codes enable row level security;

-- Storefront (anon) can read all codes for validation
create policy "Anyone can read promo codes"
  on public.promo_codes for select
  using (true);

-- Authenticated admin can do full CRUD
create policy "Authenticated users can manage promo codes"
  on public.promo_codes for all
  to authenticated
  using (true)
  with check (true);

-- 3. RPC — safe atomic increment (security definer bypasses RLS,
--    so the anon storefront can call it at checkout without write permissions)
create or replace function public.increment_promo_uses(promo_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.promo_codes
  set uses_count = uses_count + 1
  where id = promo_id;
end;
$$;

-- 4. Add promo columns to orders (idempotent)
alter table public.orders
  add column if not exists promo_code      text,
  add column if not exists discount_amount numeric default 0;
