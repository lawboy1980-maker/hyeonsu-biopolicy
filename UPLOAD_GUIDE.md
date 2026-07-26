# HsLab v4.0 GitHub 업로드 안내

## 1. 저장소 최상단에 업로드
이 폴더 안의 파일과 폴더를 모두 GitHub 저장소 최상단에 올립니다.

중요한 최상단 항목:
- `index.html`
- `assets/`
- `scripts/`
- `data/`
- `config/`
- `.github/workflows/`

압축을 푼 뒤 `HsLab-v4.0-Full-Edition` 폴더 자체를 올리지 말고, 그 안의 내용물을 올려야 합니다.

## 2. Actions가 보이지 않을 때
Windows 또는 GitHub 웹 업로드 과정에서 `.github` 폴더가 빠질 수 있습니다.
그 경우 GitHub 저장소에서 직접 다음 두 파일을 만듭니다.

- `.github/workflows/update-news.yml`
- `.github/workflows/update-kbiois.yml`

내용은 `WORKFLOW-SETUP/` 폴더의 같은 이름 파일을 그대로 복사합니다.

정상 등록되면 Actions 왼쪽 메뉴에 다음이 나타납니다.
- `Update HsLab News`
- `Update KBIOIS Statistics`

## 3. Secret 확인
저장소의 `Settings → Secrets and variables → Actions`에서 다음 Secret이 있어야 합니다.

- `KBIOIS_API_KEY`

## 4. 최초 실행
Actions에서 다음 순서로 각각 `Run workflow`를 누릅니다.

1. `Update HsLab News`
2. `Update KBIOIS Statistics`

## 5. GitHub Pages
`Settings → Pages`에서 배포 브랜치를 `main`, 폴더를 `/ (root)`로 설정합니다.
