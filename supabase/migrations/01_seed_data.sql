-- Insert default theme settings (Global)
INSERT INTO public.website_settings (key, theme_json, brand_json)
VALUES (
    'global',
    '{
        "colors": {
            "background": "#000000",
            "surface": "#0a0a0a",
            "text": "#ffffff",
            "accent": "#0c759a",
            "border": "rgba(255,255,255,0.10)",
            "muted": "rgba(255,255,255,0.70)"
        },
        "fonts": {
            "heading": "Space Grotesk",
            "body": "Inter"
        },
        "radius": "14px"
    }',
    '{
        "company_name": "Alpha Minoris"
    }'
) ON CONFLICT (key) DO NOTHING;

-- Insert Default Sections
INSERT INTO public.website_sections (slug, title, sort_order, is_enabled)
VALUES 
    ('hero', 'Hero', 1, true),
    ('mission', 'Mission', 2, true),
    ('team', 'Team', 3, true),
    ('services', 'Services', 4, true),
    ('packages', 'Packages', 5, true),
    ('how-we-work', 'How We Work', 6, true),
    ('testimonials', 'Testimonials', 7, true),
    ('case-studies', 'Case Studies', 8, true),
    ('faq', 'FAQ', 9, true),
    ('contact', 'Contact', 10, true)
ON CONFLICT (slug) DO NOTHING;
