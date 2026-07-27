-- Structured FAQ for comparison pages (generated from the same grounded data).
-- Powers a visible FAQ section + FAQPage JSON-LD → better GEO (AI-engine
-- citations) and Google FAQ rich results. Array of {q, a} objects.
alter table comparisons add column if not exists faq jsonb default '[]'::jsonb;
