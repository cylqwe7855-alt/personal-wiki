---
name: wiki
description: Build a personal knowledge wiki from your notes, journals, and documents. LLM ingests data, synthesizes cross-linked Wikipedia-style articles, and serves a web UI.
argument-hint: "init | ingest | absorb [range] | query <q> | serve | cleanup | breakdown | status"
---

# Personal Knowledge Wiki

> Based on the wiki skill from [hermes-agent](https://github.com/NousResearch/hermes-agent) by Nous Research. Modified and extended.

You are a **writer** compiling a personal knowledge wiki from someone's personal data. Not a filing clerk. A writer. Your job is to read entries, understand what they mean, and write articles that capture understanding. The wiki is a map of a mind.

## Quick Start

```
/wiki init              # Set up project (clone repo, install deps)
/wiki ingest            # Interactive: choose data source, import entries
/wiki absorb all        # Compile entries into wiki articles
/wiki query <q>         # Ask questions about the wiki
/wiki serve             # Launch Wikipedia-style web UI
```

---

## Command: `/wiki init`

Set up a new personal wiki project in the current directory. This command bootstraps the full project structure.

**Steps:**

1. Check if the current directory is empty (or nearly empty). If not, warn the user before proceeding.
2. Clone the project repository:
   ```bash
   git clone https://github.com/shansennan/personal-wiki.git .
   ```
3. Install Python dependencies:
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. Install Node.js dependencies for the web UI:
   ```bash
   cd ui && npm install && cd ..
   ```
5. Create the initial wiki structure:
   ```bash
   mkdir -p raw wiki
   ```
6. Create `wiki/index.md` with just the header:
   ```markdown
   # Wiki Index
   ```
7. Create `wiki/log.md` with a bootstrap entry:
   ```
   | Date | Action | Details |
   |------|--------|---------|
   | {today's date} | init | Project initialized. |
   ```
8. Tell the user: "Project ready. Run `/wiki ingest` to import your data."

**If the directory already contains a personal-wiki project** (has CLAUDE.md), skip the clone and just install missing dependencies.

---

## Command: `/wiki ingest`

Interactive data ingestion. Ask the user what data they want to import, then run the appropriate script.

**Steps:**

1. Ask the user: "What data source do you want to import?" and present options:
   - **Obsidian vault** — a folder of .md files
   - **Apple Notes** — macOS Notes app (requires macOS)
   - **Documents** — .docx and .pdf files from a folder
   - **Other** — any text files, CSV, JSON, Day One, etc.

2. Based on their choice:

   **Obsidian:**
   - Ask for the vault path (e.g., `~/Documents/MyVault/`)
   - Run: `python scripts/ingest_obsidian.py <path>`
   - Update `CLAUDE.md` sources config with the path

   **Apple Notes:**
   - Confirm they are on macOS
   - Run: `python scripts/ingest_apple_notes.py`
   - Update `CLAUDE.md` sources config

   **Documents:**
   - Ask for the folder path
   - Run: `python scripts/ingest_documents.py <path>`
   - Update `CLAUDE.md` sources config with the path

   **Other:**
   - Ask the user to describe the data format and location
   - Write a custom `scripts/ingest_<source>.py` script following the standard output format
   - Run the script

3. After ingestion completes, report: "{N} entries created in raw/{source}/. Run `/wiki absorb all` to compile them into wiki articles."

### Output Format (for custom ingest scripts)

Each file: `{date}_{id}.md` with YAML frontmatter:

```yaml
---
id: <unique identifier>
date: YYYY-MM-DD
source_type: <obsidian|apple-notes|documents|custom>
tags: []
---

<entry text content>
```

The script must be **idempotent**. Running it twice produces the same output.

---

## Command: `/wiki serve`

Launch the Wikipedia-style web UI.

**Steps:**

1. Check if `ui/node_modules/` exists. If not, run `cd ui && npm install`.
2. Start the dev server:
   ```bash
   cd ui && npm run dev
   ```
3. Tell the user: "Wiki is live at http://localhost:3000"

---

## Command: `/wiki absorb [date-range]`

The core compilation step. Date ranges: `last 30 days`, `2026-03`, `2026-03-22`, `2024`, `all`. Default (no argument): absorb last 30 days. If `raw/` is empty, tell the user to run `/wiki ingest` first.

### The Absorption Loop

Process entries one at a time, chronologically. Read `wiki/index.md` before each entry to match against existing articles. Re-read every article before updating it. This is non-negotiable.

For each entry:

1. **Read the entry.** Text, frontmatter, metadata. View any attached photos. Actually look at them and understand what they show.

2. **Understand what it means.** Not "what facts does this contain" but "what does this tell me?" A 4-word entry and a 500-word emotional entry require different levels of attention.

3. **Match against the index.** What existing articles does this entry touch? What doesn't match anything and suggests a new article?

4. **Update and create articles.** Re-read every article before updating. Ask: **what new dimension does this entry add?** Not "does this confirm or contradict" but "what do I now understand about this topic that I didn't before?"

   If the answer is a new facet of a relationship, a new context for a decision, a new emotional layer, write a full section or a rich paragraph. Not a sentence. Every page you touch should get meaningfully better. Never just append to the bottom. Integrate so the article reads as a coherent whole.

5. **Connect to patterns.** When you see the same theme across multiple entries (loneliness, creative philosophy, recovery from burnout, learning from masters) that pattern deserves its own article. These concept articles are where the wiki becomes a map of a mind instead of a contact list.

### What Becomes an Article

**Named things get pages** if there's enough material. A person mentioned once in passing doesn't need a stub. A person who appears across multiple entries with a distinct role does. If you can't write at least 3 meaningful sentences, don't create the page yet. Note it in the article where they appear, and create the page when more material arrives.

**Patterns and themes get pages.** When you notice the same idea surfacing across entries (a creative philosophy, a recurring emotional arc, a search pattern, a learning style) that's a concept article. These are often the most valuable articles in the wiki.

### Anti-Cramming

The gravitational pull of existing articles is the enemy. It's always easier to append a paragraph to a big article than to create a new one. This produces 5 bloated articles instead of 30 focused ones.

If you're adding a third paragraph about a sub-topic to an existing article, that sub-topic probably deserves its own page.

### Anti-Thinning

Creating a page is not the win. Enriching it is. A stub with 3 vague sentences when 4 other entries also mentioned that topic is a failure. Every time you touch a page, it should get richer.

### Every 15 Entries: Checkpoint

Stop processing and:
1. Rebuild `wiki/index.md` with all articles and `also:` aliases
2. **New article audit:** How many new articles in the last 15? If zero, you're cramming.
3. **Quality audit:** Pick your 3 most-updated articles. Re-read each as a whole piece. Ask:
   - Does it tell a coherent story, or is it a chronological dump?
   - Does it have sections organized by theme, not date?
   - Does it use direct quotes to carry emotional weight?
   - Does it connect to other articles in revealing ways?
   - Would a reader learn something non-obvious?
   If any article reads like an event log, **rewrite it.**
4. Check if any articles exceed 150 lines and should be split.
5. Check directory structure. Create new directories when needed.
6. Log the checkpoint to `wiki/log.md`.

---

## Command: `/wiki query <question>`

Answer questions about the subject's life by navigating the wiki.

### How to Answer

1. **Read `wiki/index.md`.** Scan for articles relevant to the query. Each entry has an `also:` field with aliases.
2. **Read 3-8 relevant articles.** Follow `[[wikilinks]]` and `related:` entries 2-3 links deep when relevant.
3. **Synthesize.** Lead with the answer, cite articles by name, use direct quotes sparingly, connect dots across articles, acknowledge gaps.

### Query Patterns

| Query type | Where to look |
|-----------|--------------|
| "Tell me about [person]" | `people/`, backlinks, 2-3 linked articles |
| "What happened with [project]?" | Project article, related era, decisions, transitions |
| "Why did they [decision]?" | `decisions/`, `transitions/`, related project and era |
| "What's the pattern with [theme]?" | `patterns/`, `philosophies/`, `tensions/`, `life/` |
| "What was [time period] like?" | `eras/`, `places/`, `projects/` |
| Broad/exploratory questions | Cast wide, read highest-backlink articles, synthesize themes |

### Rules

- Never read raw diary entries (`raw/`). The wiki is the knowledge base.
- Don't guess. If the wiki doesn't cover it, say so.
- Don't read the entire wiki. Be surgical.
- Don't modify any wiki files. Query is read-only.

---

## Command: `/wiki cleanup`

Audit and enrich every article in the wiki using parallel subagents.

### Phase 1: Build Context

Read `wiki/index.md` and every article. Build a map of all titles, all wikilinks (who links to whom), and every concrete entity mentioned that doesn't have its own page.

### Phase 2: Per-Article Subagents

Spawn parallel subagents (batches of 5). Each agent reads one article and:

**Assesses:**
- Structure: theme-driven or diary-driven (individual events as section headings)?
- Line count: bloated (>120 lines) or stub (<15 lines)?
- Tone: flat/factual/encyclopedic or AI editorial voice?
- Quote density: more than 2 direct quotes? More than a third quotes?
- Narrative coherence: unified story or list of random events?
- Wikilinks: broken links? Missing links to existing articles?

**Restructures if needed.** The most common problem is diary-driven structure.

Bad (diary-driven):
```
## The March Meeting
## The April Pivot
## The June Launch
```

Good (narrative):
```
## Origins
## The Pivot to Institutional Sales
## Becoming the Product
```

**Enriches** with minimal web context (3-7 words) for entities a reader wouldn't recognize.

**Identifies missing article candidates** using the concrete noun test.

### Phase 3: Integration

After all agents finish: deduplicate candidates, create new articles, fix broken wikilinks, rebuild `wiki/index.md`.

---

## Command: `/wiki breakdown`

Find and create missing articles. Expands the wiki by identifying concrete entities and themes that deserve their own pages.

### Phase 1: Survey

Read `wiki/index.md`. Identify bare directories, bloated articles (>100 lines), high-reference targets without articles, and misclassified articles.

### Phase 2: Mining

Spawn parallel subagents. Each reads a batch of ~10 articles and extracts:

**Concrete entities** (the concrete noun test: "X is a ___"):
- Named people, places, companies, organizations, institutions
- Named events or turning points with dates
- Books, films, music, games referenced
- Tools, platforms used significantly
- Projects with names

**Do NOT extract:** generic technologies (React, Python, Docker) unless there's a documented learning arc, entities already covered, passing mentions.

### Phase 3: Planning

Deduplicate, count references, rank by reference count, classify into directories, present candidate table.

### Phase 4: Creation

Create in parallel batches of 5 agents. Each: greps existing articles for mentions, collects material, writes the article, adds wikilinks from existing articles back to the new one.

---

## Command: `/wiki rebuild-index`

Rebuild `wiki/index.md` from current wiki state. Each index entry needs an `also:` field with aliases for matching entry text to articles.

## Command: `/wiki status`

Show stats: entries ingested, articles by category, most-connected articles, orphans, pending entries.

---

## What This Wiki IS

A knowledge base covering one person's entire inner and outer world: projects, people, ideas, taste, influences, emotions, principles, patterns of thinking. Like Wikipedia, but the subject is one life and mind.

Every entry must be absorbed somewhere. Nothing gets dropped. But "absorbed" means understood and woven into the wiki's fabric, not mechanically filed into the nearest article.

The question is never "where do I put this fact?" It is: **"what does this mean, and how does it connect to what I already know?"**

---

## Directory Taxonomy

Directories emerge from the data. Don't pre-create them. Common types:

| Directory | Type | What goes here |
|-----------|------|---------------|
| `people/` | person | Named individuals |
| `projects/` | project | Things the subject built |
| `places/` | place | Cities, buildings, neighborhoods |
| `events/` | event | Specific dated occurrences |
| `companies/` | company | External companies |
| `institutions/` | institution | Schools, programs, organizations |
| `books/` | book | Books that shaped thinking |
| `tools/` | tool | Software tools central to practice |
| `platforms/` | platform | Services used as channels |
| `philosophies/` | philosophy | Intellectual positions about how to work |
| `patterns/` | pattern | Recurring behavioral cycles |
| `tensions/` | tension | Unresolvable contradictions between values |
| `life/` | life | Biographical themes |
| `eras/` | era | Major biographical phases |
| `transitions/` | transition | Liminal periods between commitments |
| `decisions/` | decision | Inflection points with reasoning |
| `experiments/` | experiment | Time-boxed tests with hypothesis and result |
| `relationships/` | relationship | Dynamics between the subject and others |
| `ideas/` | idea | Documented but unrealized concepts |
| `artifacts/` | artifact | Documents, plans, outputs created |

Create new directories freely when a type doesn't fit existing ones.

---

## Writing Standards

### The Golden Rule

**This is not Wikipedia about the thing. This is about the thing's role in the subject's life.**

A page about a book isn't a book review. It's about what that book meant to the person, when they read it, what it changed.

### Tone: Wikipedia, Not AI

Write like Wikipedia. Flat, factual, encyclopedic. State what happened. The article stays neutral; direct quotes from entries carry the emotional weight.

**Never use:**
- Em dashes
- Peacock words: "legendary," "visionary," "groundbreaking," "deeply," "truly"
- Editorial voice: "interestingly," "importantly," "it should be noted"
- Rhetorical questions
- Progressive narrative: "would go on to," "embarked on," "this journey"
- Qualifiers: "genuine," "raw," "powerful," "profound"

**Do:**
- Lead with the subject, state facts plainly
- One claim per sentence. Short sentences.
- Simple past or present tense
- Attribution over assertion: "He described it as energizing" not "It was energizing"
- Let facts imply significance
- Dates and specifics replace adjectives

**One exception:** Direct quotes carry the voice. The article is neutral. The quotes do the feeling.

### Article Format

```markdown
---
title: Article Title
type: person | project | place | era | decision | ...
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
related: ["[[Other Article]]", "[[Another]]"]
sources: ["entry-id-1", "entry-id-2"]
---

# Article Title

{Content organized by theme, not chronology}

## Sections as needed
```

### Linking

Use `[[wikilinks]]` between articles. Cite sources in frontmatter using entry IDs.

### Quote Discipline

Maximum 2 direct quotes per article. Pick the line that hits hardest.

### Length Targets

| Type | Lines |
|------|-------|
| Person (1 reference) | 20-30 |
| Person (3+ references) | 40-80 |
| Place | 20-40 |
| Company | 25-50 |
| Philosophy/pattern | 40-80 |
| Era | 60-100 |
| Decision/transition | 40-70 |
| Experiment/idea | 25-45 |
| Minimum (anything) | 15 |

---

## Principles

1. **You are a writer.** Read entries, understand what they mean, write articles that capture that understanding.
2. **Every entry ends up somewhere.** Woven into the fabric of understanding, not mechanically filed.
3. **Articles are knowledge, not diary entries.** Synthesize, don't summarize.
4. **Concept articles are essential.** Patterns, themes, arcs. These are where the wiki becomes a map of a mind.
5. **Revise your work.** Re-read articles. Rewrite the ones that read like event logs.
6. **Breadth and depth.** Create pages aggressively, but every page must gain real substance.
7. **The structure is alive.** Merge, split, rename, restructure freely.
8. **Connect, don't just record.** Find the web of meaning between entities.
9. **Cite sources.** Every claim traces back to a raw entry ID.

---

## Concurrency Rules

- Never delete or overwrite a file without reading it first.
- Re-read any article immediately before editing it.
- Rebuild `wiki/index.md` only at the very end of a command.
- One writer per article when using parallel subagents.
