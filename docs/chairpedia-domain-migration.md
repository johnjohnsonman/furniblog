# Chairpedia 도메인 이전 운영 기록

대표 주소는 `https://www.chairpedia.com`이다. 서비스 식별자는 `lib/site-config.ts`에서 관리한다. 기존 경로, 공유 DB, 제휴 태그, 저장소·프로젝트 이름은 유지한다.

## 운영 기준점

- 이전 운영 배포: `dpl_7narZyVvCczVidhMugAhLhBKjPDJ`
- 이전 배포 URL: `https://furniblog-19s83v3i3-pyoinpark-6428s-projects.vercel.app`
- 기준 커밋: `faa7cae97ba7919676a70eb842a8fa3e4cb0676c`
- 검증된 배포 파일 37개 중 연결 설정 `.vercel/project.json`을 제외한 36개를 `b732515`에 보존했다. 각 파일은 기존 배포 매니페스트의 SHA256과 일치했다.
- 현재 새 홈과 제품 상세 디자인을 포함한다. 홈페이지 본문, 추천 로직, 스타일은 이전 변경에서 수정하지 않았다.
- 원래 작업 폴더와 분리된 사본에서 작업했다. 원래 폴더의 미커밋 작업을 이 사본에 일괄 반영하지 않았다.

## 운영 전환 조건과 순서

실제 새 도메인의 관리자 로그인 성공 확인이 선행되어야 한다. 로컬 자격 증명으로 운영 로그인 성공을 확인하지 못한 경우 비밀번호를 덮어쓰거나 인증을 우회하지 않는다.

1. 필수 검사와 관리자 로그인 확인을 완료한다.
2. 이 사본의 커밋과 `origin/main`을 확인하고 푸시한다. 원래 미커밋 작업 폴더에서 배포하지 않는다.
3. Vercel 프로젝트 `furniblog`의 Production 환경 `NEXT_PUBLIC_SITE_URL`을 대표 주소와 일치시킨다. 그 밖의 비밀값과 측정 ID는 유지한다. 민감한 환경변수의 CLI 내보내기 빈 값은 실제 미설정의 증거가 아니다.
4. 깨끗한 커밋에서 운영 배포한다. CLI 배포 시 `RELEASE_COMMIT_SHA`에 해당 커밋 전체 SHA를 배포 환경값으로 제공한다. `/api/version` 값과 Git SHA가 일치해야 한다. `.env*`, 로컬 감사 자료는 업로드하지 않는다.
5. Vercel Ready와 `https://www.chairpedia.com`의 실제 페이지·로그인을 확인한다.
6. Vercel 프로젝트의 Domains에서 `furniblog.com`, `www.furniblog.com`을 `www.chairpedia.com`으로 308 이동하도록 설정한다. 기존 `chairpedia.com` → `www.chairpedia.com` 규칙은 유지한다.
7. 네 호스트의 경로·쿼리, 정상 페이지, 없는 페이지, 기존 410, 인증/API 경로를 확인한다. 정상 HTTPS URL은 새 www 주소로 바로 이동해야 한다.
8. 리디렉션 검증 후 GSC 주소 변경을 신청한다. 기술적 이전과 검색 결과 반영은 별도로 기록한다.

도메인 이동은 Vercel Domains에서 담당한다. 기존 Next.js 경로 교정과 middleware의 삭제 콘텐츠 정책은 유지한다. HTTP의 플랫폼 HTTPS 전환이나 이미 이전된 legacy 경로의 추가 이동은 정상 HTTPS 주소의 도메인 이동과 구별해서 기록한다.

## 데이터·계측

- 공유 DB를 조회했으며 이번 작업에서 UPDATE·마이그레이션을 실행하지 않았다. 게시글 이미지 URL 1건에 옛 호스트가 있었다. 출력 단계의 정규화로 처리한다.
- 과거 본문·출처·분석 기록의 Furniblog, `furniblog0e-20`, `furniblog-22`, 기존 UTM 식별자와 저장소 키는 유지한다.
- 네 호스트는 콘텐츠와 과거 유입 분류에 사용한다. 인증·CORS 허용 목록에는 일괄 적용하지 않는다.
- 관리자 쿠키는 호스트 전용이다. 새 도메인에서 재로그인이 필요하다. 일반 회원 OAuth·이메일 인증·비밀번호 재설정 기능은 현재 구현되어 있지 않다.
- GA4 속성 `542296665`, 스트림 `15114409008`, 측정 ID `G-N0LGLLKG20`을 유지한다. 클릭은 주문·수수료를 의미하지 않는다.
- GSC 연결 계정에는 `sc-domain:furniblog.com`의 전체 사용자 권한이 확인됐다. 새 속성 접근과 주소 변경에 필요한 소유자 권한은 확인되지 않았다.

## 계정에서 처리할 항목

- GSC: 속성 추가 → 도메인 `chairpedia.com` 인증. DNS TXT가 필요하면 계정이 발급한 실제 값을 확인하고 별도 승인 후 추가한다. 소유자 계정에서 기존 속성의 설정 → 주소 변경을 사용한다. 새 사이트맵은 `https://www.chairpedia.com/sitemap.xml`이다. 리디렉션 적용 전에 주소 변경을 신청하지 않는다. [Google 안내](https://support.google.com/webmasters/answer/9370220?hl=ko)
- GA4: 관리 → 데이터 스트림 → 기존 웹 스트림 → 스트림 세부정보 편집에서 웹사이트 URL을 새 대표 주소로 바꾼다. 속성·스트림을 새로 만들지 않는다. [Google 안내](https://support.google.com/analytics/answer/9304776?hl=ko)
- Amazon Associates: 계정 설정 → 웹사이트 목록 편집에 `https://www.chairpedia.com`을 추가한다. 이전 기간에는 기존 사이트도 유지한다. 추적 ID는 변경하지 않는다. [Amazon 안내](https://affiliate-program.amazon.com/help/node/topic/GFZXAJAUR6K6JHR5)

## 복구

운영 전환 전에는 운영·도메인·DB 설정을 바꾸지 않았으므로 서비스 복구가 필요 없다.

전환 후 문제가 생기면 먼저 두 Furniblog 호스트의 새 도메인 리디렉션을 해제해 루프를 방지한다. 변경 전 상태는 `furniblog.com` → `www.furniblog.com` 308, `www.furniblog.com`은 Production, `chairpedia.com` → `www.chairpedia.com` 308, `www.chairpedia.com`은 Production이다. 이어 위의 이전 Ready 배포를 Vercel에서 운영으로 복원하고 환경값을 변경 기록에 따라 되돌린다. 도메인이나 TLS 연결은 삭제하지 않는다. 영구 리디렉션은 브라우저에 캐시될 수 있으므로 새 www 주소의 서비스도 유지하면서 확인한다. DB 복구는 필요하지 않다.
