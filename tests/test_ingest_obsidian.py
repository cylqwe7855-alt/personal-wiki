import os
import sys
import tempfile
import shutil

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

from ingest_obsidian import scan_vault, process_file, ingest


class TestScanVault:
    def setup_method(self):
        self.tmpdir = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.tmpdir, "文章库"))
        os.makedirs(os.path.join(self.tmpdir, "文章库", "article__assets"))
        os.makedirs(os.path.join(self.tmpdir, "资料库"))

        with open(os.path.join(self.tmpdir, "文章库", "article.md"), "w") as f:
            f.write("Article content")
        with open(os.path.join(self.tmpdir, "文章库", "draft.txt"), "w") as f:
            f.write("Draft content")
        with open(os.path.join(self.tmpdir, "文章库", "article__assets", "img.png"), "w") as f:
            f.write("fake image")
        with open(os.path.join(self.tmpdir, "资料库", "research.md"), "w") as f:
            f.write("Research content")
        with open(os.path.join(self.tmpdir, ".DS_Store"), "w") as f:
            f.write("")

    def teardown_method(self):
        shutil.rmtree(self.tmpdir)

    def test_finds_md_and_txt_files(self):
        files = scan_vault(self.tmpdir)
        extensions = {os.path.splitext(f)[1] for f in files}
        assert ".md" in extensions
        assert ".txt" in extensions

    def test_skips_assets_directories(self):
        files = scan_vault(self.tmpdir)
        for f in files:
            assert "__assets" not in f

    def test_skips_ds_store(self):
        files = scan_vault(self.tmpdir)
        for f in files:
            assert ".DS_Store" not in f

    def test_returns_absolute_paths(self):
        files = scan_vault(self.tmpdir)
        for f in files:
            assert os.path.isabs(f)


class TestProcessFile:
    def setup_method(self):
        self.tmpdir = tempfile.mkdtemp()

    def teardown_method(self):
        shutil.rmtree(self.tmpdir)

    def test_extracts_title_from_first_heading(self):
        filepath = os.path.join(self.tmpdir, "test.md")
        with open(filepath, "w") as f:
            f.write("# My Title\n\nBody content here.")
        entry = process_file(filepath, self.tmpdir)
        assert entry["title"] == "My Title"

    def test_extracts_title_from_filename_when_no_heading(self):
        filepath = os.path.join(self.tmpdir, "Polymarket.md")
        with open(filepath, "w") as f:
            f.write("Content without heading.")
        entry = process_file(filepath, self.tmpdir)
        assert entry["title"] == "Polymarket"

    def test_extracts_date_from_mtime(self):
        filepath = os.path.join(self.tmpdir, "test.md")
        with open(filepath, "w") as f:
            f.write("Content.")
        entry = process_file(filepath, self.tmpdir)
        assert entry["date"] is not None
        assert len(entry["date"]) == 10  # YYYY-MM-DD

    def test_detects_image_references(self):
        filepath = os.path.join(self.tmpdir, "test.md")
        with open(filepath, "w") as f:
            f.write("Text\n![[screenshot.png]]\nMore text\n![[photo.jpg]]")
        entry = process_file(filepath, self.tmpdir)
        assert "screenshot.png" in entry["images"]
        assert "photo.jpg" in entry["images"]

    def test_source_path_is_relative(self):
        subdir = os.path.join(self.tmpdir, "文章库")
        os.makedirs(subdir, exist_ok=True)
        filepath = os.path.join(subdir, "article.md")
        with open(filepath, "w") as f:
            f.write("Content.")
        entry = process_file(filepath, self.tmpdir)
        assert entry["source_path"] == "文章库/article.md"


class TestIngest:
    def setup_method(self):
        self.vault_dir = tempfile.mkdtemp()
        self.output_dir = tempfile.mkdtemp()
        with open(os.path.join(self.vault_dir, "test-article.md"), "w") as f:
            f.write("# Test Article\n\nThis is test content.")

    def teardown_method(self):
        shutil.rmtree(self.vault_dir)
        shutil.rmtree(self.output_dir)

    def test_creates_output_files(self):
        ingest(self.vault_dir, self.output_dir)
        output_files = os.listdir(self.output_dir)
        assert len(output_files) == 1
        assert output_files[0].endswith(".md")

    def test_idempotent(self):
        ingest(self.vault_dir, self.output_dir)
        files_first = sorted(os.listdir(self.output_dir))
        contents_first = {}
        for f in files_first:
            with open(os.path.join(self.output_dir, f)) as fh:
                contents_first[f] = fh.read()

        ingest(self.vault_dir, self.output_dir)
        files_second = sorted(os.listdir(self.output_dir))
        for f in files_second:
            with open(os.path.join(self.output_dir, f)) as fh:
                assert fh.read() == contents_first[f]

    def test_output_has_frontmatter(self):
        ingest(self.vault_dir, self.output_dir)
        output_file = os.path.join(self.output_dir, os.listdir(self.output_dir)[0])
        with open(output_file) as f:
            content = f.read()
        assert content.startswith("---")
        assert "source_type: obsidian" in content
        assert "title: Test Article" in content
