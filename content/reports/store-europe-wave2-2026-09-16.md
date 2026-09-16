# Europe store expansion ? 2026-09-16

Added 12 verified stores: UK 8, France 2, Germany 1, Spain 1. Total 352 across 16 countries; Europe 36. Official source addresses were compared with public map listings. No production DB mutation. No Korea. Public category remains Chair store.

Source evidence: content/showrooms/research/europe-wave2-20260916.json. Back in Action closed Amersham/Marlow and moved London branches were excluded. La Boutique du Dos Paris was held: official source says 20 rue de Maubeuge, map says 18.

Indexable location pages increase from 33 to 34 (Munich now meets the minimum three-store threshold). The existing directory, country/city cards and sitemap derive their counts from the registry.

GSC read-only inspection: /stores, /stores/locations, UK/London, France and Kenya/Nairobi all reported URL unknown to Google. No /stores search analytics rows for September 14?16, including preliminary data. Sitemap reported zero errors/warnings; last downloaded September 15 before this release. This is not evidence of completed indexing or ranking gains.

Validation: registry schema/catalog/geography and location coverage tests passed; lint zero errors, 15 existing warnings. Build and release checks recorded at deployment.

Rollback: restore the previous registry/readme/audit/test commit and redeploy; no database rollback is needed. Previous production deployment: dpl_77RusEP3Ex5JPURre8R8giNj1dZd.

Production build passed. Local browser checks passed at 1440x1000 and 393x852: 34 landing pages, 12 new details, canonical/schema/noindex/404, map country/city boundaries, no overflow or page errors.
