# Mobile navigation and European stores — 2026-09-16

## Diagnosis
Measured the live home, products, guides, blog, comparisons, reviews, brands, news, videos, store map and location directory at 393x852. A separate 3-run check found Aeron detail completion 6.0–9.3 seconds, blog 2.9–4.1 seconds, products 3.0–5.0 seconds, reviews 2.0–3.5 seconds. Measurements are browser content completion, not Core Web Vitals or global user percentiles. Analytics requests were blocked consistently for comparison; network and cache state vary.

Store mobile controls used 271px, leaving about 302px for the initial map. Product cards began around 690px below the viewport top. All map result cards rendered at once. Product lists serialized full detail objects. Product detail performed independent DB queries serially and repeated metadata/page resolution.

## Changes
Compact map controls (161px), default map area around 470px; mobile Map/List controls, rounded resizable sheet, overlay filters, 24-card incremental list with all stores retained for map/filter/search. Tablet layout receives the same controls. Product categories scroll horizontally; mobile title and filter spacing compacted. Home shortlist has a bounded scroll area. Review contribution CTA is compact on mobile.

Product cards receive only required fields; reviews receive minimal brand options. Product detail queries run concurrently; React cache deduplicates product/guide metadata lookups within the request without retaining old prices. Blog index card assembly is cached for 60 seconds; article detail and product prices remain fresh. Navigation shows immediate progress without a root loading boundary, preserving HTTP404 status on missing routes. Menu hover/focus prefetch is limited to intended navigation.

19 verified stores added: Germany16, Netherlands2, Belgium1. Total446, Europe130, 20countries, 48indexable location pages. Official directories: https://www.smow.de/info/smow.html ; https://www.desko.nl/opbergkasten/ ; https://ergonomiewebshop.nl/klantenservice ; https://www.ergonomio.be/contact . smow Chemnitz held pending entrance/address clarification. No Korea, DB writes, copied vendor photographs or invented chair trials.

## Verification and follow-up
Schema/location validation, lint/typecheck/build and local/live browser checks are required. Evidence under data/performance-20260916 and data/showroom-research/europe-wave5-20260916. Before/after live performance results will be recorded in the operational report.

Remaining limits: cold DB queries and third-party map tiles still depend on network; no claim that every click worldwide is instant. Blog list publication changes may take up to one minute plus revalidation. Further work: real-user navigation metrics, image byte/size audit, continued store verification and GSC inspection after 48–72 hours.

Rollback: prior production dpl_2RcXW7LoLntdZQSHMMCy2xTD1ric, commit1565964. No database rollback required.
