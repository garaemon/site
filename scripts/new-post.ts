#!/usr/bin/env -S node --experimental-strip-types
// Scaffolds a new blog post under src/content/posts/<slug>_<lang>.md with
// minimal frontmatter (title, pubDate, draft, empty tags) so the author can
// start writing immediately. Posts are created as drafts -- src/lib/posts.ts
// filters them out -- so flipping `draft: false` is the publish step.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathExists } from './lib/shared.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const LANG_PATTERN = /^[a-z]{2}$/;

type Options = {
  slug: string;
  title: string;
  lang: string;
  force: boolean;
};

function printUsageAndExit(): never {
  console.error('Usage: new-post <slug> [--title "Post title"] [--lang ja] [--force]');
  process.exit(1);
}

function readFlagValue(argv: readonly string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith('-')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function parseArgs(argv: readonly string[]): Options {
  const positional: string[] = [];
  let title: string | undefined;
  let lang = 'ja';
  let force = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--title' || arg === '-t') {
      title = readFlagValue(argv, i + 1, arg);
      i += 1;
    } else if (arg === '--lang' || arg === '-l') {
      lang = readFlagValue(argv, i + 1, arg);
      i += 1;
    } else if (arg === '--force' || arg === '-f') {
      force = true;
    } else if (arg === '--help' || arg === '-h') {
      printUsageAndExit();
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown flag: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) {
    printUsageAndExit();
  }

  const slug = positional[0];
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`invalid slug: "${slug}" (use lowercase kebab-case ASCII)`);
  }
  if (!LANG_PATTERN.test(lang)) {
    throw new Error(`invalid lang: "${lang}" (use ISO 639-1, e.g. ja, en)`);
  }

  return { slug, title: title ?? slug, lang, force };
}

// Quote a value as a YAML double-quoted scalar. Only `\` and `"` need
// escaping inside double quotes; line breaks are preserved as the raw
// sequence so callers should pass single-line strings here.
function quoteYamlString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function buildFrontmatter(title: string, pubDate: Date): string {
  const lines = [
    '---',
    `title: ${quoteYamlString(title)}`,
    `pubDate: ${pubDate.toISOString()}`,
    'draft: true',
    'tags: []',
    '---',
    '',
    '',
  ];
  return lines.join('\n');
}

async function createPost(options: Options): Promise<string> {
  const filename = `${options.slug}_${options.lang}.md`;
  const target = join(POSTS_DIR, filename);

  if (!options.force && (await pathExists(target))) {
    throw new Error(`post already exists: ${target} (use --force to overwrite)`);
  }

  await mkdir(POSTS_DIR, { recursive: true });
  await writeFile(target, buildFrontmatter(options.title, new Date()), 'utf8');
  return target;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const target = await createPost(options);
  console.log(`Created ${target}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
