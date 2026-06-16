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

### 남은 과제 (TODO)
- [ ] **프로모션 뉴스 삭제 실행**: `.env.local`에 실제 Supabase 키 넣고 `npm run clean:promo-news`로 미리보기 → 확인 후 `-- --apply`. (키워드 너무 많이/적게 잡히면 PROMO_PATTERNS 조정)
- [ ] **크론 동작 확인**: Vercel → Logs에서 `/api/cron/collect` 실행 기록 확인(매일 09:00/21:00 UTC). 안 돌면 `CRON_SECRET` env 누락 의심.
- [ ] **서치 콘솔 유효성 검사**: 배포 후 NOINDEX(84)·404(38) 화면에서 "유효성 검사 시작" 클릭 → 재크롤링 요청.
- [ ] (확인) `https://www.furniblog.com/tag/서재의자/` 가 chairpark 블로그로 301 되는지 배포 후 점검.
