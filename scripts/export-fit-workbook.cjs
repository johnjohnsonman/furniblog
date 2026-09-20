// Review workbook only. The existing CSV/JSON files remain canonical import inputs.
const fs = require('node:fs');
const path = require('node:path');
const XLSX = require('xlsx');
const root = path.resolve(__dirname, '..');
const workbook = XLSX.utils.book_new();
const batches = [[3, '051'], [4, '052'], [5, '053']];
const manifest = batches.map(([batch, migration]) => ({
  sheet: `Batch ${batch}`, source: `content/chair-fit-import/priority-batch-${batch}.csv`,
  migration, status: 'User reported applied; see dated coverage audit for recorded verification',
}));
manifest.push({ sheet: 'Configurations DRAFT', source: 'content/chair-fit-import/configurations-batch-1.json', migration: '055', status: 'Draft only; not activated for public selection' });
manifest.push({ sheet: 'Historical HOLD', source: 'content/chair-fit-import/humanscale-historical-research.csv', migration: '', status: 'Research only; not approved for import' });
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
  { note: 'Generated review copy. Edit canonical CSV/JSON through the import workflow; this multi-sheet workbook must not be passed to the SQL importer.' },
  { note: 'Application status is based on user reports and saved audits, not a fresh database query.' },
  { note: 'Draft and historical research sheets are not verified public specifications.' },
]), 'READ ME');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(manifest), 'File status');
for (const entry of manifest) {
  const file = path.join(root, entry.source);
  let sheet;
  if (file.endsWith('.csv')) {
    const input = XLSX.readFile(file, { raw: true });
    sheet = input.Sheets[input.SheetNames[0]];
  } else {
    const input = JSON.parse(fs.readFileSync(file, 'utf8'));
    const rows = Array.isArray(input) ? input : input.configurations;
    if (!Array.isArray(rows)) throw new Error('Unexpected configuration input structure');
    sheet = XLSX.utils.json_to_sheet(rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value && typeof value === 'object' ? JSON.stringify(value) : value]))));
  }
  XLSX.utils.book_append_sheet(workbook, sheet, entry.sheet);
}
const output = path.join(root, 'content/reports/chair-fit-data-workbook.xlsx');
const auditPath = path.join(root, 'content/reports/fit-configurations-audit.json');
if (fs.existsSync(auditPath)) {
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
    { ...audit, note: 'Dated read-only database audit. Configurations DRAFT is the original seed, not current public status.' },
  ]), 'Latest DB audit');
}
XLSX.writeFile(workbook, output);
const reopened = XLSX.readFile(output);
if (reopened.SheetNames.length !== workbook.SheetNames.length) throw new Error('Missing workbook sheets');
console.log(JSON.stringify({ output, sheets: reopened.SheetNames }));
