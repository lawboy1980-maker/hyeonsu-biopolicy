# HsLab Dashboard v7 Patch

## 반영 내용

1. 주요성과(KPI) 다음에 핵심지표 트렌드 6개를 3열 × 2행으로 배치
2. 주요현안 오른쪽의 `다가오는 일정`을 `Strategic Intelligence`로 변경
3. BioIN Hub 다음에 `My Workspace` 추가
4. My Workspace에서 제공된 Notion 페이지로 이동
5. Quick Research와 기존 4개 주요 통계 차트는 메인 대시보드에서 숨김

## 적용 방법

저장소 전체를 내려받은 뒤, 이 폴더의 `apply_patch.py`를 저장소 루트에서 실행합니다.

```bash
python apply_patch.py
```

그 다음 변경된 파일을 GitHub에 업로드/커밋합니다.

- `index.html`
- `assets/css/dashboard-v7.css`
- `assets/js/dashboard-v7.js`

## Notion 관련

현재 연결 방식은 안전한 외부 링크입니다. GitHub Pages에 Notion API 토큰을 직접 넣으면 토큰이 노출되므로 금지해야 합니다. 최근 문서·할 일 자동 표시는 추후 GitHub Actions 또는 Cloudflare Worker를 통해 구현하는 방식이 적절합니다.
