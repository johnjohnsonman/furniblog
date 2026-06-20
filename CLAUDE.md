# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 자동으로 읽는 프로젝트 안내서입니다.
**여러 컴퓨터(노트북/데스크탑)를 오가며 작업하므로, 작업 맥락은 로컬 메모리가 아니라 이 파일에 git으로 기록합니다.**
중요한 진행 상황이나 결정사항이 생기면 이 파일의 "진행 상황" 섹션을 갱신하고 커밋하세요.

## 프로젝트 개요

- **이름**: furniblog — 의자(체어) 중심 가구 블로그/리뷰 + 제휴(affiliate) 사이트
- **배포**: Vercel (프로덕션 도메인 `www.furniblog.com`)
- **저장소**: https://github.com/johnjohnsonman/furniblog.git
- **사용자**: 한국어로 소통합니다. 답변은 한국어로 작성하세요.

## 기술 스택

- **Next.js 16.2.6** (App Router, Turbopack), **React 19**, **TypeScript 5.7**
- **Tailwind CSS v4** + Radix UI (shadcn 계열 컴포넌트, `components.json`)
- **Supabase** (DB / 인증 / 스토리지) — `lib/supabase/`
- **Anthropic SDK** (`@anthropic-ai/sdk`) — AI 콘텐츠 파이프라인
- 데이터 수집: cheerio, axios, node-html-parser, xml2js (`lib/pipeline/sources/`)

## 디렉토리 구조

- `app/` — App Router 라우트
  - `app/admin/` — 관리자 패널 (`(panel)`, `login`, `queue`)
  - `app/api/` — API 라우트: `admin`, `affiliate`, `cron`, `experience`, `gallery`, `pipeline`, `reviews`, `track`
  - 공개 페이지: `products`, `brands`, `designers`, `reviews`, `videos`, `news`, `gallery`, `best`, `experience` 등
- `lib/` — 핵심 로직
  - `lib/supabase/` — 클라이언트/서버/스토리지, `schema.sql`, `migrations/`
  - `lib/pipeline/` — AI 콘텐츠 수집·처리 파이프라인 (`sources/`, `processor.ts`, `chair-names.ts`)
  - `lib/affiliate/`, `lib/data/`, `lib/seo/`, `lib/reviews/`, `lib/videos/`, `lib/news/`, `lib/home/`, `lib/audit/`
- `scripts/` — 시드/유지보수 스크립트 (ts-node 실행)
- `components/`, `hooks/`, `styles/`, `public/`, `types/`

## 자주 쓰는 명령

```bash
npm run dev        # 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버
npm run lint       # ESLint

# 시드/유지보수 (ts-node)
npm run seed:auto          # 의자 자동 시드
npm run seed:additional    # 추가 의자 시드
npm run seed:gallery       # 갤러리 시드
npm run sync:thumbnails    # 제품 썸네일 동기화
npm run test:pipeline      # 파이프라인 테스트
```

## 환경변수 (`.env.local`)

`.env.local.example`를 복사해서 채웁니다. **`.env*.local`과 `.env*`는 gitignore됨(절대 커밋 금지).**
필수 키:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- 데이터 소스: `REDDIT_CLIENT_ID/SECRET`, `YOUTUBE_API_KEY`, `NAVER_CLIENT_ID/SECRET`
- `ADMIN_SECRET`
- 제휴/분석: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`(`furniblog0e-20`), `NEXT_PUBLIC_AMAZON_JP_TAG`, `NEXT_PUBLIC_COUPANG_PARTNER_ID`
- `NEXT_PUBLIC_SITE_URL`

## 주요 기능

- **제품/브랜드/디자이너** 카탈로그 (Supabase 기반)
- **제휴 링크**: 아마존 직접 `/dp/` 링크 (`lib/data/affiliate-links-data.ts`), 쿠팡 — `/best/best-chairs-to-buy` "온라인 구매 가능 의자" 가이드에 자동 노출
- **리뷰/영상/뉴스 피드**: 방문할 때마다 랜덤 정렬로 신선하게 노출
- **AI 콘텐츠 파이프라인**: 외부 소스(Reddit/YouTube/Naver 등) 수집 → 처리 → 관리자 큐(`app/admin/queue`)
- **Cron** (`vercel.json`): 매일 2회 콘텐츠 수집 — `/api/cron/collect` (morning `0 21 * * *`, evening `0 9 * * *`)
- **자체 방문자 분석**: 관리자 대시보드, 사이트 소유자 본인 방문은 추적 제외
- **SEO**: `app/sitemap.ts`, `app/robots.ts`, next-seo, next-sitemap; 레거시 WordPress URL → 301 리다이렉트

## 작업 규칙

- 코드 스타일은 주변 코드를 따릅니다.
- `next.config.mjs`에 레거시 리다이렉트가 있음(Aeron variant 통합 등). 라우트 변경 시 리다이렉트 영향 확인.
- 커밋 메시지는 conventional commits 형식 (`feat(scope):`, `fix(scope):`, `chore:` 등) 사용.
- `images.unoptimized: true` 상태 (Vercel 이미지 최적화 미사용).

## 진행 상황 (수동 갱신)

> 컴퓨터를 옮기거나 큰 작업을 마칠 때 여기에 한두 줄 남기세요. 그래야 다른 컴퓨터에서 이어받을 수 있습니다.

- 2026-06-16: 데스크탑(`C:\Users\bizandlife\Desktop\park\furniblog`)에 새로 clone, 의존성 설치, 개발 서버 구동 확인. `CLAUDE.md` 추가.
- 최근 작업(~6/14): 국제 구매 가능 의자(Ergohuman, Duorest, Sidiz T50) 아마존 직접 링크 추가, 리뷰/영상 랜덤 정렬, 자체 방문자 분석 등.

### 2026-06-16 SEO 점검 & 파이프라인 개선 (커밋 fbc3f03 ~ 5ebe75e)
- **SEO 점검 결과**: 구글 서치 콘솔 기준 색인됨 33 / 색인안됨 207.
  - noindex 84개 = 전부 옛 WordPress `/tag/...` 보관함 URL → middleware에 `/tag` 레거시 301 추가로 해결(커밋 24ee33c).
  - 404 38개 = 옛 한국어 글주소(이미 단일세그먼트 리다이렉트로 처리됨, 재크롤링 대기) + `/wp-content/*` 이미지(404 정상). **추가 수정 불필요.**
  - `/about`, `/designers`에 고유 메타데이터 추가(fbc3f03). 구글 인증 태그는 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env로 받게 했으나, 서치콘솔이 이미 도메인 인증돼 있어 **불필요**.
- **뉴스 필터 강화**(5ebe75e): `lib/news/relevance.ts`에 `isPromotional` 게이트 추가 → 할인/세일/딜/쇼핑 기사 자동 거부, 공식·편집 뉴스만 통과.
- **크론 리뷰 비중 ↑**(5ebe75e): `lib/cron/run.ts` DEFAULT_CRON_OPTIONS — maxReviewChairs 8→16, reviewBudget 80→120s, maxNewsBrands 20→15.
- **프로모션 뉴스 정리 스크립트**: `npm run clean:promo-news`(dry-run) / `-- --apply`(삭제). `scripts/cleanup-promo-news.ts`.

### 2026-06-16 DB 마이그레이션 025~029 적용 완료 (프로덕션 Supabase)
- 이 컴퓨터(`C:\Users\p\Desktop\park\furniblog`)에서 `git pull`로 최신 main(85359c8) 받고 `npm install` 완료.
- **마이그레이션 025~029를 Supabase SQL Editor에서 실행 → 적용 완료**: 025 news 테이블/RLS, 026 news slug+why_it_matters, 027 reviews/videos/news audit 컬럼, 028 page_views 테이블+`get_traffic_stats()` 함수, 029 affiliate_clicks.country 컬럼.
  - 주의: `create policy`는 `if not exists` 미지원이라 재실행 시 42710 에러 → `drop policy if exists ... ; create policy ...`로 처리. 통합본 `lib/supabase/migrations/_apply_025-029.sql` 참고.
- 메모: Claude 로컬 메모리는 컴퓨터마다 따로라 PC 옮기면 안 따라옴 → 작업 맥락은 이 `CLAUDE.md`에 적고 커밋하는 게 맞음(원래 규칙대로).

### 2026-06-16 뉴스 썸네일 하이브리드 + 어드민 업로드
- **프로모션 뉴스 22건 삭제**(`npm run clean:promo-news -- --apply`). 이후는 수집 단계 AI 필터가 자동 차단.
- **뉴스 이미지 시스템**(신규 `lib/news/thumbnail.ts`, `lib/news/brand-images.ts`):
  - 수집 시 `브랜드 이미지 → 그라데이션` 폴백. 백필: `npm run backfill:news-images [-- --apply]`.
  - 실제 기사 썸네일 디코더(Google News batchexecute)는 **현재 Google이 차단(`[3]`)** → 베스트에포트로만 남김. 정책 바뀌면 자동 동작.
- **어드민 직접 썸네일 업로드**: `app/api/admin/news/[id]/thumbnail` + 어드민 News 목록에 Thumbnail 칸(업로드/교체/삭제). gallery 버킷 사용. 업로드 동작 확인됨.
- 상세페이지(`/news/[slug]`)·원본가기 버튼은 기존에 이미 존재. 기존 111건 슬러그도 이미 채워져 있어 카드→상세 연결 정상.
- **데이터 현실**: brands/products에 이미지가 거의 없음(브랜드 0, 제품 썸네일 1/141). 그래서 자동 폴백이 채울 게 없음 → 브랜드 `hero_image_url`을 채우면 그 브랜드 전체 뉴스에 자동 적용됨(고효율).

### 2026-06-16 제휴 버튼 정리 (공식몰 링크 제거)
- "Visit official store"는 수익 0(커미션 없음)이라 공개 UI 4곳에서 제거: Where-to-Buy 박스(`BuyButtonGroup`), 제품 모바일 하단바, Best 리스트, 유사 의자 표.
- 모바일 하단바·유사 의자 "Buy"는 공식몰 대신 **수익 링크(아마존, KR은 쿠팡)**로 재연결. 어드민 제휴링크 편집(ProductForm)은 그대로 유지.
- 참고: 프리미엄 의자의 아마존 링크는 `amazon.com/s?k=` 검색 링크(직판 안 됨), 저가/게이밍은 `/dp/` 직링크. 쿠팡은 `link.coupang.com/a/` 진짜 파트너스 딥링크라 KR 주 수익원. 아마존 태그는 US/JP만 주입됨(KR 미적용) — KR은 쿠팡만 노출됨.

### 2026-06-16 글로벌 수익화: Amazon Earn Globally + OneLink
- Amazon Associates "Earn Globally" 가입 완료 → 단일 US 스토어 ID(`furniblog0e-20`)가 US/CA/UK/DE/FR/IT/NL/PL/ES/SE 10개국에서 수익. (호주·일본은 별도 프로그램, 추후 가입)
- 결제: Payoneer USD 수취계좌(검토중) → 승인되면 Amazon Account Settings에 직접입금 등록. 출금은 신한은행 KRW(승인됨). 세금 W-8 인터뷰는 조세협약(reduced withholding) claim으로 제출.
- **코드**: `components/affiliate/AmazonOneLink.tsx` 추가 → 루트 레이아웃에서 OneLink 스크립트 로드(방문자 현지 아마존으로 자동 라우팅, ASIN 현지 미존재 시 폴백). **`NEXT_PUBLIC_AMAZON_ONELINK_ID`(adInstanceId UUID) 환경변수 필요** — Associates Central > Tools > OneLink > "Get the OneTag Script"에서 받아 .env.local + Vercel에 설정해야 실제 동작.
- `buildAffiliateUrl`: 이제 모든 아마존 링크에 태그를 항상 부여(이전엔 US/JP만 부여, KR/기타는 누락). OneLink가 그 위에서 현지화.

### 2026-06-16 인터랙티브 의자 추천 ("The Sit Test")
- **추천 엔진** `lib/recommend/` (`engine.ts` 순수 점수+MMR, `data.ts` DB로더): 리프트 기반 리뷰 친화도 + 에디토리얼 평점 신뢰도 블렌딩 + 구매용이성(/dp/) + MMR 분산/브랜드캡/가격대 슬롯. `POST /api/recommend` (답변→TOP5). 100% 데이터 주도(신규 제품/리뷰 자동 편입).
- **에디토리얼 평점 어드민** `/admin/editorial` — 쇼룸 평가(Overall/Comfort/Ergo 0–10)로 신상 콜드스타트 보정. 마이그레이션 030(rating 컬럼 numeric(4,1)) 필요.
- **퀴즈 UI** `app/find-your-chair/` (framer-motion, 다크 시네마틱): 풀스크린 6질문(용도/예산/시간/통증 바디맵/스타일/기능) → 분석 리빌 → TOP5(매치링·태그). 시그니처 인터랙션(바디맵 물리·드래그 다이얼)은 추후 폴리시 예정.

### 2026-06-17 크론 진단·수정 + 서버 Reddit + 카탈로그 정리·확장 + canonical 버그
- **크론은 정상 동작**(하루 2회 09:0x/21:0x UTC)이었으나 리뷰 수집이 **기아 현상**으로 헛돌고 있었음: 정렬 키가 "마지막 리뷰 저장 시각"이라 saved=0인 무명 의자(Okamura Cronos 등)가 큐 앞에 영구 고정 → 141개 중 34개 인기 의자 미수집. **수정**: `lib/cron/run.ts` `reviewChairsToRefresh`가 `pipeline_runs`의 "마지막 시도 시각"으로 정렬(커밋 b0d4de5). 또한 크론 비중 리뷰로 재조정(maxReviewChairs 8→16, 5ebe75e).
- **서버 Reddit 수집 추가**(f9dcaed): 기존 브라우저 CORS 방식 실패 → `lib/pipeline/sources/reddit.ts` OAuth(client_credentials). **단 `REDDIT_CLIENT_ID/SECRET` 미설정**(Reddit이 앱 생성에 승인 절차 검). 키 없으면 조용히 skip. 추후 키 발급 시 자동 동작.
- **카탈로그 정리·확장**(f9ab7f3, 프로덕션 DB 적용 완료, 141→149): 유령/오류 제품 검증 후 `scripts/cleanup-catalog.ts`로 삭제 12 + 수정 5, `scripts/seed-expansion-chairs.ts`로 오피스 체어 20개 추가(HON Wave/Nucleus/Convergence, Allsteel, X-Chair X1~X4, UPLIFT, La-Z-Boy, Office Star, Boss Office, Flash Furniture, SIHOO Doro S300). 신규 브랜드 7. 게이밍/라운지 제외. 두 스크립트 모두 dry-run 기본.
- **제휴 링크**(64d0f3c): 신규 19종 아마존 `/dp/` 직링크를 `lib/data/affiliate-links-data.ts`에 추가(머니 페이지/best-chairs-to-buy 자동 노출). ASIN은 리스팅 제목 기반 리서치 → **직접 클릭 스팟체크 권장**. UPLIFT Vert·유럽 프리미엄은 아마존 미판매 → 검색링크 자동 폴백.
- **🔴 canonical 버그 수정**(a4f779c, 영문 페이지 미색인의 핵심 원인): 루트 layout 전역 `canonical:'/'`가 전 페이지에 상속돼 모든 상세가 "홈의 복제본"으로 선언됨. 전역 제거 + 홈 '/', products/[id]·reviews/[id]·news/[slug] self-canonical(brands·best는 기존). 프로덕션 검증 완료(제품 canonical=자기 URL).
- 참고: 도메인 이슈(vercel.app)는 이전에 Vercel `NEXT_PUBLIC_SITE_URL=https://www.furniblog.com` 설정으로 해결됨(sitemap 1362 URL 전부 www 도메인 확인).
- 프로모션 뉴스 정리는 이전에 완료(22건). `.env.local`은 이 데스크탑에 실제 키 채워둠(vercel env pull).

### 2026-06-18 제목 중복 수정 + Soft 404 전수 점검·수정 + GSC 등록 완료
- **제목 중복 버그 수정**(069a2eb): layout 템플릿 `%s | Furniblog`인데 여러 페이지가 제목에 ` | Furniblog`를 또 붙여 `X | Furniblog | Furniblog`로 중복. 목록 7개 + 상세 3개(products/reviews/news) 접미사 제거.
- **🔴 Soft 404 진짜 원인 발견·수정**: `/reviews`가 GSC에서 Soft 404 → 라이브 테스트 결과 "No reviews found" + `Failed to execute 'json'` = **리뷰를 클라이언트 fetch로만 로드 → 구글봇 렌더 시 fetch 실패하면 빈 화면**. 수정(4ff6c03): 서버에서 첫 페이지 SSR(`getReviews`) → initialReviews 전달, 클라 첫 fetch skip. (AI 콘텐츠 판정과 무관 — 순수 버그)
- **전 페이지 색인 위험 전수 점검**: 24개 공개 라우트 확인. 상세 페이지(사이트맵 1,300+개)·허브 페이지 전부 SSR 콘텐츠 풍부=안전. 위험은 클라fetch-only였던 `/reviews`(수정)·`/gallery`뿐.
- **`/gallery` 수정**(8986621): 같은 클라fetch 패턴 SSR화 + **gallery_images 테이블 0건(빈 상태)** 발견 → 비었을 때 `noindex`(이미지 추가되면 자동 색인). 
- **GSC 작업 완료(사용자)**: sitemap `www.furniblog.com/sitemap.xml` 제출(성공, ~1,368 URL) + 옛 WordPress sitemap 5개 삭제 + 홈/`/reviews` 등 색인 요청 + NOINDEX·404 유효성 검사 시작. 실적 27클릭/528노출(28일, 대부분 옛 한국어 chairpark 글).
- **결론**: **색인 차단 기술 이슈 전부 해결.** 이제 트래픽 레버는 코드가 아니라 **콘텐츠(구매의도 키워드)+백링크+시간**. 남은 코드 SEO는 폴리시(이미지 최적화/breadcrumb/FAQ/내부링크)뿐, 급하지 않음. 별점 리치스니펫은 보류(사용자 판단).
- **수익화 전략 메모(미실행)**: 5레이어 플랜 검토함 — ①광고망 졸업(Mediavine/Raptive, **트래픽 미달로 시기상조**) ②Amazon 위 레이어(Levanta 등 셀러펀딩, 브랜드 등록여부 확인 필요) ③D2C 직제휴(Impact/CJ/ShareASale) ④자동링크(Skimlinks) ⑤Chairpark 자사 퍼널(마진100%, 최우선·트래픽무관). **현실: AdSense ID가 아직 placeholder라 광고수익 0 → 기본 AdSense부터 켜야.** 구체 수치/정책(아마존 더블딥 금지 등)은 실행 전 팩트체크 필요.

### 2026-06-18 크론 타임아웃 원인 규명 + 수동 수집 테스트
- **"크론 에러" 정체 = `FUNCTION_INVOCATION_TIMEOUT`**: 수집 예산 합계 265s + 페이지별 in-flight 오버런이 Vercel 함수 한도 300s 초과 → 매 실행 죽음(며칠간 사실상 실패의 원인). **수정**(974c2de): DEFAULT_CRON_OPTIONS 예산 210s(news50/video55/review105)로 낮춤. 150s 예산 테스트가 ~173s 실측이라 210s→~235s 예상(마진 ~65s).
- **수동 수집 테스트 성공**: 프로덕션 `/api/cron/collect`를 CRON_SECRET Bearer로 호출(쿼리 캡으로 축소). 결과 reviews saved=11(Modway+4, Razer Iskur V2 X+5 등), 리뷰 총계 1026→1061. **로테이션 수정(b0d4de5)이 실제 동작 확인**. 뉴스/영상 0건은 대상이 이미 최신(중복)이라 정상.
- 참고: 한 의자(Aeris 3Dee)가 한 번에 5회 처리된 로그 = 타임아웃된 1차 호출이 서버에서 계속 돌던 중 2차 호출이 겹친 테스트 아티팩트(제품 테이블엔 중복 없음, 149개 전부 고유). 정상 스케줄(12h 간격)+타임아웃 수정으로 재발 안 함.
- 수동 트리거 방법(메모): `SECRET=$(grep ^CRON_SECRET= .env.local|cut -d= -f2); curl -m280 -X POST "https://www.furniblog.com/api/cron/collect?maxNewsBrands=4&maxVideoChairs=3&maxReviewChairs=4&newsBudgetMs=35000&videoBudgetMs=35000&reviewBudgetMs=80000" -H "Authorization: Bearer $SECRET"`

### 2026-06-18/19 관리자 GSC 대시보드 + 카페24 백과사전 상세페이지 시스템
- **관리자 SEO 대시보드(GSC API)**: `/admin/seo`. `lib/seo/gsc.ts`(서비스계정 JWT→OAuth 토큰 캐싱→Search Analytics, 외부 의존성 없음), `/api/admin/seo`(requireAdmin, days=1/7/28/90). 통계카드+추이차트(recharts)+상위쿼리/페이지/국가 표. 커밋 5f4dde2·3a44723.
  - **Vercel env 필수**(프로덕션용): `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY`(이름 정확히! `private_key` 아님), `GSC_SITE_URL=sc-domain:furniblog.com`. 로컬 `.env.local`엔 이미 있음. 서비스계정 JSON은 `furniblog-*.json`로 gitignore됨(커밋 금지).
  - GSC 현황(참고): 옛 한글 워드프레스 글 위주 + 영문 제품키워드(cosm review 등) 29~54위 노출 시작, 해외(캐나다·영국 등)는 노출만 시작·클릭 0.
- **카페24 백과사전 상세페이지 시스템**(앱과 무관한 정적 콘텐츠, `static-pages/`):
  - `itoki-act2.html`(이토키 Act2), `x-chair-x4.html`(X-Chair X4) — 16섹션, CEO/개발자 서사, 셀렉트숍 화법, 공통 header/footer + `.cp-detail`/`.cp-img` 스코프 CSS.
  - **원칙(중요)**: 각 제품은 **웹 리서치로 검증된 사실만** 사용. 디자이너·인증·수상·스펙이 없으면 지어내지 말고 "확인되지 않음"으로 정직 표기(예: X4는 디자이너/인증/수상 없음 → 명시). 정보 풍부=길게(Act2 한글 5,661자), 부족=짧고 정직하게(X4 4,538자), 거의 없음=스킵.
  - **이미지 채우기 도구** `static-pages/_image-filler.html`: 브라우저로 열어 상세 HTML 붙여넣기→`.cp-img` 자리마다 파일 업로드/URL → 완성 HTML 복사→카페24 HTML편집에 붙여넣기. 모든 상세페이지 재사용.
  - 대량 생성 시: 리서치 신뢰도로 자동 분기(풍부→길게/부족→짧게/없음→스킵). 무검증 100/일은 구글 'scaled content abuse' + 오정보 위험 → 금지. 실제 149개 카탈로그 기준 배치+검토 권장.

### 2026-06-19 Chairpedia — 의자별 초상세 백과사전 (앱 내장, AI 생성 + 블로그 에디터)
정적 카페24 페이지(`static-pages/`)와 별개로, **furniblog 앱 안에 의자별 딥다이브 편집/발행 시스템**을 구축. 메인 메뉴 "Chairpedia" 노출. SEO 최우선 → 수익화(아마존 구매 버튼) 연결.

**작동 흐름**: 어드민 `/admin/chairpedia` → New entry → 의자 이름 입력 후 **Generate**(AI가 웹 리서치로 16섹션 초안+제목/SEO/발췌/원산지 자동 작성, 카탈로그 제품 자동 연결) → 에디터에서 검토·수정 → Slug 깔끔하게 → Publish → 공개 `/chairpedia/<slug>`.

**핵심 파일**:
- DB: `lib/supabase/migrations/031_chairpedia.sql`(테이블) + `032`(랜딩 컬럼 보강) + `033`(gen_status 등 비동기 생성 상태) + `034`(anon GRANT — 공개 노출 필수).
- 공개: `app/chairpedia/page.tsx`(랜딩, 랜덤 featured/필터/컬렉션/검색) + `components/chairpedia/chairpedia-landing.tsx`, `app/chairpedia/[slug]/page.tsx`(상세 SSR, Article/Breadcrumb JSON-LD, self-canonical, 아마존 buy 버튼).
- 어드민: `app/admin/(panel)/chairpedia/page.tsx`(목록) + `[id]/page.tsx`(에디터 페이지). 사이드바 `components/admin/AdminSidebar.tsx`에 링크.
- 에디터: `components/admin/chairpedia-editor.tsx`(TipTap v3 — 헤딩/리스트/인용/구분선/링크/**본문 이미지 업로드**/**표**/undo·redo). `immediatelyRender:false` 필수(SSR).
- API: `app/api/admin/chairpedia/route.ts`(목록/생성, slugify·고유슬러그) + `[id]/route.ts`(GET/PATCH/DELETE, product_slug→product_id 해석, 23505 충돌 메시지) + `upload/route.ts`(이미지, gallery 버킷 재사용) + `generate/route.ts`(**AI 생성, 비동기**).
- AI: `lib/chairpedia/generate.ts`(Claude + **web_search 서버툴**, 환각방지 시스템프롬프트, 깔끔한 구조 요구—At a glance/비교는 `<table>`, 16섹션) + `lib/chairpedia/match-product.ts`(이름 토큰 매칭으로 카탈로그 제품 자동 연결, 보수적 임계값 0.6).
- 스타일: **`app/globals.css`의 `.chairpedia-body`** — 에디터와 공개페이지가 **동일 CSS 공유(WYSIWYG)**. 섹션 h2 상단 구분선, 넉넉한 여백, 표/인용 스타일(itoki 톤).

**중요 설계 결정/주의**:
- **AI 생성은 비동기(fire-and-poll)**: ~90초 걸려서 동기 HTTP로는 게이트웨이/브라우저 타임아웃. POST가 즉시 반환 → `after()`로 백그라운드 생성(최대 300초) → 행에 결과 기록 → 에디터가 4초마다 폴링하여 자동 채움. `gen_status`(generating/done/error)로 추적. `maxDuration=300`.
- **콘텐츠는 HTML 한 덩어리**(content_html) 저장 — SEO는 렌더 결과가 중요하므로 구조화 저장과 동등. TipTap이 지원하는 태그만 쓰게 프롬프트 제약(표 확장 추가 설치: `@tiptap/extension-table*`).
- **공개 노출엔 anon GRANT 필수**(034): SQL로 만든 테이블은 anon SELECT 권한이 없어 `permission denied` → 어드민(서비스키)만 보이고 공개페이지 안 보임. RLS 정책(published만 읽기)과 별개.
- **Vercel env**: `ANTHROPIC_API_KEY`(웹검색 동작), 선택 `CHAIRPEDIA_MODEL`(미설정 시 CLAUDE_MODEL=claude-sonnet-4-5). 아마존 웹검색 도구는 API 별도 과금(검색 1k당 $10).

**⚠️ 프로덕션 Supabase에 마이그레이션 031~034 실행 완료해야 동작** (대표님이 SQL Editor에서 실행). 새 컴퓨터에서 DB는 동일(프로덕션 공유)이므로 재실행 불필요 — 단, 새 마이그레이션 추가 시 실행 필요.

### 2026-06-20 카탈로그 확장(DB) + Chairpedia standard 생성 버그 수정 + SEO 성장 기획
- **카탈로그 확장(DB만, 코드 커밋 없음)**: Ergohuman/Interstuhl/Dauphin 3개 브랜드는 이미 존재. 임시 스크립트(.mjs/.ts, 실행 후 삭제)로 **실존·웹검증 제품 8개 추가** — Ergohuman Pro/LX/Plus, Interstuhl JOYCEis3/Hero/MOVYis3, Dauphin Magnum/@Just evo(전부 category=office, chair_specs 복제). `npm run verify:catalog`로 가격 9건 확정(예: Ergohuman Classic null→$866, Dauphin Magnum $895, Interstuhl Hero $967). **"Ergohuman Curve"는 환각(verify 신뢰도 0.30, 실존 모델 아님) → 삭제**. 이어서 영상 자동수집 1회: JOYCEis3 +5, @Just evo +5, Ergohuman Pro/Plus +3 등(Dauphin Magnum은 관련영상 0—관련성 필터 정상 작동). 제품목록 force-dynamic이라 즉시 노출.
- **🔴 Chairpedia standard("Generate") 생성 버그 수정**(이 커밋, `lib/chairpedia/generate.ts`): 증상 = standard 티어가 "missing the ===BODY=== marker"로 실패. **재현 결과 standard 자체는 정상**(동일 설정으로 6k토큰 완전 생성, end_turn)이고, 원인은 **모델 출력 변동성**(가끔 `TITLE:`…`===BODY===` 래퍼를 건너뛰고 HTML 직출력/코드펜스 래핑)인데 기존 파서가 마커 누락 시 **하드 실패로 멀쩡한 초안 폐기**. 수정: ①`parseDraft` 관대화(마커 없으면 첫 HTML 태그부터 본문 복구, TITLE 없으면 첫 `<h2>`를 제목으로, 선행 코드펜스 제거, KEY는 위치 무관 추출) ②standard max_tokens 12k→16k ③web_search `pause_turn` 이어받기 루프 ④프롬프트에 "===BODY=== 필수" 강조. **사용자 테스트로 정상 동작 확인.** (premium/Deep은 원래 정상이었음)
- **SEO/트래픽 성장 기획(논의만, 미실행)**: 코드 감사 결과 **기술 색인 차단은 전부 해결됨**(robots/sitemap/canonical/JSON-LD 정상). 진짜 병목 = "크롤링됨–색인안됨 58 + 발견됨 17 = 75페이지를 구글이 가치판단으로 색인거부" → **얇은 제품 1,300페이지 + 도메인 권위 0** 탓. noindex 84·404 38은 레거시(무시 OK). 레버 우선순위: ①**깊이 우선**(Chairpedia 딥다이브 — 이미 10개 발행됨, 색인율 여는 핵심) ②**키워드 전략**(롱테일 구매의도: "best chair for back pain", "A vs B", "X review reddit" — 신생이 이길 수 있는 싸움) ③**E-E-A-T/독창 데이터**(Experience 자체리뷰 UGC=해자, "Reddit 1000개 분석" 데이터스터디=백링크 유발) ④**백링크**(chairpark 교차링크, Reddit/Quora, 디지털PR) ⑤**구글 밖 유통**(Pinterest=가구 폭발 카테고리, YouTube). 기술폴리시: **별점 리치스니펫**(SERP ★=CTR 2배, ROI 최고)·내부링크(제품↔Chairpedia↔리스티클)·이미지최적화(썸네일 141중 1개뿐, 구글이미지 트래픽). 신생도메인은 3~6개월 후 꿈틀이 정상이나 **가만두면 12개월 뒤도 0** — 위 레버를 돌려야 함.
  - **다음에 이어서 할 것**: 발행된 Chairpedia 10개 **GSC 색인 요청** → **내부링크 연결 상태 점검**(제품→Chairpedia 버튼, Chairpedia→아마존 버튼, Chairpedia 상호링크) → **별점 스키마** → "Best for X" 리스티클 신규.

### 남은 과제 (TODO)
- [ ] **🔴 SEO 트래픽: Chairpedia 10개 GSC 색인요청 + 내부링크 점검 + 별점 리치스니펫**(2026-06-20 기획 참조, 우선순위 최상위).
- [ ] **🔴 AdSense 실제 활성화**: 승인받고 `NEXT_PUBLIC_ADSENSE_ID` 실제값 입력(현재 placeholder=광고수익 0). 자리는 `app/layout.tsx`에 이미 있음. GA도 `NEXT_PUBLIC_GA_ID` 비어있음.
- [ ] **🔴 GSC 대시보드 Vercel env**: 프로덕션 `/admin/seo`가 되려면 Vercel에 `GSC_CLIENT_EMAIL`/`GSC_PRIVATE_KEY`/`GSC_SITE_URL` 추가+재배포(변수명 정확히). 로컬은 이미 동작.
- [ ] **Chairpedia 콘텐츠 채우기**: `/admin/chairpedia`에서 핵심 의자들 AI 생성→검토→발행. featured 몇 개 지정(홈 랜덤 노출), collections 분류. 생성 후 본문 사실/슬러그/제품연결 확인 후 Publish.
- [ ] (선택) Chairpedia 에디터 고급 기능: 유튜브 임베드, 구매버튼 블록, 이미지 캡션/정렬(현재 핵심 기능만).
- [ ] **백과사전 상세페이지 확장(정적/카페24)**: 실제 카탈로그 의자들로 추가 제작(리서치→검증→`static-pages/<slug>.html`). 정보 부족·불확실 제품은 스킵.
- [ ] **트래픽 성장(최우선)**: 구매의도 콘텐츠("best office chair for back pain" 등) + 백링크(chairpark→furniblog 등). 기술 SEO는 끝, 이제 콘텐츠/권위 싸움.
- [ ] **GSC 색인 요청 이어서**: `/products`·`/best/best-chairs-to-buy` 등 핵심 페이지 추가 색인 요청. 1~2주 후 색인 수 추이 확인.
- [ ] **추가 제휴 ASIN 스팟체크**: `affiliate-links-data.ts` 2026 확장분 19개 일부 직접 클릭 확인(틀리면 교체).
- [ ] **신규 제품 20개 디테일 보강**: 크론이 리뷰/영상 채우는 중. 브랜드 `hero_image_url` 채우면 이미지 자동 개선.
- [ ] (선택) 폼 페이지(`/experience`,`/reviews/new`) noindex / 이미지 최적화(`images.unoptimized:true` 해제) / breadcrumb·FAQ 스키마.
- [ ] (선택) 수익화: ⑤Chairpark 퍼널 CTA PoC → D2C 직제휴 1곳 → Levanta. 광고망 졸업은 트래픽 2.5만+ 후.
- [ ] (선택) Reddit 앱 키 발급 시 `REDDIT_CLIENT_ID/SECRET/USER_AGENT` 설정.
