# T06 최종 공개 제출 검증

검증일: 2026-10-02 (Asia/Seoul).
공개 URL: https://aleph-t06-pds-diary.aleph-t04-eunsu.workers.dev

최종 결과: 요청된 19항목 **19 PASS / 0 FAIL / 확인 필요 0**. 자동 테스트 별도 **61 PASS / 0 FAIL**. 실제 계획·할 일·완료 실행 필수 수량과 공개 D1 기능 검증을 충족하여 제출 가능하다. 이전 수정/복사 기록 부족은 최신 운영 데이터로 해소되었다.

## 직접 검증 방법

운영 DB aleph-t06-pds-diary-db에 Wrangler d1 execute DB --remote 읽기 전용 조회를 실행했다. 여섯 업무 테이블 전체, sqlite_master, table_info, foreign_key_list, foreign_key_check를 final-d1-snapshot.json에 저장했다. 비교 기준은 수정/복사 이전 final-d1-before-supplement.json이다.

공개 화면에서 1주차 수정 이력을 펼쳐 두 버전의 제목/성공 기준을 확인했다. 2주차 복사 카드의 원본 ID 표시와 실행 기록 0개도 확인했다. 화면 다운로드 버튼으로 받은 단일 JSON 및 사용자가 제공한 C:\Users\User\Downloads\t06-diary.json을 각각 계약과 D1 전체 행에 대조했다. scripts/verify-final-public.mjs로 재현할 수 있다. 검증 중 운영 DB 변경이나 fixture 생성은 하지 않았다.

## 실제 운영 데이터

| 테이블/상태 | 수 |
|---|---:|
| plans | 2 |
| plan_versions | 3 (1주차 v1/v2, 2주차 v1) |
| tasks | 6 (원본 5 + 복사 1) |
| 완료한 할 일 | 3 |
| tags | 9 |
| task_tags | 12 |
| execution_logs | 4 (모두 종료, 열린 기록 0) |

## 요청한 19항목

| 번호 | 항목 | 결과 | 근거 |
|---|---|---|---|
| 1 | 수정 전후 plan ID | PASS | 기존 ID/생성 시각 동일, current_version 1→2 및 수정 시각 갱신 |
| 2 | 최초/수정 버전 | PASS | 같은 plan_id에 v1/v2 존재. v1 전체 행이 이전 스냅샷과 같고 화면에서 두 버전 확인 |
| 3 | 새 2주차 plan ID | PASS | 원본과 다른 UUID, v1 생성 |
| 4 | 새 Linux task ID | PASS | 원본과 다른 UUID, 2주차 plan에 연결 |
| 5 | copied_from_task_id | PASS | 원본 Linux ID와 정확히 동일. 내용/우선순위/예상/태그 같고 새 마감일 명시 |
| 6 | 실행 미복사 | PASS | D1 로그 및 복사 task 실행 조회 API 모두 0개 |
| 7 | 원본 보존 | PASS | 원본 계획 v1과 5개 task 전체, 태그 관계가 이전과 동일. 계획은 의도한 수정 내용만 v2에 추가. 원본 계획 불변은 수정된 현재 버전 포인터가 아닌 v1 내용 보존으로 해석 |
| 8 | Linux 기존 실행 보존 | PASS | 두 기존 로그의 ID/관계/시작/종료/시간/예상/request ID 모두 이전과 동일 |
| 9 | 돌아보기 D1 일치 | PASS | 원시 행에서 독립 계산하여 공개 API/UI와 대조 |
| 10 | JSON 모든 테이블 | PASS | metadata/schema_version 및 6업무 테이블 전체 포함 |
| 11 | JSON ID 관계 | PASS | 화면 다운로드 및 사용자 JSON의 6테이블 행이 D1과 같음, 관계 참조 일치/FK 위반 0 |
| 12 | 새로고침 | PASS | 실제 데이터 조회 후 새로고침, 계획 수 및 테이블 전체 행 동일 |
| 13 | 다른 브라우저 | PASS | 쿠키/저장소를 공유하지 않는 독립 Chromium 컨텍스트 2개에서 동일 행 조회 |
| 14 | 로그인 없는 접근 | PASS | 새 세션의 공개 화면 200/API 정상. 로그인 요구 없음, localStorage 0 |
| 15 | 자동 테스트 | PASS | DB/API/계약 47 + 로컬 브라우저 14. 운영과 분리된 임시 DB에서 모두 통과 |
| 16 | TypeScript | PASS | npm run build의 tsc --noEmit 성공 |
| 17 | 빌드 | PASS | Vite production build 성공 |
| 18 | 계약/D1 구조 | PASS | 테이블/필드/타입/NULL/PK/FK, unique/CHECK/partial unique SQL 및 트리거 11개 일치. 실제 JSON/상태/UTC 시각/정수 초 계약 검증 통과 |
| 19 | 민감정보 | PASS | 실제 제목/기준/할 일/태그 직접 검토: 학습/취업 준비 내용, 연락처/비밀번호/키/토큰 없음. 키/개인키 패턴 없음. 환경/자격증명 파일 및 생성물 Git 제외 |

## 수정·복사 ID와 원본 실행

- 1주차 plan ID: 592870a1-8e4f-47d0-96ed-d8c60e7c30ff (수정 전후 동일).
- v1: 2026-10-02T07:26:12.487Z; v2: 2026-10-02T07:43:16.978Z.
- v2 성공 기준에 '포트폴리오 기록까지 정리한다.' 추가. v1 원문/날짜/예상 시간 보존.
- 2주차 plan ID: bd38558c-e85c-4048-88d6-15a70f29b959.
- 원본 Linux task ID: 52bbc724-bb15-4213-9e54-524cce0809c7.
- 복사 Linux task ID: 958c3c03-b1e3-4521-baa3-554f5be63899.
- copied_from_task_id: 52bbc724-bb15-4213-9e54-524cce0809c7.
- 복사 상태 진행 중, completed_at=null, 예상 3600초/high/동일 태그, 새 마감일 2026-10-10, 실행 기록 0.
- 원본 log 30a48fef-a7c8-449d-9cca-cf5fd354bc6c: 07:29:40.130Z→07:29:52.955Z, 12초.
- 재실행 log cb96283b-4e11-4053-aeeb-2ef8cf9c0bf4: 07:30:42.988Z→07:30:47.184Z, 4초.
- Docker 5초/Kubernetes 3초를 포함한 기존 로그 4개 전체 변경 없음. 실행으로 예상 시간 변경 없음.

## 돌아보기 독립 계산

| 지표 | 실제 D1 계산 | 공개 API/UI |
|---|---:|---:|
| 전체 계획 | 2 | 2 |
| 완료 할 일 | 3 | 3 |
| 지연 할 일 | 0 | 0 |
| 계획 자체 예상 | 25200 + 25200 = 50400초 | 50400초 |
| 할 일 예상 | 원본 25200 + 복사 3600 = 28800초 | 28800초 |
| 실제 시간 | 12 + 4 + 5 + 3 = 24초 | 24초 |
| 실제 − 할 일 예상 | 24 − 28800 = -28776초 | -28776초 |

지연 기준은 조회 당시 한국 날짜 또는 한국 완료 날짜가 due_date 이후인지다. 계획 자체 예상과 할 일 합계는 별도 값이며 차이 계산은 할 일 합계 사용.

## 근거 파일

- final-d1-snapshot.json: 최신 직접 운영 D1 행과 구조.
- final-d1-before-supplement.json: 수정/복사 전 비교 기준.
- final-public-verification.json: 최신 브라우저/스키마/보존/집계/사용자 다운로드 검증.
- final-public-export.json: 실제 공개 화면 다운로드.
- final-public-history.png: 1주차 두 버전 수정 이력.
- final-public-copy.png: 2주차 복사 카드와 원본 ID.
- final-public-desktop.png: 최신 공개 화면.
- final-unit-results.json 및 browser-results.json: 61개 자동 테스트.

## Git와 제출

사용자가 승인한 eunsu7997 / eunsu7997@users.noreply.github.com을 저장소 로컬에만 설정한다. Git 루트는 부모 과제로 T05와 공유되며 중첩 저장소나 전역 설정은 만들지 않는다. T06 경로만 커밋하고 T05는 변경/포함하지 않는다. 생성물/환경 파일/Cloudflare 인증정보 제외. 커밋 메시지: T06: complete public D1 diary verification. 커밋 ID는 최종 응답 및 Git 로그에 기록한다.

최종 제출을 막는 발견된 문제 없음. 초기 단계 증거 파일은 당시 상태의 역사 자료이고 현재 결과는 이 문서가 기준이다.
