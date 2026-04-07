---
name: wiki
description: Personal knowledge wiki — ingest sources, absorb into wiki articles, query, and maintain.
argument-hint: "init | ingest | absorb [range] | query <q> | serve | cleanup | breakdown | status"
---

# Personal Knowledge Wiki

Read the project root `CLAUDE.md` for full workflow definitions, writing standards, and taxonomy.

## Command Router

| Command | Action |
|---------|--------|
| `/wiki init` | Clone the project repo into the current directory, install Python and Node dependencies, create initial wiki structure. See `skills/wiki/SKILL.md` for full steps. |
| `/wiki ingest` | Interactive: ask user for data source type and path, run the corresponding script in `scripts/`, update `CLAUDE.md` sources config. |
| `/wiki absorb [range]` | Process raw entries into wiki articles. Range: `all`, `last 30 days`, `YYYY-MM`, `YYYY-MM-DD`. Default: `last 30 days`. Follow the absorb workflow in CLAUDE.md exactly. |
| `/wiki query <question>` | Answer a question by searching the wiki. Read-only — never modify wiki files during query. |
| `/wiki serve` | Start the web UI: `cd ui && npm run dev`. Opens at localhost:3000. |
| `/wiki cleanup` | Audit and enrich every article using parallel subagents. Fix structure, tone, links, and narrative coherence. |
| `/wiki breakdown` | Discover entities and themes that deserve their own pages but don't have one yet. Create missing articles in batches. |
| `/wiki status` | Show stats: entries ingested, entries absorbed, articles by category, most-connected articles, orphans, pending entries. |
| `/wiki rebuild-index` | Rebuild `wiki/index.md` from current wiki state. |

## Rules

- **init** clones `https://github.com/cylqwe7855-alt/personal-wiki.git` and installs all dependencies automatically.
- **ingest** is interactive — ask the user what data they have before running scripts.
- **absorb** is the core LLM workflow. Read CLAUDE.md's absorb section before starting. Re-read it every session.
- **query** is read-only. Never modify wiki/ during a query.
- **serve** starts the Next.js dev server in ui/.
- After every operation, append an entry to `wiki/log.md`.
- When in doubt about writing standards or taxonomy, CLAUDE.md is the authority.
