# HyLab Digital Research Workspace v2.3

## 이번 버전의 데이터 연결
- 원본 `내손안의바이오통계_2022.xlsm` 연결
- 대시보드 핵심지표 8개를 실제 원자료 값으로 교체
- 실제 시계열 7개를 JSON/JavaScript 데이터로 변환
- 통계·데이터 메뉴에 113개 HyLab 통계분류표 연결
- 대분류 필터와 검색 제공
- 원자료 Excel 다운로드 연결

## 주요 파일
- `assets/js/statistics.js`: 정적 웹에서 바로 사용하는 통계 데이터
- `data/statistics.json`: 향후 API/자동화 전환용 JSON
- `source/내손안의바이오통계_2022.xlsm`: 연결된 원자료
- `source/HyLab_통계분류표_v1.0.xlsx`: 분류 기준표

## 주의
현재 수치는 원본 파일 기준 2020~2021년 데이터입니다. 화면에 기준연도와 출처를 함께 표시했으며, 최신 데이터로 업데이트가 필요합니다.
