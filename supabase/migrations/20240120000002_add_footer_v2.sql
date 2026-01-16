-- Add Footer Section and Initial Version
-- v2: Correct table names and ensure version exists

DO $$
DECLARE
    v_section_id uuid;
    v_version_id uuid;
BEGIN
    -- 1. Insert or Get Section ID
    -- Using ON CONFLICT to act as upsert or finding existing
    -- Assuming slug is unique
    SELECT id INTO v_section_id FROM website_sections WHERE slug = 'footer';
    
    IF v_section_id IS NULL THEN
        INSERT INTO website_sections (slug, title, sort_order, is_enabled)
        VALUES ('footer', 'Footer', 999, true)
        RETURNING id INTO v_section_id;
    END IF;

    -- 2. Insert Published Version
    -- We need a published version for page.tsx to pick it up and read `layout_json.type`
    INSERT INTO website_section_versions (
        section_id, 
        status, 
        layout_json, 
        content_html, 
        created_at
    )
    VALUES (
        v_section_id,
        'published',
        '{"type": "footer"}', -- Critical: This tells BlockRenderer to use FooterBlock
        '', -- No HTML content needed
        NOW()
    )
    RETURNING id INTO v_version_id;

    -- 3. Update Section to point to this published version (optional if page.tsx just queries versions by section_id)
    -- But usually helpful for reference. page.tsx query: 
    -- .from('website_section_versions').eq('status', 'published').in('section_id', sectionIds)
    -- So the explicit link in section table might not be strictly required by page.tsx logic shown, 
    -- but good practice if schema has `published_version_id`.
    
    -- Check if column exists strictly before updating, but typically:
    UPDATE website_sections 
    SET published_version_id = v_version_id 
    WHERE id = v_section_id;

END $$;
