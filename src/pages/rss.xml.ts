// /rss.xml — the single Atom-style feed for the site, fed by the JA-canonical posts.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { loadAllPosts, sortByPubDateDesc, postUrl } from '../lib/posts';
import { RSS_TITLE, SITE_DESCRIPTION } from '../lib/site';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('astro.config.mjs must set `site` to build the RSS feed.');
  }
  const allPosts = await loadAllPosts();
  const sortedPosts = sortByPubDateDesc(allPosts);
  return rss({
    title: RSS_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    // Cloudflare Pages is configured with `html_handling: "drop-trailing-slash"`,
    // so emit canonical no-slash URLs here to avoid a 307 hop on every RSS click.
    trailingSlash: false,
    items: sortedPosts.map((post) => ({
      title: post.entry.data.title,
      pubDate: post.entry.data.pubDate,
      description: post.entry.data.description,
      link: postUrl(post.slug, post.lang),
      categories: post.entry.data.tags,
    })),
  });
}
