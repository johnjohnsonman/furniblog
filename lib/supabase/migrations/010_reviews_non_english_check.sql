-- Reviews with non-English summaries (run in Supabase SQL Editor)
-- Column name is summary_ko but new pipeline writes English summaries there.

-- Japanese characters in summary
SELECT id, source, summary_ko AS summary, created_at
FROM public.reviews
WHERE summary_ko ~ '[ぁ-ん]|[ァ-ン]|[一-龯]'
ORDER BY created_at DESC
LIMIT 20;

-- Korean hangul in summary (optional)
-- SELECT id, source, summary_ko AS summary, created_at
-- FROM public.reviews
-- WHERE summary_ko ~ '[가-힣]'
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Count by source (Japanese)
-- SELECT source, count(*) AS cnt
-- FROM public.reviews
-- WHERE summary_ko ~ '[ぁ-ん]|[ァ-ン]|[一-龯]'
-- GROUP BY source
-- ORDER BY cnt DESC;

-- To re-process: delete non-English rows and re-run pipeline for those products
-- (or manually edit in admin). Example — preview only, do not run without review:
-- DELETE FROM public.reviews
-- WHERE summary_ko ~ '[ぁ-ん]|[ァ-ン]|[一-龯]';
