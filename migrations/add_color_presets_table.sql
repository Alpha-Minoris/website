-- Migration: Add color presets table for gradient text feature
-- Table: website_color_presets (GLOBAL PRESETS - Shared by all users)

CREATE TABLE IF NOT EXISTS website_color_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Preset details
  name VARCHAR(100) NOT NULL UNIQUE, -- Global unique names
  type VARCHAR(20) NOT NULL CHECK (type IN ('solid', 'linear', 'radial')),
  value TEXT NOT NULL, -- CSS color string or gradient
  
  -- Metadata
  is_default BOOLEAN DEFAULT false, -- System defaults vs user-created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_color_presets_is_default ON website_color_presets(is_default);

-- RLS Policies (permissive for now, can be restricted when auth is added)
ALTER TABLE website_color_presets ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view all presets)
CREATE POLICY "Public read access"
  ON website_color_presets FOR SELECT
  USING (true);

-- Allow public insert (create custom presets) - can be restricted to auth users later
CREATE POLICY "Public insert access"
  ON website_color_presets FOR INSERT
  WITH CHECK (is_default = false);

-- Allow public update of custom presets only
CREATE POLICY "Public update custom presets"
  ON website_color_presets FOR UPDATE
  USING (is_default = false);

-- Allow public delete of custom presets only
CREATE POLICY "Public delete custom presets"
  ON website_color_presets FOR DELETE
  USING (is_default = false);

-- Insert default presets (run once)
INSERT INTO website_color_presets (name, type, value, is_default) VALUES
  -- Premium light-to-gray gradient (user requested)
  ('Premium Light', 'linear', 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(156,163,175,0.6) 100%)', true),
  
  -- Common solid colors
  ('Accent Blue', 'solid', '#00d4ff', true),
  ('Purple', 'solid', '#9333ea', true),
  ('White', 'solid', '#ffffff', true),
  
  -- Common gradients
  ('Sunset', 'linear', 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', true),
  ('Ocean', 'linear', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', true),
  ('Forest', 'linear', 'linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)', true),
  ('Radial Glow', 'radial', 'radial-gradient(circle, #00d2ff 0%, #3a7bd5 100%)', true)
ON CONFLICT (name) DO NOTHING;
