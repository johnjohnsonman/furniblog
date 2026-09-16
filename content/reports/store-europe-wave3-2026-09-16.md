# Europe expansion, batch 3 ? 2026-09-16

Previous approved commit 40481bc was pushed and deployed successfully as dpl_4BgHFVfPSmkLSkNJU6vXkMvikHSp. Live desktop/mobile tests passed for its 12 new stores and 34 location pages.

This batch adds 46 stores from 53 map-checked candidates. Registry totals: 398 stores, 20 countries, including 82 European stores. Country counts: Germany 19, UK 16, Denmark 9, France 7, Spain 5, Poland 4, Norway 4, Belgium 3, Netherlands 3, Sweden 3, Switzerland 3, Czechia 2, Finland 1, Hungary 1, Italy 1, Austria 1. Japan 134, US 172, South Africa 4 and Kenya 6 are preserved. Korea remains excluded.

Sources: individual Flokk showroom pages; Sedus official country showroom pages; Chairgo/DesignCabinet/Skovby/Interstuhl official pages; Flokk's official dealer locator for independent stores explicitly labelled as showrooms. No inferred model trials, stock or vendor photos. Building/address-only pins carry entrance-confirmation notes. All public descriptions are English; source evidence retains the original map address language in the non-public audit file.

Seven candidates held: Flokk Bergen (unresolved pin), Flokk Nassjo (postal code conflict), BOSS Herlev (different address), Daarbak Herning (different address/company), Daarbak Horsens (company identity conflict), Daarbak Aalborg (different address), DC Kontormobler Morkov (5A versus 5). Sedus Rickenbach is explicitly not a customer showroom, and is excluded.

45 indexable location pages now derive from the registry (previously 34). Existing minimum two stores per country / three per city thresholds remain. Sparse countries stay noindex; sparse city links open exact map filters. Public category remains Chair store.

Data validation and location boundary tests passed. No production database changes. Rollback: revert the batch commit and redeploy, or restore dpl_4BgHFVfPSmkLSkNJU6vXkMvikHSp. Search indexing remains pending; deployment does not imply rankings or index completion.

Validation complete: production build passed; lint 0 errors / 15 pre-existing warnings; local browser checks at 1440x1000 and 393x852 passed for 45 landing pages and 46 new details, structured data/canonical, sparse noindex, invalid 404, exact city map filtering, country reset, English-only text and no horizontal overflow/page errors.
