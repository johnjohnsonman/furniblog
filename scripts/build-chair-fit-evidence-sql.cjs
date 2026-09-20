const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

const root = path.resolve(__dirname, "..");
const inputArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
if (!inputArg) {
  console.error("Usage: node scripts/build-chair-fit-evidence-sql.cjs <csv|xlsx> [--output=path.sql]");
  process.exit(1);
}
const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = outputArg ? path.resolve(process.cwd(), outputArg.slice(9)) : path.join(root, "content/reports/generated-chair-fit-evidence.sql");
const workbook = XLSX.readFile(inputPath, { cellDates: true, raw: true, dateNF: 'yyyy-mm-dd' });
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "", raw: false });
const clean = (v) => String(v ?? "").trim();
const quote = (v) => `'${clean(v).replace(/'/g, "''")}'`;
const numeric = (v) => clean(v) === "" ? null : Number(v);
const normalizeDate = (value) => {
  const input = clean(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const short = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (short) return `20${short[3]}-${short[1].padStart(2, "0")}-${short[2].padStart(2, "0")}`;
  const match = input.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : input;
};
const fields = [
  ["seatHeightMin", "seat_height_min"], ["seatHeightMax", "seat_height_max"],
  ["seatDepthMin", "seat_depth_min"], ["seatDepthMax", "seat_depth_max"], ["seatDepth", "seat_depth_fixed"],
  ["seatWidth", "seat_width"], ["weightCapacityKg", "weight_capacity"],
  ["armrestFloorHeightMin", "armrest_floor_height_min"], ["armrestFloorHeightMax", "armrest_floor_height_max"],
];
const evidenceGroups = [
  ["seat_height", ["seat_height_min", "seat_height_max"]],
  ["seat_depth", ["seat_depth_min", "seat_depth_max", "seat_depth_fixed"]],
  ["seat_width", ["seat_width"]], ["weight_capacity", ["weight_capacity"]],
  ["armrest_floor_height", ["armrest_floor_height_min", "armrest_floor_height_max"]],
];
const errors = [];
if (!rows.length) errors.push('Input contains no evidence rows');
const prepared = rows.map((row, i) => {
  const line = i + 2, slug = clean(row.product_slug), source = clean(row.source_url), checked = normalizeDate(row.checked_on);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`Row ${line}: invalid product_slug`);
  if (!clean(row.source_title)) errors.push(`Row ${line}: source_title is required`);
  if (!/^https?:\/\//.test(source)) errors.push(`Row ${line}: source_url must be http(s)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checked)) errors.push(`Row ${line}: checked_on must be YYYY-MM-DD`);
  else if (!Number.isFinite(Date.parse(checked)) || new Date(checked).toISOString().slice(0, 10) !== checked || checked > new Date().toISOString().slice(0, 10)) errors.push(`Row ${line}: invalid or future checked_on`);
  if (clean(row.evidence_type) && !["manufacturer", "authorized_retailer", "editorial", "manual"].includes(clean(row.evidence_type))) errors.push(`Row ${line}: invalid evidence_type`);
  const values = {};
  for (const [jsonKey, column] of fields) {
    const value = numeric(row[column]);
    if (value !== null && (!Number.isFinite(value) || value <= 0)) errors.push(`Row ${line}: ${column} must be a positive number`);
    if (value !== null) values[jsonKey] = value;
  }
  if (values.seatDepth !== undefined && (values.seatDepthMin !== undefined || values.seatDepthMax !== undefined)) errors.push(`Row ${line}: use a seat-depth range or fixed value, not both`);
  for (const [min, max] of [["seatHeightMin", "seatHeightMax"], ["seatDepthMin", "seatDepthMax"], ["armrestFloorHeightMin", "armrestFloorHeightMax"]]) {
    if ((values[min] === undefined) !== (values[max] === undefined)) errors.push(`Row ${line}: ${min}/${max} must be supplied together`);
    if (values[min] > values[max]) errors.push(`Row ${line}: ${min} cannot exceed ${max}`);
  }
  if (!Object.keys(values).length) errors.push(`Row ${line}: at least one measurement is required`);
  return { row, line, slug, source, checked, values };
});
// A product has one active specification object. Never silently merge conflicting
// regional/options data into it; separate product configurations first.
const measurementsBySlug = new Map();
for (const item of prepared) {
  const previous = measurementsBySlug.get(item.slug) || {};
  for (const [field, value] of Object.entries(item.values)) {
    if (previous[field] !== undefined && previous[field] !== value) {
      errors.push(`Row ${item.line}: conflicting ${field} for ${item.slug}; separate regional or option configurations`);
    }
  }
  const merged = { ...previous, ...item.values };
  if (merged.seatDepth !== undefined && merged.seatDepthMin !== undefined) {
    errors.push(`Row ${item.line}: conflicting fixed and adjustable depth for ${item.slug}`);
  }
  measurementsBySlug.set(item.slug, merged);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(2);
}

const sql = [
  "-- GENERATED FILE. Review before running in Supabase SQL Editor.",
  "-- Units: centimetres except weightCapacityKg, which is kilograms.",
  "-- Requires migration 047_product_fit_evidence.sql.",
  "begin;", "",
];
for (const item of prepared) {
  const pairs = Object.entries(item.values).flatMap(([key, value]) => [quote(key), String(value)]).join(", ");
  const base = item.values.seatDepthMin !== undefined
    ? "(coalesce(chair_specs, '{}'::jsonb) - 'seatDepth')"
    : item.values.seatDepth !== undefined
      ? "(coalesce(chair_specs, '{}'::jsonb) - 'seatDepthMin' - 'seatDepthMax')"
      : "coalesce(chair_specs, '{}'::jsonb)";
  sql.push(`-- Source row ${item.line}: ${item.slug}`, "update public.products");
  sql.push(`set chair_specs = ${base} || jsonb_build_object(${pairs}), updated_at = now()`);
  sql.push(`where slug = ${quote(item.slug)};`, "");
  for (const [fieldKey, columns] of evidenceGroups) {
    if (!columns.some((column) => clean(item.row[column]) !== "")) continue;
    sql.push("insert into public.product_fit_evidence");
    sql.push("  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)");
    sql.push(`select id, ${quote(fieldKey)}, ${quote(clean(item.row.evidence_type) || "manufacturer")}, ${quote(item.row.source_title)}, ${quote(item.source)}, date ${quote(item.checked)}, ${quote(item.row.notes)}`);
    sql.push(`from public.products where slug = ${quote(item.slug)}`);
    sql.push("on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();", "");
  }
}
const slugs = [...new Set(prepared.map((item) => item.slug))];
sql.push("-- Stop the transaction if an input slug did not produce evidence.");
sql.push(`do $$ begin if (select count(distinct p.slug) from public.products p join public.product_fit_evidence e on e.product_id = p.id where p.slug in (${slugs.map(quote).join(", ")})) < ${slugs.length} then raise exception 'One or more product slugs were not found or produced no evidence'; end if; end $$;`);
sql.push("", "commit;", "");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql.join("\n"));
console.log(`Generated ${prepared.length} product row(s): ${path.relative(root, outputPath)}`);
