-- Migration: 01_tables.sql
-- Description: Create initial schema tables with 'web_' prefix.
-- Depends on: Existing 'users' table in the shared database.

-- 1. Web User Permissions (RBAC)
CREATE TABLE IF NOT EXISTS public.web_user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')) DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_permission UNIQUE (user_id)
);

-- 2. Web Settings (Global Config)
CREATE TABLE IF NOT EXISTS public.web_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE DEFAULT 'global',
    theme_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    brand_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT constrain_single_row CHECK (key = 'global')
);

-- 3. Web Assets (Media)
CREATE TABLE IF NOT EXISTS public.web_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id),
    bucket TEXT NOT NULL DEFAULT 'site-assets',
    path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    width INT,
    height INT,
    duration_seconds NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Web Sections (Structure)
CREATE TABLE IF NOT EXISTS public.web_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    published_version_id UUID, -- Circular reference, handle carefully or ADD CONSTRAINT later
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Web Section Versions (Content)
CREATE TABLE IF NOT EXISTS public.web_section_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.web_sections(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    title_override TEXT,
    content_format TEXT CHECK (content_format IN ('layout', 'html', 'markdown')) DEFAULT 'layout',
    content_html TEXT,
    content_markdown TEXT,
    layout_json JSONB,
    meta_json JSONB,
    custom_css TEXT,
    changelog TEXT,
    is_locked BOOLEAN DEFAULT false
);

-- Add Foreign Key for published_version_id now that versions table exists
ALTER TABLE public.web_sections 
ADD CONSTRAINT fk_published_version 
FOREIGN KEY (published_version_id) REFERENCES public.web_section_versions(id);

-- Draft uniqueness constraint
CREATE UNIQUE INDEX IF NOT EXISTS unique_draft_version 
ON public.web_section_versions (section_id, created_by) 
WHERE status = 'draft';

-- 6. Web Section Permissions (Granular Editing)
CREATE TABLE IF NOT EXISTS public.web_section_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.web_sections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_publish BOOLEAN DEFAULT false,
    CONSTRAINT unique_section_user_permission UNIQUE (section_id, user_id)
);

-- 7. Web Case Studies
CREATE TABLE IF NOT EXISTS public.web_case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('internal', 'external')),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    cover_asset_id UUID REFERENCES public.web_assets(id),
    external_url TEXT,
    content_format TEXT CHECK (content_format IN ('layout', 'html', 'markdown')) DEFAULT 'layout',
    content_html TEXT,
    layout_json JSONB,
    content_markdown TEXT,
    is_enabled BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Web Case Study Display Settings
CREATE TABLE IF NOT EXISTS public.web_case_study_display_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE DEFAULT 'global',
    mode TEXT NOT NULL CHECK (mode IN ('all', 'custom', 'rotate')) DEFAULT 'all',
    custom_ids UUID[] DEFAULT '{}',
    rotate_json JSONB DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Web Testimonials
CREATE TABLE IF NOT EXISTS public.web_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    quote TEXT NOT NULL,
    avatar_asset_id UUID REFERENCES public.web_assets(id),
    sort_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    source TEXT CHECK (source IN ('admin', 'customer')) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Web Testimonial Tokens
CREATE TABLE IF NOT EXISTS public.web_testimonial_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    max_uses INT NOT NULL DEFAULT 1,
    uses INT NOT NULL DEFAULT 0,
    is_revoked BOOLEAN DEFAULT false,
    context_json JSONB
);

-- 11. Web Testimonial Submissions
CREATE TABLE IF NOT EXISTS public.web_testimonial_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES public.web_testimonial_tokens(id),
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    quote TEXT NOT NULL,
    avatar_asset_id UUID REFERENCES public.web_assets(id),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    approved_testimonial_id UUID REFERENCES public.web_testimonials(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Web FAQ Items
CREATE TABLE IF NOT EXISTS public.web_faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer_html TEXT NOT NULL,
    category TEXT,
    sort_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Web Tool Logos
CREATE TABLE IF NOT EXISTS public.web_tool_logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    asset_id UUID NOT NULL REFERENCES public.web_assets(id),
    website_url TEXT,
    sort_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true
);

-- 14. Web Audit Logs
CREATE TABLE IF NOT EXISTS public.web_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
