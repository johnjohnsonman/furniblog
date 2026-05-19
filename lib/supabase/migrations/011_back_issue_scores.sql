-- Backfill scores.mentionsBackPain / mentionsLumbar from existing review text.
-- Run in Supabase SQL Editor after deploy.

UPDATE reviews
SET scores = scores || '{"mentionsBackPain": true}'::jsonb
WHERE
  (
    summary_ko ILIKE '%back pain%'
    OR summary_ko ILIKE '%lower back%'
    OR summary_ko ILIKE '%backache%'
    OR summary_ko ILIKE '%back ache%'
    OR summary_ko ILIKE '%back support%'
    OR summary_ko ILIKE '%sciatica%'
    OR summary_ko ILIKE '%herniated%'
    OR summary_ko ILIKE '%허리%'
    OR summary_ko ILIKE '%요통%'
    OR summary_ko ILIKE '%디스크%'
  )
  AND (scores->>'mentionsBackPain') IS NULL;

UPDATE reviews
SET scores = scores || '{"mentionsLumbar": true}'::jsonb
WHERE
  (
    summary_ko ILIKE '%lumbar%'
    OR summary_ko ILIKE '%요추%'
    OR summary_ko ILIKE '%척추%'
  )
  AND (scores->>'mentionsLumbar') IS NULL;

-- Neutral sentiment when back is mentioned but no sentiment stored yet
UPDATE reviews
SET scores = scores || '{"backIssueSentiment": "neutral"}'::jsonb
WHERE
  (
    (scores->>'mentionsBackPain')::boolean IS TRUE
    OR (scores->>'mentionsLumbar')::boolean IS TRUE
  )
  AND (scores->>'backIssueSentiment') IS NULL;
