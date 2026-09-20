# 056 activation — prepared, not applied

Reviewed on 2026-09-20 against the US manufacturer product Dimensions sections:

- Soji: https://store.haworth.com/products/soji-office-chair
- Very: https://store.haworth.com/products/very-office-chair

The three existing Soji/Very configuration rows match the published seat dimensions and capacities after unit conversion. Very explicitly distinguishes capacity with and without forward tilt. Arm-to-floor values remain unknown. These records describe the stated US dimension/option groups, not every regional SKU.

Run `lib/supabase/migrations/056_activate_reviewed_us_fit_configurations.sql` after already-applied 054/055. It validates the stored values and source metadata before activating exactly three configurations. It leaves four Zody research rows and products.chair_specs unchanged. Missing, changed, retired or unpublished targets abort the transaction. Repeat execution is supported. Rerunning 055 later resets these rows to draft.

Local PGlite regression covers repeat activation, anonymous visibility of three rows and atomic rejection of changed capacity, alongside existing schema/seed tests. Production activation has not been executed by the agent. Browser and transition timing validation remain outstanding.

The review workbook is a snapshot of original input batches; its Configurations DRAFT sheet remains the 055 input, not a live database status. This document and 056 record the pending activation separately.

Next: read-only production verification after user execution, then browser checks of populated configuration selection and transition latency.
