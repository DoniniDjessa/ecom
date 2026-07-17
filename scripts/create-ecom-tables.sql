-- ============================================================
--  Ecom — Create NEW tables + bucket notes
--  Run in Supabase Dashboard → SQL Editor
--  Does NOT rename or touch existing lty_* / other tables.
-- ============================================================

-- Tables use hyphenated names → must be quoted in SQL.
-- In the JS client use: .from('ecom-orders') etc.

-- ── ecom-orders ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ecom-orders" (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name     TEXT,
  customer_phone    TEXT,
  delivery_location TEXT,
  customer_note     TEXT,
  items             JSONB,
  total_price       NUMERIC,
  status            TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_ecom_orders_status
  ON "ecom-orders"(status);

CREATE INDEX IF NOT EXISTS idx_ecom_orders_created
  ON "ecom-orders"(created_at DESC);

-- ── ecom-products ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ecom-products" (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  name              TEXT,
  name_fr           TEXT,
  price             NUMERIC,
  category          TEXT,
  badge             TEXT,
  description       TEXT,
  images            JSONB DEFAULT '[]'::jsonb,
  is_bestseller     BOOLEAN DEFAULT false,
  is_new            BOOLEAN DEFAULT false,
  stock_qty         INTEGER DEFAULT 0,
  discount_percent  NUMERIC DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ecom_products_category
  ON "ecom-products"(category);

-- ── ecom-settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ecom-settings" (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- ── ecom-categories ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ecom-categories" (
  id          TEXT PRIMARY KEY,
  label       TEXT,
  subtitle    TEXT,
  href        TEXT,
  image       TEXT,
  color       TEXT DEFAULT '#9a3d5c',
  sort_order  INTEGER DEFAULT 0
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE "ecom-orders"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecom-products"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecom-settings"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecom-categories" ENABLE ROW LEVEL SECURITY;

-- Drop first so this script is safe to re-run
DROP POLICY IF EXISTS "Allow all ecom-orders"     ON "ecom-orders";
DROP POLICY IF EXISTS "Allow all ecom-products"   ON "ecom-products";
DROP POLICY IF EXISTS "Allow all ecom-settings"   ON "ecom-settings";
DROP POLICY IF EXISTS "Allow all ecom-categories" ON "ecom-categories";
DROP POLICY IF EXISTS "ecom-orders-all"           ON "ecom-orders";
DROP POLICY IF EXISTS "ecom-products-all"         ON "ecom-products";
DROP POLICY IF EXISTS "ecom-settings-all"         ON "ecom-settings";
DROP POLICY IF EXISTS "ecom-categories-all"       ON "ecom-categories";

CREATE POLICY "Allow all ecom-orders"     ON "ecom-orders"     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ecom-products"   ON "ecom-products"   FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ecom-settings"   ON "ecom-settings"   FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ecom-categories" ON "ecom-categories" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT ALL ON TABLE "ecom-orders"     TO anon, authenticated;
GRANT ALL ON TABLE "ecom-products"   TO anon, authenticated;
GRANT ALL ON TABLE "ecom-settings"   TO anon, authenticated;
GRANT ALL ON TABLE "ecom-categories" TO anon, authenticated;

-- ── Verify ───────────────────────────────────────────────────
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ecom-%'
ORDER BY tablename;

-- Expected:
--   ecom-categories
--   ecom-orders
--   ecom-products
--   ecom-settings

-- ============================================================
-- STORAGE (manual in Dashboard → Storage)
-- Create a PUBLIC bucket named: ecom-bucket
-- Then allow uploads (policies) for anon/authenticated as needed.
-- ============================================================
