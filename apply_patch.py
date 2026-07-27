#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parent
repo = Path.cwd()
index = repo / 'index.html'
if not index.exists():
    raise SystemExit('index.html을 찾을 수 없습니다. 저장소 루트에서 실행하세요.')

for relative in ['assets/css/dashboard-v7.css', 'assets/js/dashboard-v7.js']:
    src = root / relative
    dst = repo / relative
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(src.read_bytes())

html = index.read_text(encoding='utf-8')
css_tag = '  <link rel="stylesheet" href="assets/css/dashboard-v7.css?v=7.0.0">\n'
js_tag = '  <script src="assets/js/dashboard-v7.js?v=7.0.0" defer></script>\n'
if 'dashboard-v7.css' not in html:
    html = html.replace('</head>', css_tag + js_tag + '</head>')
elif 'dashboard-v7.js' not in html:
    html = html.replace('</head>', js_tag + '</head>')
index.write_text(html, encoding='utf-8')
print('HsLab Dashboard v7 패치가 적용되었습니다.')
