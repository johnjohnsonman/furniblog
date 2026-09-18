const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, "../lib/affiliate/amazon-region.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
new Function("module", "exports", "process", "URL", code)(mod, mod.exports, process, URL);
const { resolveAmazonDestination, readAmazonCountry } = mod.exports;

const domains = {
  US: "www.amazon.com", GB: "www.amazon.co.uk", DE: "www.amazon.de", FR: "www.amazon.fr",
  JP: "www.amazon.co.jp", CA: "www.amazon.ca", IT: "www.amazon.it", ES: "www.amazon.es",
  IN: "www.amazon.in", BR: "www.amazon.com.br", MX: "www.amazon.com.mx", AU: "www.amazon.com.au",
  AE: "www.amazon.ae", SG: "www.amazon.sg", NL: "www.amazon.nl", SA: "www.amazon.sa",
  SE: "www.amazon.se", PL: "www.amazon.pl", BE: "www.amazon.com.be", IE: "www.amazon.ie",
  TR: "www.amazon.com.tr", EG: "www.amazon.eg",
};
for (const [country, domain] of Object.entries(domains)) {
  const result = resolveAmazonDestination("https://www.amazon.com/dp/B07GNDDNMW?tag=wrong-20&ascsubtag=products_test", "SIHOO M18", country);
  const url = new URL(result.url);
  assert.equal(url.hostname, domain, country);
  if (country === "US") assert.equal(url.pathname, "/dp/B07GNDDNMW");
  else { assert.equal(url.pathname, "/s"); assert.equal(url.searchParams.get("k"), "SIHOO M18"); }
  assert.equal(result.search, country !== "US");
  assert.equal(result.affiliate, ["US", "JP", "SG"].includes(country));
  assert.equal(Boolean(url.searchParams.get("tag")), result.affiliate);
  assert.equal(url.searchParams.get("ascsubtag"), "products_test");
}
assert.equal(resolveAmazonDestination("https://example.com/chair", "Chair", "GB").url, "https://example.com/chair");
assert.equal(resolveAmazonDestination("javascript:alert(1)", "Chair", "GB").url, "javascript:alert(1)");
assert.equal(readAmazonCountry(), "US");
global.document = { cookie: "other=1; x-country=IE" };
assert.equal(readAmazonCountry(), "IE");
delete global.document;
console.log("PASS: all 22 Amazon locales use official domains; only verified IDs produce affiliate-tagged links.");
