-- Insert Footer Section if it doesn't exist
INSERT INTO site_sections (
    slug, 
    title, 
    sort_order, 
    is_enabled, 
    created_at, 
    updated_at
)
SELECT 
    'footer', 
    'Footer', 
    999, -- High sort order to ensure it's at the bottom
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM site_sections WHERE slug = 'footer'
);

-- Note: Depending on your schema, you might need to insert a default version or rely on the code to handle empty content.
-- The FooterBlock in code generates its own default content if missing, so just the section existence is enough.
