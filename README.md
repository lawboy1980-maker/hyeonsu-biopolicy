# BioPolicy Intelligence Platform v1.5

## 버전 성격

v1.5는 v1.4의 **Technology 정보구조를 유지**하면서, 플랫폼의 첫 진입화면인 **Home Dashboard**를 통합한 버전입니다.

## v1.5 핵심 변경

### 1. Home Dashboard 신설
- Quick Research
- 바이오 일반 주요 통계
- 최신 기사·보도자료
- Research Hub
- AI 정책질문

### 2. Technology v1.4 계승
- 기술 배너
- 상단 기술주제 탭
  - 합성생물학
  - AI 바이오
  - 신약개발
  - 그린·화이트바이오
- 바이오기술 개요
- 바이오 일반 핵심지표
- AI 정책질문
- 기술주제별 상세
  - 한줄 정의
  - 정책 아젠다
  - 핵심지표
  - 핵심기술
  - 국내외 동향
  - 관련자료

### 3. 연결 방식
- 대시보드의 Technology 카드와 기술주제 버튼이 Technology 상세화면으로 연결됩니다.
- 정책·산업·기관은 임의로 상세설계하지 않고 다음 버전 대상으로 유지합니다.
- JSON `fetch()` 없이 실행되므로 `index.html`을 더블클릭해도 주요 화면이 동작합니다.
- Chart.js와 아이콘은 CDN을 사용하므로 차트와 아이콘 표시는 인터넷 연결이 필요합니다.

## 파일 구조

```text
biopolicy-platform-v1.5-dashboard/
├─ index.html
├─ README.md
└─ assets/
   ├─ css/
   │  └─ style.css
   └─ js/
      └─ app.js
```

## GitHub 적용 방법

1. 기존 저장소에서 백업 브랜치를 생성합니다.
2. 이 압축파일의 내용물을 저장소 루트에 업로드합니다.
3. 아래 구조가 유지되는지 확인합니다.
   - `index.html`
   - `assets/css/style.css`
   - `assets/js/app.js`
4. GitHub Pages 배포가 완료된 뒤 강력 새로고침합니다.
   - Windows: `Ctrl + F5`

## 권장 커밋 메시지

```text
feat: integrate v1.5 home dashboard with technology v1.4
```
