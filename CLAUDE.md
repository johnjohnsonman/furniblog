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
npm run backfill:reviews   # 리뷰 얇은 제품 보강 (dry-run) / -- --apply 로 실제 수집
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

- **모든 보고의 끝에 "다음 작업" 섹션을 반드시 포함**(대표님 지시 2026-09-12). 대표님에게 요청할 일은 링크·파일·클릭 단계까지 구체적으로.

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

### 2026-06-26 카탈로그 확장(Design/Dining/Executive) + 국가별 리뷰 수집 기획(미구현)
- **Design 카테고리 추가(코드, 커밋 ba476d1)**: `types/product.ts` ChairCategory에 `"design"`, `lib/chair-categories.ts` CHAIR_CATEGORY_IDS/CHAIR_CATEGORIES("Design Chairs")/PRODUCT_LIST_CATEGORIES(dining·design 추가), `app/page.tsx` 홈 카테고리 아이콘 `design:Gem`. **`products.category`는 제약 없는 text라 DB 마이그레이션 불필요.**
- **카탈로그 대량 확장(DB only, 임시 .mjs 스크립트 실행 후 삭제 — 커밋 없음)**: 총 48종 추가.
  - 1차(명작 다이닝/디자인 18종) + 신규브랜드 8(Carl Hansen & Søn, Cassina, Kartell, Emeco, Tolix, Thonet, HAY, Muuto).
  - 2차(프리미엄 30종): **Walter Knoll 1→14**(Osuu[정식표기, Foster+Partners]·Andoo·Liz·Sheru·Burgaz·FK Chair / FK Lounge·375·Vostra·Turtle·Healey·Andoo Lounge / Leadchair Management), **Itoki Vertebra 03 + 03 Wood**(Fumie Shibata), Poltrona Frau Oxford Executive/President/Visitor, Knoll Saarinen Executive·Platner, Vitra Soft Pad EA219·Lobby ES104·Standard·Eames DSR, Fritz Hansen Grand Prix, Carl Hansen CH88·Shell CH07, Thonet S43, HAY Soft Edge, 신규브랜드 **Flexform**(Morgan).
  - 카테고리 분포: dining 13→26, executive 24→30, lounge 11→18, design 6→7, conference 5→6. **전부 thumbnail 비어있음 → 어드민 Chair Images "missing only"로 채워야.**
  - 원칙: 웹검색으로 디자이너·연도·특징 검증된 모델만(추측 모델명 제외).
- **🌍 국가별(Country-aware) 리뷰 수집 기획 — 확정, 구현 보류**(사용자: "기획만, 나중에 구현" / 대상 "온갖 나라 다"):
  - **현 구조**: 소스는 이미 언어(en/ko/ja)별 동작, `getSearchQueries(slug,name,lang)`·`CHAIR_NAMES` 번역 존재. **그러나 리뷰에 country 개념 전무**(컬럼·필터·크론 로테이션 없음), 사실상 영어+한국어 2개국. 영어 소스=reddit/youtube/trustpilot/review_sites/hackernews, 한국=naver/dcinside. `reviews` 테이블 최신 마이그레이션 037, country/region 컬럼 없음(상품 country만 있음). 피드 필터=category/brand/source/search/period(국가 없음). 프로세서는 KO/JA/EN 프롬프트 보유, 출력은 항상 영어 요약.
  - **설계**: "국가 = (소스 + 언어 + 마켓플레이스)" 묶음. `lib/pipeline/country-profiles.ts`(US/KR/JP/DE/UK/FR/CN/IN…) 신설 → 확장 가능 구조로 만들되 활성화는 소스 품질 있는 국가부터.
  - **단계**: ①migration 038(reviews.country ISO2 + 인덱스, 기존행 source기준 백필) ②MVP=YouTube `regionCode`+`relevanceLanguage`로 JP/DE/FR 즉시 다국가 + country 태깅 + `/reviews` 국기 필터 ③country-profiles config화 + Trustpilot/Reddit locale 주입 + 크론 국가 로테이션(pipeline_runs에 country 기록, 회차분산: 아침 US/KR·저녁 JP/DE 등 Vercel 300s 한도 주의) ④신규 전용 소스(JP Kakaku/Rakuten, DE idealo 등 — 유지보수 위험 큼, 트래픽 확인 후) ⑤제품상세 "국가별 평가" 섹션 + 국가별 SEO 페이지.
  - **ROI 최고**: 0+1단계(마이그레이션+YouTube 다국가+국기필터)가 신규 스크레이퍼 없이 즉시 다국가 데이터. 리스크: 국가별 양질 소스 편차→confidence 게이트(현 0.2) 국가별 조정, JP/DE 의자 별칭 부족 시 `CHAIR_NAMES` 보강 선행.

### 2026-06-29 사이트 점검 + SEO/UX 퀵윈 적용 + 브랜드 페이지 리뉴얼 기획(미구현)
- **데이터 점검**: 제품 235개 **썸네일 235/235 채워짐**(예전 "비어있음" 해소됨, 전부 고유 Supabase 이미지). **브랜드 이미지 0/83**(hero·logo 전무)=최대 시각 약점. gallery_images 0. **제품 124/235 리뷰 0건**(thin). chairpedia 27pub·blog 5pub·news 133.
- **SEO/UX 퀵윈 적용(커밋 a5b02bf)**: ①Chairpedia/Blog **E-E-A-T 바이라인**("By the Furniblog Editorial Team"→/about) + "Researched against N sources · Updated 날짜" + article 스키마 `dateModified` ②사이트 전역 **OG 카드**(`app/opengraph-image.tsx`, next/og) — twitter large_image인데 이미지 없던 것 해결 ③**빈 브랜드 noindex**(0제품: uchida·boss-design·fursys) ④**/news·/videos·/reviews self-canonical**(?page/sort/seed/brand 통합) ⑤헤더에서 **빈 Gallery 메뉴 제거**.
- **AI-SEO 판정**: Chairpedia/Blog(딥·웹리서치 고유)=SEO 유리, 페널티 아님. 진짜 위험=**얇은 제품 페이지**(리뷰0·짧은 템플릿설명)—"AI라서"가 아니라 "얇아서". `description_ko===en`(221/235)은 페이지엔 하나만 렌더→문제 아님. 대응=신규 제품 남발 금지, 리뷰/Chairpedia 깊이로 해소.
- **남은 선택지(미적용)**: 별점 리치스니펫(평점 데이터 정합성 확인 후), 이미지 최적화(`images.unoptimized` 해제—Vercel 과금), 브랜드 hero 채우기.
- **🎨 브랜드 페이지 리뉴얼 기획 — 확정, 구현 보류**(레퍼런스: Duomo&Co 리스팅 + Chairpark 상세):
  - **현 상태(이미 60%)**: 리스팅 `components/brands/brands-page-client.tsx`=featured 14(이니셜 박스)+검색+국가필터+페이지네이션. 상세 `app/brands/[id]/page.tsx`=히어로(`lib/brand-assets.ts` **제네릭 Unsplash 폴백**)+longDescription+`BrandProductsGrid`(가격·정렬·LoadMore). **재구축 아니라 리파인.**
  - **선결과제=브랜드 이미지(0/83).** 결정: **하이브리드** — ①지금 이니셜 박스→**브랜드 컬러+세리프 워드마크 카드**(color_primary/secondary 이미 있음) 즉시 업그레이드 ②어드민 **Brand Images 도구**(Chair Images처럼) 만들어 major부터 **체어파크 쇼룸 실촬영 사진**으로 점진 채움(저작권0+고유+E-E-A-T). 로고는 상표 nominative use OK, 라이프스타일 사진은 자체촬영/공식 프레스만.
  - **리스팅(Duomo식)**: featured 로고/워드마크 그리드 + **A–Z 인덱스 신설** + 각 브랜드 **"Online" 점=아마존 구매가능**(`AFFILIATE_LINKS_DATA`로 자동판정, 수작업0).
  - **상세(Chairpark식, 어필리에이트 각색)**: 히어로(쇼룸사진)+**브랜드 철학 인용구**+제품수 → 제품그리드(있음)에 재고badge 대신 **리뷰수·평점·Buy on Amazon** → **허브 레일 추가**(그 브랜드 Chairpedia/리뷰/뉴스 묶기, 내부링크·thin 완화). 제네릭 Unsplash 폴백 제거.
  - **단계**: ①워드마크 카드+Brand Images 어드민 ②리스팅 A–Z+Online점 ③상세 Chairpark화(인용·레일·배지) ④major 15~20 히어로 채움.

### 2026-07-20 집 데스크탑 동기화 + 마이그레이션 038 적용 + 데이터 실측 스냅샷
- **집 데스크탑 최신화**: 3주 밀려 있던 21커밋(`bb08829`→`901a46e`) fast-forward pull 완료. 새 env·새 npm 의존성 **없음**(package.json은 `seed:lounge` 스크립트 한 줄만 추가). 회사 컴퓨터/프로덕션엔 영향 없음(push 안 함).
- **마이그레이션 038 적용 완료**: 실측 결과 039(chairpedia 비용)·040(brand images)은 이미 적용돼 있었고 **038(reviews.country)만 미적용** → SQL Editor 실행함. 이제 031~040 전부 적용 상태.
- **⚠️ 문서 정합성 주의**: 이 파일의 06-20 / 06-26 섹션에 있는 "제품 썸네일 141중 1개", "신규 48종 thumbnail 전부 비어있음", "브랜드 이미지 0/83"은 **전부 옛 정보**다. 아래 실측치가 최신이며, 상충하면 **날짜가 늦은 섹션을 따를 것**.

**2026-07-20 프로덕션 DB 실측 (직접 쿼리)**

| 항목 | 실측 |
|---|---|
| products | **235** (office 129 / executive 29 / dining 26 / lounge 17 / gaming 15 / design 7 / standing 6 / conference 6) |
| 제품 썸네일 | **235/235 채워짐** ✅ 전부 Supabase Storage `product-images/` 실파일 |
| 제품 `images` 배열 | **0/235** (다중 이미지 미사용 — 썸네일만 씀) |
| brands | **83**, `images` **83/83 각 1장** ✅ / `logo_url` **0/83** ❌ / `hero_image_url` **0/83** ❌ |
| chairpedia | **48** (published **43**, draft 5) — 발행분 hero 이미지 **43/43** ✅ |
| reviews | **1,631** — 리뷰 있는 제품 **190/235**, 리뷰 0건 제품 **45** |
| 리뷰 소스 | youtube 639 / naver 373 / dcinside 230 / reddit 169 / community 98 / hackernews 92 / japan_community 16 / review_sites 14 / **kakaku 0** |
| blog_posts 174 · news 150 · videos 512 · gallery_images **0** | |

- **국가별 리뷰 = 절반만 구현됨**: 파이프라인 쪽은 이미 들어와 있음(다국가 YouTube `regionCode`/`relevanceLanguage`, 전언어 Trustpilot, 일본 Kakaku 소스 `4da4786`·`ad1259c`). **그러나 수집 시 `reviews.country`에 태깅하는 코드가 없어 1,631건 전부 country=NULL.** 컬럼만 준비된 상태. Kakaku도 아직 수집 0건.
- **`products.review_count`는 죽은 컬럼**: 235개 전부 0인데 실제 리뷰는 1,631건. 집계는 쿼리 시점에 함(`280f849`). 이 컬럼 보고 판단하지 말 것.
- **최대 시각 약점 = 브랜드 로고**: 사진은 83/83 채워졌지만 로고 0/83, 그리고 사진이 전부 1장씩이라 캐러셀(`37ecf57`, 최대 4장)이 단일 이미지로 동작 중.

### 2026-09-08 분석 스택 실태 확인(코드 감사) + C300 디자인 핸드오프 준비
- **GA4 실태 정정**: `components/analytics/GoogleAnalytics.tsx`(gtag, `NEXT_PUBLIC_GA_ID` 게이팅)로 **코드에 설치돼 있고 프로덕션 동작 중**(대시보드 오늘 34활성/35세션 확인). 이전 메모 "GA_ID 비어있음"은 **틀림 → 정정함**.
- **분석 스택 4중**: GA4 + Microsoft Clarity(`NEXT_PUBLIC_CLARITY_ID`) + Vercel Analytics(`@vercel/analytics`, prod만) + 자체 `PageviewTracker`(→ `page_views`, 028). 전부 `app/layout.tsx`에서 로드.
- **제휴 클릭은 이미 자체 로깅됨**: `components/affiliate/SmartBuyLink.tsx`/`BuyButton.tsx` → `app/api/affiliate/track` → `affiliate_clicks`(국가 포함, 029) → `/admin` 분석. 즉 "Check price" 클릭은 자체 DB에 기록됨. **GA4 '주요 이벤트' 0은 이 클릭이 GA 전환으로만 정의 안 된 것**(측정 자체는 됨). C300 구현 시 GA key event 추가는 선택(중복 주의).
- ⚠️ 클릭 로깅 ≠ 아마존 주문/커미션. 실제 귀속은 Associates **Tracking ID(미발급)** 로 아마존 리포트에서 확인.
- **C300 디자인 핸드오프**: `design-handoff/`에 분류 정리(업로드용/`_DO-NOT-UPLOAD` 분리). 정본 데이터=`design-handoff/02-data-USE-THIS/06-corrections-for-design.md`. 검증결과: Amazon ASIN **B0C3T865C2 = base C300(Pro 아님), 팔걸이 3D**(공식 Advanced 페이지 4D 표기와 불일치 → 리스팅 3D 채택). 30일 트라이얼=SIHOO 공식몰 한정, Amazon 반품은 별개. `design-handoff/`는 git 미추적(스크린샷 ~12MB) — 커밋 원치 않으면 `.gitignore`에 추가 권장.

### 2026-09-09 제품 이미지 재사용(파일럿 3종) + Editorial Policy/평점 스키마 정정
- **핵심 원칙**: 이미지 URL·순서는 **DB `product_images`가 단일 소스**(대표님이 어드민 제품폼에서 한 번 업로드 → 여러 화면 재사용). DB 스키마가 못 담는 메타(alt/캡션/출처/사용권)만 코드 레지스트리 `lib/data/product-images-data.ts`(제품 slug 키)에 둠. DDL 불필요(로컬에 DATABASE_URL 없음 → 마이그레이션은 대표님 실행 몫이라 회피).
- **신규 파일**: `lib/data/product-images-data.ts`(메타+레거시 템플릿 히어로 재사용 opt-in 스위치), `lib/data/product-images.ts`(`resolveProductGallery` — 제품 이미지→{hero,gallery} 발행, 데이터 없으면 `{hero:null,gallery:[]}`로 프레임 자체 숨김, unsplash 플레이스홀더 제외, alt는 레지스트리/제품명 파생).
- **재사용 배선**: ①Chairpedia rich(C300)=제품 이미지 hero+gallery 재사용(`getProductBySlug`로 조회) ②Chairpedia 레거시(content_html) 템플릿=opt-in 제품만 히어로를 제품 이미지로(그 외는 기존 curated hero 유지) ③Compare `BuyRow`=이미 로드하던 제품 thumbnail을 실제 렌더(48px 썸네일, 있을 때만). 제품페이지/카드/Best는 원래부터 `product_images` 재사용(무변경).
- **파일럿 3종**(chairpedia+제품+이미지 모두 보유 확인): `sihoo-doro-c300`(rich), `steelcase-gesture`, `herman-miller-aeron`(레거시, opt-in). 참고: 발행 chairpedia 43개 중 36개가 이미지 보유 제품과 연결, 각 제품 product_images 1장씩.
- **6A Editorial Policy**(`app/editorial-policy/page.tsx`): 허위 "모든 제품을 전문가팀이 직접 테스트" 문구 제거 → 콘텐츠 유형 3구분(리서치 기반 가이드 / 게시된 리뷰 요약 / 직접 확인 노트)으로 정직화. 점수는 "독립 실험실 테스트 아님" 명시.
- **6B C300 본문**: 1인칭 잔여 1건("which I found helpful")만 발견 → "which reviewers report is helpful"로 교체(DB content_html, 백업 후 `--apply`). 제조사 화법/중복은 없었음(모바일 패스에서 이미 정리됨).
- **🔴 6C 평점 구조화 데이터 중단**(`lib/seo/schemas.ts` `generateChairSchema`): `aggregateRating`+per-review `reviewRating`가 **외부/AI 요약 리뷰 점수** 기반이라 구글 리뷰 별점용으로 부적합 → **emit 중단**(리뷰 원본 DB·제외정책은 불변, 스키마 출력만 보류). `reviews` 파라미터는 `_reviews`로.
- **PA-API(이미지 자동수집)는 여전히 eligibility 대기**(AssociateNotEligible) → 이미지는 현재 "기존 이미지 재사용" 소스로만 채움. 자동수집/권리검증(candidate 보류)은 eligibility 확보 후 단계.
- **빌드/타입 통과**, Vercel CLI로 배포(자동배포 깨진 상태 유지).

### 2026-09-09 (2) 제품 이미지 자동화 2단계: 코드 레지스트리 탈피(DB화) + 수집 입력경로 + Amazon 게이팅
- **목표 전환**: "한번 업로드→재사용"(1단계 완료)에서 → "**공급원 연결 시 이미지 유입 + 새 제품도 코드수정 없이 공개화면 연결**"로.
- **🔴 마이그레이션 044**(`lib/supabase/migrations/044_product_images_meta.sql`, **대표님이 SQL Editor 실행 필요**): `product_images`에 `alt/caption/source/match_basis/rights`(기본 'kept'), `chairpedia`에 `use_product_image`(bool) 추가. 전부 `add column if not exists`(멱등·안전). **적용 전에도 사이트 안 깨지게 모든 읽기/쓰기 경로에 42703 방어 폴백** 넣음.
- **읽기 DB화**(`lib/supabase/queries.ts`): `getProductImageBundle(slug)`=product_images에서 메타 포함 발행(candidate 제외, unsplash 제외, 중복 제거, 044 미적용 시 베이스 컬럼 폴백), `getUseProductImage(slug)`=chairpedia opt-in(컬럼 없으면 null→레거시 코드 레지스트리 폴백). Chairpedia 페이지가 이걸 사용 → **opt-in이 DB 토글로 이동**(코드 레지스트리는 3개 파일럿 폴백으로만 잔존).
- **어드민 확장(코드수정 없이 연결)**: ①Chairpedia 에디터에 "**Use linked product's image as hero**" 체크박스(+API `EDITABLE`에 `use_product_image`, 42703 시 그 컬럼만 빼고 재시도) → 제품 연결+토글만으로 기사에 제품이미지 반영, 해제 시 기존 hero 복귀. ②제품 이미지 업로더(`ImageUploader.tsx`)에 **alt/캡션/출처 편집 UI + "Save details"**(images API PATCH가 메타 저장, 042703 폴백). 대표 이미지=여전히 첫 번째(수동 순서), **덮어쓰기 안 함**.
- **수집 입력경로**(`scripts/ingest-product-images.ts`, `npm run images:ingest -- <manifest.json> [--apply] [--retry <f>]`): 라이선스 매니페스트(제조사/공급사 폴더·허용 URL 목록) 하나 연결 시 실행. **명시적 slug/코드 매칭만 자동등록(confirmed), 이름만/애매하면 candidate로 보류(공개 제외)**, 시각적 유사성 매칭 안 함, 중복 URL/결정적 업로드경로로 **멱등**, 기존 있으면 is_thumbnail 안 건드리고 뒤에 append, 실패는 `<manifest>.failures.json`→`--retry`. dry-run 기본. **웹 스크래이핑/검색이미지 수집/접근우회 안 함.**
- **⚠️ 실제 자동수집 이미지 = 0**: 연결된 외부 라이선스 피드가 없어 --apply 미실행(정직 원칙). 파이프라인은 dry-run으로 멱등(기존 C300 이미지=skip)·candidate·append·retry 검증 완료. 대표님이 라이선스 폴더/URL을 매니페스트로 주면 즉시 유입.
- **Amazon 정확화**(`lib/amazon/paapi.ts`): 상태 구분 = 자격미충족 / 인증·호출가능(현재 여기) / 이미지조회 / 제품·옵션확인 / 페이지반영. **`AMAZON_IMAGES_ENABLED!=='true'`면 즉시 null**(자격 확보 전 매 페이지뷰 반복호출 방지). 자격 확보 후 대표님이 env=true.
- **빌드/타입 통과**, CLI 배포.

### 2026-09-09 (3) 온라인 이미지 수집(C300) + 사용권/모델일치 축 분리 + 공개 필터 완성
- **마이그레이션 044는 이미 적용됨**(대표님이 furniblog 프로젝트 SQL Editor에서 실행, "Success"). 예전 버전이었지만 핵심 컬럼(alt/caption/source/match_basis/rights + chairpedia.use_product_image)은 정상 추가됨. **주의: SQL Editor 프로젝트를 반드시 `bvytheznlotwgavmytfr`(furniblog)로** — "mukbo" 등 다른 프로젝트에서 돌리면 42P01(테이블 없음).
- **🔴 마이그레이션 045 필요**(`045_product_images_provenance.sql`, 대표님 실행): product_images에 `source_url/origin_image_url/collected_at/model_status`(기본 'verified') 추가 + 인덱스. **두 축 분리**: `rights`=사용권(permitted/owner_policy/kept, 공개 게이트 아님), `model_status`=제품일치(verified/candidate, **이게 공개 게이트**). 045가 rights의 옛 값(confirmed/candidate)을 새 모델로 리매핑(no-op if none). 전부 `add column if not exists`(멱등).
- **공개 candidate 필터 완성**: getProductImageBundle(Chairpedia)·sortedProductImageUrls(제품페이지/카드/Best/Compare 썸네일)에서 `model_status='candidate'` 제외. PRODUCT_SELECT에 model_status 추가 + **045 미적용 시 nomodel 폴백**(이미지 유지)으로 무회귀.
- **어드민 두 축 UI**: ImageUploader에 Usage(rights) select + Model(model_status) select 분리. images API가 각각 저장(42703 폴백).
- **수집 스크립트 재작성**(`ingest-product-images.ts`): 원격 URL 다운로드→스토리지 저장(결정적 경로, 멱등)→product_images 등록(source_url/origin_image_url/collected_at/rights/model_status). 명시적 slug만 verified 가능, 이름만/애매→candidate 강제. 045 필요. 스크래이핑/우회/워터마크제거 안 함.
- **C300 실제 수집(대기: 045 실행 후 --apply)**: SIHOO 공식 기본형 페이지(fr.sihoo.com/products/doro-c300-ergonomic-office-chair)에서 **눈으로 선별** — Black 정면(ASIN B0C3T865C2 파일명)=hero, Black 측면(11.webp), Black 팔걸이(1_.webp)=verified 공개 / 헤드레스트(4_.webp, 색상애매)=candidate 보류. 제외: 인증배지 배너, White 색상, 분해도. rights=owner_policy(권리자 허가 아님, 운영 판단). 제품 기존 대표는 유지(append). 매니페스트=scratchpad/c300-manifest.json.
- **빌드/타입 통과**, 코드 배포 완료. **남은 조건: 대표님 045 실행 → `npm run images:ingest -- <manifest> --apply` → 검증.**

### 2026-09-09 (4) Amazon 구매 가이드 3종(rich 템플릿 재사용) — M18·Hbada P5·Nouhaus Ergo3D
- **선정**(Amazon 전환 목표, $150±~500): SIHOO M18($145, 서브-$150), Hbada P5($198, 기존 chairpedia 강화), Nouhaus Ergo3D($299). 셋 다 /dp/ 직링크 확인. **⚠️ Amazon BSR 숫자는 미확인**(zgbs 503 차단, /dp/ JS셸) → 검색으로 카테고리 상위 브랜드임만 확인, /dp/ 타이틀로 모델 확인. 제목에 "베스트셀러" 안 붙임.
- **rich 템플릿 재사용화**(`rich-review.tsx` + `rich-types.ts`): C300 하드코딩(체크 인트로/치수 인트로/"The C300 shines for"/SIHOO official store/sources 푸터)을 선택 필드로 파라미터화(checksTitle/checksIntro/dimsIntro/forWhoTitle/buy.officialStore/sourcesFooter). C300은 해당 필드에 기존 문구 세팅해 무변경 유지. 새 디자인/CMS 없음.
- **가이드 데이터**(검증 사양만, 환각 금지): `rich-data/sihoo-m18.ts`·`hbada-p5.ts`·`nouhaus-ergo3d.ts` + 중앙 레지스트리 `rich-data/index.ts`(C300 파일의 RICH_REVIEWS 제거, 페이지 import 변경). 사양 출처=Amazon 리스팅 타이틀(모델/팔걸이/헤드레스트/용량) + 제조사/리테일러(치수/리클라인). 외부 후기는 "published reviews (research)"로 귀속, 점수·측정·내구성·체형적합 창작 안 함. 가격 고정 안 함(버튼 "Check price on Amazon"). Nouhaus 용량은 출처 상충(275 vs 330) → tier C "리스팅 확인".
- **DB**(`chairpedia`): M18(`sihoo-m18-ergonomic-office-chair`)·Nouhaus(`nouhaus-ergo3d-ergonomic-office-chair`) 신규 발행, Hbada P5는 기존 `untitled-entry-mqxfe29l` **백업 후 `hbada-p5-ergonomic-office-chair`로 개명+강화**. 전부 product 연결 + use_product_image=true + content_html(In-depth 서사). 임시 스크립트 `_upsert-guides.ts`(백업+dry-run, 커밋 제외).
- **이미지**(기존 ingest 재사용, 공식 출처): M18 3장(sihoo.com), P5 1장(hbada.ca; 공식 갤러리 대부분 텍스트 배너라 깨끗한 1장만), Nouhaus 3장(nouhaus.com). 전부 눈으로 선별, Black, 배지/텍스트/타색상 제외, rights=owner_policy·verified. 기존 대표 유지.
- **내부링크·계측(기존 재사용)**: 제품→가이드 "Read the Chairpedia deep-dive" 자동(제품이 발행 chairpedia 연결 시), 가이드→Amazon buy CTA(SmartBuyLink). 계측 `affiliate_clicks`=product_id·retailer·country·referrer(출발페이지) 이미 기록(중복 이벤트 추가 안 함, CTA위치는 별도 미기록). buy=직접 /dp/(검색 아님)+기존 태그 furniblog0e-20, 페이지별 주문 귀속은 미확인.
- **빌드/타입 통과**, 배포. 검증: 모바일 오버플로·빈 섹션·이미지 모델일치·구매링크.

### 2026-09-10 프리미엄 가이드 3종 이미지 보강(내부 재사용, 연출·디테일 포함)
- **방향**: 흰 배경 제품샷만이 아니라 **정확한 제품샷 + 공간 연출/라이프스타일 + 디테일**을 함께. 웹 나가기 전 **내부 이미지부터 판정 재사용**(대표님 제안). 본문·구매링크는 기완료로 두고 이미지에만 집중.
- **내부 후보 출처**: 각 제품의 옛 chairpedia content_html 백업(Aeron 28·Leap 20·Fern 8 `<img>`) + hero. **후보 수 ≠ 사용 수** — 전부 육안 판정. AI 생성 시절 본문이라 **공장 건물·흑백 헤리티지·Ergon 빈티지 광고·타모델(메쉬백 Leap=오판정)·수리 튜토리얼 프레임** 등 오염 다수 → 제외. 모델 정확성 엄격, 형식 유연.
- **선정·배치**(제품샷=product_images 상단갤러리/카드 공유, 연출·디테일=본문 In-depth 인라인+캡션으로 분리 → 카드/비교엔 깔끔 제품샷만):
  - **Aeron**: product_images에 등판 각도 1장 추가(#2). 본문 3장 = 스튜디오 연출(폴리시드), 사이즈 A/B/C, 8Z Pellicle 시트+틸트 디테일.
  - **Leap V2**: 본문 3장 = LiveBack 디테일, 오픈오피스 연출, 홈오피스 연출(헤드레스트=옵션 캡션 명시).
  - **Fern**: 본문 2장 = Wave Suspension 등판(틸), Digital Knit(코럴) 전후면. 기존 대표(블랙) 유지.
- **저작권/캡션**: 전부 내부 gallery 버킷 재사용(**복사 안 함** — ingest에 `noStore` 추가해 URL 그대로 등록). rights=owner_policy(보유·허가 증거 아님), 원출처 미기록이면 "manufacturer marketing image; 원출처 미기록"으로 정직 표기. 색상/finish가 구매링크 기본과 다르면 캡션에 명시(예: 폴리시드/코럴/틸). 자체 촬영·테스트로 오해시키지 않음.
- **검증**: `.chairpedia-body img{max-width:100%}` → 모바일 오버플로 없음. 3개 페이지 본문 이미지·Aeron 등판 갤러리 프로덕션 표시 확인. **브라우저 픽셀 시각검증은 미수행**(개별 이미지는 선별 시 육안 확인, 최종 합성 레이아웃은 HTML/CSS 근거로만). candidate 없음.
- **배포 없음**: 앱 런타임 코드 무변경(콘텐츠·product_images는 DB 동적 렌더로 즉시 반영). `noStore`는 스크립트 전용 → 커밋만.

### 2026-09-11 7월 급락 정밀 타임라인 + 전체 URL 분류표 (읽기 전용, 운영 무변경)
- **급락은 절벽**: GSC 일별 확정 데이터로 7/13(노출 158)→7/14(73)→7/15(6), 전 섹션·전 국가 동시, 이후 두 달 일 10~30 고정. `scripts/audit-drop-timeline.cjs` / `data/gsc/drop-timeline-*.json`.
- **7/14 로컬 커밋(901a46e)은 블로그 목록 1파일 → 원인 아님.** 유력 가설=6월 스팸 업데이트(6/24~26 공식) 이후 사이트 레벨 재평가(당시 노출 대부분이 수집 리뷰 페이지). **수동 조치·Vercel 7월 이력은 대표님 확인 필요**(API 미제공).
- **URL 전수 분류(4,481)**: 유지 1,707 / 보강 43 / 통합검토 952 / 검색제외검토 1,779(출처 없는 리뷰 1,619 + 얇은 뉴스 157 + 빈 브랜드 3). 90일 클릭 1+ 자동 보호(13건 승격). 90일 전체 클릭 27회. `scripts/audit-url-triage.cjs` / `data/seo-audit/url-triage-*.csv`. 버킷은 제안이며 실행 안 함.
- 보고서: `content/reports/url-triage-drop-timeline-2026-09-11.md` (+ 전면 기획 `sitewide-search-recovery-plan-2026-09-11.md`).
- **🔴 원인 확정(같은 날, 대표님 GSC 화면 판독으로 소거법 완료)**: 수동 조치 ✗·보안 ✗·서버 장애/봇 차단 ✗(절벽 구간 크롤링 지속, 5xx 없음, 호스트 정상)·디인덱싱 ✗(색인 ~1,430 유지) → **알고리즘 사이트 레벨 순위 재평가**가 유일한 남은 설명. 색인률 ~32%(4,487 중 1,430), "발견됨-미색인" 841 증가 추세(크롤링 의욕 저하), 총 크롤링 일 800~1,200→~100 감소. 생성형 AI 포함 확인(3개월 78노출). 상세: `content/reports/drop-cause-verdict-2026-09-11.md`. **결론: 기술 수리 대상 없음, 회복 경로는 검색용 문서 구성 개편뿐(기획안 2단계, 승인 대기).**

### 2026-09-12 2단계 실행: 발행↔검색 노출 분리 (커밋 ea496df, ⚠️ 배포 대기)
- **대표님 승인 후 구현**: `lib/seo/search-visibility.ts` — 출처 없는 리뷰(1,619)·얇은 뉴스(157)는 `noindex, follow` + 사이트맵 제외. 데이터·사이트 노출은 그대로(삭제/숨김 없음), revert로 즉시 롤백 가능. GSC 실적 있는 뉴스 9건은 면제 명단으로 보호(제외분은 90일 클릭 0).
- 사이트맵 4,487→**2,711**(리뷰 1,928=출처 보유 수와 일치, 뉴스 9). 로컬 프로덕션 빌드+실서버 렌더로 4개 케이스 전부 검증 완료.
- **✅ 배포 완료(대표님 권한 허용 후)**: 프로덕션 검증 — noindex/index 4케이스 정상, sitemap 2,711. **GSC sitemap 재제출도 API로 완료(204)**. 상세: `content/reports/search-exposure-separation-2026-09-12.md`.
- 다음: 2주 후 색인/크롤링 반응 관찰(관찰 포인트: "발견됨-미색인" 841 추세)→통합검토 버킷(비특정 출처 리뷰 945) 결정.

### 2026-09-12 (2) 3단계 착수: 미국 구매 문서 지도 + 1호 문서 발행
- **문서 지도 20개 확정**(`content/reports/us-purchase-doc-map-2026-09-12.md`): 3주제(실용 US 구매/중고·리퍼/적합성), 기존 URL 재사용 15 + 신규 5. 커버리지 최대 공백 = 보증·반품(0편)이었음.
- **1호 발행**: `/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon` (Guides, 1,023단어). 전 사실 공식 페이지 원문 검증(2026-09-12): HM 12년 보증·반품 $99 수수료, Steelcase Lifetime·30일 완전무료 반품(본토), Amazon 30일·리스팅별. 저가 브랜드 보증 수치는 불안정해 인용 보류(정직 원칙). 라이브 확인 완료.
- **2호 발행(같은 날)**: `/blog/herman-miller-aeron-classic-vs-remastered-identification-guide` (893단어). HM 공식 비교페이지·Crandall(사이즈 점 1/2/3=A/B/C)·BTOD·Reperch 검증. 60초 식별표(스윙암 2→1, PostureFit SL 2패드, AE1/AER1 라벨, 로고, 8Z). 내부 수집 리뷰는 **실제 source_url만 링크**(유튜브 auBLHJ4yUrM, 레딧 $325 구매담), 무출처 커뮤니티 증언은 '방향성 참고' 명시. 기존 중고 Aeron 가이드에 역링크 1단락 추가(백업: scratchpad/used-aeron-backup.json).
- **배치 실행 완료(같은 날, 대표님 "크게 다 해버려" 지시)**: 신규 4편 추가 발행 — ①`how-to-read-an-amazon-office-chair-listing-before-you-trust-it`(BIFMA X5.1 실체+자체 C300 감사 사례) ②`used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection`(BTOD·Crandall 검증; V1도 LiveBack·시트슬라이더 보유 — 통설 오류 배제) ③`refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs`(Amazon Renewed 90일 공식+크랜달 재제조 12년) ④`office-chair-desk-fit-guide-seat-height-and-armrest-clearance`(rich 가이드 검증 수치 13종만 재사용; **시드 chair_specs 불사용**). 크로스링크: #10 포스트에 안내 단락(백업 有).
- **rich 템플릿 `related` 레일 신설**(rich-types+rich-review.tsx): Aeron·Leap V2·Gesture·C300·M18 5개 가이드에 "Keep reading" 관련문서 레일. 빌드·배포·8개 URL 라이브 검증 완료.
- **⚠️ 데이터 오류 발견**: `rich-data/okamura-contessa-ii.ts` 시트고 "570–620mm" — 통상 420–520mm라 오류 의심, 적합성 표에서 제외함. **수정 TODO**.
- 문서 지도 결산: 20개 중 신규 6 발행+보강 3+유지 11. 남은 건 #1·#7 폴리시 수준. 다음 관찰: 2주 후 GSC(색인·"발견됨-미색인" 841 추세)+신규 6문서 색인.

### 2026-09-12 (3) 웨이브2 기획 + OneLink/AdSense 사실 정정 + 첫 실수익 확인
- **웨이브2 기획안**(`content/reports/growth-wave2-plan-2026-09-12.md`, 승인 대기): A.IndexNow(Bing·Yandex 즉시 색인) B.Amazon SubTag(ascsubtag, 주문→페이지 귀속)+GA4 이벤트+best 허브 보강+related 레일 28종 전면화 C.라운드업 3편(under $300/스탠딩데스크/Aeron 대안) D.홈 Buying Guides 고정 레일.
- **🔴 정정: Amazon OneLink 스크립트(adInstanceId/OneTag) 방식 폐지 확인**(대표님 스크린샷 Tools 메뉴에 OneLink 없음 + 공식 help). 현재는 **계정 설정 토글**로 자동 리디렉션(켜면 close match). 06-16 메모의 "NEXT_PUBLIC_AMAZON_ONELINK_ID 필요"는 **무효** — `AmazonOneLink.tsx`는 env 없으면 no-op라 무해한 죽은 코드(추후 제거 가능). 실측 국제 클릭 33건 중 1건(NL)이라 급하지 않음.
- **AdSense는 보류 결정**: 현 트래픽 기대수익 월 $1~5 vs 품질 강등 상태 신청 시 거절 리스크 + 재평가 구간 페이지 경험 마이너스 → 2주 후 색인 개선 신호 확인 후 신청.
- **📈 첫 실수익 확인**(Associates 대시보드): 지난 30일 커미션 **$19.00**, 클릭 20(자체 로그 30일 18건과 일관), 8/18 부근 스파이크. 9월 현재 주문 0·클릭 9. SubTag 붙이면 다음부터 페이지별 귀속 가능.

### 2026-09-12 (4) 성장 웨이브2 실행 완료 (대표님 승인 "한 번에 실행")
- **git 이력 통합**: 원격에 병렬 작업 스트림(다른 세션이 같은 백로그 수행, 트리 거의 동일) 존재 → 일반 merge 후 충돌 5파일 전부 "우리 신규 기능 vs 부재"라 ours로 해소, push 완료. 이후 모든 커밋 push됨. **주의: 두 컴퓨터에서 자율 세션이 같은 백로그를 돌면 평행 이력 재발 — 작업 시작 전 pull 필수.**
- **Wave A (IndexNow)**: 키 `public/4f43f721...txt` + `scripts/indexnow-submit.cjs`(전체 사이트맵/개별 URL 전송). 첫 제출 403 SiteVerificationNotCompleted(신규 키 검증 지연) → 수분 후 재시도 **200 OK, 2,720 URL 수락**. 신규 발행 후 `node scripts/indexnow-submit.cjs <url>`로 핑.
- **Wave B**: ①**Amazon SubTag** — `pageSubtag()`+`buildAffiliateUrl(..,subtag)` 추가, SmartBuyLink/BuyButton/RegionalAmazonLink 3곳 usePathname 배선. 프로덕션 HTML에 `ascsubtag=products_sihoo-doro-c300` 확인. **이제 Associates SubTag 리포트에서 페이지별 주문 귀속 가능**(대표님: 보고서에서 SubTag 항목 확인). ②GA4 affiliate_click은 병렬 스트림에서 기구현(1b6789a) — 스킵 ③best-chairs-to-buy에 "Before you buy" 3링크 박스 ④related 레일 5→**27종 전체**(예산/톨데스크/프리미엄 클러스터별).
- **Wave C**: 라운드업 3편 발행(기존 가이드의 검증·티어 수치만 재사용, 가격은 확인일 명시) — `best-office-chairs-under-300-verified-picks` / `office-chairs-for-standing-desks-and-tall-desks-documented-picks`(ProGrid 19.5–23in 니치) / `herman-miller-aeron-alternatives-by-budget`(중고 루트 포함).
- **Wave D**: 홈에 "Buying guides" 고정 섹션(9카드) — StatBand 아래. 전 항목 프로덕션 라이브 검증 완료.
- 관찰 항목 추가: Bing 색인 반응(수일), SubTag 리포트 주문 귀속(1~2주), 기존 2주 GSC 체크.

### 2026-09-12 (5) 내부 전환 대량 업그레이드(P1~P4) 실행 완료
- **P1 직링크 13종 추가**(`affiliate-links-data.ts`, 리스팅 제목 검증): Aeron B01N0ZUN15(최다 클릭 제품!)·Mirra 2·Karman(공식 스토어)·Amia·Diffrient World·Liberty·Generation/ReGeneration·Swopper·3Dee(US=빨강 주의)·LiberNovo Omni·Variable balans·Contessa Seconda(US 화이트). **정직 제외**: Zody II(리스팅이 구세대 "Zody"), Ergohuman Plus/Pro/LX(변형 모호), Embody Gaming(ASIN 미확인), Secretlab(D2C), 유럽 컨트랙트 전부. 직링크 커버리지 61→74/235. 비교 120·best·모바일바에 자동 파급.
- **P2 제품 페이지 235 일괄**: 카테고리·가격($800 기준)별 "Buying guides" 레일(standing→톨데스크/프리미엄→Aeron대안·리퍼/예산→리스팅·under300) + Where-to-Buy에 반품 한 줄+비교 링크.
- **P3 Best 4종 신규**(DB): big-and-tall(검증 용량 330lb+만 4종)/mesh(8)/under-500(9)/headrest(7). 사이트맵에 DB best_lists 쿼리 추가(기존엔 코드 목록만 열거돼 누락). IndexNow 핑 완료.
- **P4 `scripts/revenue-scoreboard.cjs`**: 클릭(출발페이지 referrer)×GSC×subtag 표. **첫 인사이트: 클릭의 대부분이 chairpedia·비교 페이지 발생, 1위 제품 Aeron(4/18)** — 직링크 확보로 즉시 수익화 경로 연결됨.
- 전 항목 프로덕션 라이브 검증(Aeron dp 링크·레일·반품 노트·리스트 4종 200)·커밋·푸시 완료. 스팟체크 권장: 신규 ASIN 직접 클릭 확인(특히 Contessa 화이트·3Dee 빨강 config).

### 2026-09-12 (6) 급락 트리거 특정 + 대표님 액션 완료 + 첫 주문 데이터
- **🔴 급락 방아쇠 특정(대표님 가설 검증)**: 블로그 259편 중 **네이버 출처 238편(92%)**, 발행 버스트 7월 1주 33편→**2주(7/8~14) 127편** → 절벽 7/14~15와 정합. 현재 **블로그 250 URL 전원 GSC 노출 0**(리뷰는 460 URL 노출 발생) = 구글이 복제 클러스터를 정확히 배제. blog.chairpark.com 동반 하락도 3중 중복(네이버↔chairpark↔furniblog)으로 설명. 보고서: `content/reports/drop-trigger-naver-copy-2026-09-12.md`. **권고안 C(네이버 출처 238편 noindex+사이트맵 제외, 비네이버 21편 유지, 리라이트 후 개별 복귀) 대표님 승인 대기.**
- **대표님 완료**: ①Bing WMT GSC 가져오기 ✅ ②OneLink는 설정 항목 소멸·자동 적용 확인 ✅ ③Associates 리포트 확인 — SubTag 데이터 없음(정상: ascsubtag 배포가 9/12라 리포트 기간 밖).
- **📈 첫 주문 데이터**(Associates 8/12~9/10): 클릭 20, **주문 4건, 매출 $623.93, 전환율 20%**, 반품 0, 수수료 $19. 8/18·8/24 주문.
- **⚠️ 계측 공백 발견**: 아마존 8월 중순 클릭 ~9건 vs 자체 로그 동기간 1건 → **본문(content_html) 안에 하드코딩된 아마존 링크는 SmartBuyLink를 안 거쳐 로깅·SubTag 모두 누락**. 후속: 렌더 시 본문 아마존 href에 tag+ascsubtag 주입하는 리라이터(블로그 noindex 배치와 묶어 처리 후보).
- ASIN 스팟체크: 13개 중 11개는 원격 제목 검증 완료, 대표님 확인 대기 ★5개(Generation·Variable balans·Amia·ReGeneration·3Dee 재고/가격).

### 2026-09-12 (7) 블로그는 구글만 noindex(빙·AI 유지) + 본문 아마존 링크 계측 (커밋 8849c6f)
- **대표님 재반박("빙·ChatGPT는 블로그 잡고 있다")이 맞았음** — page_views 60일 실측: 외부 유입 DDG 364·Bing/Copilot 171·**ChatGPT 46·Claude 12·Perplexity 9** vs 구글 83. **블로그가 DDG(160)·Bing(76)의 최다 착지 섹션**(상위: LiberNovo 라인업 82, Aeron 사이즈/조작 가이드). 일괄 noindex였으면 최대 활성 채널 파괴였음.
- **해법: `googlebot` 전용 noindex** — 네이버 출처 238편에 `<meta name="googlebot" content="noindex,follow">` + 일반 robots는 index 유지 → 구글에만 복제 클러스터 제거 신호(구글 노출 0이라 손실 0), 빙·DDG·AI 검색은 그대로. 리라이트 후 개별 복귀용 allowlist(`BLOG_GOOGLE_REENABLED_SLUGS`). 사이트맵 블로그 유지(빙 소비).
- **본문 아마존 링크 리라이터**(`lib/affiliate/content-links.ts`): blog+chairpedia content_html 렌더 시 tag+ascsubtag 자동 주입 — 8월 실주문이 이 무계측 본문 링크로 발생했던 구멍 봉합. 라이브 검증 3종 통과.

### 다음 작업 큐 — 1~4 실행 완료(2026-09-12, 커밋 64be9a3), 5만 잔여
1. ✅ **활성 채널 전환 감사**: 상위 25착지 전수 점검 — chairpedia 착지는 P1 직링크가 자동 커버(Contessa/Aeron/Leap/Generation 라이브 확인), LiberNovo 글 2편(82착지)은 buying-note 박스가 직링크로 자동 연결됨을 확인·문구만 직링크에 맞게 수정, **Freedom(16착지)만 직링크 부재 → B086H3FGFG 검증 추가**. beyond-pinterest(24착지)는 의자 구매의도 아님이라 정직하게 스킵.
2. ✅ **IndexNow 자동화**: `lib/seo/indexnow.ts` — 매 크론 말미에 26시간 내 발행·수정 URL 자동 핑(blog/chairpedia/news/compare/products/best). 실패해도 크론 안 죽음.
3. ✅ **리라이트→구글 복귀 1차(5편)**: Aeron size/control/tilt-lock/used/seat-depth — ChairPark 원문 번안 사실 공개("sister showroom" 표기)+검증 가이드 링크 보강 후 allowlist 복귀(백업: scratchpad/rewrite-backup-*). 구글 재개 allowlist 총 10편.
4. ✅ **Contessa 모멘텀**: ①시트고 데이터 오류 수정(570–620→공식 435–545mm, Okamura 확인) ②신규 가이드 `/blog/okamura-contessa-vs-contessa-seconda-identification-and-used-buying-guide`(548단어; CC8x 라벨코드·프레임 실루엣·화이트프레임=Seconda·스마트 레버, 출처 명시) ③딥다이브 레일 최상단 연결. 신규·수정 6 URL IndexNow 200.
5. **9/26경 관찰 게이트(잔여)**: GSC 재평가 반응("발견됨-미색인" 841 추세·색인 수)+신규 문서 색인+SubTag 데이터 종합 → AdSense 신청 여부·통합검토 버킷(945)·웨이브3 결정.
12. **당장-실행 배치 3(2026-09-12, 커밋 6f163f4)**: ①**`/reviews` 국가 필터 완성**(국가별 리뷰 1단계 마감) — Collection market 필 그룹(US/KR/JP/DE/FR), 기존 source 필터 패턴 그대로(타입·기본값·프레디킷·카운트·UI). 미태깅 구행은 All에서만 노출. 패널은 클라이언트 토글 뒤라 curl로 안 보임(빌드·타입 검증 완료, 브라우저 1회 확인 권장) ②**백필 결과(정직한 음성)**: 32/32 대상 수집은 됐으나(5~20건씩) **저장 전원 0** — 관련성 게이트 정상 작동, 전부 리뷰 콘텐츠가 존재하지 않는 컨트랙트·라운지 니치(Poltrona Frau·Walter Knoll 라운지·KI·Global 등). **결론: 이 32개는 수집으로 강화 불가한 영구 얇은 페이지 → 9/26 게이트 안건**(노출 축소 vs published 유지). 목록은 backfill-run.log 및 위 로그 참조.
11. **당장-실행 배치 2(2026-09-12, 커밋 a096e69)**: ①**🌍 reviews.country 태깅 구현 완료**(TODO 핵심 누락 해소) — 수집 시 스탬프(다국가 YouTube는 발견 마켓, naver/dcinside→KR, kakaku/japan_community→JP, 불명은 null·추측 금지) + 기존 행 결정적 백필 **KR 749·JP 17 = 766건 태깅**. 남은 1단계 항목: `/reviews` 국기 필터 UI ②**Wave-B 구글 재개 +3**(LiberNovo lineup-explained=최다 착지 51, Aeron adjustment-mistakes 14, beyond-pinterest 24 — 출처 표기 후 allowlist, 총 13편) ③**리뷰 0건 45개 백필 백그라운드 시작**(`npm run backfill:reviews -- --apply`, 신규 리뷰는 country 태깅 적용됨) — 결과는 완료 후 기록.
10. **크론 평가·수술 + 즉시 처리(2026-09-12, 커밋 4566276)**: ①**크론 실측 7일**: 리뷰 +167(유일한 실질 생산) / 비디오 0 / 뉴스 1(무검토 hidden 큐행) / 비교 크론 초안 3개/일 적재+AI 비용 → **수술: 비교 크론 제거, collect 저녁 제거(1회/일), 뉴스 예산 0, 비디오 최소(25s/4), 리뷰 증액(180s/18)** — 총 ~205s(300s 한도 내) ②**비교 초안 12 중 3편 발행**(Sayl vs T50 / Sayl vs ErgoChair Pro / T50 vs ErgoChair Pro — 구매 교차쇼핑 실익 조합만): 발행 전 미검증 단정 스크럽("12주 대기"→현재 견적 확인, "3.5 스타"·"3년차 교체" 제거, 백업 有). 잔여 9편은 초안 유지(어색한 조합: Lino×5, Capisco 계열 등) ③사이트맵 2,727 GSC 재제출(204)+IndexNow 전체(200) ④/best 인덱스에 신규 리스트 4종 노출 확인.
9. **위생 배치 실행 완료(2026-09-12, 커밋 9318cad)**: ①무제 슬러그 3건 개명+308 리다이렉트(ORGATEC C15/시리얼넘버 인증/풀메쉬vs패디드) + 빈 "Untitled post" 초안 강등 ②chairpedia 잔여 초안 6건 삭제(백업 有) ③중복 4쌍의 패자 5편 `BLOG_DUPLICATE_LOSERS`로 구글 영구 제외(승자: 스트레칭=desk-boost판, ingCloud=two-philosophies판, Contessa=which-2000판, 헬스케어=furniture-or-healthcare-device판) — growth 후보 목록에서도 제외 ④고아 제휴 키 7 삭제(aeron-b/c·contessa-2는 참조 주석) ⑤`AmazonOneLink.tsx` 삭제 ⑥About에 편집정책 정합 문장+링크. 전 항목 라이브 검증(308/200/404/About). 잔여: comparisons 초안 12(대표님 결정 or 위임), content/reports 처리 방침(대표님).
8. **사이트 전수 위생 스캔(2026-09-12)**: 깨진 내부링크 전수 스캔 결과 **단 1건**(데스크핏 가이드의 75cm 슬러그 오기 — 즉시 수정, 라이브 확인). 발견된 정리 대상: ①무제 슬러그 발행 4건(`untitled-post-mr8ztshk`=ORGATEC C15, `-mraabycx`=시리얼넘버 인증, `-mrj00095`=풀메쉬vs패디드, `-mreofsgn`=제목도 "Untitled post") ②유사 중복 4쌍(스트레칭·Aeron vs ingCloud·Aeron vs Contessa·헬스케어 각 2편) ③chairpedia 초안 7(무제 5+Modernica 중복 초안) ④comparisons 초안 12(검토 큐) ⑤고아 제휴 키 7(삭제된 제품 참조) ⑥죽은 코드 `AmazonOneLink.tsx`(OneLink 스크립트 폐지됨) ⑦About "two decades hands-on"(사실이므로 유지 가능하나 콘텐츠 라벨과 정합 문장 검토). 처리 계획은 다음 배치.
7. **매출 극대화 사이클 2(2026-09-12 실행)**: ①**Creators API(구 PA-API) 자격 실측** — 토큰 인증 OK, GetItems 403 AssociateNotEligible. **조건 정량화: 30일 내 판매 10건(현재 4건)** — 도달 시 실가격 표시+이미지 자동수집 잠금해제, 월간 재확인 ②**직링크 2차 결론**: 게이밍 13/15 커버 확인(미커버 Secretlab 2종=아마존 미판매 D2C, Impact 제휴는 추후 후보), Ergohuman Pro/Plus/LX는 US 리스팅이 ME7ERG 코드 체계라 매핑 불가 재확인 제외, Embody Gaming 아마존 미판매 확인 ③**LiberNovo 4변형 ASIN 전부 검증**(Omni B0FYCKPWP9/SE B0GYX9PZL6/Pro B0GYX1XXDY/Maxis B0H887JHPV 399lb) → **최다 착지 라인업 글 2편에 변형별 리스팅 표 추가**(백업 有, 렌더 시 tag+subtag 자동) ④**KR 경로 무누수 확인**: 쿠팡 env 설정됨+10개 항목+KR 쿠팡 우선정렬 로직 정상.
6. ✅ **`/admin/growth` 어드민 스코어보드 신설**(커밋 4dc4a5e): 30일 페이지별 제휴 클릭·제품별 클릭·검색/AI 채널 착지·**구글 재개 후보**(외부 유입 생긴 네이버 글, open/candidate 상태 표시). 재개는 후보 확인→보강→`BLOG_GOOGLE_REENABLED_SLUGS` 추가(코드) 순서. **단계별 구글 오픈 로드맵 합의**: A(10편 완료)→B(주간, 외부 유입 생긴 글)→C(9/26 게이트 후 20~30편)→회복 확인 후 전면.
- 대표님 대기: ★5 ASIN 스팟체크 / 다음 주 SubTag CSV(안 나오면 섹션별 Tracking ID 플랜 B 구현).

### 남은 과제 (TODO)
- [x] ~~신규 카탈로그 48종 썸네일 채우기~~ — **완료**(2026-07-20 실측 235/235).
- [ ] **🎨 브랜드 페이지 리뉴얼**(2026-06-29 기획, 하이브리드) — **일부 완료**: Brand Images 어드민(`b7d465d`)·다중이미지 캐러셀(`37ecf57`)·랜덤 featured(`028882c`) 배포됨, 사진 83/83 채움. **남은 것**: ①`logo_url` 0/83 채우기 ②브랜드당 사진 1장→최대 4장(캐러셀이 놀고 있음) ③리스팅 A–Z 인덱스+"Online" 점 ④상세 Chairpark화(철학 인용·허브 레일·리뷰/Amazon 배지).
- [ ] **🌍 국가별 리뷰 수집 구현**(2026-06-26 기획) — **0단계 완료 + 1단계 절반**: migration 038 적용됨(2026-07-20), 다국가 YouTube·전언어 Trustpilot·Kakaku 소스 배포됨. **남은 것**: ①수집 시 `reviews.country` 태깅(현재 1,631건 전부 NULL — 이게 핵심 누락) ②기존 행 source 기준 백필 ③`/reviews` 국기 필터 ④country-profiles config+크론 로테이션.
- [ ] **🔴 SEO 트래픽: Chairpedia GSC 색인요청(현재 발행 43개) + 내부링크 점검 + 별점 리치스니펫**(2026-06-20 기획 참조, 우선순위 최상위).
- [ ] **🔴 AdSense 실제 활성화**: 승인받고 `NEXT_PUBLIC_ADSENSE_ID` 실제값 입력(현재 placeholder=광고수익 0). 자리는 `app/layout.tsx`에 이미 있음. **(정정 2026-09-08) GA4는 프로덕션에서 동작 중** — `NEXT_PUBLIC_GA_ID` 프로덕션 설정됨(GA4 대시보드 실데이터 확인). 단 GA4 주요이벤트(전환) 0 — 구매 클릭이 GA 전환으로 미정의(자체 `affiliate_clicks`는 이미 로깅). 아래 2026-09-08 섹션 참조.
- [ ] **🔴 GSC 대시보드 Vercel env**: 프로덕션 `/admin/seo`가 되려면 Vercel에 `GSC_CLIENT_EMAIL`/`GSC_PRIVATE_KEY`/`GSC_SITE_URL` 추가+재배포(변수명 정확히). 로컬은 이미 동작.
- [ ] **Chairpedia 콘텐츠 채우기**: `/admin/chairpedia`에서 핵심 의자들 AI 생성→검토→발행. featured 몇 개 지정(홈 랜덤 노출), collections 분류. 생성 후 본문 사실/슬러그/제품연결 확인 후 Publish.
- [ ] (선택) Chairpedia 에디터 고급 기능: 유튜브 임베드, 구매버튼 블록, 이미지 캡션/정렬(현재 핵심 기능만).
- [ ] **백과사전 상세페이지 확장(정적/카페24)**: 실제 카탈로그 의자들로 추가 제작(리서치→검증→`static-pages/<slug>.html`). 정보 부족·불확실 제품은 스킵.
- [ ] **트래픽 성장(최우선)**: 구매의도 콘텐츠("best office chair for back pain" 등) + 백링크(chairpark→furniblog 등). 기술 SEO는 끝, 이제 콘텐츠/권위 싸움.
- [ ] **GSC 색인 요청 이어서**: `/products`·`/best/best-chairs-to-buy` 등 핵심 페이지 추가 색인 요청. 1~2주 후 색인 수 추이 확인.
- [ ] **추가 제휴 ASIN 스팟체크**: `affiliate-links-data.ts` 2026 확장분 19개 일부 직접 클릭 확인(틀리면 교체).
- [ ] **리뷰 0건 제품 45개 보강**(2026-07-20 실측, 235 중 190은 리뷰 있음) — **도구 완성**: `npm run backfill:reviews`(dry-run) / `-- --apply`. 크론과 동일한 `executeServerPipeline`을 쓰되 대상을 "리뷰 최소" 순으로 잡음(크론은 "마지막 시도" 순이라 한 바퀴에 10~24일 걸림, 로컬은 Vercel 300s 한도 없음). 3개 스모크테스트 통과(Allsteel Mimeo +2). **남은 42개 미실행.** 수집 0건으로 반복되는 의자는 카탈로그 정리 후보로 출력됨.
- [ ] (선택) 폼 페이지(`/experience`,`/reviews/new`) noindex / 이미지 최적화(`images.unoptimized:true` 해제) / breadcrumb·FAQ 스키마.
- [ ] (선택) 수익화: ⑤Chairpark 퍼널 CTA PoC → D2C 직제휴 1곳 → Levanta. 광고망 졸업은 트래픽 2.5만+ 후.
- [ ] (선택) Reddit 앱 키 발급 시 `REDDIT_CLIENT_ID/SECRET/USER_AGENT` 설정.
