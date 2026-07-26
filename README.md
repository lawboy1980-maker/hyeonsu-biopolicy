# HyLab Digital Research Workspace v2.2

GitHub Pages용 정적 웹사이트입니다.

## v2.1 변경사항

- 대시보드에 `바이오 정책 뉴스` 영역과 분야별 필터 추가
- Technology를 Policy·Industry·Regulation과 같은 공통 구조로 통합
- 기술 주제: 합성생물학, AI 바이오, 신약개발, 그린·화이트바이오
- 각 기술 주제의 하위 기술을 클릭해 자료 영역을 탐색 가능
- 모든 챕터에서 Featured Reports, Resources, HyLab Reports, Research Notes 제공
- URL에 `subtopic` 값이 반영되어 하위꼭지 직접 연결 가능
- 루트 주소 접속 시 대시보드가 기본 화면으로 표시

## 자료 추가 위치

`assets/js/data.js`와 `data/dashboard.json`의 `researchAreasV2` 항목에서 관리합니다.

각 주제에 아래 배열을 추가하거나 수정할 수 있습니다.

- `reports`
- `resources`
- `hylab`
- `notes`

하위꼭지별 자료는 항목에 `subtopic` 값을 추가하면 필터링됩니다.

```json
{
  "type": "REPORT",
  "title": "DBTL 기술동향 보고서",
  "subtopic": "DBTL"
}
```

뉴스는 최상위 `news` 배열에서 관리합니다.


## v2.2 브랜드 변경
- BioPolicy → HyLab
- BP → HL
- Intelligence Platform → Digital Research Workspace
- 대시보드 및 상위 메뉴의 제도 → 규제
- Technology, Policy, Industry, Regulation 영역에 HyLab Intelligence 표기 적용
