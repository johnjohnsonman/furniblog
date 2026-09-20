# Bulk showroom import

Use `showrooms-template.csv` for source-checked records. Multiple slugs use `|`, for example `steelcase|herman-miller`.

The importer runs as a preview unless `--write` is explicitly supplied. It resolves brand and product slugs from the current registry, holds incomplete published rows as drafts, and rejects duplicate slugs, websites, addresses, and near-identical map points. Every run creates a JSON report under `content/reports`.

```powershell
node scripts/import-showrooms-bulk.cjs content/showrooms/import/my-batch.xlsx
node scripts/import-showrooms-bulk.cjs content/showrooms/import/my-batch.xlsx --write
node scripts/validate-world-seed.cjs content/showrooms/registry.json
node scripts/test-showrooms.cjs
node scripts/test-store-locations.cjs
```

Do not infer exact model trials from a brand relationship. Put a product in `confirmed_model_slugs` only when the source identifies that model at that location. Records without a complete address, coordinates, source URL, and check date remain drafts.
