# AGENTS.md

이 저장소에서 작업하는 모든 AI 에이전트(Claude Code, Codex 등)가 공통으로 따르는 규칙입니다.
에이전트별 전용 규칙은 각 파일(`CLAUDE.md` 등)에 둡니다. 진행 기록은 `docs/progress-log.md`에 있습니다.

## 프로젝트 개요

- **이름**: Chairpedia — 의자 리서치·비교·구매 가이드 사이트 (제품 DB + 가이드 + 비교 + 매장 찾기 + 제휴)
- **대표 주소**: `https://www.chairpedia.com` (서비스 식별자는 `lib/site-config.ts`에서 관리)
  - 옛 주소 `furniblog.com` / `www.furniblog.com`은 Vercel Domains에서 `www.chairpedia.com`으로 308 이동
  - 저장소·Vercel 프로젝트 이름은 기존 그대로 `furniblog`
- **배포**: Vercel 프로젝트 `furniblog` (Production)
- **저장소**: https://github.com/johnjohnsonman/furniblog.git
- **사용자**: 대표님. 한국어로 소통하고 답변도 한국어로 씁니다.

## 기술 스택

- **Next.js 16.2.6** (App Router, Turbopack), **React 19**, **TypeScript 5.7**
- **Tailwind CSS v4** + Radix UI (shadcn 계열, `components.json`)
- **Supabase** (DB / 인증 / 스토리지) — `lib/supabase/`, 마이그레이션 `lib/supabase/migrations/` (최신 046)
- **Anthropic SDK** — AI 콘텐츠 파이프라인
- 지도: maplibre (`predev`/`prebuild`에서 worker 파일 복사)

## 디렉토리 구조

- `app/` — App Router 라우트
  - 공개 메뉴(5개): Chairs(`/products`) · Chair Finder(`/chair-fit-calculator`) · Find Stores(`/stores`) · Comparisons(`/compare`) · Guides(`/chairpedia`, `/blog` 등)
  - 기타 공개: `brands`, `designers`, `reviews`, `videos`, `news`, `best`, `chair-fit-report`, `editorial-policy` 등
  - `app/admin/` — 관리자 패널, `app/api/` — API 라우트(`cron`, `affiliate`, `chair-fit`, `showrooms`, `recommend`, `version` 등)
- `lib/` — 핵심 로직: `comparisons/`(검증 비교 원장 `verified-*.ts`), `recommend/`(Chair Finder 엔진), `showrooms/`, `seo/`, `affiliate/`, `chairpedia/`, `pipeline/`, `supabase/` 등
- `components/`, `scripts/`, `docs/`, `public/`, `types/`

## 자주 쓰는 명령

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
npx tsc --noEmit  # 타입 검사
```

데이터 수정·수집 스크립트는 `package.json`의 `scripts` 참고. **대부분 dry-run이 기본이고 `-- --apply`로 실제 반영**됩니다. 실제 반영은 운영 DB를 바꾸므로 승인 범위에서만 실행합니다.

## 환경변수

`.env.local.example`을 복사해 채웁니다. **`.env*` 파일은 절대 커밋하지 않습니다.** 서비스계정 JSON(`furniblog-*.json`)도 커밋 금지.
아마존 제휴 태그는 `furniblog0e-20`(도메인 이전 후에도 유지). 쿠팡·네이버 쇼핑 제휴는 2026-09-25에 제거했습니다(링크·고지 문구 모두).
민감한 환경변수를 CLI로 내보냈을 때 빈 값이 나와도 실제로 미설정이라는 증거는 아닙니다.

## 배포 원칙

`docs/chairpedia-domain-migration.md`가 기준 문서입니다. 요약:

- **깨끗한 커밋에서만 배포**합니다. 미커밋 작업이 있는 폴더에서 배포하지 않습니다.
- 배포 전 현재 Production 배포 ID와 SHA를 기록해 두고, 문제가 생기면 그 배포로 되돌릴 수 있게 합니다.
- `/api/version` 값이 배포한 Git SHA와 일치해야 합니다(CLI 배포 시 `RELEASE_COMMIT_SHA` 제공).
- 배포 후 `https://www.chairpedia.com`에서 실제 페이지를 확인합니다.
- Production 배포는 대표님이 명시적으로 승인한 범위에서만 합니다.

## Cron (`vercel.json`)

- `/api/cron/collect?window=morning` — 매일 1회 (`0 21 * * *` UTC)
- `/api/cron/report-cleanup` — 매일 1회 (`30 21 * * *` UTC)
- Vercel 함수 한도 300초. 수집 예산을 늘릴 때 한도 초과(`FUNCTION_INVOCATION_TIMEOUT`) 주의.

## 콘텐츠·데이터 정직성 원칙

- **출처 확인 전에는 사실로 승격하지 않습니다**: DB의 가격(`price_usd`), 리뷰 수, Best for, 치수, 장단점 문구는 출처·확인일이 없을 수 있습니다. 이를 강한 단정 문구나 구조화 데이터(schema)로 내보내지 않습니다.
- 수집된 외부/AI 요약 리뷰를 Review·AggregateRating schema로 내보내지 않습니다. 확인되지 않은 가격을 Offer로 내보내지 않습니다(`lib/seo/schemas.ts` 참고).
- 정확한 모델이 확인되지 않은 이미지를 제품 차이를 증명하는 사진으로 쓰지 않습니다.
- **존재 확인이 안 된 내부 URL로 링크하지 않습니다.** 없는 제품 페이지도 HTTP 200을 반환할 수 있으므로, 상태 코드만 보지 말고 DB 행이나 페이지 내용으로 확인합니다.
- 좋은 기존 가이드가 있으면 새 글을 만들지 말고 연결합니다. 관련 글은 관련성 높은 3~6개로 제한합니다.
- 페이지별 임시 하드코딩보다 여러 제품에 재사용할 수 있는 공통 데이터·컴포넌트로 만듭니다.
- 검색 성과 데이터 없이 "인기 순"이라고 부르지 않습니다.

## 작업 규칙

- 코드 스타일은 주변 코드를 따릅니다.
- `next.config.mjs`와 `middleware.ts`에 레거시 리다이렉트·삭제 콘텐츠 정책이 있습니다. 라우트를 바꿀 때 영향을 확인합니다.
- 커밋 메시지는 conventional commits 형식(`feat(scope):`, `fix(scope):`, `chore:` 등).
- `images.unoptimized: true` 상태입니다(Vercel 이미지 최적화 미사용).
- 큰 작업을 마치면 `docs/progress-log.md` 맨 아래에 날짜 섹션으로 한두 줄 기록하고 커밋합니다. 로컬 메모리는 컴퓨터마다 따로라 공유되지 않습니다.
- 운영 DB는 모든 환경이 공유합니다(프로덕션 Supabase). 새 마이그레이션은 대표님이 Supabase SQL Editor(프로젝트 `bvytheznlotwgavmytfr`)에서 실행합니다.
