# GitHub 업로드 안내

이 ZIP은 `hyeonsu-biopolicy` 저장소의 **최상위 경로**에 덮어쓰기 위한 패키지입니다.

## 1. ZIP 압축 해제
압축을 풀면 바로 아래 항목이 보여야 합니다.

- `.github`
- `assets`
- `config`
- `data`
- `scripts`
- `source`
- `index.html`
- `README.md`

`hylab-v...` 같은 상위 폴더가 한 번 더 들어 있지 않습니다.

## 2. GitHub 업로드
저장소의 `Code → Add file → Upload files`에서 압축을 푼 내용 전체를 업로드하고 `Commit changes`를 누릅니다.

## 3. `.github`가 업로드되지 않았을 때
Windows에서 점으로 시작하는 폴더가 빠질 수 있습니다. 이 경우 GitHub에서 다음 파일을 직접 만듭니다.

1. `Code → Add file → Create new file`
2. 파일명에 `.github/workflows/update-kbiois.yml` 입력
3. 이 패키지의 `WORKFLOW-SETUP/update-kbiois.yml` 내용을 복사해 붙여넣기
4. `Commit changes`

## 4. 인증키 등록
`Settings → Secrets and variables → Actions → New repository secret`

- Name: `KBIOIS_API_KEY`
- Secret: 발급받은 KBIOIS 인증키

## 5. 실행
`Actions → Update KBIOIS Pilot → Run workflow → Run workflow`

성공하면 `data/kbiois-pilot.json`이 자동 커밋되고 GitHub Pages가 다시 배포됩니다.
