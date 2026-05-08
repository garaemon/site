// Shared helpers for the Hatena migration scripts. Pulled out so the same
// regexes do not drift across files.
import { access } from 'node:fs/promises';

const POST_FILENAME_PATTERN = /^(.+)_([a-z]{2})\.md$/;

// Async equivalent of existsSync built on fs.promises.access. We use
// try/catch on access rather than stat because we only need a boolean and
// access is cheaper for that.
export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * A post filename split into its slug and ISO 639-1 language tag. The site
 * uses two-letter lowercase tags (today always `'ja'` or `'en'`).
 */
export type ParsedSlug = { slug: string; lang: string };

// Returns null when the filename does not match the *_<lang>.md convention.
// Use this when the caller wants to skip non-matching files.
export function parseSlugFromFilename(filename: string): ParsedSlug | null {
  const match = filename.match(POST_FILENAME_PATTERN);
  if (!match) {
    return null;
  }
  return { slug: match[1], lang: match[2] };
}

// Throws when the filename does not match the convention. Use this when the
// caller has already filtered to *.md and a non-match is a programmer error.
export function requireSlugFromFilename(filename: string): ParsedSlug {
  const parsed = parseSlugFromFilename(filename);
  if (!parsed) {
    throw new Error(`unexpected post filename: ${filename}`);
  }
  return parsed;
}

// `legacyUrl` is always a fixed `/entry/YYYY/MM/DD/HHMMSS` string emitted by
// import-hatena.ts via yamlString, so it is always double-quoted and never
// contains characters that need YAML escaping. The regex therefore requires
// the surrounding quotes -- if the importer ever switches to bare values or
// escaped `\"`, update this together with the importer rather than silently
// accepting partial matches here.
export function extractLegacyUrl(content: string): string | undefined {
  const match = content.match(/^legacyUrl:\s*"([^"\n]+)"\s*$/m);
  return match ? match[1].trim() : undefined;
}
