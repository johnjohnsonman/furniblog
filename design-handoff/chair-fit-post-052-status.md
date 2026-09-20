# 052 적용 후 점검 — 2026-09-20

## 완료

- Supabase 읽기 전용 감사로 052 적용 후 상태 확인: 공개 의자 236개, 치수 기반 fit-ready 143개, 출처 기록 17개 제품/54개 항목.
- 집계 오류 수정: 숫자가 있는 것과 출처가 있는 것을 구분. 좌판 높이와 깊이에 출처가 모두 연결된 제품은 14개. 높이/깊이/하중/바닥 기준 팔걸이의 네 항목에 숫자와 출처가 모두 있는 제품은 1개. 기존 5개 집계는 숫자 완비 수였음.
- 출처 누락 우선순위 큐 추가. 숫자가 이미 존재해도 출처가 없으면 보완 대상에 남음.
- 추천 데이터와 결과 카드에 evidence notes 전달: 지역, 실린더, 구성이 적용되는 조건을 상세 근거에서 확인 가능. 로컬 변경이며 배포하지 않음.
- CSV와 최신 감사 JSON을 대조하는 읽기 전용 배치 검증 도구 추가. 숫자, 근거 필드 존재, 고정/조절식 깊이 충돌 정리를 검사. 원문 내용과 URL의 정확성은 별도 연구 검증 대상.

## 보류 및 다음 작업

1. Humanscale Diffrient Smart / Liberty / Diffrient World의 2020 미국 표준형 자료를 `content/chair-fit-import/humanscale-historical-research.csv`에 저장. 현재 판매 구성 대조 전에는 SQL로 실행하지 말 것. 공식 원문: https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf (인쇄 페이지 12/18/26). 확인 날짜는 원문 열람일이며 사양 개정일이 아님.
2. Haworth Melbourne / Shanghai는 좌표 검증, Sydney는 방문 가능 여부까지 확인한 뒤 등록. 이번 작업에서 추가 등록하지 않음.
3. 화면 전환 지연은 브라우저 자동화 도구가 현재 세션에 없어 실측 미완료. 캐시와 Server-Timing 변경의 성능 개선 수치를 아직 주장하지 않음. 브라우저 연결 가능 시 최초/재방문/입력 변경을 구분해 측정.

대표님이 지금 실행할 추가 SQL은 없음. 조사 파일과 보고서는 에이전트가 저장함.

## 검증

- TypeScript 타입 검사 통과.
- 변경한 데이터 로더/엔진/계산기/감사 도구 ESLint 통과.
- Chair Fit 엔진 테스트 통과.
- 실시간 읽기 전용 감사 완료.

폴더: `C:\Users\p\Desktop\park\furniblog\.worktrees\chair-fit-engine\design-handoff`
