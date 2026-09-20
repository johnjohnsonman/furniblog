const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'chair-fit-conflicts-'));
const input = path.join(temp, 'input.csv');
const output = path.join(temp, 'output.sql');
const original = fs.readFileSync(path.join(root, 'content/chair-fit-import/priority-batch-5.csv'), 'utf8').trim().split(/\r?\n/);
function run(rows) {
  fs.writeFileSync(input, [original[0], ...rows].join('\n'));
  return spawnSync(process.execPath, [path.join(__dirname, 'build-chair-fit-evidence-sql.cjs'), input, `--output=${output}`], { encoding: 'utf8' });
}
fs.writeFileSync(output, 'existing approved SQL');
const differentHeight = original[1].replace('41.7,53.3', '42.0,54.0');
const conflict = run([original[1], differentHeight]);
assert.equal(conflict.status, 2);
assert.match(conflict.stderr, /conflicting seatHeightMin/);
assert.equal(fs.readFileSync(output, 'utf8'), 'existing approved SQL');
const fixed = original[1].split(',');
fixed[3] = ''; fixed[4] = ''; fixed[5] = '45';
const depthConflict = run([original[1], fixed.join(',')]);
assert.equal(depthConflict.status, 2);
assert.match(depthConflict.stderr, /conflicting fixed and adjustable/);
assert.equal(fs.readFileSync(output, 'utf8'), 'existing approved SQL');
const consistent = run([original[1], original[1]]);
assert.equal(consistent.status, 0, consistent.stderr);
assert.match(fs.readFileSync(output, 'utf8'), /commit;/);
// Delete only the explicitly created files; never recursively delete a computed path.
fs.unlinkSync(input); fs.unlinkSync(output); fs.rmdirSync(temp);
console.log('PASS: conflicting regional values and depth representations rejected; output preserved; consistent sources accepted');
