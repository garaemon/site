import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  loadAllPosts,
  filterByLang,
  sortByPubDateDesc,
  postUrl,
} from '../../lib/posts';
import { RSS_TITLE_BY_LANG, DEFAULT_DESCRIPTION_BY_LANG } from '../../lib/site';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('astro.config.mjs must set `site` to build the RSS feed.');
  }
  const allPosts = await loadAllPosts();
  const enPosts = sortByPubDateDesc(filterByLang(allPosts, 'en'));
  return rss({
    title: RSS_TITLE_BY_LANG.en,
    description: DEFAULT_DESCRIPTION_BY_LANG.en,
    site: context.site,
    items: enPosts.map((post) => ({
      title: post.entry.data.title,
      pubDate: post.entry.data.pubDate,
      description: post.entry.data.description,
      link: postUrl(post.slug, 'en'),
      categories: post.entry.data.tags,
    })),
  });
}
