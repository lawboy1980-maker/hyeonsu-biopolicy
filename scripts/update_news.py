 #!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote_plus

import feedparser
import requests

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
CONFIG_PATH = ROOT / "config" / "sources.yaml"
OUTPUT_PATH = ROOT / "data" / "news.json"

sys.path.insert(0, str(SCRIPT_DIR))
from filter import contains_any, normalize_text, parse_entry_datetime, source_allowed  # noqa: E402

KST = timezone(timedelta(hours=9))
USER_AGENT = "HsLab-NewsBot/5.0 (+GitHub Actions)"


def load_config() -> dict:
    # sources.yaml is JSON-compatible YAML, so no PyYAML dependency is needed.
    with CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def fetch_feed(url: str, timeout: int) -> feedparser.FeedParserDict:
    response = requests.get(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/xml, text/xml, */*"},
        timeout=timeout,
    )
    response.raise_for_status()
    return feedparser.parse(response.content)


def entry_datetime(entry) -> datetime | None:
    parsed = parse_entry_datetime(entry)
    if parsed:
        return parsed.astimezone(timezone.utc)
    for key in ("published", "updated", "created"):
        value = entry.get(key)
        if value:
            try:
                dt = parsedate_to_datetime(value)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except Exception:
                continue
    return None


def clean_google_title(title: str) -> tuple[str, str]:
    title = normalize_text(title)
    if " - " in title:
        article, source = title.rsplit(" - ", 1)
        return article.strip(), source.strip()
    return title, "Google News"


def make_item(title: str, source: str, url: str, dt: datetime | None) -> dict:
    effective = dt or datetime.now(timezone.utc)
    return {
        "title": normalize_text(title),
        "source": normalize_text(source),
        "date": effective.astimezone(KST).strftime("%Y-%m-%d"),
        "url": url,
        "_ts": int(effective.timestamp()),
    }


def recent_enough(dt: datetime | None, max_age_days: int) -> bool:
    if dt is None:
        return False
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    future_limit = datetime.now(timezone.utc) + timedelta(days=1)
    return cutoff <= dt <= future_limit


def collect_google_news(queries: list[str], allowed_sources: list[str], keywords: list[str], max_age_days: int, timeout: int, errors: list[str]) -> list[dict]:
    items: list[dict] = []
    for query in queries:
        url = (
            "https://news.google.com/rss/search?q="
            + quote_plus(query)
            + "&hl=ko&gl=KR&ceid=KR:ko"
        )
        try:
            feed = fetch_feed(url, timeout)
            for entry in feed.entries:
                title, source = clean_google_title(entry.get("title", ""))
                source_obj = entry.get("source")
                if isinstance(source_obj, dict) and source_obj.get("title"):
                    source = source_obj["title"]
                dt = entry_datetime(entry)
                combined = f"{title} {entry.get('summary', '')}"
                if not recent_enough(dt, max_age_days):
                    continue
                if not contains_any(combined, keywords):
                    continue
                if allowed_sources and not source_allowed(source, allowed_sources):
                    continue
                items.append(make_item(title, source, entry.get("link", ""), dt))
        except Exception as exc:
            errors.append(f"Google News query failed: {query}: {exc}")
    return items


def collect_official_feeds(feeds: list[dict], keywords: list[str], max_age_days: int, timeout: int, errors: list[str]) -> list[dict]:
    items: list[dict] = []
    for spec in feeds:
        name = spec["name"]
        url = spec["url"]
        try:
            feed = fetch_feed(url, timeout)
            for entry in feed.entries:
                title = normalize_text(entry.get("title", ""))
                summary = normalize_text(entry.get("summary", ""))
                dt = entry_datetime(entry)
                if not recent_enough(dt, max_age_days):
                    continue
                if not contains_any(f"{title} {summary}", keywords):
                    continue
                items.append(make_item(title, name, entry.get("link", ""), dt))
        except Exception as exc:
            errors.append(f"Official feed failed: {name}: {exc}")
    return items


def collect_nature(feeds: list[dict], keywords: list[str], max_age_days: int, timeout: int, errors: list[str]) -> list[dict]:
    items: list[dict] = []
    for spec in feeds:
        try:
            feed = fetch_feed(spec["url"], timeout)
            for entry in feed.entries:
                title = normalize_text(entry.get("title", ""))
                summary = normalize_text(entry.get("summary", ""))
                dt = entry_datetime(entry)
                if not recent_enough(dt, max_age_days):
                    continue
                if not contains_any(f"{title} {summary}", keywords):
                    continue
                items.append(make_item(title, spec["name"], entry.get("link", ""), dt))
        except Exception as exc:
            errors.append(f"Nature feed failed: {spec['name']}: {exc}")
    return items


def deduplicate_and_limit(items: list[dict], limit: int) -> list[dict]:
    best: dict[str, dict] = {}
    for item in items:
        key = " ".join(item["title"].lower().split())
        previous = best.get(key)
        if previous is None or item["_ts"] > previous["_ts"]:
            best[key] = item
    ordered = sorted(best.values(), key=lambda x: x["_ts"], reverse=True)[:limit]
    for item in ordered:
        item.pop("_ts", None)
    return ordered


def load_previous() -> dict:
    if not OUTPUT_PATH.exists():
        return {}
    try:
        return json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def preserve_if_empty(name: str, current: list[dict], previous: dict, errors: list[str]) -> list[dict]:
    if current:
        return current
    prior = previous.get(name)
    if isinstance(prior, list) and prior:
        errors.append(f"{name}: new collection empty; preserved previous data")
        return prior
    return []


def main() -> None:
    cfg = load_config()
    settings = cfg["settings"]
    timeout = int(settings["request_timeout_seconds"])
    limit = int(settings["max_items_per_section"])
    errors: list[str] = []

    ko = cfg["bio_keywords_ko"]
    en = cfg["bio_keywords_en"]

    domestic = collect_google_news(
        cfg["domestic"]["queries"], cfg["domestic"]["allowed_sources"], ko,
        int(settings["domestic_max_age_days"]), timeout, errors,
    )
    government = collect_official_feeds(
        cfg["government"]["feeds"], ko,
        int(settings["government_max_age_days"]), timeout, errors,
    )
    overseas = collect_google_news(
        cfg["overseas"]["queries"], cfg["overseas"]["allowed_sources"], en,
        int(settings["overseas_max_age_days"]), timeout, errors,
    )
    nature = collect_nature(
        cfg["nature"]["feeds"], en,
        int(settings["nature_max_age_days"]), timeout, errors,
    )

    domestic = deduplicate_and_limit(domestic, limit)
    government = deduplicate_and_limit(government, limit)
    overseas = deduplicate_and_limit(overseas, limit)
    nature = deduplicate_and_limit(nature, limit)

    previous = load_previous()
    domestic = preserve_if_empty("domestic", domestic, previous, errors)
    government = preserve_if_empty("government", government, previous, errors)
    overseas = preserve_if_empty("overseas", overseas, previous, errors)
    nature = preserve_if_empty("nature", nature, previous, errors)

    payload = {
        "updated_at": datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
        "domestic": domestic,
        "government": government,
        "overseas": overseas,
        "nature": nature,
        "errors": errors,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        "Wrote data/news.json; counts="
        f"domestic:{len(domestic)}, government:{len(government)}, "
        f"overseas:{len(overseas)}, nature:{len(nature)}"
    )
    if errors:
        print("Warnings:")
        for error in errors:
            print(f"- {error}")


if __name__ == "__main__":
    main()
