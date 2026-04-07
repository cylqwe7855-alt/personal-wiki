"""Shared utilities for personal-wiki ingestion scripts."""

import re
from datetime import date as _date
import yaml
from slugify import slugify


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown content.
    Returns (metadata_dict, body_text). If no frontmatter, returns ({}, full_content).
    """
    if not content.startswith("---"):
        return {}, content

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content

    yaml_str = parts[1].strip()
    body = parts[2]

    if not yaml_str:
        return {}, body

    try:
        meta = yaml.safe_load(yaml_str)
        if not isinstance(meta, dict):
            return {}, content
        return meta, body
    except yaml.YAMLError:
        return {}, content


def extract_date_from_filename(filename: str) -> str | None:
    """Extract YYYY-MM-DD date from filename if present."""
    match = re.match(r"(\d{4}-\d{2}-\d{2})", filename)
    if match:
        try:
            _date.fromisoformat(match.group(1))
            return match.group(1)
        except ValueError:
            return None
    return None


def generate_slug(title: str) -> str:
    """Generate a URL-safe slug from a title. Handles Chinese characters."""
    return slugify(title, allow_unicode=True, max_length=80)


_YAML_SPECIAL_CHARS = re.compile(r'[:#\[\]{}&*!,|>\'"%@`]|^[-?]')

_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")

_NUMERIC_PATTERN = re.compile(r"^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$")

# YAML 1.1 words that coerce to booleans or null without quoting.
_YAML_BOOLISH = frozenset({
    "true", "false", "yes", "no", "on", "off",
    "True", "False", "Yes", "No", "On", "Off",
    "TRUE", "FALSE", "YES", "NO", "ON", "OFF",
    "null", "Null", "NULL", "~",
})


def _yaml_scalar(value: str) -> str:
    """Serialize a string scalar for YAML frontmatter, quoting reserved values."""
    if not value:
        return "''"
    # YAML 1.1 boolean / null reserved words must be quoted to stay as strings.
    if value in _YAML_BOOLISH:
        return f'"{value}"'
    # Date strings (YYYY-MM-DD) must be quoted so YAML 1.1 parsers don't coerce
    # them into datetime.date objects.
    if _DATE_PATTERN.match(value):
        return f'"{value}"'
    # Bare numeric strings (e.g. "123", "3.14") must be quoted to stay as strings.
    if _NUMERIC_PATTERN.match(value):
        return f'"{value}"'
    # Any string with YAML special chars gets double-quoted.
    if _YAML_SPECIAL_CHARS.search(value):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    return value


def _yaml_field(key: str, value) -> str:
    """Serialize a single YAML frontmatter field as a plain string."""
    if isinstance(value, list):
        if not value:
            return f"{key}: []"
        items = "\n".join(f"- {_yaml_scalar(str(v))}" for v in value)
        return f"{key}:\n{items}"
    else:
        return f"{key}: {_yaml_scalar(str(value))}"


def build_entry(
    entry_id: str,
    date: str,
    source_type: str,
    source_path: str,
    title: str,
    body: str,
    tags: list[str],
    images: list[str],
) -> str:
    """Build a standardized markdown entry with YAML frontmatter."""
    fields = [
        ("id", entry_id),
        ("date", date),
        ("source_type", source_type),
        ("source_path", source_path),
        ("title", title),
        ("tags", tags),
        ("images", images),
    ]
    yaml_str = "\n".join(_yaml_field(k, v) for k, v in fields) + "\n"
    return f"---\n{yaml_str}---\n\n{body}"
