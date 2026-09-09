-- 044: product-image metadata + per-article product-image reuse toggle.
-- Additive only, idempotent — safe to run more than once.
-- Run in the Supabase SQL editor (this project has no direct DB connection).

-- Per-image metadata so ONE upload carries its alt text, caption, provenance
-- and usage-rights, and can be reused across product / Chairpedia / Compare.
alter table public.product_images add column if not exists alt text;
alter table public.product_images add column if not exists caption text;
-- provenance note (audit only, never shown publicly)
alter table public.product_images add column if not exists source text;
-- why this image was linked to the product (audit only): e.g. "ASIN B0…",
-- "manufacturer SKU", "manual". NULL for legacy rows.
alter table public.product_images add column if not exists match_basis text;
-- usage-rights status:
--   'kept'      = pre-existing Furniblog image retained by the owner's decision
--                 (a retention decision, NOT a rights clearance).
--   'confirmed' = supplier/manufacturer-cleared or own shoot.
--   'candidate' = held for review, NOT published (ambiguous match / unverified).
alter table public.product_images
  add column if not exists rights text not null default 'kept';

-- Per-article choice: use the linked product's image as the article hero
-- instead of the article's own curated hero. Unchecking reverts to the hero.
alter table public.chairpedia
  add column if not exists use_product_image boolean not null default false;

-- Speeds up "publishable only" reads (exclude held candidates).
create index if not exists product_images_rights_idx
  on public.product_images (product_id, rights);
