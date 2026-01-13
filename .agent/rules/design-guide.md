---
trigger: always_on
---

website design guidline - part 1

You are a senior full-stack engineer. Build a production-ready, one-page marketing website with an in-place admin editing workflow, using **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui**, backed by **Supabase (Postgres + Auth + Storage + RLS)**, deployed headless to **Vercel**.

IMPORTANT DELTA REQUIREMENTS (NEW)
1) Editing UI layout:
   - The editing controls must live primarily in a **single floating top “island” toolbar** (sticky/floating at top of viewport when editing).
   - No persistent right sidebar by default. Use **popover/sheet/drawer** launched from the top island for:
     - Block library picker
     - Media library
     - Section settings
     - Version history
     - Publish/Preview
   - On-block contextual mini-controls are allowed (e.g., a small handle), but the “editor components” must be accessible from the top island.

2) Theme + brand admin:
   - Super admin can edit the **main theme** (colors + fonts) and **logo** from DB.
   - Structural CSS (layout system) is NOT directly editable.
   - Theme changes must apply site-wide without redeploy.
   - Store theme tokens in DB; inject as CSS variables at runtime.
   - Fonts: allow selecting from a controlled list (Google fonts or uploaded font files); avoid arbitrary remote URLs for security.

3) Design guidelines integration:
   - The coding agent MUST read and follow the user-provided design guideline rules document (input will be provided).
   - Implement a “design rules” loader (read-only) and ensure any new UI respects those rules (spacing, component styles, motion, etc.).
   - Don’t hardcode final aesthetics now, but enforce structural constraints that will support those rules.

4) Testimonials from customers via secure one-time link:
   - Later: allow customers to submit testimonials through a **secure one-time generated link**.
   - Submissions go to a “pending” state.
   - Super admin can approve/select which testimonials are shown.
   - Admin UI should support a table view for testimonial moderation.

5) Case studies display mode:
   - Case studies section must support:
     - Show all
     - Custom selection (curated)
     - Rotate (time-based and/or location-based)
   - Super admin configures the mode + rules in DB.
   - Location-based rotation must not require precise GPS; use coarse geo/IP country (via server-side lookup) and allow fallback.

GOAL
- A modern, clean, one-pager public site whose **content is fully database-driven**.
- When logged in, admins can click **Edit** on a section and edit **in place** (WYSIWYG / blocks) with:
  - a top floating toolbar island controlling editing
  - popovers/sheets from the island for adding blocks/media/settings
  - drag & drop for blocks and media
  - responsive grid layout per section
  - preview before publish
  - version history (internal version control) and rollback
- Super admin can assign which users can edit which sections.

PUBLIC SITE SECTIONS (default)
1) Hero / opening section (includes logo marquee)
2) Mission
3) Team
4) Services
5) Packages (like pricing but no prices)
6) How to work with us
7) Testimonials
8) Case studies (external + internal)
9) FAQ
10) Contact

CONTENT MODEL (HYBRID)
Each section supports:
- `content_html` (optional)
- `layout_json` (primary) for blocks + responsive grid
Render priority:
- if layout_json exists -> render blocks
- else render sanitized content_html

EDITOR UX (FUNCTIONAL REQUIREMENTS)
- Public route: `/` one-pager with anchors
- Minimal admin route: `/admin` for:
  - user roles + per-section permissions
  - theme + brand settings
  - testimonial moderation + one-time link generation
  - case studies management + rotation rules
  - section list + ordering + version history overview
- In-place edit overlay on `/`:
  - Hover sections -> “Edit” (if permitted)
  - Click -> edit mode enabled for that section
  - Top floating island appears:
    - Section dropdown (select current section)
    - Add block (opens popover/sheet with block library)
    - Media (sheet)
    - Reorder section / toggle enabled
    - Preview
    - Save draft / autosave status
    - Version history
    - Publish (if allowed)
    - Undo/redo (optional)
  - Blocks selectable; on click highlight; top island shows block controls:
    - Move (up/down or drag handle)
    - Duplicate
    - Delete
    - Edit props (opens popover)
    - Link
    - Alignment
    - Style knobs (limited)
- Drag & drop:
  - reorder blocks inside section grid
  - drag media onto section to create Media block
Use `@dnd-kit/*` for DnD.

RESPONSIVE GRID SYSTEM
- Section defines grid preset + breakpoint columns
- Blocks store col/row spans per breakpoint
- Enforce constraints.

BLOCK LIBRARY (EXTENDABLE, SHADCN-BASED)
Implement a blocks registry mapping type -> React component + Zod props.
Minimum blocks:
- RichTextBlock (Tiptap recommended)
- HeadingBlock
- ParagraphBlock
- ButtonBlock (shadcn Button)
- CardBlock (shadcn Card)
- FeatureListBlock
- StepsBlock
- TestimonialBlock (render approved testimonials)
- FAQBlock (Accordion)
- LogoMarqueeBlock (tool logos)
- CaseStudyGridBlock (mode: all/custom/rotate)
- TeamGridBlock
- ContactFormBlock
- Spacer/DividerBlock
- MediaBlock (image/video)

SECURITY + PERMISSIONS
Supabase Auth + RLS.
Roles: super_admin, admin, editor, viewer.
Super admin:
- manage users/roles
- manage per-section permissions
- manage theme/brand
- manage case studies + selection/rotation rules
- approve testimonials
- publish/rollback any section
Admins/editors: edit assigned sections; publish only if granted `can_publish`.

VERSIONING + DRAFT/PUBLISH
Per-user drafts recommended:
- drafts are separate per (section_id, created_by, status='draft')
Publish creates new published version and locks it.

THEME + BRAND (DB-DRIVEN)
Implement `site_settings` table storing theme tokens and brand assets.
- Theme tokens:
  - colors: primary, secondary, accent, muted, background, foreground, border, ring, card, etc.
  - radius: base rounding tokens
  - font families: heading, body (from allowlist)
  - optional: spacing scale knobs (limited)
- Brand:
  - logo asset reference (SVG/PNG)
  - wordmark optional
- Apply theme:
  - server fetch settings -> inject CSS variables into <html> or a top-level ThemeProvider
  - store as JSON and validate with Zod
- Structural CSS is fixed; only tokens change.

DESIGN GUIDELINES DOCUMENT (INPUT)
The agent will be given a “design guidelines rules” doc.
- Implement a loader to store it in DB as read-only reference:
  - `design_guidelines` table with versioning.
- The code should include a small “rules” panel for admins to view guidelines while editing (read-only).
- Enforce at least:
  - consistent spacing scale usage
  - consistent typography tokens usage
  - motion toggles honoring prefers-reduced-motion

CUSTOMER TESTIMONIAL SUBMISSION VIA ONE-TIME LINK
Implement:
- One-time token generation by super admin:
  - token is random, hashed in DB (store hash only)
  - token has expiry and max uses (default 1)
  - token can be associated with optional context (campaign, customer name/email optional)
- Public form route:
  - `/t/[token]` renders a submission form (name, role, company, quote, optional rating, optional avatar upload)
  - Validate token server-side, ensure not used/expired
  - On submit:
    - store testimonial in `testimonial_submissions` with status='pending'
    - mark token used
- Admin moderation:
  - table view with filters (pending/approved/rejected)
  - approve -> creates/updates `testimonials` record or marks submission approved and publishable
  - selection control: testimonials shown on site come from `testimonials` where is_enabled=true and status='approved'

CASE STUDIES DISPLAY MODES
In case studies section config (DB):
- mode: 'all' | 'custom' | 'rotate'
- if custom:
  - store list of selected case_study ids + order
- if rotate:
  - rotation basis: 'time' | 'location' | 'time_then_location'
  - time rotation:
    - window: daily/weekly/monthly
    - algorithm: round-robin with persisted pointer or deterministic hash by date
  - location rotation:
    - mapping by country/region -> set of case studies
    - use server-side coarse geo lookup of request IP (do not store personal data; store only derived country code for selection; cache briefly)
  - fallback selection:
    - if no matching region -> default pool
Admin UI:
- configure mode + preview what user sees (simulate date + country).

ASSETS
Supabase Storage bucket: `site-assets`.
assets table for metadata.

DB DESIGN (SUPABASE POSTGRES) — OUTPUT AS JSON
Return JSON describing tables, columns, constraints, indexes, and key RLS intent.
Add/modify tables as follows (include everything, not just deltas):

1) profiles
- id uuid pk references auth.users(id) on delete cascade
- email text
- full_name text
- role text check ('super_admin','admin','editor','viewer') default 'viewer'
- avatar_url text nullable
- created_at timestamptz default now()

2) site_settings (NEW)
- id uuid pk (single row; enforce via unique constraint on a constant key)
- key text unique not null default 'global'
- theme_json jsonb not null  (colors/fonts/radius tokens)
- brand_json jsonb not null  (logo_asset_id, wordmark_asset_id optional, company_name)
- updated_by uuid references profiles(id)
- updated_at timestamptz default now()
Zod validate theme_json + brand_json in app.

3) design_guidelines (NEW)
- id uuid pk
- title text not null
- content_md text not null  (markdown rules)
- created_by uuid references profiles(id)
- created_at timestamptz default now()
- is_active boolean default true
Indexes: (is_active, created_at desc)

4) site_sections
- id uuid pk
- slug text unique not null
- title text not null
- description text nullable
- sort_order int not null
- is_enabled boolean default true
- published_version_id uuid nullable references section_versions(id)
- created_at timestamptz default now()
- updated_at timestamptz default now()

5) section_versions
- id uuid pk
- section_id uuid not null references site_sections(id) on delete cascade
- status text check ('draft','published','archived') not null
- created_by uuid references profiles(id)
- created_at timestamptz default now()
- title_override text nullable
- content_html text nullable
- layout_json jsonb nullable
- custom_css text nullable  (scoped + sanitized)
- meta_json jsonb nullable  (grid preset, padding, background, section-level settings)
- changelog text nullable
- is_locked boolean default false
Indexes:
- (section_id, created_at desc)
- (section_id, status)
- unique partial index for per-user draft: (section_id, created_by) where status='draft'

6) section_permissions
- id uuid pk
- section_id uuid not null references site_sections(id) on delete cascade
- user_id uuid not null references profiles(id) on delete cascade
- can_view boolean default true
- can_edit boolean default false
- can_publish boolean default false
Unique:
- (section_id, user_id)

7) assets
- id uuid pk
- owner_id uuid references profiles(id)
- bucket text not null default 'site-assets'
- path text not null
- public_url text not null
- mime_type text
- size_bytes bigint
- width int nullable
- height int nullable
- duration_seconds numeric nullable
- created_at timestamptz default now()
Indexes:
- (owner_id, created_at desc)

8) case_studies
- id uuid pk
- type text check ('internal','external') not null
- slug text unique not null
- title text not null
- summary text nullable
- tags text[] default '{}'
- cover_asset_id uuid nullable references assets(id)
- external_url text nullable
- content_html text nullable
- layout_json jsonb nullable
- is_enabled boolean default true
- is_featured boolean default false
- sort_order int default 0
- published_at timestamptz nullable
- created_at timestamptz default now()
- updated_at timestamptz default now()
