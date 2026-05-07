import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  loadAllPosts,
  filterByLang,
  sortByPubDateDesc,
  postUrl,
} from '../lib/posts';
import { RSS_TITLE_BY_LANG, DEFAULT_DESCRIPTION_BY_LANG } from '../lib/site';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('astro.config.mjs must set `site` to build the RSS feed.');
  }
  const allPosts = await loadAllPosts();
  const jaPosts = sortByPubDateDesc(filterByLang(allPosts, 'ja'));
  return rss({
    title: RSS_TITLE_BY_LANG.ja,
    description: DEFAULT_DESCRIPTION_BY_LANG.ja,
    site: context.site,
    items: jaPosts.map((post) => ({
      title: post.entry.data.title,
      pubDate: post.entry.data.pubDate,
      description: post.entry.data.description,
      link: postUrl(post.slug, 'ja'),
      categories: post.entry.data.tags,
    })),
  });
}
