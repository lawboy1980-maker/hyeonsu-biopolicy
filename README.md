# HsLab v4.0

바이오 정책·산업·통계를 연결하는 디지털 연구 워크스페이스입니다.

## v4.0 변경사항

- 브랜드명 `HyLab` → `HsLab`
- 대시보드 뉴스: 국내 뉴스 / 부처 보도자료 / 해외 자료 / Nature News
- BIOIN 및 Nature RSS 자동 수집
- 생산규모·업체수·종사자수를 `통계·데이터` 화면으로 이동
- 산업 화면에 통계·데이터 연결 카드 추가

## GitHub 설정

1. 저장소 루트에 전체 파일을 업로드합니다.
2. `Settings → Secrets and variables → Actions`에서 `KBIOIS_API_KEY`를 등록합니다.
3. Actions에서 `Update HsLab News`와 `Update KBIOIS Statistics`를 한 번씩 수동 실행합니다.
4. `.github` 폴더 업로드가 어려우면 `WORKFLOW-SETUP` 안의 파일을 GitHub 웹에서 `.github/workflows/`에 생성합니다.

뉴스는 매일, KBIOIS 통계는 매주 자동 갱신됩니다. BIOIN 페이지 구조가 변경되면 `scripts/update_news.py`의 파서를 조정해야 합니다.
