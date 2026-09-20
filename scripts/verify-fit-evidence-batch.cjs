// Read-only verification against a freshly generated coverage audit.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const XLSX = require('xlsx');

const [input, reportPath] = process.argv.slice(2);
if (!input || !reportPath) throw new Error('Usage: node scripts/verify-fit-evidence-batch.cjs batch.csv coverage.json');
const workbook = XLSX.readFile(input, { raw: true });
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
assert.ok(report.summary.evidenceTableAvailable, 'Evidence table must be available');
const fields = {
  seat_height_min: ['seatHeightMin', 'seat_height'], seat_height_max: ['seatHeightMax', 'seat_height'],
  seat_depth_min: ['seatDepthMin', 'seat_depth'], seat_depth_max: ['seatDepthMax', 'seat_depth'],
  seat_depth_fixed: ['seatDepth', 'seat_depth'], seat_width: ['seatWidth', 'seat_width'],
  weight_capacity: ['weightCapacityKg', 'weight_capacity'],
  armrest_floor_height_min: ['armrestFloorHeightMin', 'armrest_floor_height'],
  armrest_floor_height_max: ['armrestFloorHeightMax', 'armrest_floor_height'],
};
let values = 0;
for (const row of rows) {
  const record = report.records.find(item => item.slug === row.product_slug);
  assert.ok(record, `Missing product: ${row.product_slug}`);
  for (const [inputField, [spec, evidence]] of Object.entries(fields)) {
    if (row[inputField] === '') continue;
    assert.equal(record.currentSpecs[spec], Number(row[inputField]), `${record.slug}: ${spec}`);
    assert.ok(record.evidenceFields.includes(evidence), `${record.slug}: missing ${evidence} source`);
    values++;
  }
  if (row.seat_depth_fixed !== '') {
    assert.equal(record.currentSpecs.seatDepthMin, null, `${record.slug}: obsolete min depth`);
    assert.equal(record.currentSpecs.seatDepthMax, null, `${record.slug}: obsolete max depth`);
  } else if (row.seat_depth_min !== '') {
    assert.equal(record.currentSpecs.seatDepth, null, `${record.slug}: obsolete fixed depth`);
  }
}
console.log(`PASS: ${rows.length} batch rows; ${values} numeric values match audit ${report.generatedAt}; field source presence and depth cleanup checked. Source URL/content must be reviewed separately.`);
