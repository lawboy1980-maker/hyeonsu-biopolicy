#!/usr/bin/env python3
"""Collect HsLab news feeds and write data/news.json.

Sources:
- BIOIN domestic news
- BIOIN ministry press releases
- BIOIN overseas news
- Nature RSS
"""
from __future__ import annotations
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "news.json"
KST = timezone(timedelta(hours=9))
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; HsLab-NewsBot/1.0; +https://github.com/)",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7",
}
SOURCES = {
    "domestic": "https://www.bioin.or.kr/hbrd_News.do?bid=todaynews",
    "government": "https://www.bioin.or.kr/board.do?bid=division",
    "overseas": "https://www.bioin.or.kr/hbrd_News.do?bid=overseanews",
}
NATURE_RSS = [
    "https://www.nature.com/nature.rss",
    "https://www.nature.com/subjects/biotechnology.rss",
]

def clean(text: str | None) -> str:
    return re.sub(r"\s+", " ", text or "").strip()

def normalize_date(text: str) -> str:
    text = clean(text)
    match = re.search(r"(20\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})", text)
    if match:
        return f"{int(match.group(1)):04d}-{int(match.group(2)):02d}-{int(match.group(3)):02d}"
    match = re.search(r"(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})", text)
    if match:
        return f"20{int(match.group(1)):02d}-{int(match.group(2)):02d}-{int(match.group(3)):02d}"
    return text[:20]

def request(url: str) -> requests.Response:
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    response.encoding = response.apparent_encoding or response.encoding
    return response

def choose_source(text: str, default: str) -> str:
    candidates = [
        "과학기술정보통신부", "보건복지부", "산업통상자원부", "식품의약품안전처",
        "질병관리청", "환경부", "농림축산식품부", "해양수산부", "중소벤처기업부",
    ]
    return next((name for name in candidates if name in text), default)

def parse_bioin(url: str, kind: str, limit: int = 12) -> list[dict]:
    soup = BeautifulSoup(request(url).text, "html.parser")
    items: list[dict] = []
    seen: set[str] = set()
    anchors = soup.select("a[href]")
    for anchor in anchors:
        title = clean(anchor.get_text(" ", strip=True))
        href = anchor.get("href", "")
        if len(title) < 8 or title in seen:
            continue
        # BIOIN detail links usually include cmd=view or a numeric article parameter.
        if not ("cmd=view" in href or "num=" in href or "seq=" in href or "board" in href.lower()):
            continue
        container = anchor.find_parent(["tr", "li", "div", "article"])
        context = clean(container.get_text(" ", strip=True) if container else title)
        if len(context) > 900:
            context = context[:900]
        date = normalize_date(context)
        default = "BIOIN"
        if kind == "government": default = "정부 부처"
        elif kind == "overseas": default = "해외 매체"
        source = choose_source(context, default)
        # Common separators often put publisher before/after the date.
        tokens = [clean(x) for x in re.split(r"[|·]", context) if clean(x)]
        for token in tokens:
            if 2 <= len(token) <= 35 and token != title and not re.search(r"20\d{2}[.\-/]", token):
                if any(word in token.lower() for word in ["bioin", "조회", "첨부"]):
                    continue
                if kind != "government": source = token
        items.append({"title": title, "source": source, "date": date, "url": urljoin(url, href)})
        seen.add(title)
        if len(items) >= limit:
            break
    if not items:
        raise RuntimeError(f"No BIOIN items parsed for {kind}; page structure may have changed")
    return items

def rss_text(node: ET.Element, names: Iterable[str]) -> str:
    for name in names:
        found = node.find(name)
        if found is not None and found.text:
            return clean(found.text)
    return ""

def parse_nature(limit: int = 12) -> list[dict]:
    last_error: Exception | None = None
    for url in NATURE_RSS:
        try:
            root = ET.fromstring(request(url).content)
            items=[]
            for item in root.findall(".//item"):
                title=rss_text(item,["title"])
                link=rss_text(item,["link"])
                date=rss_text(item,["pubDate", "{http://purl.org/dc/elements/1.1/}date"])
                if title and link:
                    items.append({"title":title,"source":"Nature","date":normalize_date(date),"url":link})
                if len(items)>=limit: break
            if items:return items
        except Exception as exc:
            last_error=exc
    raise RuntimeError(f"Nature RSS unavailable: {last_error}")

def main() -> int:
    payload={"updated_at":datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),"domestic":[],"government":[],"overseas":[],"nature":[],"errors":[]}
    for kind,url in SOURCES.items():
        try: payload[kind]=parse_bioin(url,kind)
        except Exception as exc: payload["errors"].append(f"{kind}: {exc}")
    try: payload["nature"]=parse_nature()
    except Exception as exc: payload["errors"].append(f"nature: {exc}")
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}; counts=" + ", ".join(f"{k}:{len(payload[k])}" for k in ("domestic","government","overseas","nature")))
    for error in payload["errors"]: print("WARNING",error,file=sys.stderr)
    return 0 if any(payload[k] for k in ("domestic","government","overseas","nature")) else 1
if __name__=="__main__": raise SystemExit(main())
