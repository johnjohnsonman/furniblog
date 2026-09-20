# 지역·옵션별 사양 기반 구축

2026-09-20 — SQL 준비 완료, 운영 적용 전.

## 이번 결과

제품마다 하나뿐인 chair_specs에 서로 다른 옵션의 범위를 합치는 문제를 피하기 위해 별도 product_fit_configurations 테이블을 준비했다. 기존 products 및 product_fit_evidence는 변경하지 않는다.

- 식별: product_id + market_code + configuration_key.
- 옵션, 측정값, 원문 제목/URL, 확인일, 주의사항을 같은 구성에 저장.
- DB 자체에서 범위 역전, 반쪽 범위, 고정/조절 깊이 혼용, 0/음수/비정상 수치 차단.
- draft / verified / retired 상태. 공개 사용자는 공개 제품의 verified 구성만 읽을 수 있고 쓰기는 불가.
- 입력 파일의 중복 구성 키, 미지정 컬럼, 잘못된 URL/날짜/수치/범위를 생성 전에 거부.
- 수정 시 기존 구성도 draft로 되돌려 재검토. 원문이 바뀌었는데 공개 검증 상태가 남는 것 방지.
- 이번 시드는 모두 draft. 계산기 추천 엔진에는 아직 연결하지 않았다.

## 실행 순서

1. `054_product_fit_configurations.sql`: 테이블·제약·RLS·권한 생성.
2. `055_seed_fit_configurations_draft.sql`: 3개 기존 제품에 7개 검토 대기 구성 저장.

두 파일의 폴더:
`C:\Users\p\Desktop\park\furniblog\.worktrees\chair-fit-engine\lib\supabase\migrations`

| 제품 | 구성 수 | 주의사항 |
|---|---:|---|
| Haworth Soji | 1 | 미국 표준 sliding-seat; XL/스툴 제외 |
| Haworth Very Task | 2 | 전방 틸트 유무에 따른 하중 147.4 / 158.8 kg 분리 |
| Haworth Zody II 연구 연결 | 4 | Standard/Dual × lumbar 유무. 실제 SKU 조합과 카탈로그 연결 확인 전 공개 금지. 틸트 옵션 미지정이므로 하중은 공란 |

제품 7개를 추가한 것이 아니다. 출처 검증 제품 수나 활성 추천 후보 수가 이번 시드로 증가하지 않는다.

원문:
- https://store.haworth.com/products/soji-office-chair
- https://store.haworth.com/products/very-office-chair
- https://store.haworth.com/products/zody-office-chair

## 에이전트가 저장한 입력 및 도구

- `content/chair-fit-import/configurations-batch-1.json`: 입력 완성본. 대표님 수작업 불필요.
- `scripts/build-fit-configurations-sql.cjs`: JSON → SQL 생성.
- `scripts/test-fit-configurations.cjs`: 실제 PostgreSQL 호환 로컬 DB 검증.

```powershell
node scripts/build-fit-configurations-sql.cjs content/chair-fit-import/configurations-batch-1.json lib/supabase/migrations/055_seed_fit_configurations_draft.sql
node scripts/test-fit-configurations.cjs
```

## 완료된 검증

스키마/시드 재실행, 독립 하중 보존, 미확인 값 공란, 기존 제품 JSON 불변, draft 공개 차단, 미공개 제품 조회 차단, 일반 사용자 쓰기 차단, 범위/깊이 제약, 수정 후 draft 복귀, 누락 제품 시 전체 시드 롤백 통과.

## 다음 단계와 남은 한계

운영 적용 확인 후 관리용 검토 목록 및 구성 선택을 연결한다. 사용자가 시장과 구성을 고르지 않은 상태에서 가장 유리한 값들을 서로 다른 구성에서 조합하지 않는다. 기존 일반 제품 사양의 출처 부족은 이 테이블만으로 해소되지 않는다.

현재 단계는 저장·입력·검증 기반 완료이며, 구성별 추천 UI/엔진 연결 및 신규 제품 대량 수집은 아직 미완료다. 쇼룸 추가 조사와 화면 전환 속도 실측도 후속 과제로 남아 있다.
