-- Reviewer profile columns for quantitative filtering
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS body_type text,
ADD COLUMN IF NOT EXISTS back_issues text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS occupation text;

CREATE INDEX IF NOT EXISTS idx_reviews_height ON reviews (reviewer_height_cm);
CREATE INDEX IF NOT EXISTS idx_reviews_body_type ON reviews (body_type);
