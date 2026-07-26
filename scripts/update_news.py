 #!/usr/bin/env python3
"""Collect HsLab BIO NEWS and write data/news.json.

Dashboard sections:
- domestic: Korean bio news
- government: Korean ministry and agency press releases
- overseas: International bio news
- nature: Nature News RSS

BIOIN page scraping is not used. News is collected from RSS feeds and
Google News RSS keyword searches, merged, de-duplicated, and sorted newest first.
"""
from __future__ import annotations

import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Iterable
from urllib.parse import quote_plus

import requests

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "news.json"
KST = timezone(timedelta(hours=9))
MAX_ITEMS_PER_SECTION = 12

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; HsLab-NewsBot/2.0; +https://github.com/)",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}

# 국내 뉴스: 기술·정책·산업·제도/규제를 모두 포함하되 화면에서는 하나로 표시
DOMESTIC_QUERIES = [
    "바이오 생명공학 기술 정책 산업 규제",
    "첨단바이오 바이오산업",
    "합성생물학 바이오파운드리",
    "AI 신약개발 바이오",
    "유전자치료 세포치료 mRNA",
    "바이오의약품 CDMO 투자",
    "바이오 법 제도 규제 식약처",
]

# 부처 보도자료: 각 기관 공식 도메인을 검색 대상으로 제한
GOVERNMENT_QUERIES = [
    "바이오 site:msit.go.kr",       # 과학기술정보통신부
    "바이오 site:mohw.go.kr",       # 보건복지부
    "바이오 site:mfds.go.kr",       # 식품의약품안전처
    "바이오 site:motie.go.kr",      # 산업통상자원부
    "바이오 site:kdca.go.kr",       # 질병관리청
    "바이오 site:mafra.go.kr",      # 농림축산식품부
    "바이오 site:me.go.kr",         # 환경부
    "바이오 site:mss.go.kr",        # 중소벤처기업부
    "생명공학 site:go.kr",
]

# 해외 뉴스: 기술·정책·산업·규제를 하나의 해외 뉴스 목록으로 표시
OVERSEAS_QUERIES = [
    "biotechnology policy industry regulation",
    "synthetic biology biomanufacturing",
    "AI drug discovery biotech",
    "gene therapy cell therapy mRNA",
    "biopharma CDMO investment",
    "FDA EMA biotechnology regulation",
]

NATURE_RSS = [
    "https://www.nature.com/nature.rss",
    "https://www.nature.com/subjects/biotechnology.rss",
]


def clean(text: str | None) -> str:
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def google_news_rss(query: str, language: str) -> str:
    if language == "ko":
        return (
            "https://news.google.com/rss/search?"
            f"q={quote_plus(query)}&hl=ko&gl=KR&ceid=KR:ko"
        )
    return (
        "https://news.google.com/rss/search?"
        f"q={quote_plus(query)}&hl=en-US&gl=US&ceid=US:en"
    )


def request_bytes(url: str) -> bytes:
    response = requests.get(url, headers=HEADERS, timeout=35)
    response.raise_for_status()
    return response.content


def node_text(node: ET.Element, names: Iterable[str]) -> str:
    for name in names:
        found = node.find(name)
        if found is not None and found.text:
            return clean(found.text)
    return ""


def parse_datetime(text: str) -> datetime:
    text = clean(text)
    if not text:
        return datetime(1970, 1, 1, tzinfo=timezone.utc)

    try:
        dt = parsedate_to_datetime(text)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        pass

    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(text[:25], fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except ValueError:
            continue

    return datetime(1970, 1, 1, tzinfo=timezone.utc)


def display_date(dt: datetime) -> str:
    if dt.year <= 1970:
        return ""
    return dt.astimezone(KST).strftime("%Y-%m-%d")


def split_google_title(title: str, source: str) -> tuple[str, str]:
    """Google News often formats titles as 'headline - publisher'."""
    title = clean(title)
    source = clean(source)
    if source and title.endswith(f" - {source}"):
        title = title[: -(len(source) + 3)].strip()
    elif " - " in title and not source:
        headline, possible_source = title.rsplit(" - ", 1)
        if 1 < len(possible_source) < 60:
            title, source = headline.strip(), possible_source.strip()
    return title, source


def parse_rss(url: str, default_source: str = "") -> list[dict]:
    root = ET.fromstring(request_bytes(url))
    rows: list[dict] = []

    # RSS 2.0
    for item in root.findall(".//item"):
        title = node_text(item, ["title"])
        link = node_text(item, ["link"])
        date_text = node_text(
            item,
            ["pubDate", "{http://purl.org/dc/elements/1.1/}date"],
        )
        source = node_text(item, ["source"]) or default_source
        title, source = split_google_title(title, source)
        dt = parse_datetime(date_text)
        if title and link:
            rows.append(
                {
                    "title": title,
                    "source": source or default_source,
                    "date": display_date(dt),
                    "url": link,
                    "_published": dt.isoformat(),
                }
            )

    # Atom fallback
    if not rows:
        atom = "{http://www.w3.org/2005/Atom}"
        for entry in root.findall(f".//{atom}entry"):
            title = node_text(entry, [f"{atom}title"])
            date_text = node_text(entry, [f"{atom}published", f"{atom}updated"])
            source = default_source
            link = ""
            for link_node in entry.findall(f"{atom}link"):
                href = link_node.attrib.get("href", "")
                rel = link_node.attrib.get("rel", "alternate")
                if href and rel in ("alternate", ""):
                    link = href
                    break
            dt = parse_datetime(date_text)
            if title and link:
                rows.append(
                    {
                        "title": title,
                        "source": source,
                        "date": display_date(dt),
                        "url": link,
                        "_published": dt.isoformat(),
                    }
                )
    return rows


def normalized_title(text: str) -> str:
    text = clean(text).lower()
    text = re.sub(r"[^0-9a-z가-힣]+", "", text)
    return text


def merge_and_limit(groups: Iterable[list[dict]], limit: int) -> list[dict]:
    merged: list[dict] = []
    seen_titles: set[str] = set()
    seen_urls: set[str] = set()

    for group in groups:
        for item in group:
            title_key = normalized_title(item.get("title", ""))
            url_key = clean(item.get("url", ""))
            if not title_key or len(title_key) < 6:
                continue
            if title_key in seen_titles or (url_key and url_key in seen_urls):
                continue
            seen_titles.add(title_key)
            if url_key:
                seen_urls.add(url_key)
            merged.append(item)

    merged.sort(key=lambda row: row.get("_published", ""), reverse=True)
    result = merged[:limit]
    for row in result:
        row.pop("_published", None)
    return result


def collect_google_queries(queries: list[str], language: str) -> tuple[list[dict], list[str]]:
    groups: list[list[dict]] = []
    errors: list[str] = []
    for query in queries:
        try:
            groups.append(parse_rss(google_news_rss(query, language)))
        except Exception as exc:  # continue collecting from the remaining feeds
            errors.append(f"{query}: {exc}")
    return merge_and_limit(groups, MAX_ITEMS_PER_SECTION), errors


def collect_nature() -> tuple[list[dict], list[str]]:
    groups: list[list[dict]] = []
    errors: list[str] = []
    for url in NATURE_RSS:
        try:
            groups.append(parse_rss(url, default_source="Nature"))
        except Exception as exc:
            errors.append(f"{url}: {exc}")
    return merge_and_limit(groups, MAX_ITEMS_PER_SECTION), errors


def main() -> int:
    payload = {
        "updated_at": datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
        "domestic": [],
        "government": [],
        "overseas": [],
        "nature": [],
        "errors": [],
    }

    payload["domestic"], errors = collect_google_queries(DOMESTIC_QUERIES, "ko")
    payload["errors"].extend(f"domestic: {error}" for error in errors)

    payload["government"], errors = collect_google_queries(GOVERNMENT_QUERIES, "ko")
    payload["errors"].extend(f"government: {error}" for error in errors)

    payload["overseas"], errors = collect_google_queries(OVERSEAS_QUERIES, "en")
    payload["errors"].extend(f"overseas: {error}" for error in errors)

    payload["nature"], errors = collect_nature()
    payload["errors"].extend(f"nature: {error}" for error in errors)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    counts = ", ".join(
        f"{key}:{len(payload[key])}"
        for key in ("domestic", "government", "overseas", "nature")
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)}; counts={counts}")
    for error in payload["errors"]:
        print("WARNING", error, file=sys.stderr)

    return 0 if any(payload[key] for key in ("domestic", "government", "overseas", "nature")) else 1


if __name__ == "__main__":
    raise SystemExit(main())
