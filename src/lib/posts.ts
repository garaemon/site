import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Lang = 'ja' | 'en';
export const LANGS = ['ja', 'en'] as const satisfies readonly Lang[];
export const DEFAULT_LANG: Lang = 'ja';

export type Post = CollectionEntry<'posts'>;

export type LocalizedPost = {
  entry: Post;
  slug: string;
  lang: Lang;
};

export function parsePostId(id: string): { slug: string; lang: Lang } {
  const withoutExt = id.replace(/\.[^.]+$/, '');
  const match = withoutExt.match(/^(.+)_([a-z]{2})$/);
  if (!match) {
    throw new Error(`unexpected post id: ${id} (expected <slug>_<lang>.md)`);
  }
  const [, slug, langCandidate] = match;
  if (!isLang(langCandidate)) {
    throw new Error(`unexpected post lang: ${langCandidate} (id=${id})`);
  }
  return { slug, lang: langCandidate };
}

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export async function loadAllPosts(): Promise<LocalizedPost[]> {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  return entries.map((entry) => {
    const { slug, lang } = parsePostId(entry.id);
    return { entry, slug, lang };
  });
}

export function filterByLang(posts: LocalizedPost[], lang: Lang): LocalizedPost[] {
  return posts.filter((post) => post.lang === lang);
}

export function sortByPubDateDesc(posts: LocalizedPost[]): LocalizedPost[] {
  return [...posts].sort(
    (a, b) => b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime()
  );
}

export function findTranslation(
  posts: LocalizedPost[],
  slug: string,
  targetLang: Lang
): LocalizedPost | undefined {
  return posts.find((post) => post.slug === slug && post.lang === targetLang);
}

export function postUrl(slug: string, lang: Lang): string {
  return lang === DEFAULT_LANG ? `/posts/${slug}` : `/${lang}/posts/${slug}`;
}

export function tagUrl(tag: string, lang: Lang): string {
  return lang === DEFAULT_LANG ? `/tags/${tag}` : `/${lang}/tags/${tag}`;
}

export function homeUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/' : `/${lang}`;
}

export function aboutUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/about' : `/${lang}/about`;
}

export function tagsIndexUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/tags' : `/${lang}/tags`;
}

export function postsIndexUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/posts' : `/${lang}/posts`;
}

export function rssUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/rss.xml' : `/${lang}/rss.xml`;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ja' ? 'en' : 'ja';
}

export type PageEntry = CollectionEntry<'pages'>;

export async function loadPage(slug: string, lang: Lang): Promise<PageEntry> {
  const id = `${slug}_${lang}`;
  const entry = await getEntry('pages', id);
  if (!entry) {
    throw new Error(`page not found: ${id}`);
  }
  return entry;
}

export function collectTags(posts: LocalizedPost[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}
