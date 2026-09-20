# Configuration selection UI — 2026-09-20

Implemented in the local chair-fit worktree. Not deployed.

- Selected-chair evidence includes an expandable configuration check.
- User explicitly enters purchase market and selects a verified configuration. No market or configuration is silently selected.
- Requests run only on explicit submission, with cancellation, stale-response protection, a 15-second timeout and resubmission after errors.
- Changing chair or body inputs resets the check; changing market clears configuration and result.
- Results show a separate configuration Fit Score (not probability), confidence, supporting evidence, conflicts, unknowns and source information. Main shortlist order is unchanged.
- Empty verified inventory explains that missing records do not mean the chair is unavailable in that market.
- Body measurements are submitted in POST bodies, not URLs.

The seven existing configuration records remain draft. There is no new SQL to execute for this UI change. Verified-data activation still requires exact product/market/option validation, especially the unresolved Zody II mapping.

Validation: TypeScript and targeted ESLint; existing configuration-selection regression test. Browser rendering, keyboard interaction and measured transition performance still require browser validation; no visual or timing pass is claimed.

Next: verify exact purchasable configurations and prepare narrowly scoped activation SQL; then test empty/populated/error states and measure stage transitions in the browser.
