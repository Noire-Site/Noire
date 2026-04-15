-- Add structured shipping address columns to orders table
-- The old shipping_address text column is kept for backwards compatibility

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS flat_number  text,
  ADD COLUMN IF NOT EXISTS apartment    text,
  ADD COLUMN IF NOT EXISTS landmark     text,
  ADD COLUMN IF NOT EXISTS street       text,
  ADD COLUMN IF NOT EXISTS city         text,
  ADD COLUMN IF NOT EXISTS state        text,
  ADD COLUMN IF NOT EXISTS pincode      text;
