# 053 실행 안내 및 조사 기록

작성: 2026-09-20. 상태: 준비 완료 / 운영 DB 미실행.

## 실행 대상

`lib/supabase/migrations/053_seed_priority_fit_evidence_batch_5.sql`

기존 Haworth Soji / Very Task 2개 제품을 보정하고 8개 필드 출처를 추가한다. 새 제품 생성이 아니다. 052까지 적용된 DB에서 실행한다.

| 제품 | 좌판 높이 cm | 좌판 깊이 cm | 좌판 폭 cm | 하중 kg |
|---|---|---|---|---|
| Soji | 41.7–53.3 | 41.3–47.6 | 50.8 | 158.8 |
| Very Task | 40.6–53.3 | 40.6–48.3 | 48.3 | 147.4 |

미국 공식 판매 구성 기준. Soji XL/스툴 및 Very Conference/Stacking 제외. Very의 147.4 kg는 전방 틸트가 있는 구성의 325 lb를 환산한 값이며 옵션 없는 구성의 350 lb와 구분한다. 팔걸이 높이는 바닥 기준임을 확인하지 못했으므로 입력하지 않았다.

출처:
- https://store.haworth.com/products/soji-office-chair
- https://store.haworth.com/products/very-office-chair

기존 seatDepth 고정 값을 제거하고 조절식 범위로 교체한다. 관련 없는 JSON 필드는 보존한다. 모델이 누락되면 전체 트랜잭션이 실패한다.

## 검증

- 로컬 PostgreSQL 호환 PGlite에서 053 실행: 2개 제품 / 8개 출처 행.
- 재실행 중복 방지, 고정 깊이 제거, 관련 없는 키 보존, 누락 제품 시 롤백 통과.
- 기존 052 회귀 검사: 10개 제품 / 26개 출처 행 통과.
- 테스트 도구에 SQL 경로 인수를 추가해 후속 배치에도 재사용 가능.

## 다음 작업

- 대표님 실행 후 최신 읽기 전용 감사와 CSV 대조로 운영 반영 확인.
- Zody는 Standard/Dual Posture 및 lumbar 유무에 따라 값이 달라 현재 일반 제품 slug에 단일 조합을 덮어쓰지 않고 보류. 원문: https://store.haworth.com/products/zody-office-chair
- Humanscale 기존 2020 자료는 최신 구성 확인까지 보류 유지.
- 쇼룸 좌표 확인과 화면 전환 실측은 미완료 상태 유지.

폴더: `C:\Users\p\Desktop\park\furniblog\.worktrees\chair-fit-engine\lib\supabase\migrations`
