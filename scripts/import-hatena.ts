#!/usr/bin/env -S node --experimental-strip-types
// Parses the Hatena Blog Movable-Type export (blog.garaemon.com.export.txt)
// and writes one Astro content file per published entry into
// src/content/posts/<slug>_ja.md, including frontmatter (title, pubDate,
// description, tags, legacyUrl) and a lightly cleaned-up HTML body.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathExists } from './lib/shared.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const EXPORT_FILE = join(ROOT, 'blog.garaemon.com.export.txt');
const POSTS_DIR = join(ROOT, 'src/content/posts');

type Header = {
  TITLE?: string;
  BASENAME?: string;
  STATUS?: string;
  DATE?: string;
  CATEGORY?: string[];
};

type Entry = {
  header: Header;
  body: string;
};

/**
 * Parse a full Movable Type export. The input contains one or more entries
 * separated by a line of exactly eight dashes (`--------`). Empty blocks --
 * for example trailing whitespace -- are tolerated and skipped.
 */
function parseExport(text: string): Entry[] {
  const blocks = text.split(/\r?\n--------\r?\n/);
  const entries: Entry[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) {
      continue;
    }
    const entry = parseEntry(trimmed);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

/**
 * Parse a single entry block. The block is a header section followed by one
 * or more body sections separated by `-----`. The header is a sequence of
 * `KEY: VALUE` lines (TITLE, BASENAME, STATUS, DATE, plus zero-or-more
 * CATEGORY values); each body section begins with a tag line such as
 * `BODY:`, `EXTENDED BODY:`, or `COMMENT:` followed by the section's
 * content. Returns null when the block lacks the header/body separator.
 */
function parseEntry(block: string): Entry | null {
  const sections = block.split(/\r?\n-----\r?\n/);
  if (sections.length < 2) {
    return null;
  }
  const headerSection = sections[0];
  const header: Header = {};
  for (const line of headerSection.split(/\r?\n/)) {
    const colon = line.indexOf(': ');
    if (colon < 0) {
      continue;
    }
    const key = line.slice(0, colon);
    const value = line.slice(colon + 2);
    if (key === 'CATEGORY') {
      const list = header.CATEGORY ?? [];
      list.push(value);
      header.CATEGORY = list;
    } else if (key === 'TITLE' || key === 'BASENAME' || key === 'STATUS' || key === 'DATE') {
      header[key] = value;
    }
  }
  const bodySection = pickBody(sections.slice(1));
  return { header, body: bodySection.trim() };
}

/**
 * Pick the `BODY:` section out of an entry's body-section list. Each input
 * section starts with a tag line (`BODY:`, `EXTENDED BODY:`, `COMMENT:`,
 * etc.) followed by the section's content. Returns the empty string when
 * no BODY section is present so the caller can skip the entry rather than
 * mistaking another section's content for the post body.
 */
function pickBody(sections: string[]): string {
  for (const section of sections) {
    const match = section.match(/^BODY:\r?\n([\s\S]*)$/);
    if (match) {
      return match[1];
    }
  }
  return '';
}

/**
 * Parse a `DATE` value from a Hatena MT export. The expected shape is
 * `MM/DD/YYYY HH:MM:SS` (Hatena writes timestamps in JST), and the result is
 * the corresponding instant interpreted as Asia/Tokyo.
 */
function parseHatenaDate(input: string): Date {
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(`unexpected DATE format: ${input}`);
  }
  const [, mm, dd, yyyy, hh, mi, ss] = match;
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+09:00`);
}

// Hatena's MT export only emits this short list of named entities (plus the
// numeric &#39; for the apostrophe). Numeric entities such as &#NNN; or
// &#xHH; do not appear in the corpus we are importing, so we deliberately do
// not try to decode them.
function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Remove Hatena's auto-linked keyword anchors. The expected input is HTML
 * containing zero-or-more `<a class="keyword" href="...">text</a>` tags
 * (Hatena Blog wraps any term that matches its keyword dictionary). The
 * surrounding `<a>` is dropped and the inner text is kept verbatim.
 */
function stripHatenaKeywordLinks(html: string): string {
  return html.replace(/<a\s+class="keyword"[^>]*>([\s\S]*?)<\/a>/g, '$1');
}

/**
 * Convert Hatena's syntax-highlighted code blocks to fenced markdown. The
 * expected input is HTML containing
 * `<pre class="code lang-LANG" ...>... <span class="syn*">tok</span> ...</pre>`
 * blocks, where LANG is the language tag (e.g. `ts`, `c++`, `objective-c`)
 * and the inner `<span class="syn*">` wrappers are highlight tokens. The
 * spans are unwrapped, entities are decoded, and the result is emitted as a
 * triple-backtick code fence with the original LANG.
 */
function convertHighlightedPre(html: string): string {
  return html.replace(
    /<pre[^>]*class="code\s+lang-([\w+#-]+)"[^>]*>([\s\S]*?)<\/pre>/g,
    (_full, lang: string, inner: string) => {
      const stripped = inner.replace(/<span\s+class="syn[^"]*">([\s\S]*?)<\/span>/g, '$1');
      const decoded = decodeEntities(stripped);
      return `\n\n\`\`\`${lang}\n${decoded.trim()}\n\`\`\`\n\n`;
    }
  );
}

/**
 * Convert plain Hatena code blocks to fenced markdown. The expected input
 * is HTML containing `<pre><code class="LANG">…</code></pre>` blocks that
 * Hatena emits when no syntax-highlight markup is requested. Entities are
 * decoded and the result is emitted as a triple-backtick code fence with
 * the original LANG.
 */
function convertCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code\s+class="([\w+#-]+)">([\s\S]*?)<\/code><\/pre>/g,
    (_full, lang: string, inner: string) => {
      const decoded = decodeEntities(inner);
      return `\n\n\`\`\`${lang}\n${decoded.trim()}\n\`\`\`\n\n`;
    }
  );
}

function cleanupBody(html: string): string {
  const stripped = stripHatenaKeywordLinks(html);
  const highlighted = convertHighlightedPre(stripped);
  const fenced = convertCodeBlocks(highlighted);
  return fenced.trim();
}

// Pulls the first <p>…</p> as a description. If the entry leads with a code
// block, figure, or other non-paragraph element, the description stays
// undefined -- the schema makes it optional, so we deliberately do not fall
// back to "first text-bearing block."
function deriveDescription(body: string): string | undefined {
  const firstP = body.match(/<p>([\s\S]*?)<\/p>/);
  if (!firstP) {
    return undefined;
  }
  const stripped = firstP[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  // Decode entities so the description does not end up with literal "&amp;"
  // (or similar) inside the YAML frontmatter.
  const text = decodeEntities(stripped);
  if (!text) {
    return undefined;
  }
  // The description is an approximation, not a structurally-significant
  // string, so we slice on UTF-16 code units. A surrogate-pair split (e.g.
  // half of an emoji at the boundary) is acceptable for the rare titles
  // where it would happen.
  return text.length > 160 ? text.slice(0, 157) + '...' : text;
}

function yamlString(value: string): string {
  // Collapse newlines and tabs to single spaces so a stray line break in a
  // title or category does not produce a multi-line YAML scalar that the
  // simple regex-based readers in lib/shared.ts would mis-parse.
  const flattened = value.replace(/[\r\n\t]+/g, ' ');
  return `"${flattened.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function renderFrontmatter(data: {
  title: string;
  pubDate: string;
  description?: string;
  tags: string[];
  legacyUrl: string;
}): string {
  const lines = ['---'];
  lines.push(`title: ${yamlString(data.title)}`);
  lines.push(`pubDate: ${data.pubDate}`);
  if (data.description) {
    lines.push(`description: ${yamlString(data.description)}`);
  }
  if (data.tags.length > 0) {
    lines.push(`tags: [${data.tags.map(yamlString).join(', ')}]`);
  }
  lines.push(`legacyUrl: ${yamlString(data.legacyUrl)}`);
  lines.push('---');
  return lines.join('\n');
}

const SKIP_REASONS = ['unpublished', 'missing-fields', 'unsafe-basename', 'empty-body'] as const;
type SkipReason = (typeof SKIP_REASONS)[number];

// BASENAMEs in Hatena MT exports are typically date-based
// (`YYYY/MM/DD/HHMMSS`), but custom BASENAMEs can technically contain any
// character. Restrict to a filesystem- and URL-safe subset so a stray space
// or non-ASCII character does not crash writeFileSync or land in a public URL.
const SAFE_BASENAME_PATTERN = /^[A-Za-z0-9/_.-]+$/;

function buildEntryFile(entry: Entry): { path: string; content: string } | { skip: SkipReason } {
  if (entry.header.STATUS !== 'Publish') {
    return { skip: 'unpublished' };
  }
  const entryBasename = entry.header.BASENAME;
  const dateStr = entry.header.DATE;
  const title = entry.header.TITLE;
  if (!entryBasename || !dateStr || !title) {
    return { skip: 'missing-fields' };
  }
  if (!SAFE_BASENAME_PATTERN.test(entryBasename)) {
    return { skip: 'unsafe-basename' };
  }
  // Check the cleaned-up body, not the raw one: keyword links and code-block
  // markers can make a non-empty raw body collapse to an empty post.
  const cleanedBody = cleanupBody(entry.body);
  if (!cleanedBody) {
    return { skip: 'empty-body' };
  }
  const date = parseHatenaDate(dateStr);
  const slug = entryBasename.replace(/\//g, '-');
  const legacyUrl = `/entry/${entryBasename}`;
  const tags = (entry.header.CATEGORY ?? []).map((category) => category.trim()).filter(Boolean);
  const description = deriveDescription(cleanedBody);
  const frontmatter = renderFrontmatter({
    title,
    pubDate: date.toISOString(),
    description,
    tags,
    legacyUrl,
  });
  return {
    path: join(POSTS_DIR, `${slug}_ja.md`),
    content: `${frontmatter}\n\n${cleanedBody}\n`,
  };
}

async function main(): Promise<void> {
  const text = await readFile(EXPORT_FILE, 'utf8');
  const entries = parseExport(text);
  // mkdir with recursive:true is idempotent, so we can ensure POSTS_DIR up
  // front and then skip the per-entry directory check.
  await mkdir(POSTS_DIR, { recursive: true });
  let written = 0;
  let overwritten = 0;
  let skippedExisting = 0;
  const skippedByReason = Object.fromEntries(
    SKIP_REASONS.map((reason) => [reason, 0])
  ) as Record<SkipReason, number>;
  // Track every path we have written in this run so a duplicate BASENAME
  // surfaces as a warning instead of silently overwriting the earlier entry.
  const writtenPaths = new Set<string>();
  for (const entry of entries) {
    const result = buildEntryFile(entry);
    if ('skip' in result) {
      skippedByReason[result.skip]++;
      if (result.skip === 'missing-fields') {
        // A missing BASENAME/DATE/TITLE almost always means a malformed
        // export; surface it so the operator notices instead of silently
        // dropping the entry.
        console.warn(`skip: missing BASENAME/DATE/TITLE for entry titled "${entry.header.TITLE ?? '(untitled)'}"`);
      }
      if (result.skip === 'unsafe-basename') {
        console.warn(`skip: unsafe BASENAME "${entry.header.BASENAME ?? ''}" for entry titled "${entry.header.TITLE ?? '(untitled)'}"`);
      }
      continue;
    }
    const exists = await pathExists(result.path);
    // Re-running the importer overwrites previously imported posts. That is
    // intentional for re-exports, but it would also clobber manual edits, so
    // honour HATENA_IMPORT_SKIP_EXISTING when the operator wants to preserve
    // local changes.
    if (process.env.HATENA_IMPORT_SKIP_EXISTING === '1' && exists) {
      skippedExisting++;
      continue;
    }
    if (writtenPaths.has(result.path)) {
      console.warn(`duplicate output path within this run: ${result.path}`);
    }
    if (exists) {
      overwritten++;
    }
    await writeFile(result.path, result.content);
    writtenPaths.add(result.path);
    written++;
  }
  const reasonsLog = SKIP_REASONS
    .map((reason) => `${reason}=${skippedByReason[reason]}`)
    .join(', ');
  const skippedTotal = SKIP_REASONS.reduce((sum, reason) => sum + skippedByReason[reason], 0) + skippedExisting;
  console.log(
    `wrote ${written} entries (${overwritten} overwritten), ` +
      `skipped ${skippedTotal} of ${entries.length} total ` +
      `(${reasonsLog}, existing=${skippedExisting})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
