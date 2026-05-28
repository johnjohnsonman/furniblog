-- Update review_sessions enum-like checks to English encoding used by /reviews/new wizard.

alter table public.review_sessions
  drop constraint if exists review_sessions_height_band_check;

alter table public.review_sessions
  add constraint review_sessions_height_band_check
  check (
    height_band is null
    or height_band in ('under_5_4', '5_4_5_7', '5_8_5_11', '6_0_6_2', '6_3plus')
  );

alter table public.review_sessions
  drop constraint if exists review_sessions_age_band_check;

alter table public.review_sessions
  add constraint review_sessions_age_band_check
  check (
    age_band is null
    or age_band in ('under20', '20s', '30s', '40s', '50plus')
  );
