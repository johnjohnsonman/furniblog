// Explicitly reviewed 2026-09-20 against Haworth US Dimensions sections.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const rows = JSON.parse(fs.readFileSync(path.join(root, 'content/chair-fit-import/configurations-batch-1.json'), 'utf8')).filter(r => ['haworth-soji','haworth-very-task'].includes(r.product_slug));
if(rows.length !== 3) throw new Error('Expected exactly three reviewed configurations');
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
let sql = '-- PREPARED ONLY. Run after 054 and 055. Reviewed 2026-09-20.\n-- Activates three US configurations only; leaves Zody research and product specs unchanged.\n-- Fails atomically if any reviewed record differs. Do not rerun 055 after activation.\nbegin;\nlock table public.product_fit_configurations in share row exclusive mode;\n';
for(const row of rows) {
  const { product_slug, status, ...expected } = row;
  for(const field of ['seat_depth_fixed','armrest_floor_height_min','armrest_floor_height_max']) expected[field] ??= null;
  const where = `product_id=(select id from public.products where slug=${quote(product_slug)} and published=true) and market_code=${quote(row.market_code)} and configuration_key=${quote(row.configuration_key)}`;
  sql += `do $$ begin\n  if not exists(select 1 from public.product_fit_configurations c where ${where} and status in ('draft','verified') and to_jsonb(c) @> ${quote(JSON.stringify(expected))}::jsonb) then\n    raise exception 'Reviewed configuration missing or changed: ${product_slug}/${row.configuration_key}';\n  end if;\nend $$;\n`;
}
for(const row of rows) sql += `update public.product_fit_configurations set status='verified',updated_at=now() where product_id=(select id from public.products where slug=${quote(row.product_slug)}) and market_code=${quote(row.market_code)} and configuration_key=${quote(row.configuration_key)} and status='draft';\n`;
sql += 'commit;\n';
fs.writeFileSync(path.join(root,'lib/supabase/migrations/056_activate_reviewed_us_fit_configurations.sql'),sql);
console.log('Prepared 056: three reviewed US configurations; no database writes.');
