import { TocEntry } from "@/lib/wiki";

interface TocProps {
  entries: TocEntry[];
}

export default function TableOfContents({ entries }: TocProps) {
  if (entries.length < 2) return null;

  // Build numbered list: group top-level (h2) with sub-entries (h3+)
  const items: { entry: TocEntry; index: string }[] = [];
  let h2Count = 0;
  let h3Count = 0;

  for (const entry of entries) {
    if (entry.level === 2) {
      h2Count++;
      h3Count = 0;
      items.push({ entry, index: `${h2Count}` });
    } else if (entry.level === 3) {
      h3Count++;
      items.push({ entry, index: `${h2Count}.${h3Count}` });
    } else {
      items.push({ entry, index: "" });
    }
  }

  return (
    <div className="mw-toc">
      <div className="mw-toc-title">Contents</div>
      <ol>
        {items.map(({ entry, index }) => (
          <li
            key={entry.id}
            style={{ marginLeft: entry.level > 2 ? `${(entry.level - 2) * 12}px` : 0 }}
          >
            <a href={`#${entry.id}`}>
              {index && <span style={{ marginRight: 4 }}>{index}</span>}
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
