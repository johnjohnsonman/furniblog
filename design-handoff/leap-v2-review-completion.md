# Leap V2 상세·영상 점검 결과 — 2026-09-20

## 완료

- YouTube oEmbed로 7개 영상 모두 공개 메타데이터 응답 확인. 저장된 제목·채널 7/7 일치.
- Leap V2 사양 탭에 Steelcase 공식 사양서 링크, February 2024 버전, 확인일, 인쇄 페이지 49/52 안내 추가.
- 일반 작업용·Plus·스툴·옵션 실린더를 구분하도록 설명 추가. 타 제품에는 표시하지 않는다.
- 기존 개요의 유사 제품 연결, 영상 탭, 모델 필터 스토어 링크를 코드로 확인. 신규 비교 결론이나 매장 보유 확인은 추가하지 않았다.

| 영상 ID | 채널 | 제목상 주제 | 메타데이터 |
|---|---|---|---|
| O3OZ9-Qrfso | BTODtv | Aeron / Leap 비교 | 제목·채널 일치 |
| cOtsAbpqyz8 | OT Focus | Leap V2 3개월 리뷰 | 제목·채널 일치 |
| NfIF-8pwP7w | BTODtv | Leap / Fern / Embody 비교 | 제목·채널 일치 |
| iaZPWPqCsIo | BTODtv | Leap V2 장기 리뷰 | 제목·채널 일치 |
| XsnHSQMubQM | Ahnestly | 신품 / 재제조 Leap V2 | 제목·채널 일치 |
| KnhcIPUs1lU | BTODtv | Leap / Gesture 비교 | 제목·채널 일치 |
| oNcjg47iTZ4 | BTODtv | Leap V2 구매 관련 | 제목·채널 일치 |

제목에 Leap만 있는 비교 영상은 세대 일치를 내용으로 확인해야 한다. 위 주제는 제목에 따른 분류이며 시청 요약이 아니다.

## 미완료와 적용 상태

실제 플레이어 재생, 영상 시청을 통한 모델·세대 검수, 모바일/데스크톱 브라우저 검증은 미완료. YouTube 페이지 직접 열기는 실패했지만 oEmbed 메타데이터 접근은 성공했다. 로컬 변경이며 운영 배포·DB 변경은 없다. SQL 실행 불필요.

근거: content/reports/leap-video-review.json. 재실행: node scripts/audit-leap-video-metadata.cjs.

## 다음 작업 범위

이번 수정은 Leap V2 1개 제품에 한정한다. 다음은 Gesture 1개 제품을 대상으로 연결 영상 전체의 메타데이터·공식 사양서·옵션 안내를 같은 기준으로 점검한다. 운영 배포나 신규 매장 추가는 별도 작업이다. Leap 영상 내용/재생 검수는 미완료 목록에 유지한다.
