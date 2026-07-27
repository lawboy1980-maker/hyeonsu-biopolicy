import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import recurring_ical_events
import requests
from icalendar import Calendar

TZ = ZoneInfo("Asia/Seoul")
OUT = Path("data/agenda.json")


def normalize_datetime(value):
    if isinstance(value, datetime):
        dt = value
        all_day = False
    else:
        dt = datetime.combine(value, datetime.min.time())
        all_day = True

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TZ)
    else:
        dt = dt.astimezone(TZ)
    return dt, all_day


def main():
    url = os.environ.get("ICAL_URL", "").strip()
    if not url:
        raise RuntimeError("GitHub Secret ICAL_URL is missing.")

    now = datetime.now(TZ)
    range_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    range_end = range_start + timedelta(days=8)

    response = requests.get(url, timeout=30)
    response.raise_for_status()
    cal = Calendar.from_ical(response.content)

    events = []
    for event in recurring_ical_events.of(cal).between(range_start, range_end):
        start, all_day = normalize_datetime(event.decoded("DTSTART"))
        end_value = event.get("DTEND")
        if end_value:
            end, _ = normalize_datetime(event.decoded("DTEND"))
        else:
            end = start + (timedelta(days=1) if all_day else timedelta(hours=1))

        title = str(event.get("SUMMARY", "제목 없는 일정"))
        location = str(event.get("LOCATION", ""))
        description = str(event.get("DESCRIPTION", ""))
        uid = str(event.get("UID", f"{title}-{start.isoformat()}"))

        events.append({
            "id": uid,
            "title": title,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "all_day": all_day,
            "location": location,
            "description": description,
        })

    events.sort(key=lambda item: item["start"])
    today_end = range_start + timedelta(days=1)
    today_count = sum(
        1 for event in events
        if datetime.fromisoformat(event["start"]) < today_end
        and datetime.fromisoformat(event["end"]) > range_start
    )

    payload = {
        "status": "ok",
        "updated_at": now.isoformat(),
        "timezone": "Asia/Seoul",
        "range_start": range_start.isoformat(),
        "range_end": range_end.isoformat(),
        "today_count": today_count,
        "week_count": len(events),
        "events": events,
        "message": "",
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(events)} events to {OUT}")


if __name__ == "__main__":
    main()
