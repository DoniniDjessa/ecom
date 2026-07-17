-- ============================================================
-- Fix RLS for ecom-* tables (INSERT/UPDATE/DELETE blocked)
-- Run in Supabase → SQL Editor
-- ============================================================

-- Drop old policies if they exist (names may vary)
DROP POLICY IF EXISTS "Allow all ecom-orders"     ON "ecom-orders";
DROP POLICY IF EXISTS "Allow all ecom-products"   ON "ecom-products";
DROP POLICY IF EXISTS "Allow all ecom-settings"   ON "ecom-settings";
DROP POLICY IF EXISTS "Allow all ecom-categories" ON "ecom-categories";
DROP POLICY IF EXISTS "ecom-orders-all"           ON "ecom-orders";
DROP POLICY IF EXISTS "ecom-products-all"         ON "ecom-products";
DROP POLICY IF EXISTS "ecom-settings-all"         ON "ecom-settings";
DROP POLICY IF EXISTS "ecom-categories-all"       ON "ecom-categories";

-- Ensure RLS is on
ALTER TABLE "ecom-orders"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecom-products"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecom-settings"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecom-categories" ENABLE ROW LEVEL SECURITY;

-- Grants for anon + authenticated (browser uses anon key)
GRANT ALL ON TABLE "ecom-orders"     TO anon, authenticated;
GRANT ALL ON TABLE "ecom-products"   TO anon, authenticated;
GRANT ALL ON TABLE "ecom-settings"   TO anon, authenticated;
GRANT ALL ON TABLE "ecom-categories" TO anon, authenticated;

-- Policies: USING = SELECT/UPDATE/DELETE, WITH CHECK = INSERT/UPDATE
CREATE POLICY "ecom-orders-all"
  ON "ecom-orders" FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "ecom-products-all"
  ON "ecom-products" FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "ecom-settings-all"
  ON "ecom-settings" FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "ecom-categories-all"
  ON "ecom-categories" FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Storage bucket policies for ecom-bucket (uploads from admin)
-- Create bucket first in Dashboard if missing, then run:
INSERT INTO storage.buckets (id, name, public)
VALUES ('ecom-bucket', 'ecom-bucket', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "ecom-bucket public read" ON storage.objects;
DROP POLICY IF EXISTS "ecom-bucket anon upload" ON storage.objects;
DROP POLICY IF EXISTS "ecom-bucket anon update" ON storage.objects;
DROP POLICY IF EXISTS "ecom-bucket anon delete" ON storage.objects;

CREATE POLICY "ecom-bucket public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'ecom-bucket');

CREATE POLICY "ecom-bucket anon upload"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'ecom-bucket');

CREATE POLICY "ecom-bucket anon update"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'ecom-bucket') WITH CHECK (bucket_id = 'ecom-bucket');

CREATE POLICY "ecom-bucket anon delete"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'ecom-bucket');
