# HsLab Google Calendar 자동 연동

## 이미 완료해야 하는 설정

GitHub 저장소의 `Settings → Secrets and variables → Actions`에서 다음 Secret을 등록합니다.

- Name: `ICAL_URL`
- Value: Google Calendar의 새 비공개 iCal 주소

비공개 iCal 주소는 소스코드나 `agenda.json`에 직접 넣지 않습니다.

## 최초 실행

1. 수정된 파일을 GitHub 저장소에 업로드합니다.
2. 저장소의 `Actions` 탭으로 이동합니다.
3. `Update HsLab Calendar`를 선택합니다.
4. `Run workflow`를 눌러 최초 동기화를 실행합니다.
5. 작업이 완료된 뒤 GitHub Pages를 강력 새로고침합니다 (`Ctrl+Shift+R`).

이후에는 매시간 7분에 자동 동기화됩니다. GitHub Actions의 예약 실행은 혼잡 상황에 따라 다소 늦어질 수 있습니다.

## 생성되는 데이터

- `data/agenda.json`: 오늘부터 7일간의 일정
- Hero 카드: 오늘 일정 우선 표시, 오늘 일정이 없으면 향후 일정 표시

## 보안

과거에 외부로 노출한 iCal 주소는 Google Calendar에서 재설정하고, 새 주소만 `ICAL_URL` Secret에 저장하세요.
