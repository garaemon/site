#!/usr/bin/env -S node --experimental-strip-types
// Renames imported post files (and their public/images/posts/<slug>/ dirs)
// from the legacy Hatena BASENAME-derived slug to a human-friendly slug
// derived from the post title. Collisions are disambiguated with a numeric
// suffix, and image references inside the markdown are updated in place.
import { readFile, writeFile, readdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSlugFromFilename, pathExists } from './lib/shared.ts';

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

async function readPostInfo(filename: string): Promise<PostInfo | null> {
  const parsed = parseSlugFromFilename(filename);
  if (!parsed) {
    return null;
  }
  const content = await readFile(join(POSTS_DIR, filename), 'utf8');
  // Title regex assumes the value never contains an escaped `\"`. The
  // importer's yamlString collapses newlines and only escapes `\` and `"`,
  // so titles with embedded quotes would truncate here -- keep this in sync
  // with yamlString if the importer ever permits embedded quotes.
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

function findFittingSlug(tokens: readonly string[], maxLength: number): string {
  for (let count = tokens.length; count > 0; count--) {
    const candidate = tokens.slice(0, count).join('-');
    if (candidate.length <= maxLength) {
      return candidate;
    }
  }
  return tokens[0].slice(0, maxLength);
}

// We only keep ASCII tokens because Cloudflare-friendly URLs are best kept
// ASCII; Japanese-only or non-Latin titles return null, and the call site
// falls back to the date-based slug carried over from the Hatena import.
function slugFromTitle(title: string): string | null {
  const tokens = title.match(/[A-Za-z0-9][A-Za-z0-9._+-]*/g);
  if (!tokens) {
    return null;
  }
  const normalized = tokens
    .map((token) => token.toLowerCase())
    .map((token) => token.replace(/[^a-z0-9-]/g, '-'))
    .map((token) => token.replace(/-+/g, '-').replace(/^-|-$/g, ''))
    .filter((token) => token.length > 0);
  if (normalized.length === 0) {
    return null;
  }
  const limited = normalized.slice(0, MAX_SLUG_TOKENS);
  const candidate = findFittingSlug(limited, MAX_SLUG_LENGTH);
  return candidate || null;
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

// Drive the slug derivation off the JA file only: Japanese is the canonical
// language for this site, so an EN translation should not influence the slug.
// applyRenames still sweeps all languages and renames the EN file via the
// shared old-slug key. Note that EN-only posts (no JA counterpart) are
// intentionally not in the rename map, so they keep their date-based slug;
// this matches the corpus today and is documented in scripts/README.md.
function planRenames(posts: PostInfo[]): Map<string, string> {
  const taken = new Set<string>();
  const renamesBySlug = new Map<string, string>();
  const jaPosts = posts.filter((post) => post.lang === 'ja');
  // Sort by pubDate so the oldest post claims the bare slug; later posts that
  // collide get -2/-3 suffixes. Older URLs are more likely to be linked
  // externally, so we prefer to preserve their unsuffixed form.
  const sorted = [...jaPosts].sort((a, b) => a.pubDate.localeCompare(b.pubDate));
  for (const post of sorted) {
    if (renamesBySlug.has(post.slug)) {
      continue;
    }
    // Fall back to the existing (date-based) slug when the title has no
    // ASCII tokens to derive a readable slug from.
    const base = slugFromTitle(post.title) ?? post.slug;
    const finalSlug = disambiguate(base, taken);
    taken.add(finalSlug);
    renamesBySlug.set(post.slug, finalSlug);
  }
  return renamesBySlug;
}

async function renameImageDir(oldSlug: string, newSlug: string): Promise<void> {
  const oldDir = join(IMAGES_ROOT, oldSlug);
  const newDir = join(IMAGES_ROOT, newSlug);
  if (!(await pathExists(oldDir))) {
    return;
  }
  // The destination already exists when both _ja.md and _en.md share a slug
  // (the second pass is a no-op). It can also exist if a prior partial run
  // left state behind, in which case stale files may linger in oldDir; log so
  // a manual cleanup path is discoverable.
  if (await pathExists(newDir)) {
    console.log(`image dir rename skipped (destination exists): ${oldSlug} -> ${newSlug}`);
    return;
  }
  await rename(oldDir, newDir);
}

// `/images/posts/<slug>/` is unique enough as a path prefix that we can
// rewrite every occurrence in the post body, regardless of the surrounding
// syntax. That covers both `<img src="...">` attributes and Markdown
// `![alt](...)` link targets, which is why this is broader than
// download-images.ts:rewriteAttributeUrls -- there the input is an absolute
// URL that could plausibly appear inside prose or a code block, but here the
// path is a project-internal identifier.
function rewriteImagePaths(content: string, oldSlug: string, newSlug: string): string {
  const oldPath = `/images/posts/${oldSlug}/`;
  const newPath = `/images/posts/${newSlug}/`;
  const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content.replace(new RegExp(escaped, 'g'), newPath);
}

async function applyRenames(posts: PostInfo[], renamesBySlug: Map<string, string>): Promise<number> {
  let renamedFiles = 0;
  for (const post of posts) {
    const newSlug = renamesBySlug.get(post.slug);
    if (!newSlug || newSlug === post.slug) {
      continue;
    }
    const oldPath = join(POSTS_DIR, post.filename);
    const newPath = join(POSTS_DIR, `${newSlug}_${post.lang}.md`);
    // disambiguate() prevents collisions inside a single run, but a previous
    // interrupted run or a manual edit could have left a file at newPath.
    // Skip with a warning so we never silently clobber existing work --
    // mirrors the symmetric guard in renameImageDir.
    if (await pathExists(newPath)) {
      console.warn(`post rename skipped (destination exists): ${post.filename} -> ${newSlug}_${post.lang}.md`);
      continue;
    }
    const content = await readFile(oldPath, 'utf8');
    const updated = rewriteImagePaths(content, post.slug, newSlug);
    // Rename first, then write the rewritten body to the new path. If a step
    // fails partway through, the file is either still under its old name with
    // the original body, or under its new name pending a rewrite -- both are
    // simpler to recover from than "old name, new body" would be. A "renamed
    // but not rewritten" recovery path is intentionally not automated: a
    // re-run rebuilds the slug map from current filenames and would not
    // retry, so manual `git diff` before commit is the recovery surface.
    await rename(oldPath, newPath);
    await writeFile(newPath, updated);
    await renameImageDir(post.slug, newSlug);
    console.log(`${post.slug} -> ${newSlug}`);
    renamedFiles++;
  }
  return renamedFiles;
}

async function main(): Promise<void> {
  const filenames = (await readdir(POSTS_DIR)).filter((filename) => filename.endsWith('.md'));
  const posts: PostInfo[] = [];
  for (const filename of filenames) {
    const info = await readPostInfo(filename);
    if (info) {
      posts.push(info);
    }
  }
  const renames = planRenames(posts);
  const renamedFiles = await applyRenames(posts, renames);
  console.log(`renamed ${renamedFiles} files`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
