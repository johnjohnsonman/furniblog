const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Module = require("node:module");
const ts = require("typescript");
const XLSX = require("xlsx");

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "content/showrooms/registry.json");
const reportDir = path.join(root, "content/reports");
const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith("--"));
const write = args.includes("--write");

if (!inputArg) {
  console.error("Usage: node scripts/import-showrooms-bulk.cjs <csv|xlsx|json> [--write]");
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
function loadTs(file) {
  const filename = path.join(root, file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod.require = (request) => request === "./domain"
    ? loadTs("lib/showrooms/domain.ts")
    : request === "./locations"
      ? loadTs("lib/showrooms/locations.ts")
      : require(request);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  mod._compile(output, filename);
  return mod.exports;
}
const { storeSchema } = loadTs("lib/showrooms/validation.ts");
const brandsBySlug = new Map(registry.catalog.brands.map((item) => [item.slug, item]));
const modelsBySlug = new Map(registry.catalog.models.map((item) => [item.slug, item]));

function readRows(file) {
  if (path.extname(file).toLowerCase() === ".json") {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(value) ? value : value.rows;
  }
  const workbook = XLSX.readFile(file, { cellDates: true, raw: true, dateNF: 'yyyy-mm-dd' });
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
    defval: "",
    raw: false,
  });
}

const clean = (value) => String(value ?? "").trim();
const list = (value) => clean(value).split("|").map(clean).filter(Boolean);
const slugify = (value) => clean(value).toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
const key = (value) => clean(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const numberOrNull = (value) => clean(value) === "" ? null : Number(value);
const normalizeDate = (value) => {
  const input = clean(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const short = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (short) return `20${short[3]}-${short[1].padStart(2, "0")}-${short[2].padStart(2, "0")}`;
  const match = input.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : input;
};
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(normalizeDate(value));
const isUrl = (value) => { try { const u = new URL(clean(value)); return ["http:", "https:"].includes(u.protocol); } catch { return false; } };
const urlKey = (value) => { try { const u = new URL(value); return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`.toLowerCase(); } catch { return ""; } };
const distanceKm = (a, b) => {
  if ([a.latitude, a.longitude, b.latitude, b.longitude].some((v) => v === null)) return Infinity;
  const rad = (v) => v * Math.PI / 180;
  const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

function relationship(slug, catalog, row, kind, errors) {
  const item = catalog.get(slug);
  if (!item) {
    errors.push(`Unknown ${kind} slug: ${slug}`);
    return null;
  }
  const source = clean(row.relationship_source_url) || clean(row.source_url);
  const checked = normalizeDate(row.relationship_checked_on) || normalizeDate(row.checked_on);
  return kind === "brand"
    ? { brand_id: item.id, carried: "confirmed", official: "unknown", source_url: source, checked_on: checked }
    : { product_id: item.id, trial: "confirmed", source_url: source, checked_on: checked };
}

function prepare(row, index) {
  const errors = [], warnings = [];
  const name = clean(row.name);
  const city = clean(row.city);
  const country = clean(row.country_code).toUpperCase();
  const source = clean(row.source_url);
  const checked = normalizeDate(row.checked_on);
  const statusRequested = clean(row.status) || "draft";
  const latitude = numberOrNull(row.latitude), longitude = numberOrNull(row.longitude);
  let status = ["draft", "published", "private"].includes(statusRequested) ? statusRequested : "draft";
  if (!name) errors.push("name is required");
  if (!/^[A-Z]{2}$/.test(country)) errors.push("country_code must be ISO alpha-2");
  if (country === "KR") errors.push("Korea is excluded from this public registry");
  if (source && !isUrl(source)) errors.push("source_url must be http(s)");
  if (checked && !isDate(checked)) errors.push("checked_on must be YYYY-MM-DD");
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) errors.push("invalid latitude");
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) errors.push("invalid longitude");
  const publishMissing = [city, clean(row.address), source, checked].some((v) => !v) || latitude === null || longitude === null;
  if (status === "published" && publishMissing) {
    status = "draft";
    warnings.push("Held as draft: publishing requires city, address, coordinates, source_url and checked_on");
  }
  const brandSlugs = [...new Set([...list(row.brand_slugs), ...list(row.official_brand_slugs)])];
  const official = new Set(list(row.official_brand_slugs));
  const brands = brandSlugs.map((slug) => {
    const rel = relationship(slug, brandsBySlug, row, "brand", errors);
    return rel ? { ...rel, official: official.has(slug) ? "confirmed" : "unknown" } : null;
  }).filter(Boolean);
  const models = [...new Set(list(row.confirmed_model_slugs))]
    .map((slug) => relationship(slug, modelsBySlug, row, "model", errors)).filter(Boolean);
  const slug = slugify(row.slug || `${name}-${city}-${country}`);
  if (!slug) errors.push("slug could not be generated");
  return {
    row: index + 2,
    errors,
    warnings,
    store: {
      id: clean(row.id) || crypto.randomUUID(), slug, name, status, country_code: country, city,
      region: clean(row.region), address: clean(row.address), unit: clean(row.unit), latitude, longitude,
      timezone: clean(row.timezone), phone: clean(row.phone), email: clean(row.email),
      website_url: clean(row.website_url), booking_url: clean(row.booking_url),
      store_type: ["brand_showroom", "retailer", "refurbisher"].includes(clean(row.store_type)) ? clean(row.store_type) : "retailer",
      appointment: ["required", "walk_in", "unknown"].includes(clean(row.appointment)) ? clean(row.appointment) : "unknown",
      hours: { weekly: {}, exceptions: {} }, visit_notes: clean(row.visit_notes), transport_notes: clean(row.transport_notes),
      photos: [], source_url: source, checked_on: checked, brands, models,
    },
  };
}

const rows = readRows(inputPath);
if (!Array.isArray(rows)) throw new Error("Input must contain rows");
const prepared = rows.map(prepare);
for (const item of prepared) {
  const result = storeSchema.safeParse(item.store);
  if (!result.success) {
    for (const issue of result.error.issues) item.errors.push(`${issue.path.join(".") || "record"}: ${issue.message}`);
  }
}
const existingBySlug = new Map(registry.stores.map((s) => [s.slug, s]));
const seen = new Map();
for (const item of prepared) {
  const s = item.store;
  const candidates = [...registry.stores, ...seen.values()];
  if (existingBySlug.has(s.slug)) item.errors.push(`Duplicate slug already exists: ${s.slug}`);
  if (seen.has(s.slug)) item.errors.push(`Duplicate slug in import: ${s.slug}`);
  const duplicate = candidates.find((other) =>
    (urlKey(s.website_url) && urlKey(s.website_url) === urlKey(other.website_url)) ||
    (key(s.address) && key(s.address) === key(other.address) && s.country_code === other.country_code) ||
    (key(s.name) === key(other.name) && s.country_code === other.country_code && distanceKm(s, other) < 0.2)
  );
  if (duplicate) item.errors.push(`Possible duplicate of ${duplicate.slug}`);
  if (!item.errors.length) seen.set(s.slug, s);
}

const accepted = prepared.filter((item) => !item.errors.length).map((item) => item.store);
const report = {
  generated_at: new Date().toISOString(), input: path.relative(root, inputPath), mode: write ? "write" : "preview",
  totals: { rows: rows.length, accepted: accepted.length, published: accepted.filter((s) => s.status === "published").length, held_as_draft: accepted.filter((s) => s.status === "draft").length, rejected: prepared.length - accepted.length },
  rows: prepared.map((item) => ({ row: item.row, slug: item.store.slug, status: item.store.status, errors: item.errors, warnings: item.warnings })),
};
fs.mkdirSync(reportDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const reportPath = path.join(reportDir, `showroom-import-${stamp}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

if (write && report.totals.rejected) {
  console.error(`WRITE BLOCKED: ${report.totals.rejected} rejected row(s). Fix every error first.`);
  console.error(`Report: ${path.relative(root, reportPath)}`);
  process.exit(2);
}
if (write) {
  registry.stores.push(...accepted);
  registry.checked_on = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
}
console.log(JSON.stringify(report.totals, null, 2));
console.log(`${write ? "UPDATED" : "PREVIEW ONLY"}: ${path.relative(root, registryPath)}`);
console.log(`Report: ${path.relative(root, reportPath)}`);
