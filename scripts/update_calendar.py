#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from icalendar import Calendar
import recurring_ical_events

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "data" / "agenda.json"
KST = ZoneInfo("Asia/Seoul")
TIMEOUT = 30
LOOKAHEAD_DAYS = 8
MAX_EVENTS = 30


def as_kst(value) -> datetime:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=KST)
        return value.astimezone(KST)
    if isinstance(value, date):
        return datetime.combine(value, time.min, tzinfo=KST)
    raise TypeError(f"Unsupported calendar value: {type(value)!r}")


def clean_text(value) -> str:
    return " ".join(str(value or "").replace("\\n", " ").split())


def event_to_dict(component) -> dict:
    raw_start = component.decoded("DTSTART")
    raw_end = component.decoded("DTEND") if component.get("DTEND") else None
    all_day = isinstance(raw_start, date) and not isinstance(raw_start, datetime)

    start = as_kst(raw_start)
    if raw_end is None:
        end = start + (timedelta(days=1) if all_day else timedelta(hours=1))
    else:
        end = as_kst(raw_end)

    return {
        "id": clean_text(component.get("UID")) or f"{start.isoformat()}-{clean_text(component.get('SUMMARY'))}",
        "title": clean_text(component.get("SUMMARY")) or "제목 없는 일정",
        "start": start.isoformat(),
        "end": end.isoformat(),
        "all_day": all_day,
        "location": clean_text(component.get("LOCATION")),
        "description": clean_text(component.get("DESCRIPTION")),
    }


def load_previous() -> dict:
    if not OUTPUT.exists():
        return {}
    try:
        return json.loads(OUTPUT.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def write_payload(payload: dict) -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    ical_url = os.environ.get("ICAL_URL", "").strip()
    if not ical_url:
        raise RuntimeError("GitHub Actions secret ICAL_URL is not configured.")

    now = datetime.now(KST)
    range_start = datetime.combine(now.date(), time.min, tzinfo=KST)
    range_end = range_start + timedelta(days=LOOKAHEAD_DAYS)

    response = requests.get(
        ical_url,
        timeout=TIMEOUT,
        headers={"User-Agent": "HsLab-Calendar-Updater/1.0"},
    )
    response.raise_for_status()

    calendar = Calendar.from_ical(response.content)
    components = recurring_ical_events.of(calendar).between(range_start, range_end)
    events = [event_to_dict(component) for component in components]

    deduped = {}
    for event in events:
        key = (event["id"], event["start"])
        deduped[key] = event

    ordered = sorted(deduped.values(), key=lambda item: (item["start"], item["title"]))[:MAX_EVENTS]
    today = now.date().isoformat()
    today_count = sum(1 for item in ordered if item["start"][:10] == today)

    payload = {
        "status": "ok",
        "updated_at": now.isoformat(),
        "timezone": "Asia/Seoul",
        "range_start": range_start.isoformat(),
        "range_end": range_end.isoformat(),
        "today_count": today_count,
        "week_count": len(ordered),
        "events": ordered,
        "message": "",
    }
    write_payload(payload)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(ordered)} events ({today_count} today).")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        previous = load_previous()
        now = datetime.now(KST)
        if previous.get("events"):
            previous["status"] = "stale"
            previous["message"] = f"캘린더 갱신 실패: {exc}"
            previous["last_attempt_at"] = now.isoformat()
            write_payload(previous)
            print(previous["message"])
        else:
            write_payload({
                "status": "error",
                "updated_at": now.isoformat(),
                "timezone": "Asia/Seoul",
                "today_count": 0,
                "week_count": 0,
                "events": [],
                "message": f"캘린더 갱신 실패: {exc}",
            })
            raise
