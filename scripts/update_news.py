#!/usr/bin/env python3
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

import feedparser
import requests

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
OUTPUT_PATH = ROOT / "data" / "news.json"
KST = timezone(timedelta(hours=9))
USER_AGENT = "HsLab-BioIN-Hub/6.1 (+GitHub Actions)"
REQUEST_TIMEOUT = 30
MAX_ITEMS_PER_SECTION = 20

BIOIN_FEEDS = {
    "news": {"name": "BioIN 뉴스", "url": "https://www.bioin.or.kr/rss/rssNews.xml"},
    "trend": {"name": "BioIN 동향", "url": "https://www.bioin.or.kr/rss/rssTrend.xml"},
    "knowledge": {"name": "BioIN 지식", "url": "https://www.bioin.or.kr/rss/rssKnow.xml"},
    "publication": {"name": "BioIN 발간물", "url": "https://www.bioin.or.kr/rss/rssPblcte.xml"},
}


def normalize_text(value: object) -> str:
    if value is None:
        return ""
    return " ".join(str(value).replace("\xa0", " ").split())


def fetch_feed(url: str) -> feedparser.FeedParserDict:
    response = requests.get(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    return feedparser.parse(response.content)


def entry_datetime(entry) -> datetime | None:
    for struct_key in ("published_parsed", "updated_parsed", "created_parsed"):
        parsed = entry.get(struct_key)
        if parsed:
            return datetime(*parsed[:6], tzinfo=timezone.utc)

    for text_key in ("published", "updated", "created", "pubDate"):
        value = entry.get(text_key)
        if not value:
            continue
        try:
            dt = parsedate_to_datetime(value)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except (TypeError, ValueError, OverflowError):
            continue
    return None


def make_item(entry, source_name: str) -> dict:
    dt = entry_datetime(entry)
    item = {
        "title": normalize_text(entry.get("title")) or "제목이 없는 자료",
        "source": source_name,
        "date": dt.astimezone(KST).strftime("%Y-%m-%d") if dt else "",
        "url": normalize_text(entry.get("link")),
        "_ts": int(dt.timestamp()) if dt else 0,
    }
    return item


def deduplicate_and_limit(items: list[dict], limit: int) -> list[dict]:
    unique: dict[str, dict] = {}
    for item in items:
        key = " ".join(item["title"].lower().split())
        previous = unique.get(key)
        if previous is None or item["_ts"] > previous["_ts"]:
            unique[key] = item
    ordered = sorted(unique.values(), key=lambda item: item["_ts"], reverse=True)[:limit]
    for item in ordered:
        item.pop("_ts", None)
    return ordered


def collect_section(spec: dict, errors: list[str]) -> list[dict]:
    try:
        feed = fetch_feed(spec["url"])
        if getattr(feed, "bozo", False) and not feed.entries:
            raise RuntimeError(str(getattr(feed, "bozo_exception", "invalid RSS")))
        items = [make_item(entry, spec["name"]) for entry in feed.entries]
        return deduplicate_and_limit(items, MAX_ITEMS_PER_SECTION)
    except Exception as exc:
        errors.append(f'{spec["name"]}: {exc}')
        return []


def load_previous() -> dict:
    if not OUTPUT_PATH.exists():
        return {}
    try:
        return json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def preserve_if_empty(key: str, current: list[dict], previous: dict, errors: list[str]) -> list[dict]:
    if current:
        return current
    prior = previous.get(key)
    if isinstance(prior, list) and prior:
        errors.append(f"{key}: 새 수집 결과가 없어 기존 데이터를 유지했습니다.")
        return prior
    return []


def main() -> None:
    errors: list[str] = []
    previous = load_previous()
    sections: dict[str, list[dict]] = {}

    for key, spec in BIOIN_FEEDS.items():
        current = collect_section(spec, errors)
        sections[key] = preserve_if_empty(key, current, previous, errors)

    payload = {
        "updated_at": datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
        **sections,
        "errors": errors,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    counts = ", ".join(f"{key}:{len(value)}" for key, value in sections.items())
    print(f"Wrote data/news.json; counts={counts}")
    for error in errors:
        print(f"WARNING: {error}")


if __name__ == "__main__":
    main()
