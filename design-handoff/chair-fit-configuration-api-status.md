# 구성별 계산 API 연결

2026-09-20. 로컬 구현 완료 / 배포 전.

- GET `/api/chair-fit/configurations?product=haworth-very-task&market=US`: 공개 제품의 해당 시장 verified 구성만 조회.
- POST 같은 경로: configurationId, market, heightCm 필수. weightKg, deskHeightCm, armrestsUnderDesk 선택.
- 익명 Supabase 클라이언트와 RLS 사용. 검토 대기/폐기/미공개 제품 구성 계산 불가.
- 선택한 구성의 수치만 기존 evaluateProductFit에 전달. 일반 제품/다른 옵션으로 미확인 수치를 채우지 않음.
- 신체 입력은 POST 본문에만 받고 응답은 private,no-store. 신체 입력 로그 없음.
- 구성 없으면 GET 빈 목록 / POST 404. 입력 오류 400, 데이터 장애 503. 데이터 장애를 빈 목록으로 숨기지 않음.

## 테스트

`scripts/test-fit-configuration-selection.ts`: 시장/ID 일치, draft/retired 거부, 옵션별 독립 하중, 미확인 팔걸이 유지, 범위/입력 오류 거부.

현재 7개 시드는 draft로 유지. 상태 변경 SQL을 실행하거나 운영 데이터를 수정하지 않음. 이번 API는 구성별 fit 계산이며 전체 추천 순위를 재계산하는 API가 아니다. 소비자 구성 선택 UI는 아직 미연결.

## 다음

검토 자료의 실제 판매 옵션 확인 후 검증 상태 전환을 별도 SQL로 준비하고 소비자 구성 선택 UI에 연결한다. 브라우저·HTTP 통합 검증 및 성능 실측은 미완료.

대표님이 지금 실행할 추가 SQL 없음.

폴더: `C:\Users\p\Desktop\park\furniblog\.worktrees\chair-fit-engine\design-handoff`
