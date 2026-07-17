-- ============================================================
--  Ltyy Mood — Table Prefix Migration (updated)
--  Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- STEP 1: Rename existing tables (products, settings, categories)
ALTER TABLE IF EXISTS products    RENAME TO lty_products;
ALTER TABLE IF EXISTS settings    RENAME TO lty_settings;
ALTER TABLE IF EXISTS categories  RENAME TO lty_categories;

-- NOTE: "orders" is NOT renamed — other apps use that table.
-- A fresh lty_orders table is created instead (Step 2).

-- ============================================================
-- STEP 2: Create fresh lty_orders table (same schema as orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS lty_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name    TEXT,
  customer_phone   TEXT,
  delivery_location TEXT,
  customer_note    TEXT,
  items            JSONB,        -- Array of {id, name, qty, price, image}
  total_price      NUMERIC,
  status           TEXT NOT NULL DEFAULT 'pending'  -- 'pending' | 'completed'
);

-- Optional: index for fast status filtering
CREATE INDEX IF NOT EXISTS idx_lty_orders_status
  ON lty_orders(status);

-- Optional: index for date ordering
CREATE INDEX IF NOT EXISTS idx_lty_orders_created
  ON lty_orders(created_at DESC);

-- ============================================================
-- STEP 3: Enable Row Level Security (recommended)
-- ============================================================
ALTER TABLE lty_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lty_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lty_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lty_categories ENABLE ROW LEVEL SECURITY;

-- Allow full access from service role / anon (adjust to your RLS policy)
CREATE POLICY "Allow all lty_orders"     ON lty_orders     FOR ALL USING (true);
CREATE POLICY "Allow all lty_products"   ON lty_products   FOR ALL USING (true);
CREATE POLICY "Allow all lty_settings"   ON lty_settings   FOR ALL USING (true);
CREATE POLICY "Allow all lty_categories" ON lty_categories FOR ALL USING (true);

-- ============================================================
-- STEP 4: Verify
-- ============================================================
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'lty_%'
ORDER BY tablename;

-- Expected:
--   lty_categories
--   lty_orders
--   lty_products
--   lty_settings
