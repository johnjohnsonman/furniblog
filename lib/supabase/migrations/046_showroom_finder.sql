-- PREPARED ONLY. Requires explicit production approval. No seed data.
begin;
create table public.showrooms (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(trim(name))>0), status text not null default 'draft' check(status in ('draft','published','private')),
 country_code text not null default '',city text not null default '',region text not null default '',address text not null default '',unit text not null default '',
 latitude double precision check(latitude between -90 and 90),longitude double precision check(longitude between -180 and 180),timezone text not null default '',
 phone text not null default '',email text not null default '',website_url text not null default '',booking_url text not null default '',
 store_type text not null default 'retailer' check(store_type in ('brand_showroom','retailer','refurbisher')),
 appointment text not null default 'unknown' check(appointment in ('required','walk_in','unknown')),
 hours jsonb not null default '{"weekly":{},"exceptions":{}}',visit_notes text not null default '',transport_notes text not null default '',photos jsonb not null default '[]',
 source_url text not null default '',checked_on text not null default '',updated_at timestamptz not null default now(),
 check(status<>'published' or (country_code ~ '^[A-Z]{2}$' and length(trim(city))>0 and length(trim(address))>0 and latitude is not null and longitude is not null and source_url ~ '^https?://' and checked_on ~ '^\d{4}-\d{2}-\d{2}$'))
);
create table public.showroom_brands (
 showroom_id uuid not null references public.showrooms(id) on delete cascade,brand_id uuid not null references public.brands(id) on delete restrict,
 carried text not null check(carried in ('confirmed','unavailable','unknown')),official text not null check(official in ('confirmed','unavailable','unknown')),
 source_url text not null default '',checked_on text not null default '',primary key(showroom_id,brand_id),
 check(official<>'confirmed' or (carried='confirmed' and source_url ~ '^https?://' and checked_on<>''))
);
create table public.showroom_models (
 showroom_id uuid not null references public.showrooms(id) on delete cascade,product_id uuid not null references public.products(id) on delete restrict,
 trial text not null check(trial in ('confirmed','unavailable','unknown')),source_url text not null default '',checked_on text not null default '',primary key(showroom_id,product_id),
 check(trial='unknown' or (source_url ~ '^https?://' and checked_on<>''))
);
create table public.showroom_corrections (
 id uuid primary key default gen_random_uuid(),showroom_id uuid not null references public.showrooms(id) on delete cascade,
 message text not null check(length(message) between 10 and 3000),requester_email text not null default '',
 status text not null default 'pending' check(status in ('pending','resolved','dismissed')),admin_notes text not null default '',created_at timestamptz not null default now()
);
create index on public.showrooms(status,city);
create index on public.showroom_brands(brand_id);
create index on public.showroom_models(product_id);
alter table public.showrooms enable row level security;
alter table public.showroom_brands enable row level security;
alter table public.showroom_models enable row level security;
alter table public.showroom_corrections enable row level security;
create policy showroom_public_read on public.showrooms for select to anon,authenticated using(status='published');
create policy showroom_brand_public_read on public.showroom_brands for select to anon,authenticated using(exists(select 1 from public.showrooms s where s.id=showroom_id and s.status='published'));
create policy showroom_model_public_read on public.showroom_models for select to anon,authenticated using(exists(select 1 from public.showrooms s where s.id=showroom_id and s.status='published'));
revoke all on public.showrooms,public.showroom_brands,public.showroom_models,public.showroom_corrections from anon,authenticated;
grant select on public.showrooms,public.showroom_brands,public.showroom_models to anon,authenticated;
grant all on public.showrooms,public.showroom_brands,public.showroom_models,public.showroom_corrections to service_role;

-- Atomic metadata + relationship replacement; avoids partially saved public stores.
-- SECURITY INVOKER, callable only by service_role behind existing admin authentication.
create function public.save_showroom(payload jsonb, expected_updated_at timestamptz default null) returns uuid
language plpgsql security invoker set search_path=public,pg_temp as $$
declare sid uuid; rowdata public.showrooms; current_stamp timestamptz;
begin
 sid:=coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());
 select updated_at into current_stamp from public.showrooms where id=sid for update;
 if found then
   if expected_updated_at is null or current_stamp<>expected_updated_at then raise exception 'Store changed; reload before saving' using errcode='40001'; end if;
 elsif expected_updated_at is not null then raise exception 'Store no longer exists' using errcode='40001'; end if;
 rowdata:=jsonb_populate_record(null::public.showrooms,payload||jsonb_build_object('id',sid,'updated_at',clock_timestamp()));
 insert into public.showrooms select rowdata.* on conflict(id) do update set
 slug=excluded.slug,name=excluded.name,status=excluded.status,country_code=excluded.country_code,city=excluded.city,region=excluded.region,address=excluded.address,unit=excluded.unit,
 latitude=excluded.latitude,longitude=excluded.longitude,timezone=excluded.timezone,phone=excluded.phone,email=excluded.email,website_url=excluded.website_url,booking_url=excluded.booking_url,
 store_type=excluded.store_type,appointment=excluded.appointment,hours=excluded.hours,visit_notes=excluded.visit_notes,transport_notes=excluded.transport_notes,photos=excluded.photos,
 source_url=excluded.source_url,checked_on=excluded.checked_on,updated_at=excluded.updated_at;
 delete from public.showroom_brands where showroom_id=sid;
 insert into public.showroom_brands select sid,x.brand_id,x.carried,x.official,x.source_url,x.checked_on from jsonb_to_recordset(payload->'brands') as x(brand_id uuid,carried text,official text,source_url text,checked_on text);
 delete from public.showroom_models where showroom_id=sid;
 insert into public.showroom_models select sid,x.product_id,x.trial,x.source_url,x.checked_on from jsonb_to_recordset(payload->'models') as x(product_id uuid,trial text,source_url text,checked_on text);
 return sid;
end; $$;
revoke all on function public.save_showroom(jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.save_showroom(jsonb,timestamptz) to service_role;
commit;
