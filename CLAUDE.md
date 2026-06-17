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

### 남은 과제 (TODO)
- [ ] **🔴 AdSense 실제 활성화**: 승인받고 `NEXT_PUBLIC_ADSENSE_ID` 실제값 입력(현재 placeholder=광고수익 0). 자리는 `app/layout.tsx`에 이미 있음. GA도 `NEXT_PUBLIC_GA_ID` 비어있음.
- [ ] **트래픽 성장(최우선)**: 구매의도 콘텐츠("best office chair for back pain" 등) + 백링크(chairpark→furniblog 등). 기술 SEO는 끝, 이제 콘텐츠/권위 싸움.
- [ ] **GSC 색인 요청 이어서**: `/products`·`/best/best-chairs-to-buy` 등 핵심 페이지 추가 색인 요청. 1~2주 후 색인 수 추이 확인.
- [ ] **추가 제휴 ASIN 스팟체크**: `affiliate-links-data.ts` 2026 확장분 19개 일부 직접 클릭 확인(틀리면 교체).
- [ ] **신규 제품 20개 디테일 보강**: 크론이 리뷰/영상 채우는 중. 브랜드 `hero_image_url` 채우면 이미지 자동 개선.
- [ ] (선택) 폼 페이지(`/experience`,`/reviews/new`) noindex / 이미지 최적화(`images.unoptimized:true` 해제) / breadcrumb·FAQ 스키마.
- [ ] (선택) 수익화: ⑤Chairpark 퍼널 CTA PoC → D2C 직제휴 1곳 → Levanta. 광고망 졸업은 트래픽 2.5만+ 후.
- [ ] (선택) Reddit 앱 키 발급 시 `REDDIT_CLIENT_ID/SECRET/USER_AGENT` 설정.
