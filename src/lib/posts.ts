import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Lang = 'ja' | 'en';

export const LANGS = ['ja', 'en'] as const satisfies readonly Lang[];

export type Post = CollectionEntry<'posts'>;

export type LocalizedPost = {
  entry: Post;
  slug: string;
  lang: Lang;
};

/**
 * Parse an Astro Content Collection id (e.g. "hello_ja", "image-sample_ja",
 * "foo_bar_en") into a `{ slug, lang }` pair. Throws if the id does not end
 * with a recognised `_<lang>` suffix.
 *
 * The greedy `(.+)` is intentional: post slugs themselves may contain `_`,
 * so we only split on the trailing `_xx` segment.
 */
export function parsePostId(id: string): { slug: string; lang: Lang } {
  const withoutExt = id.replace(/\.[^.]+$/, '');
  // Two-step validation: the regex enforces the `_xx` shape and lets the
  // greedy `(.+)` capture slugs that themselves contain underscores; isLang
  // then narrows the two-letter suffix to the supported set. Splitting the
  // checks gives separate, more useful error messages than a single regex
  // built from LANGS would.
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

/** Type guard for the supported set of languages. */
export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/**
 * Load every published post (drafts excluded) and pair each entry with its
 * parsed `{ slug, lang }`. The same `slug` may appear in multiple languages;
 * each `(slug, lang)` pair is its own URL.
 */
export async function loadAllPosts(): Promise<LocalizedPost[]> {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  return entries.map((entry) => {
    const { slug, lang } = parsePostId(entry.id);
    return { entry, slug, lang };
  });
}

/** Sort posts by `pubDate` newest-first, returning a fresh array. */
export function sortByPubDateDesc(posts: LocalizedPost[]): LocalizedPost[] {
  return [...posts].sort(
    (a, b) => b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime()
  );
}

/**
 * Find the translation of `slug` in `targetLang`. Used by per-post pages to
 * show a "Read in <other lang>" link when the translation exists.
 */
export function findTranslation(
  posts: LocalizedPost[],
  slug: string,
  targetLang: Lang
): LocalizedPost | undefined {
  return posts.find((post) => post.slug === slug && post.lang === targetLang);
}

/** Return the opposite of `lang` from the supported pair. */
export function otherLang(lang: Lang): Lang {
  return lang === 'ja' ? 'en' : 'ja';
}

/**
 * URL of a post page. JA is canonical at `/posts/<slug>` (the site is
 * JA-first); EN translations live under the bare slug as
 * `/posts/<slug>/en`. EN-only posts are served at `/posts/<slug>/en`
 * with no canonical bare path.
 */
export function postUrl(slug: string, lang: Lang): string {
  return lang === 'ja' ? `/posts/${slug}` : `/posts/${slug}/en`;
}

/**
 * URL of a tag page. The tag is `encodeURIComponent`-ed so that tags
 * containing spaces, `#`, `/`, or non-ASCII characters do not break the
 * URL.
 */
export function tagUrl(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`;
}

export type PageEntry = CollectionEntry<'pages'>;

/**
 * Load a single page (e.g. `about`). Pages are English-only; the slug is
 * the file basename. Throws with a path hint when the file is missing.
 */
export async function loadPage(slug: string): Promise<PageEntry> {
  const entry = await getEntry('pages', slug);
  if (!entry) {
    throw new Error(
      `page not found: ${slug} (expected src/content/pages/${slug}.md)`
    );
  }
  return entry;
}

/**
 * Build a `tag → count` map across `posts`. Used both for the tag cloud and
 * to derive the unique tag set on tag-detail pages.
 */
export function collectTags(posts: LocalizedPost[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}
