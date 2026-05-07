#!/usr/bin/env -S node --experimental-strip-types
// Parses the Hatena Blog Movable-Type export (blog.garaemon.com.export.txt)
// and writes one Astro content file per published entry into
// src/content/posts/<slug>_ja.md, including frontmatter (title, pubDate,
// description, tags, legacyUrl) and a lightly cleaned-up HTML body.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

function pickBody(sections: string[]): string {
  for (const section of sections) {
    const match = section.match(/^BODY:\r?\n([\s\S]*)$/);
    if (match) {
      return match[1];
    }
  }
  return sections[0] ?? '';
}

function parseHatenaDate(input: string): Date {
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(`unexpected DATE format: ${input}`);
  }
  const [, mm, dd, yyyy, hh, mi, ss] = match;
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+09:00`);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHatenaKeywordLinks(html: string): string {
  return html.replace(/<a\s+class="keyword"[^>]*>([\s\S]*?)<\/a>/g, '$1');
}

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
  let out = html;
  out = stripHatenaKeywordLinks(out);
  out = convertHighlightedPre(out);
  out = convertCodeBlocks(out);
  return out.trim();
}

function deriveDescription(body: string): string | undefined {
  const firstP = body.match(/<p>([\s\S]*?)<\/p>/);
  if (!firstP) {
    return undefined;
  }
  const text = firstP[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return undefined;
  }
  return text.length > 160 ? text.slice(0, 157) + '...' : text;
}

function yamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
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

function buildEntryFile(entry: Entry): { path: string; content: string } | null {
  if (entry.header.STATUS !== 'Publish') {
    return null;
  }
  const basename = entry.header.BASENAME;
  const dateStr = entry.header.DATE;
  const title = entry.header.TITLE;
  if (!basename || !dateStr || !title) {
    return null;
  }
  const date = parseHatenaDate(dateStr);
  const slug = basename.replace(/\//g, '-');
  const legacyUrl = `/entry/${basename}`;
  const tags = (entry.header.CATEGORY ?? []).map((c) => c.trim()).filter(Boolean);
  const cleanedBody = cleanupBody(entry.body);
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

function main(): void {
  const text = readFileSync(EXPORT_FILE, 'utf8');
  const entries = parseExport(text);
  let written = 0;
  let skipped = 0;
  for (const entry of entries) {
    const file = buildEntryFile(entry);
    if (!file) {
      skipped++;
      continue;
    }
    if (!existsSync(dirname(file.path))) {
      mkdirSync(dirname(file.path), { recursive: true });
    }
    writeFileSync(file.path, file.content);
    written++;
  }
  console.log(`wrote ${written} entries, skipped ${skipped} of ${entries.length} total`);
}

main();
