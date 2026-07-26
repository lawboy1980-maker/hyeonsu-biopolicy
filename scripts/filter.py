from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Iterable


def normalize_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def contains_any(text: str, keywords: Iterable[str]) -> bool:
    haystack = normalize_text(text).lower()
    return any(keyword.lower() in haystack for keyword in keywords)


def source_allowed(source: str, allowed_sources: Iterable[str]) -> bool:
    cleaned = normalize_text(source).lower()
    return any(item.lower() in cleaned or cleaned in item.lower() for item in allowed_sources)


def parse_entry_datetime(entry) -> datetime | None:
    for attr in ("published_parsed", "updated_parsed", "created_parsed"):
        value = getattr(entry, attr, None)
        if value:
            try:
                return datetime(*value[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return None
