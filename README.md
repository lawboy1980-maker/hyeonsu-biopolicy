# BioPolicy Intelligence Platform v1.5.1 Hotfix

## 수정 목적

GitHub Pages에서 `index.html`은 v1.5로 바뀌었지만, 기존 v1.4의 `style.css` 또는 `app.js`가 남아 있거나 캐시되어 화면이 깨지는 문제를 방지합니다.

## 핵심 수정

- CSS 파일명을 `dashboard-v1.5.1.css`로 변경
- JavaScript 파일명을 `dashboard-v1.5.1.js`로 변경
- `?v=151` 캐시 무효화 쿼리 추가
- 기존 `style.css`, `app.js`와 충돌하지 않도록 분리

## 업로드 방법

저장소 루트에 아래 파일을 그대로 업로드합니다.

```text
index.html
README.md
assets/css/dashboard-v1.5.1.css
assets/js/dashboard-v1.5.1.js
```

기존 파일은 남아 있어도 되지만, 새 `index.html`이 반드시 위의 새 파일명을 가리켜야 합니다.

GitHub Pages 배포 후:

1. 배포가 완료될 때까지 1~3분 기다립니다.
2. 브라우저에서 `Ctrl + F5`
3. 그래도 이전 화면이면 시크릿 창에서 접속합니다.

## 정상 여부 확인

브라우저 주소 끝에 `#technology`가 있을 때 Technology 화면이 열리고,
홈 화면에는 통계 카드와 뉴스 목록이 표시되어야 합니다.
