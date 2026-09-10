# Chairpedia buying-guide batch record

Cross-session record so a content session and a separate video session can
coordinate. **Content session = writes** (rich-data, chairpedia rows,
product_images). **Video session = reads only** (completed rows + the video
memo below); it must not edit the same rows.

Execution note: background subagents only live while a session is open — nothing
here runs after a session closes or the computer sleeps. Resume a stopped batch
by opening a new Claude Code session and continuing from the first `대기`/`진행`
row.

## Batch 1 — DONE (2026-09-10)

All 10 published as rich chairpedia buying guides (new URLs; no duplicate of the
already-done 7). Rich data in `lib/chairpedia/rich-data/<slug>.ts`, registered in
`rich-data/index.ts`. Chairpedia rows created via `scripts/_batch1-upsert.ts`
(backups in `scripts/backups/chairpedia-*-<ts>.json`; new rows had no prior
version). Demand = **unverified** (no GSC access this session). Amazon links are
verified direct `/dp/` product links unless noted.

| # | product | guide URL (/chairpedia/…) | status | images (internal/ext) | buy · limits |
|---|---|---|---|---|---|
| 1 | ticova-ergonomic | ticova-ergonomic-office-chair | 완료 | 1 / 0 | /dp/B08LBJXVSP · recline 130/140 by batch |
| 2 | gabrylly-ergonomic | gabrylly-ergonomic-office-chair | 완료 | 1 / 0 | /dp/B07Y8BXBX8 · many look-alike SKUs |
| 3 | duramont-ergonomic | duramont-ergonomic-office-chair | 완료 | 1 / 0 | /dp/B0797HZ8W1 · arms "3D" unconfirmed |
| 4 | mimoglad-high-back | mimoglad-high-back-office-chair | 완료 | 1 / 0 | /dp/B09N93L2RQ · flip-up arms only |
| 5 | branch-ergonomic-chair | branch-ergonomic-chair | 완료 | 1 / 0 | /dp/B0C15B3HN1 (+official) · headrest add-on |
| 6 | flexispot-c7 | flexispot-c7-office-chair | 완료 | 1 / 0 | /dp/B0DPQQ2L22 (+official) · base=3D not 4D |
| 7 | hon-ignition-2 | hon-ignition-2-office-chair | 완료 | 1 / 0 | /dp/B07ZGFPQNW (+official) · config-dependent |
| 8 | sihoo-doro-s300 | sihoo-doro-s300-office-chair | 완료 | 3 / 0 | /dp/B0DQTRVSHS (+official) · integrated headrest |
| 9 | office-star-progrid | office-star-progrid-office-chair | 완료 | 1 / 0 | /dp/B00450P182 (+official) · **older SKU, confirm model** |
| 10 | sidiz-t50 | sidiz-t50-office-chair | 완료 | 1 / 0 | /dp/B083FBN9BH (+official) · headrest is a version choice |

Images this batch = existing accurate `product_images` hero per product (internal
reuse; S300 has 3). Body/staged/detail enrichment (internal-first, per the prior
premium-3 method) is the tracked **follow-up** — not blocking publication.

Statuses: 대기 / 진행 / 완료 / 보류.

## Next 10 candidates (office, US /dp/, not yet done)
nouhaus? (done) — use: **modway-articulate ($165), flexispot-oc3 ($170), office-star-ventilated-managers ($236), serta-fairbanks ($326), hon-convergence ($330), uplift-envoke ($389), la-z-boy-trafford ($400), duorest-alpha ($500), allsteel-mimeo ($600), x-chair-x1 ($729)**. Confirm demand + exact model/ASIN before writing; hold any with ambiguous SKUs (like Office Star was).

## Video memos (video session reads these; do not edit rows above)
Format: buyer question · 3 evidence points · 1 caution · image path · guide URL.

1. **Ticova** — Q: "Is a $200-ish chair actually adjustable?" · Points: 2-axis (height+depth) lumbar; true 3D arms; adjustable removable headrest for tall users · Caution: gas cylinder/mesh can wear in 1–2 yrs; deep fixed seat · Img: product_images hero (sihoo… no—ticova-ergonomic) · URL: /chairpedia/ticova-ergonomic-office-chair
2. **Gabrylly** — Q: "Which Gabrylly do I buy?" · Points: cool double-mesh back; flip-up arms tuck under desk; headrest+lumbar at budget · Caution: many look-alike SKUs (280 vs 350 vs 400 lb); support softens ~12–18 mo · Img: product_images hero · URL: /chairpedia/gabrylly-ergonomic-office-chair
3. **Duramont** — Q: "Are the arms really 3D?" · Points: breathable high-back mesh for tall users; locks at multiple recline angles; 5-yr warranty · Caution: arms ~2D (screw-set), lumbar/headrest limited; deep seat · Img: product_images hero · URL: /chairpedia/duramont-ergonomic-office-chair
4. **MIMOGLAD** — Q: "Headrest + lumbar on a budget?" · Points: mesh back+headrest+sliding lumbar; flip-up arms; 5-yr warranty · Caution: arms flip-up only; recline 2 locks; buy OC-5188H not look-alikes · Img: product_images hero · URL: /chairpedia/mimoglad-high-back-office-chair
5. **Branch** — Q: "Premium feel without premium price?" · Points: 8-pt adjust incl. 3D arms + seat-depth slider; smooth casters; 7-yr parts warranty · Caution: arms hard/slip; headrest costs extra; shallow recline · Img: product_images hero · URL: /chairpedia/branch-ergonomic-chair
6. **FlexiSpot C7** — Q: "Is the base C7 the 4D one?" · Points: self-adaptive lumbar; mesh or foam seat + footrest option; 10-yr warranty · Caution: base=3D (Max is 5D); official vs review specs differ; arms high for low desks · Img: product_images hero · URL: /chairpedia/flexispot-c7-office-chair
7. **HON Ignition 2.0** — Q: "What do I actually get?" · Points: contract-grade + lifetime warranty; mesh or upholstered; Big&Tall 450 lb · Caution: arms/lumbar/headrest often paid options; lumbar thin plastic · Img: product_images hero · URL: /chairpedia/hon-ignition-2-office-chair
8. **SIHOO Doro S300** — Q: "What's the anti-gravity recline like?" · Points: weightless infinite recline; 6D arms + dual dynamic lumbar; all-mesh premium build · Caution: integrated (non-separate) headrest depends on height; 2 colours, no footrest · Img: product_images (3: 3/4, front, armrest) · URL: /chairpedia/sihoo-doro-s300-office-chair
9. **Office Star ProGrid** — Q: "Which ProGrid is this?" · Points: cool ProGrid mesh back; built-in lumbar; GREENGUARD + Pro-Line II warranty · Caution: linked ASIN is an older SKU — confirm model + ~250 lb capacity; no headrest, firm seat · Img: product_images hero · URL: /chairpedia/office-star-progrid-office-chair
10. **SIDIZ T50** — Q: "How much adjustment under $400?" · Points: 3D arms + 2-way lumbar; seat-depth + forward tilt (rare at price); GREENGUARD design · Caution: budget-grade knobs/padding; rolls fast on hard floors; headrest is a version choice · Img: product_images hero · URL: /chairpedia/sidiz-t50-office-chair
