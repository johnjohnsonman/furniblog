-- Track the AI cost of each Chairpedia generation (Generate / Deep) so the
-- editor can show how much a draft cost. Tokens + web-search requests + the
-- resulting USD cost, plus which tier was run. NULL until a generation runs.
alter table chairpedia add column if not exists gen_cost_usd numeric;
alter table chairpedia add column if not exists gen_input_tokens integer;
alter table chairpedia add column if not exists gen_output_tokens integer;
alter table chairpedia add column if not exists gen_web_searches integer;
alter table chairpedia add column if not exists gen_tier text;
