#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


COUNT_RE = re.compile(r"\[(\d+)\]\s*$")
FILTER_ID_RE = re.compile(r"(?:FilterCategoryProductsByManufacturers|FilterCategoryProducts)\(this,(\d+)\)")
TITLE_CLEAN_RE = re.compile(r"\s+Logo Whatsapp\s*$")
CANONICAL_RE = re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', re.IGNORECASE)
OG_URL_RE = re.compile(r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\']([^"\']+)["\']', re.IGNORECASE)


@dataclass
class Option:
    raw_input_id: str | None
    filter_id: int | None
    param: str | None
    label: str = ""
    count: int | None = None

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "id": self.filter_id,
            "label": self.label,
            "count": self.count,
            "param": self.param,
            "raw_input_id": self.raw_input_id,
        }
        return payload


@dataclass
class Group:
    raw_group_id: str
    group_name: str
    options: list[Option] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "group_id": self.raw_group_id.replace("filter_group_", ""),
            "raw_group_id": self.raw_group_id,
            "group_name": self.group_name,
            "options": [option.to_dict() for option in self.options if option.filter_id is not None],
        }
        if self.raw_group_id == "filter_group_p":
            payload["param"] = "prange"
        elif self.options:
            params = sorted({option.param for option in self.options if option.param})
            if len(params) == 1:
                payload["param"] = params[0]
            elif params:
                payload["param"] = params
        return payload


class TraklinFilterParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.groups: list[Group] = []
        self._last_header_text = ""
        self._header_text_parts: list[str] = []
        self._current_group: Group | None = None
        self._group_depth = 0
        self._current_label_parts: list[str] | None = None
        self._last_option: Option | None = None
        self._in_header = False
        self._title_parts: list[str] = []
        self._capture_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        class_attr = attr_map.get("class", "") or ""

        if tag == "title":
            self._capture_title = True

        if tag == "h2" and "a_filter_group_header" in class_attr:
            self._in_header = True
            self._header_text_parts = []
            return

        div_id = attr_map.get("id") or ""
        if tag == "div" and div_id.startswith("filter_group_"):
            if self._current_group is None:
                self._current_group = Group(raw_group_id=div_id, group_name=self._last_header_text.strip())
                self._group_depth = 1
            else:
                self._group_depth += 1
            return

        if self._current_group is None:
            return

        if tag == "div":
            self._group_depth += 1
            return

        if tag == "input":
            input_id = attr_map.get("id")
            if not input_id or not input_id.startswith("chk_"):
                return
            onclick = attr_map.get("onclick") or ""
            filter_id_match = FILTER_ID_RE.search(onclick)
            filter_id = int(filter_id_match.group(1)) if filter_id_match else None
            param = None
            if input_id.startswith("chk_m_"):
                param = "pm"
            elif input_id.startswith("chk_g_"):
                param = "pfacg"
            option = Option(raw_input_id=input_id, filter_id=filter_id, param=param)
            self._current_group.options.append(option)
            self._last_option = option
            return

        if tag == "label" and self._current_group is not None:
            self._current_label_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._capture_title = False
            return

        if tag == "h2" and self._in_header:
            self._in_header = False
            self._last_header_text = self._normalize("".join(self._header_text_parts))
            return

        if self._current_group is None:
            return

        if tag == "label" and self._current_label_parts is not None:
            if self._last_option is not None and not self._last_option.label:
                label_text = self._normalize("".join(self._current_label_parts))
                count_match = COUNT_RE.search(label_text)
                if count_match:
                    self._last_option.count = int(count_match.group(1))
                    label_text = COUNT_RE.sub("", label_text).strip()
                self._last_option.label = label_text
            self._current_label_parts = None
            return

        if tag == "div":
            self._group_depth -= 1
            if self._group_depth == 0 and self._current_group is not None:
                self.groups.append(self._current_group)
                self._current_group = None
                self._last_option = None

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self._title_parts.append(data)
        if self._in_header:
            self._header_text_parts.append(data)
        if self._current_label_parts is not None:
            self._current_label_parts.append(data)

    @property
    def title(self) -> str:
        title = self._normalize("".join(self._title_parts))
        return TITLE_CLEAN_RE.sub("", title).strip()

    @staticmethod
    def _normalize(text: str) -> str:
        return " ".join(text.replace("\xa0", " ").split())


def extract_page_url(html: str) -> str | None:
    for pattern in (CANONICAL_RE, OG_URL_RE):
        match = pattern.search(html)
        if match:
            return match.group(1).strip()
    return None


def parse_filters(html: str, source_url: str | None = None) -> dict[str, Any]:
    parser = TraklinFilterParser()
    parser.feed(html)
    resolved_source_url = source_url or extract_page_url(html) or ""

    filters = [group.to_dict() for group in parser.groups if group.options or group.raw_group_id == "filter_group_p"]
    total_options = sum(len(group["options"]) for group in filters if isinstance(group.get("options"), list))

    return {
        "source_url": resolved_source_url,
        "page_title": parser.title,
        "filters": filters,
        "stats": {
            "groups": len(filters),
            "options": total_options,
        },
    }


def validate_filters_document(document: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    filters = document.get("filters", [])

    if not document.get("source_url"):
        errors.append("missing source_url")
    if not document.get("page_title"):
        errors.append("missing page_title")
    if not isinstance(filters, list) or not filters:
        errors.append("missing filters")
        return errors

    seen_group_ids: set[str] = set()
    total_options = 0

    for group_index, group in enumerate(filters):
        group_id = str(group.get("group_id", ""))
        group_name = str(group.get("group_name", "")).strip()
        options = group.get("options", [])

        if not group_id:
            errors.append(f"group[{group_index}] missing group_id")
        elif group_id in seen_group_ids:
            errors.append(f"group[{group_index}] duplicate group_id={group_id}")
        else:
            seen_group_ids.add(group_id)

        if not group_name:
            errors.append(f"group[{group_index}] missing group_name")

        if not isinstance(options, list):
            errors.append(f"group[{group_index}] options is not a list")
            continue

        seen_option_ids: set[int] = set()
        for option_index, option in enumerate(options):
            option_id = option.get("id")
            label = str(option.get("label", "")).strip()

            if option_id is None:
                errors.append(f"group[{group_id}] option[{option_index}] missing id")
            elif option_id in seen_option_ids:
                errors.append(f"group[{group_id}] duplicate option id={option_id}")
            else:
                seen_option_ids.add(option_id)

            if option_id is not None and not label:
                errors.append(f"group[{group_id}] option[{option_index}] missing label")

        total_options += len(options)

    stats = document.get("stats", {})
    if stats.get("groups") != len(filters):
        errors.append(
            f"stats.groups={stats.get('groups')} does not match extracted groups={len(filters)}"
        )
    if stats.get("options") != total_options:
        errors.append(
            f"stats.options={stats.get('options')} does not match extracted options={total_options}"
        )

    return errors


def main() -> None:
    argp = argparse.ArgumentParser(description="Extract Traklin category filter metadata from saved HTML.")
    argp.add_argument("html_path", type=Path, help="Path to a saved category HTML file.")
    argp.add_argument("--source-url")
    argp.add_argument(
        "--output",
        type=Path,
        default=Path("data/categories/traklin_tv_filters.json"),
        help="Where to write the extracted JSON.",
    )
    args = argp.parse_args()

    html = args.html_path.read_text(encoding="utf-8")
    result = parse_filters(html=html, source_url=args.source_url)
    errors = validate_filters_document(result)
    if errors:
        raise SystemExit("Validation failed:\n- " + "\n- ".join(errors))
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {result['stats']['groups']} groups / {result['stats']['options']} options to {args.output}")


if __name__ == "__main__":
    main()
