#!/usr/bin/env python3
"""Fetch selected KBIOIS indicators and build a static JSON cache for GitHub Pages."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any

TOTAL_LABELS = {"합계", "전체", "총계", "계"}


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def request_json(base_url: str, api_key: str, statbl_id: str, cycle: str, year: int,
                 timeout: int = 30, retries: int = 2) -> dict[str, Any]:
    params = {
        "KEY": api_key,
        "STATBL_ID": statbl_id,
        "DTACYCLE_CD": cycle,
        "WRTTIME_IDTFR_ID": str(year),
        "Type": "json",
        "pIndex": "1",
        "pSize": "1000"
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    headers = {"User-Agent": "HyLab-KBIOIS-Pilot/1.0"}
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8-sig"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"KBIOIS request failed: {statbl_id}/{year}: {last_error}")


def extract_rows(payload: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, str]]:
    # KBIOIS response wrapper casing differs across examples; detect it defensively.
    wrapper = next((v for k, v in payload.items() if k.lower() == "sttsapitbldata"), None)
    if not isinstance(wrapper, list):
        return [], {"code": "INVALID_RESPONSE", "message": "SttsApiTblData wrapper not found"}
    status = {"code": "", "message": ""}
    rows: list[dict[str, Any]] = []
    for block in wrapper:
        if not isinstance(block, dict):
            continue
        if isinstance(block.get("head"), list):
            for head in block["head"]:
                result = head.get("RESULT") if isinstance(head, dict) else None
                if isinstance(result, dict):
                    status = {"code": str(result.get("CODE", "")), "message": str(result.get("MESSAGE", ""))}
        if isinstance(block.get("row"), list):
            rows.extend(r for r in block["row"] if isinstance(r, dict))
    return rows, status


def to_number(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", ""))
    except ValueError:
        return None


def normalize_label(row: dict[str, Any]) -> str:
    return str(row.get("CLS_NM") or row.get("GRP_NM") or row.get("ITM_NM") or "미분류").strip()


def aggregate_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
    by_field: dict[str, float] = defaultdict(float)
    explicit_total: float | None = None
    unit = ""
    for row in rows:
        value = to_number(row.get("DTA_VAL"))
        if value is None:
            continue
        label = normalize_label(row)
        unit = unit or str(row.get("UI_NM") or "")
        if label in TOTAL_LABELS:
            explicit_total = value
        else:
            by_field[label] += value
    total = explicit_total if explicit_total is not None else sum(by_field.values())
    fields = [{"name": k, "value": v} for k, v in sorted(by_field.items(), key=lambda x: x[1], reverse=True)]
    return {"total": total, "fields": fields, "api_unit": unit}


def merge_sources(source_results: list[dict[str, Any]], method: str) -> dict[str, Any]:
    if method == "single_source":
        return source_results[0] if source_results else {"total": 0, "fields": [], "api_unit": ""}
    totals = 0.0
    fields: dict[str, float] = defaultdict(float)
    api_units: list[str] = []
    for result in source_results:
        totals += float(result.get("total") or 0)
        if result.get("api_unit"):
            api_units.append(str(result["api_unit"]))
        for item in result.get("fields", []):
            fields[str(item["name"])] += float(item["value"])
    return {
        "total": totals,
        "fields": [{"name": k, "value": v} for k, v in sorted(fields.items(), key=lambda x: x[1], reverse=True)],
        "api_unit": " + ".join(dict.fromkeys(api_units))
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="config/kbiois-indicators.json")
    parser.add_argument("--output", default="data/kbiois-pilot.json")
    parser.add_argument("--start-year", type=int)
    parser.add_argument("--end-year", type=int)
    parser.add_argument("--strict", action="store_true", help="fail when any year/source request fails")
    args = parser.parse_args()

    api_key = os.environ.get("KBIOIS_API_KEY", "").strip()
    if not api_key:
        print("ERROR: KBIOIS_API_KEY environment variable is required.", file=sys.stderr)
        return 2

    config_path = Path(args.config)
    output_path = Path(args.output)
    config = load_json(config_path)
    start_year = args.start_year or int(config.get("start_year", 2016))
    end_year = args.end_year or dt.date.today().year

    output: dict[str, Any] = {
        "provider": config.get("provider", "KBIOIS"),
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "period": {"start": start_year, "end": end_year},
        "indicators": [],
        "errors": []
    }

    for indicator in config["indicators"]:
        series = []
        for year in range(start_year, end_year + 1):
            source_results = []
            year_errors = []
            for source in indicator["sources"]:
                try:
                    payload = request_json(
                        config["base_url"], api_key, source["statbl_id"], config.get("cycle", "YY"), year
                    )
                    rows, status = extract_rows(payload)
                    if status.get("code") and status["code"] != "INFO-000":
                        raise RuntimeError(f"{status['code']}: {status['message']}")
                    if not rows:
                        year_errors.append(f"{source['statbl_id']}: no rows")
                        continue
                    result = aggregate_rows(rows)
                    result["source"] = source
                    source_results.append(result)
                except Exception as exc:  # continue other indicators/years
                    year_errors.append(str(exc))
            if source_results:
                merged = merge_sources(source_results, indicator.get("method", "single_source"))
                series.append({"year": year, **merged})
            if year_errors:
                output["errors"].append({"indicator": indicator["id"], "year": year, "messages": year_errors})
                if args.strict:
                    print(json.dumps(output["errors"][-1], ensure_ascii=False), file=sys.stderr)
                    return 1

        latest = series[-1] if series else None
        previous = series[-2] if len(series) > 1 else None
        change_rate = None
        if latest and previous and previous.get("total"):
            change_rate = (latest["total"] - previous["total"]) / previous["total"] * 100
        output["indicators"].append({
            "id": indicator["id"],
            "title": indicator["title"],
            "unit": indicator["unit"],
            "method": indicator["method"],
            "sources": indicator["sources"],
            "latest": latest,
            "change_rate": change_rate,
            "series": series
        })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = output_path.with_suffix(output_path.suffix + ".tmp")
    temp_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_path.replace(output_path)
    print(f"Wrote {output_path} with {len(output['indicators'])} indicators; errors={len(output['errors'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
