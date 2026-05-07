#!/usr/bin/env -S node --experimental-strip-types
// Generates public/_redirects from each post's legacyUrl frontmatter so that
// the original Hatena Blog paths return 301 redirects to /posts/<slug>.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const REDIRECTS_FILE = join(ROOT, 'public/_redirects');

type RedirectRule = { from: string; to: string };

function parseSlugFromFilename(filename: string): { slug: string; lang: string } {
  const match = filename.match(/^(.+)_([a-z]{2})\.md$/);
  if (!match) {
    throw new Error(`unexpected post filename: ${filename}`);
  }
  return { slug: match[1], lang: match[2] };
}

function extractLegacyUrl(content: string): string | undefined {
  const match = content.match(/^legacyUrl:\s*"?([^"\n]+)"?\s*$/m);
  return match ? match[1].trim() : undefined;
}

function buildRules(): RedirectRule[] {
  const rules: RedirectRule[] = [];
  for (const filename of readdirSync(POSTS_DIR)) {
    if (!filename.endsWith('.md')) {
      continue;
    }
    const { slug, lang } = parseSlugFromFilename(filename);
    if (lang !== 'ja') {
      continue;
    }
    const content = readFileSync(join(POSTS_DIR, filename), 'utf8');
    const legacy = extractLegacyUrl(content);
    if (!legacy) {
      continue;
    }
    rules.push({ from: legacy, to: `/posts/${slug}` });
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
