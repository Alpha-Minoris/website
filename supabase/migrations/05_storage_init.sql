-- Storage bucket initialization for site assets
-- This version is designed to be safe to run even with restricted permissions.

-- 1. Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create policies scoped to the 'site-assets' bucket.
-- We use DO blocks to avoid errors if policies already exist.

DO $$
BEGIN
    -- Public Read Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'site_assets_public_select'
    ) THEN
        CREATE POLICY "site_assets_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
    END IF;

    -- Permissive Insert (Allows both authenticated and anon for development)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'site_assets_permissive_insert'
    ) THEN
        CREATE POLICY "site_assets_permissive_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');
    END IF;

    -- Permissive Update
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'site_assets_permissive_update'
    ) THEN
        CREATE POLICY "site_assets_permissive_update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets');
    END IF;

    -- Permissive Delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'site_assets_permissive_delete'
    ) THEN
        CREATE POLICY "site_assets_permissive_delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets');
    END IF;
END
$$;
