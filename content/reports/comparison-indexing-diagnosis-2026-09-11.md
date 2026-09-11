# Comparison Indexing Diagnosis

## Readonly GSC Inspection

| Comparison | Coverage returned | Last crawl returned |
| --- | --- | --- |
| Aeron / Mirra 2 | Discovered - currently not indexed | None |
| Leap V2 / Karman | Discovered - currently not indexed | None |
| Contessa II / Aeron | Discovered - currently not indexed | None |
| M18 / Doro C300 | URL is unknown to Google | None |
| Ticova / M18 | URL is unknown to Google | None |

All five verdicts were NEUTRAL. Fetch, indexing and robots states were
UNSPECIFIED, not explicit failures or blocking decisions. The first three
listed https://www.furniblog.com/sitemap.xml. None returned evidence of a
post-correction crawl. Do not claim that Google crawled and rejected the new
content, or that these results prove a manual penalty. This five-URL sample
does not establish the index status of all 120 comparison pages.

## Live Verification

All five URLs returned HTTP 200, a matching self-canonical, index/follow,
server-rendered article text and exactly one H1. All appear in the live sitemap
with their actual September 10/11 content-modification dates. robots.txt allows
public URLs and disallows only /admin and /api.

Followed actual HTML pagination anchors through ten comparison-list pages.
Each returned 12 article links and the matching page canonical. All five targets
are reachable without executing JavaScript:

- Aeron / Mirra 2: page 10.
- Leap V2 / Karman: page 5.
- Contessa II / Aeron, M18 / C300 and Ticova / M18: page 3.

No missing hub links or pagination loops were found. These HTTP checks are not
a Google live test or proof that Googlebot sees an identical response under
all network conditions. Sitemap presence today does not prove Google has read
the current sitemap version.

Evidence: data/seo-audit/comparison-crawl-paths-1789094137101.json

## Decision

The immediate observed issue for these URLs is discovery/indexing, not a
demonstrated current robots/canonical/HTTP barrier. The reason for Google's
crawl selection remains unknown. Avoid repetitive body edits or request-time
freshness changes as a response.

Next engineering action: bring already source-reviewed, useful comparisons
closer to the initial comparison-list view. Do not promote unreviewed pages
merely because they are new or contain profitable product names.

Owner action: if not already submitted, use GSC URL Inspection's live test and
request indexing once for the corrected Aeron/Mirra URL and new M18/C300 URL.
The current readonly API did not submit an indexing request. Repeated requests
do not accelerate crawling; Google does not guarantee indexing and says crawl
processing can take days to weeks.

Source: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl

No production content/configuration changes, artificial affiliate clicks,
scheduled monitoring or indexing submission were made in this audit.
