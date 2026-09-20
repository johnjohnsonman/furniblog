# Bulk chair fit evidence

Regional/option configurations now have a separate prepared schema (054) and draft seed (055). Use `scripts/build-fit-configurations-sql.cjs` with `configurations-batch-1.json` as the concrete example. Never combine different configurations into the legacy product-wide CSV. Draft records are not public or active recommendations. See `design-handoff/chair-fit-configurations-handoff.md` for execution order and limits.

Enter one source-checked row per product and source. Measurements use centimetres; `weight_capacity` uses kilograms. Use either `seat_depth_min` and `seat_depth_max`, or `seat_depth_fixed`.

Generate a reviewable SQL file:

```powershell
node scripts/build-chair-fit-evidence-sql.cjs content/chair-fit-import/my-batch.xlsx --output=lib/supabase/migrations/051_my_verified_fit_batch.sql
```

Review the generated migration, run it in Supabase SQL Editor, then run `npm run audit:chair-fit-coverage`. Manufacturer documentation is preferred. Do not convert marketing claims or retailer estimates into fit measurements.
