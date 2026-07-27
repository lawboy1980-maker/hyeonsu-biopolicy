HsLab BioIN Hub Patch

GitHub 동일 경로에 아래 4개 파일을 덮어쓰세요.

1. index.html
2. assets/js/news-feed.js
3. scripts/update_news.py
4. .github/workflows/update-news.yml

반영 후 GitHub Actions > Update BioIN Hub > Run workflow를 1회 실행하세요.
성공하면 data/news.json이 뉴스/동향/지식/발간물 구조로 자동 갱신됩니다.
