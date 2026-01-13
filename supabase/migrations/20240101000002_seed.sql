-- Migration: 03_seed.sql
-- Description: Seed default data for settings and sections.

-- 1. Seed Site Settings
INSERT INTO public.web_settings (key, theme_json, brand_json)
VALUES (
    'global',
    '{
        "colors": {
            "background": "#ffffff",
            "foreground": "#0a0a0a",
            "primary": "#171717"
        },
        "radius": "0.5rem"
    }'::jsonb,
    '{
        "company_name": "Alpha Minoris"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 2. Seed Default Sections
-- We will create sections. The actual content versions will be empty initially or just placeholders.
-- Slug order: hero, mission, team, services, packages, process, testimonials, casestudies, faq, contact

INSERT INTO public.web_sections (title, slug, sort_order, is_enabled) VALUES
('Hero', 'hero', 10, true),
('Mission', 'mission', 20, true),
('Team', 'team', 30, true),
('Services', 'services', 40, true),
('Packages', 'packages', 50, true),
('Process', 'process', 60, true),
('Testimonials', 'testimonials', 70, true),
('Case Studies', 'case-studies', 80, true),
('FAQ', 'faq', 90, true),
('Contact', 'contact', 100, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Initialize Case Study Display Settings
INSERT INTO public.web_case_study_display_settings (key, mode)
VALUES ('global', 'all')
ON CONFLICT (key) DO NOTHING;
