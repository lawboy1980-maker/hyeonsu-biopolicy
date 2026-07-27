# HsLab V12

## 적용 방법
1. ZIP을 풀고 저장소 최상위에 모든 파일을 덮어씁니다.
2. `.github/workflows/update-calendar.yml`과 `scripts/update_calendar.py`가 포함되어 있는지 확인합니다.
3. GitHub 저장소의 `Settings > Secrets and variables > Actions`에 `ICAL_URL`이 등록되어 있어야 합니다.
4. `Actions > Update HsLab Calendar > Run workflow`를 한 번 실행합니다.
5. GitHub Pages 배포 후 강력 새로고침(Ctrl+F5)합니다.

## V12 변경사항
- 일정 제목, 시간, 요약 숫자 글씨 확대
- `agenda.json` 캐시 방지
- 페이지에서 5분마다 자동 재조회
- 진행 중 일정 강조
- 종료 일정은 화면에서 제외
- 오늘 일정이 없으면 다음 일정 표시
- 동기화 시각과 상태 표시
- 모바일 반응형 개선
