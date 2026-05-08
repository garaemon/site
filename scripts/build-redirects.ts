#!/usr/bin/env -S node --experimental-strip-types
// Generates public/_redirects from each post's legacyUrl frontmatter so that
// the original Hatena Blog paths return 301 redirects to /posts/<slug>.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractLegacyUrl, parseSlugFromFilename } from './lib/shared.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const REDIRECTS_FILE = join(ROOT, 'public/_redirects');

type RedirectRule = { from: string; to: string };

async function buildRules(): Promise<RedirectRule[]> {
  const rules: RedirectRule[] = [];
  const filenames = await readdir(POSTS_DIR);
  for (const filename of filenames) {
    const parsed = parseSlugFromFilename(filename);
    // Only Japanese posts carry legacyUrl, so non-JA files contribute nothing
    // to the redirect map.
    if (!parsed || parsed.lang !== 'ja') {
      continue;
    }
    const content = await readFile(join(POSTS_DIR, filename), 'utf8');
    const legacy = extractLegacyUrl(content);
    if (!legacy) {
      continue;
    }
    rules.push({ from: legacy, to: `/posts/${parsed.slug}` });
  }
  rules.sort((a, b) => a.from.localeCompare(b.from));
  return rules;
}

function renderRedirects(rules: RedirectRule[]): string {
  const lines = rules.map((rule) => `${rule.from} ${rule.to} 301`);
  return lines.join('\n') + '\n';
}

async function main(): Promise<void> {
  const rules = await buildRules();
  await writeFile(REDIRECTS_FILE, renderRedirects(rules));
  console.log(`wrote ${rules.length} redirect rules to ${REDIRECTS_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
