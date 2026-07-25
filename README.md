# BioPolicy Intelligence Platform v1.3

## 주요 변경사항
- Quick Access를 **Quick Research**로 변경
- 카드 순서를 **기술 → 정책 → 산업 → 제도**로 재배치
- `바이오통계` 카드를 `바이오인력`으로 변경
- Quick Research 카드별 분야 배지와 이동 링크 적용
- 카드 클릭 시 해당 분야 안의 주제 화면으로 이동
- 기술·정책·산업·제도 화면에 좌측 주제 메뉴와 상세 콘텐츠 영역 추가
- URL 쿼리 예시: `index.html?view=technology&topic=synthetic-biology`

## Quick Research 구성
- 기술: 합성생물학, AI 바이오, 신약개발, 그린·화이트바이오
- 정책: 기본계획, 바이오인력, 국제협력
- 산업: 기술사업화
- 제도: 바이오규제, 법·제도

## 실행
GitHub Pages에 업로드하거나 로컬 서버에서 실행하세요.

```bash
python -m http.server 8000
```
