const fs = require('node:fs');
const path = require('node:path');
const { z } = require('zod');
const positive = z.number().positive().lt(1000).optional();
const schema = z.object({
  product_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  configuration_key: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  market_code: z.string().regex(/^[A-Z]{2}$/),
  label: z.string().trim().min(1),
  status: z.enum(['draft', 'verified', 'retired']).default('draft'),
  options: z.record(z.string(), z.union([z.string(),z.boolean()])).default({}),
  seat_height_min: positive, seat_height_max: positive,
  seat_depth_min: positive, seat_depth_max: positive, seat_depth_fixed: positive,
  seat_width: positive, weight_capacity: positive,
  armrest_floor_height_min: positive, armrest_floor_height_max: positive,
  source_title: z.string().trim().min(1), source_url: z.string().url().regex(/^https?:\/\//),
  checked_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(value); return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value && value <= new Date().toISOString().slice(0,10);
  }),
  notes: z.string().default(''),
}).strict().superRefine((row, ctx) => {
  for (const [min,max] of [['seat_height_min','seat_height_max'],['seat_depth_min','seat_depth_max'],['armrest_floor_height_min','armrest_floor_height_max']]) {
    if ((row[min] == null) !== (row[max] == null) || row[min] > row[max]) ctx.addIssue({code:'custom',message:`Invalid ${min}/${max}`});
  }
  if (row.seat_depth_fixed != null && row.seat_depth_min != null) ctx.addIssue({code:'custom',message:'Fixed and adjustable depth conflict'});
  if (![row.seat_height_min,row.seat_depth_min,row.seat_depth_fixed,row.seat_width,row.weight_capacity,row.armrest_floor_height_min].some(v=>v!=null)) ctx.addIssue({code:'custom',message:'At least one measurement required'});
});
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node scripts/build-fit-configurations-sql.cjs input.json output.sql');
const rows = z.array(schema).min(1).parse(JSON.parse(fs.readFileSync(input,'utf8')));
const seen = new Set();
for (const row of rows) {
  const key = [row.product_slug,row.market_code,row.configuration_key].join(':');
  if (seen.has(key)) throw new Error(`Duplicate configuration: ${key}`);
  seen.add(key);
}
const quote = v => `'${String(v).replaceAll("'", "''")}'`;
const columns = Object.keys(schema.parse(rows[0]));
// Use all optional measurement columns, so a revision can clear obsolete fields.
const measurements = ['seat_height_min','seat_height_max','seat_depth_min','seat_depth_max','seat_depth_fixed','seat_width','weight_capacity','armrest_floor_height_min','armrest_floor_height_max'];
const fields = [...new Set([...columns.filter(k=>k!=='product_slug'),...measurements])];
const sql = ['-- PREPARED ONLY. Run 054 first. Does not modify products.chair_specs.', 'begin;'];
for (const row of rows) {
  sql.push(`do $$ begin if not exists(select 1 from public.products where slug=${quote(row.product_slug)}) then raise exception 'Missing product: ${row.product_slug}'; end if; end $$;`);
  const values = fields.map(key => row[key] == null ? 'null' : key === 'options' ? `${quote(JSON.stringify(row[key]))}::jsonb` : typeof row[key] === 'number' ? String(row[key]) : quote(row[key]));
  sql.push(`insert into public.product_fit_configurations(product_id,${fields.join(',')}) select id,${values.join(',')} from public.products where slug=${quote(row.product_slug)} on conflict(product_id,market_code,configuration_key) do update set ${fields.filter(k=>!['market_code','configuration_key','status'].includes(k)).map(k=>`${k}=excluded.${k}`).join(',')}, status='draft', updated_at=now();`);
}
sql.push('commit;','');
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});
fs.writeFileSync(output,sql.join('\n'));
console.log(`Prepared ${rows.length} configurations; revisions return to draft for review.`);
