#!/usr/bin/env -S node --experimental-strip-types
// Rewrites legacy intra-blog links inside post bodies: absolute URLs that
// point at blog.garaemon.com or garaemon.hatenadiary.{jp,com}/entry/... are
// remapped to local /posts/<slug> paths using each post's legacyUrl, and the
// bare blog homepage is rewritten to /.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractLegacyUrl, parseSlugFromFilename } from './_shared.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');

type SlugMap = Map<string, string>;

// legacyUrl values produced by import-hatena.ts always look like
// `/entry/YYYY/MM/DD/HHMMSS`. The map below keys off the
// `YYYY/MM/DD/HHMMSS` portion so the regex pattern in rewriteContent can
// look it up directly.
function buildLegacyToSlugMap(): SlugMap {
  const map: SlugMap = new Map();
  for (const filename of readdirSync(POSTS_DIR)) {
    const parsed = parseSlugFromFilename(filename);
    if (!parsed || parsed.lang !== 'ja') {
      continue;
    }
    const content = readFileSync(join(POSTS_DIR, filename), 'utf8');
    const legacy = extractLegacyUrl(content);
    if (!legacy) {
      continue;
    }
    const entryPath = legacy.startsWith('/entry/') ? legacy.slice('/entry/'.length) : null;
    if (!entryPath) {
      continue;
    }
    map.set(entryPath, parsed.slug);
  }
  return map;
}

function rewriteContent(content: string, slugMap: SlugMap): { updated: string; rewriteCount: number } {
  let rewriteCount = 0;

  // Run the entry pattern first: its prefix overlaps with the homepage
  // pattern, so reversing the order would let the homepage replace eat
  // /entry/... URLs before they have a chance to be remapped.
  const entryPattern = /https?:\/\/(?:blog\.garaemon\.com|garaemon\.hatenadiary\.(?:jp|com))\/entry\/(\d{4}\/\d{2}\/\d{2}\/\d+)\/?/g;
  const afterEntries = content.replace(entryPattern, (match, entryPath: string) => {
    const slug = slugMap.get(entryPath);
    if (!slug) {
      return match;
    }
    rewriteCount++;
    return `/posts/${slug}`;
  });

  // Lookahead requires the URL to terminate with a quote, whitespace, or
  // end-of-string, so longer URLs (e.g. /entry/...) that should already have
  // been handled by the entry pattern above are not accidentally truncated,
  // and homepage links at the very end of a file are still caught. The
  // imported corpus is HTML-flavoured, so we do not need to terminate on
  // markdown link `)` either; if a future re-run targets markdown sources,
  // extend the lookahead.
  const homePattern = /https?:\/\/blog\.garaemon\.com\/?(?=["\s]|$)/g;
  const updated = afterEntries.replace(homePattern, () => {
    rewriteCount++;
    return '/';
  });

  return { updated, rewriteCount };
}

function main(): void {
  const slugMap = buildLegacyToSlugMap();
  let totalRewrites = 0;
  let touchedPosts = 0;
  for (const filename of readdirSync(POSTS_DIR)) {
    if (!filename.endsWith('.md')) {
      continue;
    }
    const filePath = join(POSTS_DIR, filename);
    const original = readFileSync(filePath, 'utf8');
    const { updated, rewriteCount } = rewriteContent(original, slugMap);
    if (rewriteCount > 0 && updated !== original) {
      writeFileSync(filePath, updated);
      console.log(`${basename(filename)}: ${rewriteCount} link(s) rewritten`);
      touchedPosts++;
      totalRewrites += rewriteCount;
    }
  }
  console.log(`done: ${totalRewrites} links across ${touchedPosts} posts`);
}

main();
