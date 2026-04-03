#!/usr/bin/env python3
from __future__ import annotations

import json
import time
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

from extract_traklin_filters import parse_filters, validate_filters_document
from traklin_categories import TOP_LEVEL_CATEGORIES, Category


USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
TIMEOUT_SECONDS = 30
RETRY_DELAYS_SECONDS = (1, 3)


def fetch_html(url: str) -> str:
    last_error: Exception | None = None
    for attempt in range(len(RETRY_DELAYS_SECONDS) + 1):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                return response.read().decode("utf-8", errors="replace")
        except Exception as exc:  # pragma: no cover - runtime/network path
            last_error = exc
            if attempt < len(RETRY_DELAYS_SECONDS):
                time.sleep(RETRY_DELAYS_SECONDS[attempt])
    assert last_error is not None
    raise last_error


def refresh_category(category: Category, data_dir: Path) -> dict[str, Any]:
    html = fetch_html(category.url)

    html_path = data_dir / f"traklin_{category.key}_category.html"
    filters_path = data_dir / f"traklin_{category.key}_filters.json"

    html_path.write_text(html, encoding="utf-8")

    result = parse_filters(html=html, source_url=category.url)
    validation_errors = validate_filters_document(result)
    if validation_errors:
        raise ValueError(
            f"validation failed for {category.key}: " + "; ".join(validation_errors)
        )
    result["category_key"] = category.key
    result["category_name"] = category.name
    result["fk_content_id"] = category.fk_content_id
    result["generated_at_utc"] = datetime.now(timezone.utc).isoformat()
    result["html_path"] = str(html_path)
    result["filters_path"] = str(filters_path)

    filters_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


def build_corpus(entries: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "category_count": len(entries),
        "categories": entries,
    }


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    data_dir = repo_root / "data"
    categories_dir = data_dir / "categories"
    data_dir.mkdir(parents=True, exist_ok=True)
    categories_dir.mkdir(parents=True, exist_ok=True)

    entries: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []

    for category in TOP_LEVEL_CATEGORIES:
        try:
            entry = refresh_category(category=category, data_dir=categories_dir)
            entries.append(entry)
            print(
                f"[ok] {category.key}: "
                f"{entry['stats']['groups']} groups / {entry['stats']['options']} options"
            )
        except Exception as exc:  # pragma: no cover - runtime reporting path
            failures.append({"category_key": category.key, "error": str(exc)})
            print(f"[error] {category.key}: {exc}", file=sys.stderr)

    corpus = build_corpus(entries=entries)
    if failures:
        corpus["failures"] = failures

    corpus_path = data_dir / "traklin_filters_corpus.json"
    corpus_path.write_text(json.dumps(corpus, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[done] wrote corpus to {corpus_path}")

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
