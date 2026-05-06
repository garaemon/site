#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const IMAGES_ROOT = join(ROOT, 'public/images/posts');

const HATENA_HOST_PATTERN = /^https?:\/\/(?:cdn-ak\.f\.st-hatena\.com|cdn\.image\.st-hatena\.com|f\.hatena\.ne\.jp)\//;

function parseSlugFromFilename(filename: string): string {
  const match = filename.match(/^(.+)_([a-z]{2})\.md$/);
  if (!match) {
    throw new Error(`unexpected post filename: ${filename}`);
  }
  return match[1];
}

function listPostFiles(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => join(POSTS_DIR, name));
}

function findImageUrls(markdown: string): string[] {
  const urls = new Set<string>();
  const srcPattern = /(?:src|href)="(https?:\/\/[^"]+)"/g;
  for (const match of markdown.matchAll(srcPattern)) {
    const url = match[1];
    if (HATENA_HOST_PATTERN.test(url) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) {
      urls.add(url);
    }
  }
  return [...urls];
}

function localPathFor(slug: string, url: string): { dir: string; absolute: string; webPath: string } {
  const cleanUrl = url.split('?')[0];
  const filename = basename(cleanUrl);
  const safeName = filename || `image${extname(cleanUrl) || '.bin'}`;
  const dir = join(IMAGES_ROOT, slug);
  const absolute = join(dir, safeName);
  const webPath = `/images/posts/${slug}/${safeName}`;
  return { dir, absolute, webPath };
}

async function downloadOnce(url: string, target: string): Promise<boolean> {
  if (existsSync(target)) {
    return false;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(arrayBuffer));
  return true;
}

async function processPost(filePath: string): Promise<{ downloaded: number; rewrites: number }> {
  const slug = parseSlugFromFilename(basename(filePath));
  const original = readFileSync(filePath, 'utf8');
  const urls = findImageUrls(original);
  if (urls.length === 0) {
    return { downloaded: 0, rewrites: 0 };
  }

  let downloaded = 0;
  let updated = original;
  for (const url of urls) {
    const target = localPathFor(slug, url);
    const fresh = await downloadOnce(url, target.absolute);
    if (fresh) {
      downloaded++;
    }
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updated = updated.replace(new RegExp(escaped, 'g'), target.webPath);
  }

  let rewrites = 0;
  if (updated !== original) {
    writeFileSync(filePath, updated);
    rewrites = 1;
  }
  return { downloaded, rewrites };
}

async function main(): Promise<void> {
  const files = listPostFiles();
  let totalDownloaded = 0;
  let totalRewrites = 0;
  for (const file of files) {
    const { downloaded, rewrites } = await processPost(file);
    if (downloaded > 0 || rewrites > 0) {
      console.log(`${basename(file)}: downloaded=${downloaded} rewrites=${rewrites}`);
    }
    totalDownloaded += downloaded;
    totalRewrites += rewrites;
  }
  console.log(`done: downloaded ${totalDownloaded} images, updated ${totalRewrites} posts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
