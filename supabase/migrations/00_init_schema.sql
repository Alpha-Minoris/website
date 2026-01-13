-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends auth.users)
CREATE TABLE public.website_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')) DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles for authors"
  ON public.website_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.website_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Site Settings
CREATE TABLE public.website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL DEFAULT 'global',
  theme_json JSONB NOT NULL,
  brand_json JSONB NOT NULL,
  updated_by UUID REFERENCES public.website_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON public.website_settings FOR SELECT
  USING (true);

CREATE POLICY "Super Admin update settings"
  ON public.website_settings FOR UPDATE
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role = 'super_admin'));

-- 3. Assets
CREATE TABLE public.website_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.website_profiles(id),
  bucket TEXT NOT NULL DEFAULT 'site-assets',
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INT,
  height INT,
  duration_seconds NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read assets"
  ON public.website_assets FOR SELECT
  USING (true);

CREATE POLICY "Auth upload assets"
  ON public.website_assets FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Site Sections
CREATE TABLE public.website_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  published_version_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled sections"
  ON public.website_sections FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admin read all sections"
  ON public.website_sections FOR SELECT
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role IN ('super_admin', 'admin', 'editor')));

CREATE POLICY "Super Admin write sections"
  ON public.website_sections FOR ALL
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role = 'super_admin'));

-- 4b. Section Permissions
CREATE TABLE public.website_section_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.website_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.website_profiles(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_publish BOOLEAN DEFAULT false,
  UNIQUE(section_id, user_id)
);

ALTER TABLE public.website_section_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin manage permissions"
  ON public.website_section_permissions FOR ALL
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role = 'super_admin'));


-- 5. Section Versions
CREATE TABLE public.website_section_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.website_sections(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
  content_format TEXT CHECK (content_format IN ('layout', 'html', 'markdown')) DEFAULT 'layout',
  created_by UUID REFERENCES public.website_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title_override TEXT,
  content_html TEXT,
  content_markdown TEXT,
  layout_json JSONB,
  custom_css TEXT,
  meta_json JSONB,
  changelog TEXT,
  is_locked BOOLEAN DEFAULT false
);

ALTER TABLE public.website_sections 
  ADD CONSTRAINT fk_published_version 
  FOREIGN KEY (published_version_id) 
  REFERENCES public.website_section_versions(id);

ALTER TABLE public.website_section_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published versions"
  ON public.website_section_versions FOR SELECT
  USING (status = 'published');

CREATE POLICY "Auth read versions"
  ON public.website_section_versions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert draft"
  ON public.website_section_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update draft"
  ON public.website_section_versions FOR UPDATE
  USING (auth.role() = 'authenticated' AND status = 'draft');

-- 6. Case Studies
CREATE TABLE public.website_case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('internal', 'external')) NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_asset_id UUID REFERENCES public.website_assets(id),
  external_url TEXT,
  content_format TEXT CHECK (content_format IN ('layout', 'html', 'markdown')) DEFAULT 'layout',
  content_html TEXT,
  content_markdown TEXT,
  layout_json JSONB,
  is_enabled BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled case studies"
  ON public.website_case_studies FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admin manage case studies"
  ON public.website_case_studies FOR ALL
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role IN ('super_admin', 'admin')));

-- 7. Case Study Display Settings
CREATE TABLE public.website_case_study_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL DEFAULT 'global',
  mode TEXT CHECK (mode IN ('all', 'custom', 'rotate')) NOT NULL DEFAULT 'all',
  custom_ids UUID[] DEFAULT '{}',
  rotate_json JSONB,
  updated_by UUID REFERENCES public.website_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_case_study_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read case study settings"
  ON public.website_case_study_settings FOR SELECT
  USING (true);

CREATE POLICY "Super Admin manage case study settings"
  ON public.website_case_study_settings FOR UPDATE
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role = 'super_admin'));

-- 8. Testimonials
CREATE TABLE public.website_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  quote TEXT NOT NULL,
  avatar_asset_id UUID REFERENCES public.website_assets(id),
  sort_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  source TEXT CHECK (source IN ('admin', 'customer')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled testimonials"
  ON public.website_testimonials FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admin manage testimonials"
  ON public.website_testimonials FOR ALL
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role IN ('super_admin', 'admin')));

-- 9. Testimonial Tokens
CREATE TABLE public.website_testimonial_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.website_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INT NOT NULL DEFAULT 1,
  uses INT NOT NULL DEFAULT 0,
  is_revoked BOOLEAN DEFAULT false,
  context_json JSONB
);

ALTER TABLE public.website_testimonial_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin manage tokens"
  ON public.website_testimonial_tokens FOR ALL
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role = 'super_admin'));

-- 10. Testimonial Submissions
CREATE TABLE public.website_testimonial_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id UUID REFERENCES public.website_testimonial_tokens(id),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  quote TEXT NOT NULL,
  avatar_asset_id UUID REFERENCES public.website_assets(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.website_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_testimonial_id UUID REFERENCES public.website_testimonials(id)
);

ALTER TABLE public.website_testimonial_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read submissions"
  ON public.website_testimonial_submissions FOR SELECT
  USING (exists (select 1 from public.website_profiles where id = auth.uid() and role IN ('super_admin', 'admin')));

CREATE POLICY "Public insert submission"
  ON public.website_testimonial_submissions FOR INSERT
  WITH CHECK (true);

-- 11. Design Guidelines
CREATE TABLE public.website_design_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    created_by UUID REFERENCES public.website_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.website_design_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read guidelines"
    ON public.website_design_guidelines FOR SELECT
    USING (auth.role() = 'authenticated');
    
CREATE POLICY "Admin manage guidelines"
    ON public.website_design_guidelines FOR ALL
    USING (exists (select 1 from public.website_profiles where id = auth.uid() and role IN ('super_admin', 'admin')));
