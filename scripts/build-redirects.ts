#!/usr/bin/env -S node --experimental-strip-types
// Generates public/_redirects from each post's legacyUrl frontmatter so that
// the original Hatena Blog paths return 301 redirects to /posts/<slug>.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractLegacyUrl, parseSlugFromFilename } from './_shared.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const REDIRECTS_FILE = join(ROOT, 'public/_redirects');

type RedirectRule = { from: string; to: string };

function buildRules(): RedirectRule[] {
  const rules: RedirectRule[] = [];
  for (const filename of readdirSync(POSTS_DIR)) {
    const parsed = parseSlugFromFilename(filename);
    // Only Japanese posts carry legacyUrl, so non-JA files contribute nothing
    // to the redirect map.
    if (!parsed || parsed.lang !== 'ja') {
      continue;
    }
    const content = readFileSync(join(POSTS_DIR, filename), 'utf8');
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

function main(): void {
  const rules = buildRules();
  writeFileSync(REDIRECTS_FILE, renderRedirects(rules));
  console.log(`wrote ${rules.length} redirect rules to ${REDIRECTS_FILE}`);
}

main();
