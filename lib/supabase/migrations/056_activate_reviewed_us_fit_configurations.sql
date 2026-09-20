-- PREPARED ONLY. Run after 054 and 055. Reviewed 2026-09-20.
-- Activates three US configurations only; leaves Zody research and product specs unchanged.
-- Fails atomically if any reviewed record differs. Do not rerun 055 after activation.
begin;
lock table public.product_fit_configurations in share row exclusive mode;
do $$ begin
  if not exists(select 1 from public.product_fit_configurations c where product_id=(select id from public.products where slug='haworth-soji' and published=true) and market_code='US' and configuration_key='standard-sliding-seat' and status in ('draft','verified') and to_jsonb(c) @> '{"market_code":"US","checked_on":"2026-09-20","configuration_key":"standard-sliding-seat","label":"US standard Soji with sliding seat","options":{"seat":"sliding"},"seat_height_min":41.7,"seat_height_max":53.3,"seat_depth_min":41.3,"seat_depth_max":47.6,"seat_width":50.8,"weight_capacity":158.8,"source_title":"Haworth Soji US product dimensions","source_url":"https://store.haworth.com/products/soji-office-chair","notes":"Not XL or stool. Source checked 2026-09-20. Arm-floor values unknown.","seat_depth_fixed":null,"armrest_floor_height_min":null,"armrest_floor_height_max":null}'::jsonb) then
    raise exception 'Reviewed configuration missing or changed: haworth-soji/standard-sliding-seat';
  end if;
end $$;
do $$ begin
  if not exists(select 1 from public.product_fit_configurations c where product_id=(select id from public.products where slug='haworth-very-task' and published=true) and market_code='US' and configuration_key='without-forward-tilt' and status in ('draft','verified') and to_jsonb(c) @> '{"market_code":"US","checked_on":"2026-09-20","configuration_key":"without-forward-tilt","label":"US Very without forward tilt","options":{"forward_tilt":false},"seat_height_min":40.6,"seat_height_max":53.3,"seat_depth_min":40.6,"seat_depth_max":48.3,"seat_width":48.3,"weight_capacity":158.8,"source_title":"Haworth Very US product dimensions","source_url":"https://store.haworth.com/products/very-office-chair","notes":"US task chair; not conference or stacking. Manufacturer distinguishes 325 lb with tilt and 350 lb without tilt. Arm-floor values unknown.","seat_depth_fixed":null,"armrest_floor_height_min":null,"armrest_floor_height_max":null}'::jsonb) then
    raise exception 'Reviewed configuration missing or changed: haworth-very-task/without-forward-tilt';
  end if;
end $$;
do $$ begin
  if not exists(select 1 from public.product_fit_configurations c where product_id=(select id from public.products where slug='haworth-very-task' and published=true) and market_code='US' and configuration_key='with-forward-tilt' and status in ('draft','verified') and to_jsonb(c) @> '{"market_code":"US","checked_on":"2026-09-20","configuration_key":"with-forward-tilt","label":"US Very with forward tilt","options":{"forward_tilt":true},"seat_height_min":40.6,"seat_height_max":53.3,"seat_depth_min":40.6,"seat_depth_max":48.3,"seat_width":48.3,"weight_capacity":147.4,"source_title":"Haworth Very US product dimensions","source_url":"https://store.haworth.com/products/very-office-chair","notes":"US task chair; not conference or stacking. Manufacturer distinguishes 325 lb with tilt and 350 lb without tilt. Arm-floor values unknown.","seat_depth_fixed":null,"armrest_floor_height_min":null,"armrest_floor_height_max":null}'::jsonb) then
    raise exception 'Reviewed configuration missing or changed: haworth-very-task/with-forward-tilt';
  end if;
end $$;
update public.product_fit_configurations set status='verified',updated_at=now() where product_id=(select id from public.products where slug='haworth-soji') and market_code='US' and configuration_key='standard-sliding-seat' and status='draft';
update public.product_fit_configurations set status='verified',updated_at=now() where product_id=(select id from public.products where slug='haworth-very-task') and market_code='US' and configuration_key='without-forward-tilt' and status='draft';
update public.product_fit_configurations set status='verified',updated_at=now() where product_id=(select id from public.products where slug='haworth-very-task') and market_code='US' and configuration_key='with-forward-tilt' and status='draft';
commit;
