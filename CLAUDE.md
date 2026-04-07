# CLAUDE.md — Personal Wiki Schema

This file is the authoritative schema for this wiki. Any LLM agent maintaining this wiki must read this file first and follow its rules exactly.

---

## 1. Project Overview

This is a personal knowledge wiki built and maintained by LLMs. It follows a three-layer architecture: raw sources (immutable input entries the LLM reads but never writes), the wiki (a living knowledge base the LLM owns completely), and this schema file (the rules governing how the wiki is built and maintained). The wiki captures one person's life in encyclopedic form — capturing places, people, ideas, decisions, patterns, and eras as they appear across journals, notes, and other personal sources. The project is inspired by Karpathy's LLM Wiki pattern: the LLM acts as a tireless editor who reads raw entries and synthesizes them into a coherent, cross-linked knowledge base, not a diary, not a log, but a wiki.

---

## 2. Directory Conventions

```
raw/       — immutable source entries. LLM reads, never writes.
wiki/      — LLM-generated knowledge base. LLM owns completely.
scripts/   — ingestion scripts. Human and LLM maintain together.
```

- `raw/` contains subdirectories per source (e.g., `raw/obsidian/`). Each entry is a single file. Filenames encode date and ID. The LLM reads these to absorb content into the wiki.
- `wiki/` contains all article files plus `index.md` and `log.md`. The LLM creates, edits, and reorganizes files here freely.
- `scripts/` contains Python ingestion scripts that convert source data into raw entries. The LLM may read and modify scripts but does not run them autonomously.

Do not create any other top-level directories without updating this schema.

---

## 3. Data Source Config

```yaml
sources:
  obsidian:
    path: ~/path/to/your/obsidian-vault/
    script: scripts/ingest_obsidian.py
  apple_notes:
    path: (macOS Notes app via AppleScript)
    script: scripts/ingest_apple_notes.py
  documents:
    path: ~/path/to/your/documents/
    script: scripts/ingest_documents.py
  # notion: (future)
```

The ingestion scripts read source files and write structured entries into `raw/<source>/`. Each entry file follows this naming convention: `YYYY-MM-DD_<id>.md`. Entries are append-only once written. The LLM never modifies files in `raw/`.

---

## 4. Taxonomy

Directories inside `wiki/` are organized by type. The LLM creates directories as needed when articles of a new type are first written.

**Rule: Directories emerge from data. Never pre-create empty directories.**

| Directory | Type Label | What Goes Here |
|---|---|---|
| `wiki/people/` | person | Named individuals who appear in the subject's life |
| `wiki/projects/` | project | Discrete efforts the subject worked on or contributed to |
| `wiki/places/` | place | Physical locations with personal significance |
| `wiki/events/` | event | Specific occurrences: conferences, encounters, ceremonies, incidents |
| `wiki/companies/` | company | Organizations the subject worked at, worked with, or was shaped by |
| `wiki/institutions/` | institution | Universities, governments, nonprofits, collectives |
| `wiki/books/` | book | Books read or encountered with meaningful impact |
| `wiki/films/` | film | Films watched that left a mark |
| `wiki/music/` | music | Artists, albums, or songs with personal resonance |
| `wiki/games/` | game | Video games, board games, or play experiences |
| `wiki/tools/` | tool | Software, apps, or hardware used repeatedly |
| `wiki/platforms/` | platform | Platforms the subject used, built on, or studied |
| `wiki/courses/` | course | Formal or informal learning experiences |
| `wiki/publications/` | publication | Newsletters, journals, blogs, or media outlets |
| `wiki/philosophies/` | philosophy | Named belief systems, frameworks, or worldviews encountered |
| `wiki/patterns/` | pattern | Recurring behaviors, tendencies, or habits in the subject's life |
| `wiki/tensions/` | tension | Persistent internal conflicts or unresolved contradictions |
| `wiki/identities/` | identity | Self-conceptualizations the subject held at different points |
| `wiki/life/` | life | Overview articles about periods or domains of the subject's life |
| `wiki/eras/` | era | Multi-year life phases with a coherent character |
| `wiki/transitions/` | transition | Pivot moments between eras or life configurations |
| `wiki/decisions/` | decision | Specific choices made, with context and consequence |
| `wiki/experiments/` | experiment | Deliberate tests: new habits, modes of working, lifestyle changes |
| `wiki/setbacks/` | setback | Failures, losses, and reversals worth understanding |
| `wiki/relationships/` | relationship | Significant dyadic relationships (friendship, romance, partnership) |
| `wiki/mentorships/` | mentorship | Relationships structured around learning or guidance |
| `wiki/communities/` | community | Groups the subject belonged to or was shaped by |
| `wiki/strategies/` | strategy | High-level approaches the subject used to navigate life or work |
| `wiki/techniques/` | technique | Specific repeatable methods or practices |
| `wiki/skills/` | skill | Capabilities developed over time |
| `wiki/ideas/` | idea | Standalone intellectual concepts the subject encountered or developed |
| `wiki/artifacts/` | artifact | Objects, documents, or outputs the subject created |
| `wiki/restaurants/` | restaurant | Dining places with personal significance |
| `wiki/health/` | health | Medical events, physical states, or wellness practices |
| `wiki/media/` | media | Miscellaneous media that doesn't fit books/films/music/games |
| `wiki/routines/` | routine | Regular practices or daily structures at a given period |
| `wiki/metaphors/` | metaphor | Recurring figurative language or mental images the subject used |
| `wiki/assessments/` | assessment | Evaluations the subject made of situations, people, or themselves |
| `wiki/touchstones/` | touchstone | Objects, quotes, or memories the subject returned to repeatedly |

---

## 5. Writing Standards

### Tone

- Wikipedia tone: flat, factual, encyclopedic.
- Focus: "what this meant in the subject's life", not "what this thing is in general".
- The subject of every article is a node in one person's life. Write it that way.

### Quotes

- Max 2 direct quotes per article.
- Pick the line that hits hardest. If two lines say the same thing, cut one.
- Quotes must be verbatim from source entries. Do not paraphrase into quote marks.

### Structure

- Organize by theme, not chronology.
- Do not narrate. Do not tell stories. State facts.
- Sections should be short. 2-5 sentences per section is normal.

### Length Targets (lines)

| Article type | Minimum | Target |
|---|---|---|
| Person (1 source reference) | 15 | 20-30 |
| Person (3+ source references) | 30 | 40-80 |
| Place | 15 | 20-40 |
| Company | 20 | 25-50 |
| Philosophy or pattern | 30 | 40-80 |
| Era | 50 | 60-100 |
| Decision or transition | 30 | 40-70 |
| Experiment or idea | 20 | 25-45 |
| Any article | 15 | — |

### Forbidden Words and Constructions

NEVER use:

- Em dashes (—) in prose
- Peacock words: "legendary", "visionary", "groundbreaking", "deeply", "truly"
- Editorial voice: "interestingly", "importantly", "notably", "remarkably"
- Rhetorical questions
- Progressive narrative framing: "would go on to", "embarked on", "set out to"
- Soft qualifiers: "genuine", "raw", "powerful", "profound", "meaningful", "impactful"
- Filler intensifiers: "very", "really", "quite", "rather", "somewhat"

### Rules to Follow

- Lead with the subject in the first sentence.
- State facts plainly. One claim per sentence.
- Use short sentences. Aim for 15 words or fewer per sentence on average.
- Use simple past or present tense. No future speculation.
- Attribution over assertion: if uncertain, attribute to source or period ("as of [year]", "per his journal").
- Link generously. If a named entity has a page, wikilink it.

---

## 6. Article Format Template

Every article in `wiki/` must follow this structure:

```markdown
---
title: Article Title
type: person | project | place | era | decision | ...
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
related: ["[[Other Article]]", "[[Another Article]]"]
sources: ["entry-id-1", "entry-id-2"]
---

# Article Title

{Opening sentence naming the subject and its primary role in the subject's life.}

## Section Name

{Content organized by theme, not chronology. Each section covers one aspect.}

## Another Section

{Continue as needed. Remove unused sections.}

## Backlinks

{Generated automatically by rebuild-index. Do not write manually.}
```

Notes on frontmatter:

- `title`: matches the H1 heading exactly.
- `type`: one value from the taxonomy table in Section 4.
- `created`: the date this article was first written.
- `last_updated`: the date of the most recent edit.
- `related`: wikilinks to directly connected articles. 2-8 entries is normal.
- `sources`: list of raw entry IDs that contributed content to this article. Use the filename stem (e.g., `2024-03-15_obs_001`).

---

## 7. index.md Spec

`wiki/index.md` is the LLM's map of the wiki. It must be read before any absorb or query operation. It must be rebuilt at the end of every absorb session.

### Format

One line per article. Format:

```
- [Title](path/to/article.md) — one-line summary. also: alias1, alias2
```

Example:

```
- [Zhang Wei](people/zhang-wei.md) — college roommate and co-founder of first startup. also: Zhang, Xiao Zhang
- [Beijing](places/beijing.md) — city where subject spent ages 18-22. also: BJ, 北京
```

### Organization

Group lines by category using headers:

```markdown
# Wiki Index

## People
...

## Places
...

## Projects
...
```

Use the same category groupings as the taxonomy table. Categories with no articles yet are omitted.

### Usage Rules

- The LLM reads `index.md` before every entry during absorb.
- The LLM searches `index.md` before creating any new article to check if the entity already has a page.
- `index.md` is rebuilt only at the end of a full absorb session or at a checkpoint, not after every article edit.

---

## 8. log.md Spec

`wiki/log.md` is an append-only record of all LLM operations on the wiki.

### Format

```markdown
## [YYYY-MM-DD] verb | description
```

Example entries:

```
## [2024-11-03] absorb | processed entries obs_001 through obs_045. created 12 articles, updated 8.
## [2024-11-03] checkpoint | rebuilt index. 47 total articles. flagged people/li-jun.md as bloated (160 lines).
## [2024-11-04] cleanup | restructured eras/college-years.md. reduced from 140 to 90 lines.
## [2024-11-04] lint | found 3 orphan pages, 2 broken wikilinks, 1 contradiction.
```

Verbs: `absorb`, `checkpoint`, `cleanup`, `lint`, `query`, `breakdown`, `create`, `update`, `delete`, `rebuild-index`.

### Greppable Format

The format is designed to be grepped:

```bash
grep "^## \[" wiki/log.md | tail -5
```

This returns the last 5 log entries, giving any LLM a quick state-of-wiki summary.

### Rules

- Never edit past log entries.
- Always append, never overwrite.
- Log every article created or deleted by name.
- Log every absorb session with entry range and article counts.

---

## 9. Workflows

### ingest

**Purpose:** Convert raw source files into structured raw entries.

**How it works:** Run `python scripts/ingest_<source>.py <path>`. This is NOT the LLM's job. The LLM does not run ingestion. A human or automated process runs the ingestion script, which writes files into `raw/<source>/`. The LLM then runs absorb on the new entries.

**Example:**

```bash
python scripts/ingest_obsidian.py ~/path/to/your/obsidian-vault/
```

---

### absorb [range]

**Purpose:** THE CORE WORKFLOW. Read raw entries and synthesize them into wiki articles.

**When to run:** After new entries appear in `raw/`. Optionally specify a range of entry IDs (e.g., `obs_001-obs_045`) or run on all unprocessed entries.

**Full loop:**

1. Read `wiki/index.md` at the start of the session to load the current map.
2. Process entries one at a time, in chronological order.
3. For each entry:
   a. Read the entry fully.
   b. Understand what it means in the subject's life, not just what it says.
   c. Search `index.md` for any entities mentioned.
   d. For each matched article: re-read the full article, then update it with new information.
   e. For each unmatched entity worth a page: create a new article.
   f. Connect the entry's content to existing patterns, eras, or tensions where relevant.
4. Re-read every article in full immediately before editing it. This is non-negotiable. Do not rely on memory of previously read content.
5. Ask for each entry: "What new dimension does this entry add? What does it change about what I already know?"
6. Every 15 entries: run a checkpoint.
   - Rebuild `index.md`.
   - Audit 3 random articles for quality.
   - Count new articles created in this session so far.
   - Identify any articles exceeding 150 lines and flag for cleanup.
   - Log checkpoint to `wiki/log.md`.

**Anti-Cramming Rule:** The gravitational pull of existing articles is the enemy. When an entry has something to say about three different people, do not dump all of it into the most prominent person's article. Each entity gets only what it contributed. Resist the pull toward the most familiar page.

**Anti-Thinning Rule:** Creating a page is not the win. Enriching it is. A stub with a title and two sentences is not useful. If an entity cannot fill 15 lines, it should be mentioned in-line in another article until enough material accumulates.

**What to avoid:**
- Do not create articles speculatively (e.g., "this person might be important later").
- Do not copy-paste from raw entries. Synthesize and restate in wiki voice.
- Do not add content to an article without re-reading it first.
- Do not absorb the same entry twice. Track progress in `wiki/log.md`.

---

### query

**Purpose:** Answer a question about the subject's life using wiki knowledge. READ-ONLY.

**Steps:**

1. Read `wiki/index.md` to identify relevant articles.
2. Select 3-8 articles most likely to contain relevant information.
3. Read each selected article in full.
4. Follow wikilinks 2-3 levels deep where they seem relevant to the question.
5. Synthesize an answer from what was read. Do not add any new information not in the wiki.
6. Cite article titles when making claims.

**Rules:**
- Query is strictly read-only. No files are created or modified.
- Do not generate answers from general knowledge. Only use what the wiki contains.
- If the wiki lacks the information, say so plainly.

---

### lint

**Purpose:** Health check of the wiki. Identifies structural and quality problems.

**What to check:**

- Contradictions between pages (e.g., two articles give different years for the same event).
- Stale claims (e.g., an article describes something as ongoing when later entries indicate it ended).
- Orphan pages: articles with no inlinks from other articles.
- Missing cross-references: articles that mention an entity by name without wikilinking.
- Broken wikilinks: wikilinks pointing to articles that do not exist.
- Concepts mentioned repeatedly across articles but lacking their own page.
- Data gaps: topics or entities where the wiki has very thin coverage relative to what source entries contain.

**Output:** A lint report written to `wiki/log.md` as a single log entry with a bulleted list of issues found.

**Rules:** Lint does not fix anything. It identifies and reports. Run cleanup or absorb to fix issues.

---

### breakdown

**Purpose:** Identify and create stub articles for named concrete entities that are mentioned in existing articles but lack their own pages.

**Steps:**

1. Survey `wiki/index.md` to understand current coverage.
2. Mine existing articles for concrete entities: named people, places, companies, events, books, tools, and similar.
3. Cross-reference against `index.md` to find entities without pages.
4. Assess which entities have enough material in existing articles to warrant a page (3+ meaningful sentences worth of information across the wiki).
5. Plan a batch of articles to create.
6. Create articles in batches of 5, using parallel subagents where the environment supports it.
7. Rebuild `index.md` after the batch.

**Rules:**
- Only create articles for entities with enough existing material to fill 15+ lines.
- Do not invent content. Only use what is already in the wiki.
- Extract content from existing articles; do not duplicate it. Summarize and link.

---

### cleanup

**Purpose:** Audit and restructure existing articles for quality and consistency.

**Steps:**

Run a parallel subagent per article (or per batch of articles). Each subagent assesses:

1. **Structure:** Is the article organized by theme, or does it read like a diary entry or chronological narrative?
2. **Line count:** Is it within the target range for its type? Is it bloated (>150 lines)? Is it a stub (<15 lines)?
3. **Tone:** Does it follow writing standards? Any forbidden words or constructions?
4. **Quote density:** More than 2 quotes? Remove the weaker ones.
5. **Narrative coherence:** Does each section make one clear point? Are there redundant sections?
6. **Wikilinks:** Are all named entities linked? Are there broken links?

If the article needs structural work, rewrite it from scratch using the article template. Do not patch bad structure incrementally.

**Output:** Log each article audited to `wiki/log.md` with a one-line assessment and action taken.

---

## 10. Concurrency Rules

These rules apply when multiple agents operate on the wiki simultaneously, and also as general discipline for single-agent operation.

- **Never delete without reading first.** Read any article you are about to delete to confirm it has no unique content that should be preserved elsewhere.
- **Re-read any article immediately before editing.** If you read an article 10 entries ago and are now about to update it, read it again. Article state may have changed.
- **Never modify `_absorb_log.json`** (if it exists). This file tracks processed entry IDs and is managed externally.
- **Rebuild `index.md` only at the very end of a command.** Do not rebuild mid-session after each article edit. The index is rebuilt once, at the close of a session or at a scheduled checkpoint.
- **Log before deleting.** Before removing an article, log the deletion with reason to `wiki/log.md`.
- **One writer per article.** If using parallel subagents, assign each article to exactly one subagent. Do not have two agents update the same article concurrently.

---

## 11. What Becomes an Article

Not every entity mentioned in a raw entry deserves its own article. Use these thresholds:

- **Named things get pages** if there is enough material: 3 or more meaningful sentences that could be written about them using only information from the source entries. A name and a sentence is not enough. Wait until more material accumulates.
- **Patterns and themes get pages** when the same idea surfaces across multiple entries. A pattern page should be grounded in at least 3 distinct instances.
- **If adding a third paragraph about a sub-topic to an existing article,** that sub-topic probably deserves its own page. Extract it, link to it.
- **Ephemeral mentions do not get pages.** If someone is mentioned once in passing, note them in-line in the relevant article. Do not stub.
- **Emotions and moods do not get pages** unless they rise to the level of a recurring pattern or tension with its own character and history.
- **Proper nouns from media** (characters in books, places in games, etc.) do not get pages unless the subject had a personal relationship with them.

---

## 12. File Naming Conventions

- All article filenames use lowercase kebab-case: `zhang-wei.md`, `college-years.md`, `first-job-at-bytedance.md`.
- Filenames must be stable. Once created, do not rename without updating all wikilinks and the index.
- Use English for filenames even if the article title contains Chinese characters.
- Disambiguation: if two entities share a name, append a qualifier: `zhang-wei-roommate.md`, `zhang-wei-manager.md`.

---

## 13. Wikilink Conventions

- Use double-bracket wikilinks: `[[Article Title]]`.
- The text inside brackets must match the `title` field in the article's frontmatter exactly, OR use a display alias: `[[zhang-wei|Zhang Wei]]`.
- Do not link the same article more than twice in a single article.
- Do not link in headings.
- Every article should have at least 2 outbound wikilinks. An isolated article is a signal the absorb step was incomplete.

---

## 14. Rebuild Index Procedure

When rebuilding `wiki/index.md`:

1. Walk all `.md` files in `wiki/` except `index.md`, `log.md`, and any file starting with `_`.
2. For each file: read the frontmatter to get `title`, `type`, and a summary (first non-heading sentence of content).
3. Extract any aliases from `related` or a dedicated `aliases` frontmatter field if present.
4. Group entries by type using the taxonomy from Section 4.
5. Write the full index in the format specified in Section 7.
6. Overwrite `wiki/index.md` with the new content.
7. Log the rebuild to `wiki/log.md`.

---

## 15. Bootstrap Procedure

When starting a new wiki from scratch (no existing articles):

1. Confirm `raw/` contains at least one entry.
2. Create `wiki/index.md` with just the header:
   ```markdown
   # Wiki Index
   ```
3. Create `wiki/log.md` with a bootstrap entry:
   ```
   ## [YYYY-MM-DD] absorb | bootstrap. beginning first absorb session.
   ```
4. Run absorb on all entries in `raw/`.
5. After absorb completes, rebuild `index.md`.

Do not pre-create any wiki article directories or stub articles before absorbing entries. The wiki shape emerges from the data.

---

*End of schema. Any LLM agent reading this file is expected to follow all rules above without exception. When in doubt, refer back to this document before acting.*
