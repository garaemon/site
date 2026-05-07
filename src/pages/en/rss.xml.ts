import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  loadAllPosts,
  filterByLang,
  sortByPubDateDesc,
  postUrl,
} from '../../lib/posts';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('astro.config.mjs must set `site` to build the RSS feed.');
  }
  const allPosts = await loadAllPosts();
  const enPosts = sortByPubDateDesc(filterByLang(allPosts, 'en'));
  return rss({
    title: 'garaemon (English)',
    description: 'A machine that consumes pop culture and outputs code.',
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
