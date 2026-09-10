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

## Batch 2 — famous brands — DONE (2026-09-10)

10 famous-brand chairs published as **rich buying guides with internal image
work** (not hero-only). Group A reuses the existing image-rich Chairpedia
deep-dive as the rich template's "In depth" section (bodies preserved, not
rewritten); Group B are new rich entries with hand-placed images. Rich data in
`lib/chairpedia/rich-data/<slug>.ts`, registered in `rich-data/index.ts`.
Backups in `scripts/backups/chairpedia-*-<ts>.json`. Demand = **unverified**
(no GSC this session). Buy = **Search on Amazon + official store** for all
except Gesture & Series 1 (verified direct `/dp/`).

| # | product | guide URL (/chairpedia/…) | grp | unique imgs (int/ext-hosted) | buy · notes |
|---|---|---|---|---|---|
| 1 | HM Embody (standard) | herman-miller-embody-chair | B(new) | 6 (6 int / 0) | Search + HM official · gaming (Logitech G) distinguished; body reuses shared-platform shots from the gaming deep-dive |
| 2 | HM Mirra 2 | herman-miller-mirra-2-chair | B(new) | 4 (1 int / 3 HM-official self-hosted) | Search + HM official · TriFlex vs Butterfly back |
| 3 | HM Sayl | herman-miller-sayl-chair | A | ~20 (deep-dive body) + hero | Search + HM official · suspension vs upholstered; HM spec page 404 → dims tier C |
| 4 | HM Cosm | herman-miller-cosm | A | ~16 (deep-dive body) + hero | Search + HM official · **fixed wrong product link (was HM Lino → Cosm High Back)**; Low/Mid/High + Leaf arms |
| 5 | Steelcase Gesture | steelcase-gesture | A | ~20 (deep-dive body) + hero | **/dp/B08KL9JMVB** + Steelcase official · 360° arms |
| 6 | Steelcase Series 1 | steelcase-series-1-chair | B(new) | 4 (1 int / 3 Steelcase-official self-hosted) | **/dp/B08M42B334 (existing)** + official · Microknit vs Air back |
| 7 | Humanscale Freedom | humanscale-freedom-task-chair | A | 8 (deep-dive body) + hero | Search + Humanscale official · headrest option; no recline lock |
| 8 | Haworth Zody II | haworth-zody-ii | A | 8 (deep-dive body) + hero | Search + Haworth official · Zody II vs original Zody; PAL back |
| 9 | Okamura Contessa II | okamura-contessa-ii-contessa-seconda | A | ~21 (deep-dive body) + hero | Search + Okamura official · Seconda = II; US = dealer/import |
| 10 | Vitra ID Trim | vitra-id-trim-chair | B(new) | 3 (3 int) | Search + Vitra official · **vitra.com 403-blocks fetch**; body = ID family back-type comparison (Trim/Soft/Mesh) |

**Image sourcing notes (batch 2):**
- Group A (Gesture, Sayl, Cosm, Contessa, Freedom, Zody) already had 8–21 curated body images in their published deep-dives → preserved as the rich "In depth" section; no re-upload. Each also has 1 `product_images` hero.
- Group B new images: HM CDN (`content/dam/...`) is fetchable (Mirra 2 04/05/og); Steelcase `images.steelcase.com` is fetchable (Series 1 main/microknit/air/lifestyle); **Herman Miller product pages are JS-rendered (0 static Embody images extractable)**; **Vitra.com returns 403 to automated fetch**. Embody body therefore reuses the gaming Embody deep-dive's shared-platform shots (captioned as the Embody platform). Product shots → `product_images` (verified, owner_policy); staged/detail → `gallery` bucket, referenced inline in `content_html`.
- Vitra ID Trim ended at 3 unique images: internal candidates = 1 product primary (ID Trim) + the ID Soft & ID Mesh catalog primaries reused for a labelled family comparison. **Reason more weren't added: vitra.com blocks automated fetch (403) and there is no blog/gallery supply for the ID line.**

## Batch 2 video memos (video session reads these; do not edit rows above)
Format: buyer question · 3 evidence points · 1 caution · image path · guide URL.

1. **HM Embody** — Q: "Is a health-first chair worth it, and is the gaming one different?" · Points: pixelated support matrix keeps you moving; one adaptive size (no A/B/C); 300 lb, 12-yr warranty · Caution: no headrest, no separate lumbar dial, firmer/warmer seat; gaming edition = same chassis + cooling foam · Img: product_images hero + gallery/chairpedia-1782713*.{jpg,webp} (shared platform) · URL: /chairpedia/herman-miller-embody-chair
2. **HM Mirra 2** — Q: "Which back do I get on a mid-range Herman Miller?" · Points: TriFlex vs Butterfly back; PostureFit sacral + Harmonic 2 tilt; 350 lb, 12-yr · Caution: no headrest, base build fixed seat depth + fixed arms; suspension seat is firm · Img: product_images (hero+blue) + gallery/b2-mirra2-* · URL: /chairpedia/herman-miller-mirra-2-chair
3. **HM Sayl** — Q: "Cheapest way into Herman Miller?" · Points: Yves Béhar Y-Tower suspension back; entry HM price; 12-yr warranty · Caution: base builds armless/fixed, no adjustable lumbar unless upgraded; no headrest; thin seat · Img: product hero + deep-dive body · URL: /chairpedia/herman-miller-sayl-chair
4. **HM Cosm** — Q: "The no-knob chair — which one do I buy?" · Points: Auto-Harmonic self-adjusting tilt; Low/Mid/High back; Leaf arms · Caution: no recline lock/tension, no separate lumbar; premium price · Img: product hero (Cosm High Back) + deep-dive body · URL: /chairpedia/herman-miller-cosm
5. **Steelcase Gesture** — Q: "Best arms for switching between devices?" · Points: 360° arms (4 directions + pivot); 400 lb; spine-tracking LiveBack · Caution: no headrest; expensive; many configs (easy to buy fixed-arm) · Img: product hero + deep-dive body · URL: /chairpedia/steelcase-gesture
6. **Steelcase Series 1** — Q: "Real Steelcase on a budget?" · Points: weight-activated recline + boost; Microknit vs Air back; 400 lb, genuinely on Amazon · Caution: no headrest; cheapest builds armless; materials below Gesture/Leap · Img: product_images (hero+microknit+air) + gallery/b2-series1-office-lifestyle · URL: /chairpedia/steelcase-series-1-chair
7. **Humanscale Freedom** — Q: "A chair with no recline levers?" · Points: weight-sensitive self-balancing recline (Niels Diffrient); single bar adjusts both arms; articulating headrest option; 15-yr components warranty · Caution: no recline lock, upholstered only (no mesh), mostly dealer purchase · Img: product hero + deep-dive body · URL: /chairpedia/humanscale-freedom-task-chair
8. **Haworth Zody II** — Q: "Which Zody, and what's the PAL back?" · Points: PAL independent L/R lumbar; 3-pt synchro + 5° forward tilt; Zody II ~400 lb, 12-yr · Caution: two live generations (Zody vs II) with different capacity; II firmer/shallower recline; no single Amazon listing · Img: product hero + deep-dive body · URL: /chairpedia/haworth-zody-ii
9. **Okamura Contessa II** — Q: "Japan's answer to the big three — how do I buy it?" · Points: Giugiaro design + Nishijin mesh; Smart Operation fingertip controls; deep option list (mesh/cushion, headrest, 4D arms, lumbar) · Caution: Seconda = II (don't overpay); US = dealer/import, no US Amazon; warranty unpublished · Img: product hero + deep-dive body · URL: /chairpedia/okamura-contessa-ii-contessa-seconda
10. **Vitra ID Trim** — Q: "Which ID Chair back do I choose?" · Points: Citterio family (Air/Mesh/Soft/Trim); ID Trim = slim back + integrated lumbar; FlowMotion vs AutoMotion · Caution: Vitra doesn't publish seat height/capacity/warranty; US = Vitra shop/dealer, no Amazon; family option confusion · Img: product hero (ID Trim) + product_images vitra-id-soft / vitra-id-chair-concept (family comparison) · URL: /chairpedia/vitra-id-trim-chair

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
