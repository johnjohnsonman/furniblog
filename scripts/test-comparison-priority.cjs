const assert = require('node:assert/strict');
const { inspect, comparisonSlug, prioritize } = require('./audit-comparison-priority.cjs');
const result = inspect({ content_html: '<p>Price $1,399; 5 kg; 12-year warranty; aggregate rating 3.6 / 5; better value.</p>', faq: [{ q: 'Fit?', a: 'Blood circulation improves.' }] });
for (const kind of ['price', 'rating', 'dimensions_or_weight', 'warranty', 'winner', 'health', 'no_external_body_sources']) {
  assert.ok(result.flags.some(flag => flag.kind === kind), kind);
}
assert.equal(inspect({ content_html: '<p>Research overview.</p><a href="https://example.com/specs">Source</a>' }).flags.length, 0);
assert.equal(inspect({ content_html: '<script>Price $300</script><a href="https://example.com">Source</a>' }).flags.length, 0);
assert.equal(comparisonSlug('https://www.furniblog.com/compare/a-vs-b?source=x'), 'a-vs-b');
assert.equal(comparisonSlug('https://furniblog.com/compare/a-vs-b/'), 'a-vs-b');
for (const url of ['https://other.example/compare/a', 'bad-url', 'https://www.furniblog.com/products/a']) assert.equal(comparisonSlug(url), null);
const base = { affiliateEvents: 0, searchClicks: 0, impressions: 0, flags: [], slug: 'a' };
assert.ok(prioritize({ ...base, affiliateEvents: 1 }, { ...base, impressions: 100 }) < 0);
assert.ok(prioritize({ ...base, searchClicks: 1 }, base) < 0);
assert.ok(prioritize({ ...base, flags: [{}] }, base) < 0);
console.log('PASS: candidate detection, HTML handling, same-site referrer matching and explicit priority ordering.');
