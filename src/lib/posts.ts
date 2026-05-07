import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Lang = 'ja' | 'en';

export const LANGS = ['ja', 'en'] as const satisfies readonly Lang[];

// The default language has no URL prefix; the other language is served
// under `/<lang>/...`. postUrl/tagUrl/etc. all branch on this constant.
export const DEFAULT_LANG: Lang = 'ja';

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
 * parsed `{ slug, lang }`. The returned array contains posts in both
 * languages; callers narrow with `filterByLang`.
 */
export async function loadAllPosts(): Promise<LocalizedPost[]> {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  return entries.map((entry) => {
    const { slug, lang } = parsePostId(entry.id);
    return { entry, slug, lang };
  });
}

/** Keep only the posts that match `lang`. */
export function filterByLang(posts: LocalizedPost[], lang: Lang): LocalizedPost[] {
  return posts.filter((post) => post.lang === lang);
}

/** Sort posts by `pubDate` newest-first, returning a fresh array. */
export function sortByPubDateDesc(posts: LocalizedPost[]): LocalizedPost[] {
  return [...posts].sort(
    (a, b) => b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime()
  );
}

/**
 * Find the translation of `slug` in `targetLang`. Used by per-post pages to
 * decide whether the JA/EN switcher links to a matching post or falls back.
 */
export function findTranslation(
  posts: LocalizedPost[],
  slug: string,
  targetLang: Lang
): LocalizedPost | undefined {
  return posts.find((post) => post.slug === slug && post.lang === targetLang);
}

/** URL of a post page in `lang`. */
export function postUrl(slug: string, lang: Lang): string {
  return lang === DEFAULT_LANG ? `/posts/${slug}` : `/${lang}/posts/${slug}`;
}

/**
 * URL of a tag page in `lang`. The tag is `encodeURIComponent`-ed so that
 * tags containing spaces, `#`, `/`, or non-ASCII characters do not break the
 * URL. Tag slugs themselves are not yet normalised; that lives on the
 * import-side roadmap.
 */
export function tagUrl(tag: string, lang: Lang): string {
  const encoded = encodeURIComponent(tag);
  return lang === DEFAULT_LANG ? `/tags/${encoded}` : `/${lang}/tags/${encoded}`;
}

/** URL of the language home page. */
export function homeUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/' : `/${lang}`;
}

/** URL of the language about page. */
export function aboutUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/about' : `/${lang}/about`;
}

/** URL of the language tags index. */
export function tagsIndexUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/tags' : `/${lang}/tags`;
}

/** URL of the language posts index. */
export function postsIndexUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/posts' : `/${lang}/posts`;
}

/** URL of the language RSS feed. */
export function rssUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/rss.xml' : `/${lang}/rss.xml`;
}

/** Return the opposite of `lang` from the supported pair. */
export function otherLang(lang: Lang): Lang {
  return lang === 'ja' ? 'en' : 'ja';
}

export type PageEntry = CollectionEntry<'pages'>;

/**
 * Load a single page (e.g. `about`) in `lang`. Throws with a path hint when
 * the expected `<slug>_<lang>.md` file is missing so the build error points
 * at the file that needs to be created.
 */
export async function loadPage(slug: string, lang: Lang): Promise<PageEntry> {
  const id = `${slug}_${lang}`;
  const entry = await getEntry('pages', id);
  if (!entry) {
    throw new Error(
      `page not found: ${id} (expected src/content/pages/${id}.md)`
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
