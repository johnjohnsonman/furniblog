-- 045: image provenance + model-match publish gate.
-- Separates two INDEPENDENT axes so one field never approves both at once:
--   rights       = usage/licence (does NOT gate public display)
--   model_status = product-match (DOES gate public display)
-- Additive, idempotent. Run in the SQL editor of the APP project:
--   project ref  bvytheznlotwgavmytfr  (the "furniblog" project).

-- Provenance (audit only; never shown publicly).
alter table public.product_images add column if not exists source_url text;         -- original page the image came from
alter table public.product_images add column if not exists origin_image_url text;   -- original online image URL (pre-storage)
alter table public.product_images add column if not exists collected_at timestamptz;

-- model_status = product-match / publish gate (THIS controls public display):
--   'verified'  = confirmed to be this exact model/option -> may show publicly.
--   'candidate' = model match unconfirmed -> held, NEVER shown publicly.
alter table public.product_images
  add column if not exists model_status text not null default 'verified';

create index if not exists product_images_model_status_idx
  on public.product_images (product_id, model_status);

-- Re-interpret the interim 044 `rights` values as USAGE-ONLY and move any
-- publish/hold meaning onto model_status. Safe no-ops if no such rows exist.
--   rights now: 'permitted' | 'owner_policy' | 'kept'
update public.product_images set model_status = 'candidate' where rights = 'candidate';
update public.product_images set rights = 'owner_policy'      where rights = 'confirmed';
update public.product_images set rights = 'kept'              where rights = 'candidate';
