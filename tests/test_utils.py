import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

from utils import parse_frontmatter, extract_date_from_filename, generate_slug, build_entry


class TestParseFrontmatter:
    def test_with_yaml_frontmatter(self):
        content = "---\ntitle: Hello\ntags: [ai, tech]\n---\n\nBody text here."
        meta, body = parse_frontmatter(content)
        assert meta["title"] == "Hello"
        assert meta["tags"] == ["ai", "tech"]
        assert body.strip() == "Body text here."

    def test_without_frontmatter(self):
        content = "Just plain text\nwith multiple lines."
        meta, body = parse_frontmatter(content)
        assert meta == {}
        assert body == content

    def test_empty_frontmatter(self):
        content = "---\n---\n\nBody."
        meta, body = parse_frontmatter(content)
        assert meta == {}
        assert body.strip() == "Body."


class TestExtractDateFromFilename:
    def test_date_prefix_YYYY_MM_DD(self):
        assert extract_date_from_filename("2026-04-02_some-article.md") == "2026-04-02"

    def test_date_prefix_MMDD(self):
        assert extract_date_from_filename("0402 一晚涨粉 4000.md") == None

    def test_no_date(self):
        assert extract_date_from_filename("Polymarket.md") == None

    def test_invalid_date_rejected(self):
        """9999-99-99 matches the regex but is not a real date."""
        assert extract_date_from_filename("9999-99-99_article.md") is None


class TestGenerateSlug:
    def test_chinese_title(self):
        slug = generate_slug("一晚涨粉 4000，一个 AI 博主的真实 24 小时")
        assert isinstance(slug, str)
        assert len(slug) > 0
        assert " " not in slug

    def test_english_title(self):
        slug = generate_slug("Claude Code Leaked Source")
        assert slug == "claude-code-leaked-source"

    def test_mixed(self):
        slug = generate_slug("Claude Code泄密！万字教程")
        assert isinstance(slug, str)
        assert len(slug) > 0


class TestBuildEntry:
    def test_builds_valid_entry(self):
        entry = build_entry(
            entry_id="obsidian_test_001",
            date="2026-04-02",
            source_type="obsidian",
            source_path="文章库/test.md",
            title="Test Article",
            body="Article body content.",
            tags=[],
            images=["test__assets/img1.png"],
        )
        assert "---" in entry
        assert "id: obsidian_test_001" in entry
        assert 'date: "2026-04-02"' in entry
        assert "source_type: obsidian" in entry
        assert "title: Test Article" in entry
        assert "Article body content." in entry

    def test_entry_has_images_list(self):
        entry = build_entry(
            entry_id="obsidian_test_002",
            date="2026-04-02",
            source_type="obsidian",
            source_path="test.md",
            title="Test",
            body="Body.",
            tags=["ai"],
            images=[],
        )
        assert "images:" in entry
        assert "tags:" in entry

    def test_date_field_is_string_after_round_trip(self):
        """date must survive yaml.safe_load as a str, not a datetime.date."""
        entry = build_entry(
            entry_id="obsidian_test_003",
            date="2026-04-02",
            source_type="obsidian",
            source_path="test.md",
            title="Round-trip test",
            body="Body.",
            tags=[],
            images=[],
        )
        meta, _ = parse_frontmatter(entry)
        assert isinstance(meta["date"], str), (
            f"Expected date to be str, got {type(meta['date'])}: {meta['date']!r}"
        )
        assert meta["date"] == "2026-04-02"

    def test_boolean_tags_round_trip(self):
        """Tags like 'yes'/'no'/'true' must round-trip as strings, not booleans."""
        entry = build_entry(
            entry_id="obsidian_test_004",
            date="2026-04-02",
            source_type="obsidian",
            source_path="test.md",
            title="Bool tag test",
            body="Body.",
            tags=["yes", "no", "true"],
            images=[],
        )
        meta, _ = parse_frontmatter(entry)
        for tag in meta["tags"]:
            assert isinstance(tag, str), (
                f"Expected tag to be str, got {type(tag)}: {tag!r}"
            )
        assert meta["tags"] == ["yes", "no", "true"]
