// Client-safe utilities (no fs usage)

export function slugToHref(slug: string[]): string {
  if (slug.length === 1 && slug[0] === "index") return "/";
  return "/wiki/" + slug.map((s) => encodeURIComponent(s)).join("/");
}
