#!/usr/bin/env python3
"""Ingest an Obsidian vault into raw/obsidian/ as standardized entry files.

Usage:
    python scripts/ingest_obsidian.py <vault_path> [output_dir]
"""

import os
import re
import sys
from datetime import datetime
from hashlib import md5

from utils import parse_frontmatter, extract_date_from_filename, generate_slug, build_entry


SKIP_PATTERNS = {"__assets", ".DS_Store", ".obsidian", ".trash"}
TEXT_EXTENSIONS = {".md", ".txt"}


def scan_vault(vault_path: str) -> list[str]:
    """Recursively find all .md and .txt files, skipping assets and system dirs."""
    files = []
    for root, dirs, filenames in os.walk(vault_path):
        dirs[:] = [d for d in dirs if not any(p in d for p in SKIP_PATTERNS) and not d.startswith(".")]
        for fname in filenames:
            if fname.startswith("."):
                continue
            ext = os.path.splitext(fname)[1].lower()
            if ext in TEXT_EXTENSIONS:
                files.append(os.path.join(root, fname))
    return sorted(files)


def process_file(filepath: str, vault_path: str) -> dict:
    """Process a single file and extract structured metadata."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    filename = os.path.basename(filepath)
    rel_path = os.path.relpath(filepath, vault_path)

    meta, body = parse_frontmatter(content)

    # Title: frontmatter > first heading > filename
    title = meta.get("title")
    if not title:
        heading_match = re.match(r"^#\s+(.+)$", body.strip(), re.MULTILINE)
        if heading_match:
            title = heading_match.group(1).strip()
        else:
            title = os.path.splitext(filename)[0]

    # Date: frontmatter > filename > mtime
    date = meta.get("date")
    if date and isinstance(date, datetime):
        date = date.strftime("%Y-%m-%d")
    elif date:
        date = str(date)[:10]
    else:
        date = extract_date_from_filename(filename)
    if not date:
        mtime = os.path.getmtime(filepath)
        date = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")

    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",")]

    # Image references: ![[img.png]] or ![alt](path)
    obsidian_imgs = re.findall(r"!\[\[([^\]]+\.(?:png|jpg|jpeg|gif|webp|svg))\]\]", body, re.IGNORECASE)
    md_imgs = re.findall(r"!\[[^\]]*\]\(([^)]+\.(?:png|jpg|jpeg|gif|webp|svg))\)", body, re.IGNORECASE)
    images = obsidian_imgs + md_imgs

    return {
        "title": title,
        "date": date,
        "source_path": rel_path,
        "body": body,
        "tags": tags,
        "images": images,
    }


def ingest(vault_path: str, output_dir: str) -> None:
    """Ingest all files from vault_path into output_dir as standardized entries."""
    os.makedirs(output_dir, exist_ok=True)

    files = scan_vault(vault_path)

    for filepath in files:
        entry_data = process_file(filepath, vault_path)

        path_hash = md5(entry_data["source_path"].encode()).hexdigest()[:8]
        entry_id = f"obsidian_{path_hash}"

        slug = generate_slug(entry_data["title"])
        output_filename = f"{entry_data['date']}_{slug}.md"
        output_path = os.path.join(output_dir, output_filename)

        entry_content = build_entry(
            entry_id=entry_id,
            date=entry_data["date"],
            source_type="obsidian",
            source_path=entry_data["source_path"],
            title=entry_data["title"],
            body=entry_data["body"],
            tags=entry_data["tags"],
            images=entry_data["images"],
        )

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(entry_content)

    print(f"Ingested {len(files)} files → {output_dir}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest_obsidian.py <vault_path> [output_dir]")
        sys.exit(1)

    vault = os.path.expanduser(sys.argv[1])
    output = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "raw", "obsidian")
    output = os.path.abspath(output)

    ingest(vault, output)
