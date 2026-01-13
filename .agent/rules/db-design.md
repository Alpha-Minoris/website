---
trigger: model_decision
description: use this when you are designing the database schemas
---

Data model requirements (you must implement these, filling gaps)

0) Common patterns required across most tables
- Primary key: integer/bigint auto-increment or UUID (choose one and be consistent).
- created_at, updated_at (timestamps).
- created_by, updated_by (foreign key to users if you create users; otherwise string actor id).
- tenant_id (string/uuid).
- status (draft/active/archived where meaningful).
- tags (array of strings) OR a normalized tagging table (prefer normalized if possible).
- references: allow multiple references per entity (normalized Reference table recommended).

1) KPI catalog (enhance user-provided KPIs table)
Original:
KPIs { KPI_id, name, description, reference, reference_url, value, area[], unit, effect, impact, reporting(FK) }
You must add (typical KPI governance fields):
- owner_role / owner_contact (who is responsible)
- baseline_value
- target_value
- measurement_method (how calculated)
- data_source (system/table/query)
- collection_frequency (e.g., daily/weekly/monthly/quarterly)
- reporting_frequency (distinct from collection if needed)
- currency (if unit is money)
- directionality (increase/decrease) as enum; keep effect too if you keep legacy
- aggregation (sum/avg/median/p95/etc) for rollups
- timeframe (e.g., 7d/30d/quarter) or window definition
- last_measured_at
- notes

2) AI tools catalog (enhance user-provided AI_tools table)
Original:
AI_tools { tools_id, name, description, vendor, vendor_logo, price, area[], requirements, deploymnet_time, deployment_location, reporting(FK) }
You must add standard software-catalog fields:
- vendor_url
- product_url
- license_type (open-source/commercial/freemium/enterprise)
- pricing_model (per seat/usage/subscription/one-time/custom)
- pricing_currency
- free_tier (bool)
- contract_term (monthly/annual/custom)
- supported_platforms (web, desktop, mobile, api)
- api_available (bool) + api_docs_url
- integration_methods (SSO, SCIM, REST, webhooks, SDK)
- data_residency_options (EU/US/region)
- security_features (SOC2, ISO27001, encryption, RBAC) as structured JSON
- compliance_support (GDPR, HIPAA, etc) as tags/structured
- deployment_requirements (GPU, VPC, network, IAM) structured
- onboarding_effort (low/med/high) OR a more explicit estimate field
- deployment_time_estimate (days/weeks) as structured range
- support_sla (community/standard/premium)
- last_verified_at (when your team last validated pricing/features)
Fix misspellings in normalized schema but keep API backward compatibility:
- deployment_time, not deploymnet_time

3) Solutions catalog (enhance user-provided Solutions table)
Original:
Solutions { solution_id, name, description, scenario, area[], AI_tools[], KPIs[], reporting(FK) }
You must normalize arrays into join tables and add solutionization fields:
- industry (optional tags)
- problem_statement
- prerequisites (data, stack, access)
- implementation_steps (structured)
- estimated_time_to_value (range)
- estimated_cost_range
- expected_benefits (structured)
- risks_and_mitigations (structured)
- required_maturity_level (enum 0-5 or basic/intermediate/advanced)
- dependencies (other solutions)
- success_criteria (links to KPIs)
- version (semantic or integer)
- is_template (bool) to allow cloning per client later

4) Assessment builder (enhance user-provided Assesment_builder table)
Original:
Assesment_builder { question, question_id, answer(0-7 likert), description, domain, reference, reference_url }
You must correct spelling (“Assessment”) in normalized schema and add survey mechanics:
- question_type (likert_0_7, likert_1_5, single_select, multi_select, numeric, text)
- scale_labels (for likert: strongly disagree… strongly agree)
- options (for select types)
- min_value/max_value (for numeric)
- is_required (bool)
- order_index
- section (string) + subsection (optional)
- weight (for scoring)
- scoring_rule (structured) if non-linear
- branching_logic (structured) for conditional visibility
- active_from/active_to (for versioned questionnaires)
- questionnaire_version (required)
- rationale (why this question exists)
- evidence_hint (what documents/data prove the answer)

5) Assessments (client results) — you must normalize this properly
Original:
Assesment { assessment_id, client_id, questions[], asnwers[] }
This array-parallel design is fragile. You must implement normalized:
- assessment (header) table: id, client_id, questionnaire_version, started_at, completed_at, status
- assessment_response table: assessment_id, question_id, answer_value, answer_text, confidence(optional), notes(optional)
- computed_scores table (optional but recommended): domain_score, overall_score, computed_at, method_version
Keep API compatibility by allowing intake of arrays, but store normalized.

6) Reporting (templates linked to any item)
Original:
Reporting { name, code (static html+css+js), paramenterss (json) }
You must:
- Split code into html, css, js fields.
- Add schema_version for parameters.
- Add target_resource_type (enum: KPI, AI_TOOL, SOLUTION, CLIENT, etc.)
- Add target_resource_id (FK) OR a polymorphic association table.
- Add preview_data_binding rules:
   - which entity fields are injected into parameters
- Add safe_render_mode flags:
   - allow_js (default false; if true, heavily sandboxed)
- Add last_rendered_at, last_render_error

7) Clients
Original:
Clients { name, company_url, contact, assessment, discovered solutions[], proposed_slutions[], report, ... }
You must normalize and add operational fields:
- client_id (PK)
- legal_name vs display_name
- website_url
- industry, size_band, region
- primary_contact_id (FK to contacts table) OR embedded structured contact JSON
- lifecycle_stage (lead/prospect/active/paused/closed)
- discovered_solution_links (join table with evidence/notes)
- proposed_solution_links (join table with proposal status)
- client_reports (generated instances) separate from templates
- notes
Correct “proposed_slutions” spelling in normalized schema but keep API backward compatibility.

8) Additional required tables (to fill RAG + governance gaps)
You must add at minimum:
- users (for admin auth) and roles/permissions (RBAC)
- audit_log (actor, action, entity_type, entity_id, before/after diff)
- reference (multi-reference support): entity_type, entity_id, title, url, citation_text, accessed_at
- attachments/documents for evidence (stored in blob storage): file metadata + link to entity
RAG foundations (minimal):
- kb_source (where doc came from: url, file, connector)
- kb_document (metadata: title, mime, source_id, checksum, status)
- kb_chunk (document_id, chunk_index, text, token_count)
- kb_embedding (chunk_id, embedding_model, vector_ref OR raw vector if using pgvector; created_at)
- entity_kb_link (links structured entities to documents/chunks)
