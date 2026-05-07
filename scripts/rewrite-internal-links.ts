#!/usr/bin/env -S node --experimental-strip-types
// Rewrites legacy intra-blog links inside post bodies: absolute URLs that
// point at blog.garaemon.com or garaemon.hatenadiary.{jp,com}/entry/... are
// remapped to local /posts/<slug> paths using each post's legacyUrl, and the
// bare blog homepage is rewritten to /.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');

type SlugMap = Map<string, string>;

function parseSlugFromFilename(filename: string): { slug: string; lang: string } | null {
  const match = filename.match(/^(.+)_([a-z]{2})\.md$/);
  if (!match) {
    return null;
  }
  return { slug: match[1], lang: match[2] };
}

function extractLegacyUrl(content: string): string | undefined {
  const match = content.match(/^legacyUrl:\s*"?([^"\n]+)"?\s*$/m);
  return match ? match[1].trim() : undefined;
}

function buildLegacyToSlugMap(): SlugMap {
  const map: SlugMap = new Map();
  for (const filename of readdirSync(POSTS_DIR)) {
    if (!filename.endsWith('_ja.md')) {
      continue;
    }
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

function rewriteContent(content: string, slugMap: SlugMap): { updated: string; rewrites: number } {
  let rewrites = 0;
  let updated = content;

  const entryPattern = /https?:\/\/(?:blog\.garaemon\.com|garaemon\.hatenadiary\.(?:jp|com))\/entry\/([\d]{4}\/[\d]{2}\/[\d]{2}\/[\d]+)\/?/g;
  updated = updated.replace(entryPattern, (match, entryPath: string) => {
    const slug = slugMap.get(entryPath);
    if (!slug) {
      return match;
    }
    rewrites++;
    return `/posts/${slug}`;
  });

  const homePattern = /https?:\/\/blog\.garaemon\.com\/?(?=["\s])/g;
  updated = updated.replace(homePattern, () => {
    rewrites++;
    return '/';
  });

  return { updated, rewrites };
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
    const { updated, rewrites } = rewriteContent(original, slugMap);
    if (rewrites > 0 && updated !== original) {
      writeFileSync(filePath, updated);
      console.log(`${basename(filename)}: ${rewrites} link(s) rewritten`);
      touchedPosts++;
      totalRewrites += rewrites;
    }
  }
  console.log(`done: ${totalRewrites} links across ${touchedPosts} posts`);
}

main();
