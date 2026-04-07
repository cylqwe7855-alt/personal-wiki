#!/usr/bin/env python3
"""Ingest Apple Notes into raw/apple-notes/ via AppleScript.

Usage:
    python scripts/ingest_apple_notes.py [output_dir]

Requires macOS. Accesses Notes via AppleScript (no Full Disk Access needed).
"""

import os
import re
import subprocess
import sys
from hashlib import md5

# Add scripts dir to path for utils import
sys.path.insert(0, os.path.dirname(__file__))
from utils import generate_slug, build_entry


def _run_osascript(script: str) -> str:
    """Run an AppleScript and return stdout."""
    result = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True, text=True, timeout=120,
    )
    if result.returncode != 0:
        raise RuntimeError(f"osascript failed: {result.stderr.strip()}")
    return result.stdout.strip()


def get_note_count() -> int:
    return int(_run_osascript('tell application "Notes" to return count of notes'))


def get_note_data(index: int) -> dict | None:
    """Fetch a single note's metadata and body by 1-based index."""
    # Use a delimiter that won't appear in normal text
    delim = "<<<NOTE_FIELD_SEP>>>"
    script = f'''
tell application "Notes"
    set n to note {index}
    set t to name of n
    set d to creation date of n
    set m to modification date of n
    set b to plaintext of n
    try
        set f to name of container of n
    on error
        set f to "Notes"
    end try
    set ds to (year of d as string) & "-"
    if (month of d as integer) < 10 then set ds to ds & "0"
    set ds to ds & (month of d as integer as string) & "-"
    if (day of d as integer) < 10 then set ds to ds & "0"
    set ds to ds & (day of d as integer as string)
    set ms to (year of m as string) & "-"
    if (month of m as integer) < 10 then set ms to ms & "0"
    set ms to ms & (month of m as integer as string) & "-"
    if (day of m as integer) < 10 then set ms to ms & "0"
    set ms to ms & (day of m as integer as string)
    return t & "{delim}" & ds & "{delim}" & ms & "{delim}" & f & "{delim}" & b
end tell
'''
    try:
        raw = _run_osascript(script)
    except Exception as e:
        print(f"  Warning: skipping note {index}: {e}")
        return None

    parts = raw.split(delim, 4)
    if len(parts) < 5:
        print(f"  Warning: skipping note {index}: unexpected format ({len(parts)} parts)")
        return None

    title, created, modified, folder, body = parts
    return {
        "title": title.strip() or f"Untitled Note {index}",
        "created": created.strip(),
        "modified": modified.strip(),
        "folder": folder.strip(),
        "body": body.strip(),
    }


def ingest(output_dir: str) -> None:
    """Ingest all Apple Notes into output_dir."""
    os.makedirs(output_dir, exist_ok=True)

    count = get_note_count()
    print(f"Found {count} Apple Notes. Ingesting...")

    written = 0
    for i in range(1, count + 1):
        if i % 20 == 0:
            print(f"  Processing {i}/{count}...")

        note = get_note_data(i)
        if not note:
            continue

        # Skip very short notes (< 10 chars body) — likely empty or trivial
        if len(note["body"]) < 10:
            continue

        path_key = f"apple-notes/{note['folder']}/{note['title']}"
        path_hash = md5(path_key.encode()).hexdigest()[:8]
        entry_id = f"applenotes_{path_hash}"

        date = note["created"]
        tags = [note["folder"]] if note["folder"] != "Notes" else []

        slug = generate_slug(note["title"])
        output_filename = f"{date}_{slug}.md"
        output_path = os.path.join(output_dir, output_filename)

        entry_content = build_entry(
            entry_id=entry_id,
            date=date,
            source_type="apple-notes",
            source_path=f"{note['folder']}/{note['title']}",
            title=note["title"],
            body=note["body"],
            tags=tags,
            images=[],
        )

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(entry_content)
        written += 1

    print(f"Ingested {written} notes (skipped {count - written} short/empty) → {output_dir}")


if __name__ == "__main__":
    output = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), "..", "raw", "apple-notes"
    )
    output = os.path.abspath(output)
    ingest(output)
