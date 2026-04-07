#!/usr/bin/env python3
"""Ingest .docx and .pdf files from local folders into raw/documents/.

Usage:
    python scripts/ingest_documents.py <folder_path> [--output_dir <dir>] [--exclude <pattern>]

Supports multiple --exclude patterns. Temp files (~$*) are always skipped.
"""

import os
import re
import sys
from datetime import datetime
from hashlib import md5

import docx
import pdfplumber

# Add scripts dir to path for utils import
sys.path.insert(0, os.path.dirname(__file__))
from utils import generate_slug, build_entry


SUPPORTED_EXTENSIONS = {".docx", ".pdf"}
ALWAYS_SKIP = {"~$", ".DS_Store"}


def extract_docx_text(filepath: str) -> str:
    """Extract plain text from a .docx file."""
    doc = docx.Document(filepath)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def extract_pdf_text(filepath: str) -> str:
    """Extract plain text from a .pdf file."""
    text_parts = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def scan_folder(folder_path: str, exclude_patterns: list[str]) -> list[str]:
    """Find all .docx and .pdf files, skipping excluded patterns and temp files."""
    files = []
    for root, dirs, filenames in os.walk(folder_path):
        # Skip hidden dirs
        dirs[:] = [d for d in dirs if not d.startswith(".")]

        for fname in filenames:
            # Skip temp files
            if any(fname.startswith(skip) for skip in ALWAYS_SKIP):
                continue

            ext = os.path.splitext(fname)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, folder_path)

            # Check exclude patterns
            if any(pattern in rel_path for pattern in exclude_patterns):
                continue

            files.append(full_path)

    return sorted(files)


def process_file(filepath: str, folder_path: str) -> dict | None:
    """Extract content and metadata from a single document."""
    ext = os.path.splitext(filepath)[1].lower()
    rel_path = os.path.relpath(filepath, folder_path)
    filename = os.path.basename(filepath)
    title = os.path.splitext(filename)[0]

    try:
        if ext == ".docx":
            body = extract_docx_text(filepath)
        elif ext == ".pdf":
            body = extract_pdf_text(filepath)
        else:
            return None
    except Exception as e:
        print(f"  Warning: could not read {rel_path}: {e}")
        return None

    if not body or len(body.strip()) < 20:
        print(f"  Skipping {rel_path}: too short ({len(body.strip())} chars)")
        return None

    # Date from file mtime
    mtime = os.path.getmtime(filepath)
    date = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")

    # Tags from parent directory name
    parent_dir = os.path.basename(os.path.dirname(filepath))
    folder_name = os.path.basename(folder_path)
    tags = []
    if parent_dir != folder_name:
        tags.append(parent_dir)
    tags.append(folder_name)

    return {
        "title": title,
        "date": date,
        "source_path": rel_path,
        "body": body,
        "tags": tags,
        "ext": ext,
    }


def ingest(folder_path: str, output_dir: str, exclude_patterns: list[str]) -> None:
    """Ingest all documents from folder_path into output_dir."""
    os.makedirs(output_dir, exist_ok=True)

    folder_name = os.path.basename(folder_path.rstrip("/"))
    files = scan_folder(folder_path, exclude_patterns)
    print(f"Found {len(files)} documents in {folder_name}. Ingesting...")

    written = 0
    for filepath in files:
        entry_data = process_file(filepath, folder_path)
        if not entry_data:
            continue

        path_hash = md5(entry_data["source_path"].encode()).hexdigest()[:8]
        entry_id = f"doc_{path_hash}"

        slug = generate_slug(entry_data["title"])
        output_filename = f"{entry_data['date']}_{slug}.md"
        output_path = os.path.join(output_dir, output_filename)

        entry_content = build_entry(
            entry_id=entry_id,
            date=entry_data["date"],
            source_type="document",
            source_path=f"{folder_name}/{entry_data['source_path']}",
            title=entry_data["title"],
            body=entry_data["body"],
            tags=entry_data["tags"],
            images=[],
        )

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(entry_content)
        written += 1

    print(f"Ingested {written} documents (skipped {len(files) - written}) → {output_dir}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Ingest documents into personal wiki")
    parser.add_argument("folder", help="Source folder path")
    parser.add_argument("--output-dir", default=None, help="Output directory (default: raw/documents/)")
    parser.add_argument("--exclude", action="append", default=[], help="Exclude paths containing this string (repeatable)")

    args = parser.parse_args()

    folder = os.path.expanduser(args.folder)
    output = args.output_dir or os.path.join(
        os.path.dirname(__file__), "..", "raw", "documents"
    )
    output = os.path.abspath(output)

    ingest(folder, output, args.exclude)
