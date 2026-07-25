# Hyeonsu BioPolicy

## 1단계: 새 홈페이지 적용

이 압축파일의 폴더와 파일을 GitHub 저장소 최상단에 업로드합니다.

필수 파일:
- index.html
- css/style.css
- js/app.js
- data/dashboard.json

업로드 후 GitHub Pages가 자동으로 다시 배포됩니다.

## 2단계: KBIOIS 연결

현재 dashboard.json에는 0과 '연결 준비' 상태가 들어 있습니다.
API 호출 형식이 확정되면 GitHub Actions와 수집 스크립트를 추가해 실제 수치로 교체합니다.

## 주의

API 인증키를 index.html, JavaScript 또는 공개 JSON 파일에 직접 입력하지 마세요.
인증키는 GitHub Repository Secret에 저장해야 합니다.
