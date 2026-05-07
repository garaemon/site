#!/usr/bin/env -S node --experimental-strip-types
// Scans every post in src/content/posts for remote Hatena image URLs,
// downloads each image into public/images/posts/<slug>/, and rewrites the
// markdown to reference the locally hosted copy. Idempotent: already-fetched
// files are skipped.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireSlugFromFilename } from './_shared.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const IMAGES_ROOT = join(ROOT, 'public/images/posts');

const HATENA_HOST_PATTERN = /^https?:\/\/(?:cdn-ak\.f\.st-hatena\.com|cdn\.image\.st-hatena\.com|f\.hatena\.ne\.jp)\//;
const FETCH_TIMEOUT_MS = 30_000;
const FETCH_USER_AGENT = 'blog-migration (garaemon/site)';

function listPostFiles(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => join(POSTS_DIR, name));
}

// Hatena's MT export emits images as `<img src="...">` (always
// double-quoted), so this scanner only handles double-quoted src/href
// attributes. Markdown image syntax `![alt](...)` and single-quoted
// attributes are not present in the corpus and are intentionally not
// matched.
function findImageUrls(markdown: string): string[] {
  const urls = new Set<string>();
  const srcPattern = /(?:src|href)="(https?:\/\/[^"]+)"/g;
  for (const match of markdown.matchAll(srcPattern)) {
    const url = match[1];
    if (HATENA_HOST_PATTERN.test(url) && /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(url)) {
      urls.add(url);
    }
  }
  return [...urls];
}

// We dedupe by basename (after stripping the query string), assuming Hatena
// posts never reference two distinct images that share a basename. If two
// URLs differ only by query string, the second download is short-circuited
// because the file already exists; the bytes of the first one win.
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
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'user-agent': FETCH_USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  // TODO: cap response size (e.g. at 25 MiB) to defend against runaway
  // downloads if this script is ever pointed at a less-trusted source.
  // The current corpus is filtered to the Hatena CDN, so this is acceptable.
  const arrayBuffer = await response.arrayBuffer();
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(arrayBuffer));
  return true;
}

// Substitutes the bare URL inside src/href attributes only, mirroring the
// shape that findImageUrls captured. A naive global string replace would
// also rewrite the URL if it appeared inside prose or a code block, which
// we do not want.
function rewriteAttributeUrls(content: string, oldUrl: string, newUrl: string): string {
  const escapedUrl = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`((?:src|href)=")${escapedUrl}(")`, 'g');
  return content.replace(pattern, `$1${newUrl}$2`);
}

async function processPost(filePath: string): Promise<{ downloaded: number; rewritten: number; failed: number }> {
  const { slug } = requireSlugFromFilename(basename(filePath));
  const original = readFileSync(filePath, 'utf8');
  const urls = findImageUrls(original);
  if (urls.length === 0) {
    return { downloaded: 0, rewritten: 0, failed: 0 };
  }

  let downloaded = 0;
  let failed = 0;
  let rewritten = 0;
  const successfulRewrites: { from: string; to: string }[] = [];
  for (const url of urls) {
    const paths = localPathFor(slug, url);
    try {
      const fresh = await downloadOnce(url, paths.absolute);
      if (fresh) {
        downloaded++;
      }
    } catch (error) {
      // Per-URL fetch failures (404, timeout, transient network errors) must
      // not abort the whole batch -- a re-run will pick the rest of the URLs
      // back up where this one left off.
      failed++;
      console.warn(`fetch failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    successfulRewrites.push({ from: url, to: paths.webPath });
  }

  const updated = successfulRewrites.reduce(
    (acc, { from, to }) => rewriteAttributeUrls(acc, from, to),
    original
  );
  if (updated !== original) {
    writeFileSync(filePath, updated);
    rewritten = successfulRewrites.length;
  }
  return { downloaded, rewritten, failed };
}

async function main(): Promise<void> {
  const files = listPostFiles();
  let totalDownloaded = 0;
  let totalFailed = 0;
  let postsTouched = 0;
  for (const file of files) {
    const { downloaded, rewritten, failed } = await processPost(file);
    if (downloaded > 0 || rewritten > 0 || failed > 0) {
      console.log(`${basename(file)}: downloaded=${downloaded} rewritten=${rewritten} failed=${failed}`);
    }
    totalDownloaded += downloaded;
    totalFailed += failed;
    if (rewritten > 0) {
      postsTouched++;
    }
  }
  console.log(`done: downloaded ${totalDownloaded} images, updated ${postsTouched} posts, ${totalFailed} fetch failures`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
