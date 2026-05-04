import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  loadAllPosts,
  filterByLang,
  sortByPubDateDesc,
  postUrl,
} from '../../lib/posts';

export async function GET(context: APIContext) {
  const all = await loadAllPosts();
  const en = sortByPubDateDesc(filterByLang(all, 'en'));
  return rss({
    title: 'garaemon (English)',
    description: 'A machine that consumes pop culture and outputs code.',
    site: context.site!,
    items: en.map((post) => ({
      title: post.entry.data.title,
      pubDate: post.entry.data.pubDate,
      description: post.entry.data.description,
      link: postUrl(post.slug, 'en'),
      categories: post.entry.data.tags,
    })),
  });
}
