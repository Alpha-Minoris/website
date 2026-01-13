-- Migration: 02_rls.sql
-- Description: Enable RLS and set policies for all web_ tables.

-- Function to helper check permissions
CREATE OR REPLACE FUNCTION public.check_web_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.web_user_permissions
        WHERE user_id = auth.uid()
        AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Web User Permissions
ALTER TABLE public.web_user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage permissions"
ON public.web_user_permissions
FOR ALL
USING (auth.uid() IN (
    SELECT user_id FROM public.web_user_permissions WHERE role = 'super_admin'
));

CREATE POLICY "Users can view own permission"
ON public.web_user_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Web Settings
ALTER TABLE public.web_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
ON public.web_settings FOR SELECT
USING (true);

CREATE POLICY "Super admin update settings"
ON public.web_settings FOR UPDATE
USING (public.check_web_role(ARRAY['super_admin']));

-- 3. Web Assets
ALTER TABLE public.web_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read assets"
ON public.web_assets FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload assets"
ON public.web_assets FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 4. Web Sections
ALTER TABLE public.web_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled sections"
ON public.web_sections FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Authenticated users read all sections"
ON public.web_sections FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Super admin manage sections"
ON public.web_sections FOR ALL
USING (public.check_web_role(ARRAY['super_admin']));

-- 5. Web Section Versions
ALTER TABLE public.web_section_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published versions"
ON public.web_section_versions FOR SELECT
USING (status = 'published');

CREATE POLICY "Users read own drafts"
ON public.web_section_versions FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Admins and Editors read all versions"
ON public.web_section_versions FOR SELECT
USING (public.check_web_role(ARRAY['super_admin', 'admin', 'editor']));

CREATE POLICY "Editors can create drafts"
ON public.web_section_versions FOR INSERT
WITH CHECK (
    -- Must be authenticated and status must be draft
    auth.role() = 'authenticated' 
    AND status = 'draft'
    AND (
        -- Check granular permission or Admin role
        EXISTS (
            SELECT 1 FROM public.web_section_permissions 
            WHERE section_id = web_section_versions.section_id 
            AND user_id = auth.uid() 
            AND can_edit = true
        ) OR public.check_web_role(ARRAY['super_admin', 'admin'])
    )
);

CREATE POLICY "Editors can update own drafts"
ON public.web_section_versions FOR UPDATE
USING (
    created_by = auth.uid() 
    AND status = 'draft'
);

-- 6. Web Section Permissions
ALTER TABLE public.web_section_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manage section permissions"
ON public.web_section_permissions FOR ALL
USING (public.check_web_role(ARRAY['super_admin']));

CREATE POLICY "Users view own section permissions"
ON public.web_section_permissions FOR SELECT
USING (user_id = auth.uid());

-- 7. Web Case Studies
ALTER TABLE public.web_case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled case studies"
ON public.web_case_studies FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins manage case studies"
ON public.web_case_studies FOR ALL
USING (public.check_web_role(ARRAY['super_admin', 'admin']));

-- 8. Web Case Study Display Settings
ALTER TABLE public.web_case_study_display_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read display settings"
ON public.web_case_study_display_settings FOR SELECT
USING (true);

CREATE POLICY "Admins update display settings"
ON public.web_case_study_display_settings FOR UPDATE
USING (public.check_web_role(ARRAY['super_admin', 'admin']));

-- 9. Web Testimonials
ALTER TABLE public.web_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled testimonials"
ON public.web_testimonials FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins manage testimonials"
ON public.web_testimonials FOR ALL
USING (public.check_web_role(ARRAY['super_admin', 'admin']));

-- 10. Web Testimonial Tokens
ALTER TABLE public.web_testimonial_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manage tokens"
ON public.web_testimonial_tokens FOR ALL
USING (public.check_web_role(ARRAY['super_admin']));

-- 11. Web Testimonial Submissions
ALTER TABLE public.web_testimonial_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read submissions"
ON public.web_testimonial_submissions FOR SELECT
USING (public.check_web_role(ARRAY['super_admin', 'admin']));

-- Note: Submissions are created via Server Action with Service Role, 
-- or we can allow public insert if valid token provided (complex in RLS).
-- Strategy: Service Role insert via Next.js backend to validate token first.

-- 12. Web FAQ Items
ALTER TABLE public.web_faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled faq"
ON public.web_faq_items FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins manage faq"
ON public.web_faq_items FOR ALL
USING (public.check_web_role(ARRAY['super_admin', 'admin']));

-- 13. Web Tool Logos
ALTER TABLE public.web_tool_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enabled logos"
ON public.web_tool_logos FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins manage logos"
ON public.web_tool_logos FOR ALL
USING (public.check_web_role(ARRAY['super_admin', 'admin']));

-- 14. Web Audit Logs
ALTER TABLE public.web_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit logs"
ON public.web_audit_logs FOR SELECT
USING (public.check_web_role(ARRAY['super_admin', 'admin']));
