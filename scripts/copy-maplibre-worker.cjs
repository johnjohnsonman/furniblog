// MapLibre v6 Next.js integration: the worker imports its sibling shared module.
// Copy from the pinned installation on every build/dev; never mix versions.
const fs = require("node:fs");
const path = require("node:path");
const root = path.dirname(require.resolve("maplibre-gl/package.json"));
const dest = path.join(__dirname, "../public/maplibre");
fs.mkdirSync(dest, { recursive: true });
for (const name of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  fs.copyFileSync(path.join(root, "dist", name), path.join(dest, name));
}
fs.copyFileSync(path.join(root, "LICENSE.txt"), path.join(dest, "LICENSE.txt"));
