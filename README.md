# HyLab Digital Research Workspace — KBIOIS Pilot

## 시범 연동 범위
- 바이오산업 생산규모: 국내판매 + 수출 합산
- 바이오산업 업체수
- 바이오산업 종사자수
- 각 지표는 전체 시계열과 분야별 구성을 함께 저장합니다.

## 구조
```text
KBIOIS OpenAPI → scripts/update_kbiois.py → data/kbiois-pilot.json → index.html
```
브라우저에서 KBIOIS를 직접 호출하지 않습니다. 인증키는 GitHub Secret에 보관하고, GitHub Actions가 정적 JSON 캐시를 생성합니다.

## GitHub 설정
1. 저장소 `Settings → Secrets and variables → Actions`로 이동합니다.
2. Repository secret 이름을 `KBIOIS_API_KEY`로 등록합니다.
3. `Actions → Update KBIOIS Pilot → Run workflow`를 실행합니다.
4. 생성된 `data/kbiois-pilot.json`이 자동 커밋되면 GitHub Pages 화면이 갱신됩니다.

## 로컬 실행
```bash
export KBIOIS_API_KEY="발급받은_인증키"
python scripts/update_kbiois.py
python -m http.server 8000
```
Windows PowerShell:
```powershell
$env:KBIOIS_API_KEY="발급받은_인증키"
python scripts/update_kbiois.py
python -m http.server 8000
```

## 통계표 코드
- 분야별 국내판매: `T228313007602109`
- 분야별 수출: `T221983007616496`
- 분야별 업체: `T233613007424798`
- 분야별 인력: `T229813007584612`

## 유의사항
- 생산규모는 시범 구현에서 `국내판매 + 수출`로 산출합니다. KBIOIS의 공식 생산규모 정의와 다른 경우 `config/kbiois-indicators.json`의 소스를 조정해야 합니다.
- API가 제공하지 않는 연도는 오류 목록에 남기고 나머지 연도는 계속 갱신합니다.
- 인증키는 소스코드나 JSON 파일에 저장하지 마십시오.
