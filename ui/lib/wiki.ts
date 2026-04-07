import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

// Resolve wiki directory: prefer ../wiki/, fall back to ../wiki.example/
function getWikiRoot(): string {
  const base = path.resolve(process.cwd(), '..')
  const wikiPath = path.join(base, 'wiki')
  const examplePath = path.join(base, 'wiki.example')

  // Check if wiki has any real content beyond index.md and log.md
  if (fs.existsSync(wikiPath)) {
    try {
      const files = getAllMdFiles(wikiPath).filter(
        (f) => !f.endsWith('index.md') && !f.endsWith('log.md')
      )
      if (files.length > 0) return wikiPath
    } catch {
      // fall through
    }
  }

  if (fs.existsSync(examplePath)) return examplePath
  return wikiPath
}

export function getWikiDir(): string {
  return getWikiRoot()
}

// Recursively get all .md files
export function getAllMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllMdFiles(full))
    } else if (entry.name.endsWith('.md')) {
      results.push(full)
    }
  }
  return results
}

export interface WikiFrontmatter {
  title?: string
  type?: string
  created?: string
  last_updated?: string
  related?: string[]
  sources?: string[]
}

export interface WikiPage {
  slug: string[]       // e.g. ['projects', 'example-project'] or ['index']
  filePath: string     // absolute path
  frontmatter: WikiFrontmatter
  content: string      // raw markdown (without frontmatter)
  title: string        // resolved title
}

export interface RelatedLink {
  label: string
  href: string | null  // null if target page not found
}

export interface WikiPageWithHtml extends WikiPage {
  html: string
  toc: TocEntry[]
  backlinks: BacklinkInfo[]
  relatedLinks: RelatedLink[]
}

export interface TocEntry {
  id: string
  text: string
  level: number
}

export interface BacklinkInfo {
  slug: string[]
  title: string
}

// Slug helpers — always decode percent-encoded segments (Next.js 16 may pass raw %-encoded params)
export function decodeSlug(slug: string[]): string[] {
  return slug.map((s) => {
    try { return decodeURIComponent(s) } catch { return s }
  })
}

export function filePathToSlug(filePath: string, wikiDir: string): string[] {
  const rel = path.relative(wikiDir, filePath)
  const withoutExt = rel.replace(/\.md$/, '')
  return withoutExt.split(path.sep)
}

export function slugToFilePath(slug: string[], wikiDir: string): string {
  return path.join(wikiDir, ...decodeSlug(slug)) + '.md'
}

export function slugToHref(slug: string[]): string {
  if (slug.length === 1 && slug[0] === 'index') return '/'
  return '/wiki/' + slug.map((s) => encodeURIComponent(s)).join('/')
}

// Parse a single wiki page
export function parseWikiPage(filePath: string, wikiDir: string): WikiPage {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  // gray-matter parses YAML dates as Date objects — convert to strings
  const rawData = data as Record<string, unknown>
  for (const key of Object.keys(rawData)) {
    if (rawData[key] instanceof Date) {
      rawData[key] = (rawData[key] as Date).toISOString().split('T')[0]
    }
  }
  const fm = rawData as WikiFrontmatter
  const slug = filePathToSlug(filePath, wikiDir)

  // Derive title: frontmatter > first H1 > filename
  let title = fm.title
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m)
    if (h1Match) title = h1Match[1].trim()
  }
  if (!title) {
    title = slug[slug.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return { slug, filePath, frontmatter: fm, content, title }
}

// Load all wiki pages (short-lived cache for within a single request batch)
let _cache: WikiPage[] | null = null
let _cacheTime = 0
const CACHE_TTL_MS = 2000 // 2 seconds in dev; effectively one request cycle

export function getAllPages(useCache = true): WikiPage[] {
  const now = Date.now()
  if (useCache && _cache && (now - _cacheTime) < CACHE_TTL_MS) return _cache
  const wikiDir = getWikiDir()
  const files = getAllMdFiles(wikiDir)
  const pages = files.map((f) => parseWikiPage(f, wikiDir))
  _cache = pages
  _cacheTime = now
  return pages
}

// Extract [[wikilinks]] from markdown text
export function extractWikilinks(text: string): string[] {
  const matches = text.matchAll(/\[\[([^\]]+)\]\]/g)
  return Array.from(matches).map((m) => m[1])
}

// Build a map from page title (lowercase) -> page
export function buildTitleMap(pages: WikiPage[]): Map<string, WikiPage> {
  const map = new Map<string, WikiPage>()
  for (const page of pages) {
    map.set(page.title.toLowerCase(), page)
    // Also map by slug last segment
    const last = page.slug[page.slug.length - 1]
    map.set(last.toLowerCase(), page)
    // Map by full slug path as a title variant
    map.set(page.slug.join('/').toLowerCase(), page)
  }
  return map
}

// Resolve a wikilink text to a page href
export function resolveWikilink(
  linkText: string,
  titleMap: Map<string, WikiPage>
): string {
  const display = linkText.split('|')[0].trim()
  const page = titleMap.get(display.toLowerCase())
  if (page) return slugToHref(page.slug)
  // Try to guess a slug from the link text
  const guessSlug = display.toLowerCase().replace(/\s+/g, '-')
  return `/wiki/${guessSlug}`
}

// Replace [[wikilinks]] in markdown with <a> tags before HTML conversion
function transformWikilinks(
  markdown: string,
  titleMap: Map<string, WikiPage>
): string {
  return markdown.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
    const parts = linkText.split('|')
    const target = parts[0].trim()
    const label = parts[1]?.trim() || target
    const href = resolveWikilink(target, titleMap)
    return `[${label}](${href})`
  })
}

// Extract table of contents from markdown
function extractToc(markdown: string): TocEntry[] {
  const toc: TocEntry[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
        .replace(/\s+/g, '-')
      toc.push({ id, text, level })
    }
  }
  return toc
}

// Add IDs to heading elements in HTML
function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>(.*?)<\/\1>/g, (_, tag, content) => {
    const text = content.replace(/<[^>]+>/g, '')
    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
      .replace(/\s+/g, '-')
    return `<${tag} id="${id}">${content}</${tag}>`
  })
}

// Fix relative .md links in HTML to point to /wiki/ routes
function fixRelativeMdLinks(html: string, titleMap: Map<string, WikiPage>): string {
  return html.replace(/href="([^"]+\.md)"/g, (_, href) => {
    // Remove .md extension and leading ./; decode percent-encoded chars (remark encodes non-ASCII)
    let clean = href.replace(/^\.\//, '').replace(/\.md$/, '')
    try { clean = decodeURIComponent(clean) } catch { /* keep as-is */ }
    // Try to find in titleMap by slug path
    const page = titleMap.get(clean.toLowerCase())
    if (page) {
      return `href="${slugToHref(page.slug)}"`
    }
    // Fallback: convert to /wiki/ path with proper encoding
    const parts = clean.split('/')
    return `href="/wiki/${parts.map((p) => encodeURIComponent(p)).join('/')}"`
  })
}

// Convert markdown to HTML with wikilink support
export async function markdownToHtml(
  markdown: string,
  titleMap: Map<string, WikiPage>
): Promise<string> {
  const withLinks = transformWikilinks(markdown, titleMap)
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(withLinks)
  const html = addHeadingIds(result.toString())
  return fixRelativeMdLinks(html, titleMap)
}

// Find backlinks to a given page
export function findBacklinks(
  targetPage: WikiPage,
  allPages: WikiPage[]
): BacklinkInfo[] {
  const backlinks: BacklinkInfo[] = []
  const targetTitles = new Set([
    targetPage.title.toLowerCase(),
    targetPage.slug[targetPage.slug.length - 1].toLowerCase(),
  ])

  for (const page of allPages) {
    if (page.filePath === targetPage.filePath) continue
    const links = extractWikilinks(page.content)
    const hasLink = links.some((l) => {
      const display = l.split('|')[0].trim().toLowerCase()
      return targetTitles.has(display)
    })
    if (hasLink) {
      backlinks.push({
        slug: page.slug,
        title: page.title,
      })
    }
  }
  return backlinks
}

// Resolve frontmatter related: ["[[Title]]", ...] into proper links
function resolveRelatedLinks(
  related: string[] | undefined,
  titleMap: Map<string, WikiPage>
): RelatedLink[] {
  if (!related || related.length === 0) return []
  return related.map((rel) => {
    const match = rel.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/)
    const target = match ? match[1] : rel
    const label = match ? (match[2] || match[1]) : rel
    const page = titleMap.get(target.toLowerCase())
    return {
      label,
      href: page ? slugToHref(page.slug) : null,
    }
  })
}

// Build full page data with HTML, TOC, backlinks
export async function buildPageData(
  slug: string[]
): Promise<WikiPageWithHtml | null> {
  const wikiDir = getWikiDir()
  const filePath = slugToFilePath(slug, wikiDir)

  if (!fs.existsSync(filePath)) return null

  const page = parseWikiPage(filePath, wikiDir)
  const allPages = getAllPages()
  const titleMap = buildTitleMap(allPages)

  const html = await markdownToHtml(page.content, titleMap)
  const toc = extractToc(page.content).filter((e) => e.level >= 2)
  const backlinks = findBacklinks(page, allPages)
  const relatedLinks = resolveRelatedLinks(page.frontmatter.related, titleMap)

  return { ...page, html, toc, backlinks, relatedLinks }
}

// Category navigation: group pages by their top-level directory
export interface Category {
  name: string
  pages: { slug: string[]; title: string }[]
}

export function buildCategories(): Category[] {
  const allPages = getAllPages()
  const map = new Map<string, { slug: string[]; title: string }[]>()

  for (const page of allPages) {
    if (page.slug.length === 1) {
      // top-level file, put in "Main"
      const key = 'Main'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push({ slug: page.slug, title: page.title })
    } else {
      const dir = page.slug[0]
      const key = dir.charAt(0).toUpperCase() + dir.slice(1)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push({ slug: page.slug, title: page.title })
    }
  }

  // Sort categories: Main first, then alphabetical
  const sorted: Category[] = []
  if (map.has('Main')) {
    sorted.push({ name: 'Main', pages: map.get('Main')! })
  }
  for (const [name, pages] of map.entries()) {
    if (name !== 'Main') {
      sorted.push({ name, pages: pages.sort((a, b) => a.title.localeCompare(b.title, 'zh')) })
    }
  }
  sorted.slice(1).sort((a, b) => a.name.localeCompare(b.name))

  return sorted
}

// Graph data
export interface GraphNode {
  id: string
  title: string
  slug: string[]
}

export interface GraphLink {
  source: string
  target: string
}

export function buildGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const allPages = getAllPages()
  const titleMap = buildTitleMap(allPages)

  const nodes: GraphNode[] = allPages.map((p) => ({
    id: p.slug.join('/'),
    title: p.title,
    slug: p.slug,
  }))

  const links: GraphLink[] = []
  const seen = new Set<string>()

  for (const page of allPages) {
    const sourceId = page.slug.join('/')
    const wikilinks = extractWikilinks(page.content)
    for (const link of wikilinks) {
      const display = link.split('|')[0].trim()
      const target = titleMap.get(display.toLowerCase())
      if (target) {
        const targetId = target.slug.join('/')
        const key = `${sourceId}--${targetId}`
        if (!seen.has(key) && sourceId !== targetId) {
          seen.add(key)
          links.push({ source: sourceId, target: targetId })
        }
      }
    }
  }

  return { nodes, links }
}

// Search
export interface SearchResult {
  slug: string[]
  title: string
  excerpt: string
  score: number
}

export function searchPages(query: string): SearchResult[] {
  if (!query.trim()) return []
  const allPages = getAllPages()
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  for (const page of allPages) {
    const titleLower = page.title.toLowerCase()
    const contentLower = page.content.toLowerCase()

    let score = 0
    if (titleLower.includes(q)) score += 10
    if (titleLower === q) score += 20
    const contentOccurrences = (contentLower.match(new RegExp(q, 'g')) || []).length
    score += contentOccurrences

    if (score > 0) {
      // Find excerpt around first match
      const idx = contentLower.indexOf(q)
      const start = Math.max(0, idx - 80)
      const end = Math.min(page.content.length, idx + 160)
      const excerpt = (start > 0 ? '...' : '') +
        page.content.slice(start, end).replace(/[#*`]/g, '') +
        (end < page.content.length ? '...' : '')

      results.push({ slug: page.slug, title: page.title, excerpt, score })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 20)
}
