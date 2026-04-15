-- Add structured address columns to the addresses table
ALTER TABLE addresses
  ADD COLUMN IF NOT EXISTS flat_number  text,
  ADD COLUMN IF NOT EXISTS apartment    text,
  ADD COLUMN IF NOT EXISTS landmark     text,
  ADD COLUMN IF NOT EXISTS pincode      text;

-- street and state columns likely already exist; add if missing
ALTER TABLE addresses
  ADD COLUMN IF NOT EXISTS street       text,
  ADD COLUMN IF NOT EXISTS state        text;
