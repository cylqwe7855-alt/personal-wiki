# Personal Wiki

A personal knowledge wiki built and maintained by LLMs. You curate data sources; the LLM ingests, synthesizes, cross-references, and maintains the wiki. Browse it in a Wikipedia-style web UI.

Inspired by [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) and the [hermes-agent wiki skill](https://github.com/NousResearch/hermes-agent).

## Install

```bash
npx skills add cylqwe7855-alt/personal-wiki
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

---

# Personal Wiki (中文)

由 LLM 构建和维护的个人知识百科。你提供数据源，LLM 负责摄取、综合、交叉引用并维护整个知识库。通过维基百科风格的 Web UI 浏览。

灵感来自 [Karpathy 的 LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 和 [hermes-agent wiki skill](https://github.com/NousResearch/hermes-agent)。

## 安装

```bash
npx skills add cylqwe7855-alt/personal-wiki
```

支持 40+ 种 AI 代理（Claude Code、Cursor、Cline 等），兼容 [Agent Skills](https://agentskills.io) 标准。

## 使用方法

```bash
mkdir my-wiki && cd my-wiki

/wiki init                    # 克隆项目，安装 Python 和 Node 依赖
/wiki ingest                  # 交互式选择数据源，导入条目
/wiki absorb all              # LLM 阅读条目，编译为百科文章
/wiki serve                   # 启动 Web UI，访问 localhost:3000
/wiki query "问题"             # 向百科提问
```

## 工作原理

三层架构：

1. **原始数据** (`raw/`) — 你的数据，转换为标准化的 Markdown 条目，不可修改。
2. **百科** (`wiki/`) — LLM 生成的知识库，按主题组织的交叉链接 Markdown 文章。
3. **规则** (`CLAUDE.md`) — 控制百科构建方式的分类法、写作标准和工作流。

LLM 读取你的条目，理解其含义，将它们编织成一个不断生长的知识百科。你可以通过 Web UI 或 `/wiki query` 查阅。

## 全部命令

| 命令 | 说明 |
|------|------|
| `/wiki init` | 初始化项目：克隆仓库，安装所有依赖 |
| `/wiki ingest` | 交互式数据导入（Obsidian、Apple Notes、文档或自定义格式） |
| `/wiki absorb [范围]` | 将条目编译为百科文章（`all`、`last 30 days`、`2024-03`） |
| `/wiki query <问题>` | 向百科提问（只读） |
| `/wiki serve` | 启动 Web UI |
| `/wiki cleanup` | 审计并提升文章质量 |
| `/wiki breakdown` | 发现并创建缺失的文章 |
| `/wiki status` | 显示统计信息 |
| `/wiki rebuild-index` | 重建百科索引 |

## 支持的数据源

| 数据源 | 方式 |
|--------|------|
| Obsidian 笔记库 | 任意 `.md` 文件夹 |
| Apple Notes | macOS 备忘录（通过 AppleScript） |
| 文档 | `.docx` 和 `.pdf` 文件 |
| 自定义 | LLM 自动编写解析器（CSV、JSON、Day One、邮件、推文等） |

## Web UI

基于 Next.js 的维基百科风格界面：

- 文章浏览，含元数据、目录和反向链接
- 全文搜索与相关度排序
- 交互式知识图谱（D3 力导向图）
- 分类侧边栏导航
- 中英文切换

## 隐私

`raw/` 和 `wiki/` 已被 gitignore，你的个人数据不会进入 Git 仓库。
