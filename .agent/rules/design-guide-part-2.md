---
trigger: always_on
---

website design guidline - part 2

9) case_study_display_settings (NEW)
- id uuid pk (single row or by key)
- key text unique not null default 'global'
- mode text check ('all','custom','rotate') not null default 'all'
- custom_ids uuid[] default '{}'
- rotate_json jsonb nullable
  rotate_json schema example:
  {
    "basis": "time"|"location"|"time_then_location",
    "time": { "window": "daily"|"weekly"|"monthly", "count": 6 },
    "location": {
      "default_ids": ["..."],
      "country_map": { "DE": ["..."], "NL": ["..."] }
    }
  }
- updated_by uuid references profiles(id)
- updated_at timestamptz default now()

10) testimonials (APPROVED/PUBLISHED)
- id uuid pk
- name text not null
- role text nullable
- company text nullable
- quote text not null
- avatar_asset_id uuid nullable references assets(id)
- sort_order int default 0
- is_enabled boolean default true
- source text check ('admin','customer') default 'admin'
- created_at timestamptz default now()

11) testimonial_tokens (NEW one-time links)
- id uuid pk
- token_hash text not null unique
- created_by uuid references profiles(id)
- created_at timestamptz default now()
- expires_at timestamptz not null
- max_uses int not null default 1
- uses int not null default 0
- is_revoked boolean default false
- context_json jsonb nullable (campaign, notes)
Indexes: (expires_at), (is_revoked)

12) testimonial_submissions (NEW pending queue)
- id uuid pk
- token_id uuid references testimonial_tokens(id)
- name text not null
- role text nullable
- company text nullable
- quote text not null
- avatar_asset_id uuid nullable references assets(id)
- status text check ('pending','approved','rejected') default 'pending'
- reviewed_by uuid nullable references profiles(id)
- reviewed_at timestamptz nullable
- created_at timestamptz default now()
- approved_testimonial_id uuid nullable references testimonials(id)
Indexes: (status, created_at desc)

13) faq_items
- id uuid pk
- question text not null
- answer_html text not null
- category text nullable
- sort_order int default 0
- is_enabled boolean default true
- created_at timestamptz default now()

14) tool_logos
- id uuid pk
- name text not null
- asset_id uuid not null references assets(id)
- website_url text nullable
- sort_order int default 0
- is_enabled boolean default true

15) audit_logs
- id uuid pk
- actor_id uuid references profiles(id)
- action text not null
- entity_type text not null
- entity_id uuid not null
- details_json jsonb
- created_at timestamptz default now()
Indexes:
- (actor_id, created_at desc)
- (entity_type, entity_id, created_at desc)

RLS POLICIES (IMPLEMENT AS SQL)
- Public read:
  - site_sections where is_enabled=true
  - section_versions where status='published'
  - case_studies where is_enabled=true
  - testimonials where is_enabled=true
  - faq_items where is_enabled=true
  - tool_logos where is_enabled=true
  - site_settings read allowed for public (theme/brand is not sensitive)
  - case_study_display_settings read allowed for public
- Authenticated write:
  - drafts and edits only with section_permissions or role admin/super_admin
  - publish only with can_publish or role admin/super_admin
- testimonial_submissions:
  - insert allowed for anonymous ONLY via server route (recommended) OR via RLS with token validation (hard in SQL).
  - preferred: handle token verification in Next.js server action/route and write with Supabase service role key (ONLY server-side).
  - still store minimal info; do not store IP.
- testimonial_tokens: only super_admin can create/revoke.
- site_settings: only super_admin can update.
- design_guidelines: only super_admin/admin can insert; public can read active guideline content (or restrict to authenticated).

API/DATA ACCESS PATTERN (MANDATORY)
- Public rendering uses Supabase SSR client.
- Mutations requiring elevated logic (publish, token redemption) should be via Next.js Route Handlers / Server Actions using server-side Supabase client (service role ONLY where needed).
- Keep service role key strictly server-only.

TOP FLOATING ISLAND IMPLEMENTATION
- Create `EditorTopIsland` component:
  - visible when (user authorized) AND (editMode true)
  - anchored top center, responsive
  - uses shadcn: `Card`/`Popover`/`Sheet`/`DropdownMenu`
  - contains tabs/segments: Section / Block / Media / Versions / Theme (super admin only)
- Use `Sheet` from shadcn for “Add block” and “Media library” instead of a permanent sidebar.

CASE STUDIES ROTATION IMPLEMENTATION NOTES
- Time-based deterministic selection:
  - seed = current date truncated to window
  - select N case studies by stable hash ordering
- Location-based:
  - in server route, derive `country` from request headers via a geo service (Vercel provides some geolocation headers in many setups; else fallback).
  - choose pool = rotate_json.location.country_map[country] || default_ids
  - then apply time-based within pool
- Provide admin preview simulator: select country + date.

DELIVERABLES
1) Next.js App Router project with:
   - public one pager
   - `/admin` minimal ops
   - `/t/[token]` testimonial submission page
2) Editor overlay with top floating island and DnD
3) DB migrations + RLS SQL
4) Seed data
5) README

OUTPUT FORMAT REQUIRED FROM YOU (CODING AGENT)
A) Updated DB schema JSON (include new tables)
B) Implementation plan checklist (ordered)
C) File tree + main skeleton components for:
   - ThemeProvider (DB-driven tokens)
   - EditorTopIsland
   - Testimonial token flow (route + server action)
   - Case studies selection resolver
D) SQL for tables + RLS policies
E) Zod schemas for theme_json, brand_json, rotate_json, layout_json

NOW START:
- First output the updated DB schema JSON.
- Then output implementation plan.
- Then output scaffolds and SQL.
- Keep focus on functionality and security; visuals later.