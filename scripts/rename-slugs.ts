#!/usr/bin/env -S node --experimental-strip-types
// Renames imported post files (and their public/images/posts/<slug>/ dirs)
// from the legacy Hatena BASENAME-derived slug to a human-friendly slug
// derived from the post title. Collisions are disambiguated with a numeric
// suffix, and image references inside the markdown are updated in place.
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const IMAGES_ROOT = join(ROOT, 'public/images/posts');

const MAX_SLUG_TOKENS = 6;
const MAX_SLUG_LENGTH = 60;

type PostInfo = {
  filename: string;
  slug: string;
  lang: string;
  title: string;
  pubDate: string;
};

function parseSlugFromFilename(filename: string): { slug: string; lang: string } | null {
  const match = filename.match(/^(.+)_([a-z]{2})\.md$/);
  if (!match) {
    return null;
  }
  return { slug: match[1], lang: match[2] };
}

function readPostInfo(filename: string): PostInfo | null {
  const parsed = parseSlugFromFilename(filename);
  if (!parsed) {
    return null;
  }
  const content = readFileSync(join(POSTS_DIR, filename), 'utf8');
  const titleMatch = content.match(/^title:\s*"([^"]*)"\s*$/m);
  const dateMatch = content.match(/^pubDate:\s*([0-9T:.+\-Z]+)\s*$/m);
  if (!titleMatch || !dateMatch) {
    return null;
  }
  return {
    filename,
    slug: parsed.slug,
    lang: parsed.lang,
    title: titleMatch[1],
    pubDate: dateMatch[1],
  };
}

function slugFromTitle(title: string): string | null {
  const tokens = title.match(/[A-Za-z0-9][A-Za-z0-9._+-]*/g);
  if (!tokens) {
    return null;
  }
  const normalized = tokens
    .map((t) => t.toLowerCase())
    .map((t) => t.replace(/[^a-z0-9-]/g, '-'))
    .map((t) => t.replace(/-+/g, '-').replace(/^-|-$/g, ''))
    .filter((t) => t.length > 0);
  if (normalized.length === 0) {
    return null;
  }
  const limited = normalized.slice(0, MAX_SLUG_TOKENS);
  let candidate = limited.join('-');
  while (candidate.length > MAX_SLUG_LENGTH && limited.length > 1) {
    limited.pop();
    candidate = limited.join('-');
  }
  return candidate || null;
}

function fallbackSlugFromDate(currentSlug: string): string {
  return currentSlug;
}

function disambiguate(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    return base;
  }
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
  throw new Error(`could not disambiguate slug: ${base}`);
}

function planRenames(posts: PostInfo[]): Map<string, string> {
  const taken = new Set<string>();
  const renamesBySlug = new Map<string, string>();
  const sorted = [...posts].sort((a, b) => a.pubDate.localeCompare(b.pubDate));
  for (const post of sorted) {
    if (renamesBySlug.has(post.slug)) {
      continue;
    }
    const base = slugFromTitle(post.title) ?? fallbackSlugFromDate(post.slug);
    const finalSlug = disambiguate(base, taken);
    taken.add(finalSlug);
    renamesBySlug.set(post.slug, finalSlug);
  }
  return renamesBySlug;
}

function renameImageDir(oldSlug: string, newSlug: string): void {
  const oldDir = join(IMAGES_ROOT, oldSlug);
  const newDir = join(IMAGES_ROOT, newSlug);
  if (!existsSync(oldDir)) {
    return;
  }
  if (existsSync(newDir)) {
    return;
  }
  renameSync(oldDir, newDir);
}

function rewriteImagePaths(content: string, oldSlug: string, newSlug: string): string {
  const oldPath = `/images/posts/${oldSlug}/`;
  const newPath = `/images/posts/${newSlug}/`;
  const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content.replace(new RegExp(escaped, 'g'), newPath);
}

function applyRenames(posts: PostInfo[], renamesBySlug: Map<string, string>): void {
  for (const post of posts) {
    const newSlug = renamesBySlug.get(post.slug);
    if (!newSlug || newSlug === post.slug) {
      continue;
    }
    const oldPath = join(POSTS_DIR, post.filename);
    const newPath = join(POSTS_DIR, `${newSlug}_${post.lang}.md`);
    const content = readFileSync(oldPath, 'utf8');
    const updated = rewriteImagePaths(content, post.slug, newSlug);
    writeFileSync(oldPath, updated);
    renameSync(oldPath, newPath);
    renameImageDir(post.slug, newSlug);
    console.log(`${post.slug} -> ${newSlug}`);
  }
}

function main(): void {
  const filenames = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts: PostInfo[] = [];
  for (const filename of filenames) {
    const info = readPostInfo(filename);
    if (info) {
      posts.push(info);
    }
  }
  const renames = planRenames(posts);
  applyRenames(posts, renames);
  console.log(`renamed ${[...renames.entries()].filter(([from, to]) => from !== to).length} posts`);
}

main();
