# Personal Wiki

A personal knowledge wiki built and maintained by LLMs. You curate data sources; the LLM ingests, synthesizes, cross-references, and maintains the wiki. Browse it in a Wikipedia-style web UI.

Inspired by [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) and the [hermes-agent wiki skill](https://github.com/NousResearch/hermes-agent).

## Install

```bash
npx skills add shansennan/personal-wiki
```

Works across 40+ agents (Claude Code, Cursor, Cline, etc.) that support [Agent Skills](https://agentskills.io).

## Usage

```bash
mkdir my-wiki && cd my-wiki

/wiki init                    # Clone repo, install Python & Node deps, scaffold project
/wiki ingest                  # Interactive: pick data source, import entries
/wiki absorb all              # LLM reads entries, compiles wiki articles
/wiki serve                   # Launch web UI at localhost:3000
/wiki query "question"        # Ask questions about the wiki
```

## How It Works

Three layers:

1. **Raw sources** (`raw/`) — your data, converted to standardized markdown entries. Immutable.
2. **Wiki** (`wiki/`) — LLM-generated knowledge base. Cross-linked markdown articles organized by topic.
3. **Schema** (`CLAUDE.md`) — rules, taxonomy, and workflows governing the wiki.

The LLM reads your entries, understands what they mean, and weaves them into a growing wiki. You read the result in a Wikipedia-style web UI or through `/wiki query`.

## All Commands

| Command | Description |
|---------|-------------|
| `/wiki init` | Set up project: clone repo, install all dependencies |
| `/wiki ingest` | Interactive data import (Obsidian, Apple Notes, documents, or custom) |
| `/wiki absorb [range]` | Compile entries into wiki articles (`all`, `last 30 days`, `2024-03`) |
| `/wiki query <question>` | Ask questions about the wiki (read-only) |
| `/wiki serve` | Start the web UI at localhost:3000 |
| `/wiki cleanup` | Audit and improve article quality |
| `/wiki breakdown` | Find and create missing articles |
| `/wiki status` | Show statistics |
| `/wiki rebuild-index` | Rebuild the wiki index |

## Supported Data Sources

| Source | How |
|--------|-----|
| Obsidian vault | Any folder of `.md` files |
| Apple Notes | macOS Notes app via AppleScript |
| Documents | `.docx` and `.pdf` files |
| Custom | LLM writes a parser for any format (CSV, JSON, Day One, email, tweets, etc.) |

## Web UI

Wikipedia-style interface built with Next.js:

- Article browsing with metadata, TOC, and backlinks
- Full-text search with relevance scoring
- Interactive knowledge graph (D3 force-directed)
- Category sidebar navigation
- Chinese/English toggle

## Privacy

`raw/` and `wiki/` are gitignored. Your personal data never enters git.

## Acknowledgments

- [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — the original pattern
- [hermes-agent wiki skill](https://github.com/NousResearch/hermes-agent) by Nous Research — the skill this project builds upon

## License

MIT
