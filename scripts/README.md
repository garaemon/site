# Migration scripts

One-shot Node scripts that take Hatena Blog data and produce the
Markdown, images, and Cloudflare redirects that the Astro site
consumes. Each script is idempotent: re-running it on partially-imported
state should converge, not duplicate.

All scripts are TypeScript and run via `node --experimental-strip-types`
(the shebang is set on each file). They expect the repo root as the
working directory and read/write files relative to it.

## When you run them

The full migration order is:

1. `import-hatena.ts` — convert the Hatena export into Markdown.
2. `download-images.ts` — pull every Hatena-hosted image local.
3. `rename-slugs.ts` — (optional) replace date-based slugs with readable ones.
4. `rewrite-internal-links.ts` — rewrite intra-blog links to the new slugs.
5. `build-redirects.ts` — emit `public/_redirects` from `legacyUrl`.

For an incremental update (a few new posts), only steps 1, 2, and 5 are
typically needed.

## Scripts

### `import-hatena.ts`

Reads `blog.garaemon.com.export.txt` (a Hatena Blog Movable Type export,
kept locally — never committed) and writes one
`src/content/posts/<slug>_ja.md` per `STATUS: Publish` record.

Frontmatter mapping:

- `title` ← `TITLE`
- `pubDate` ← `DATE` (parsed as Asia/Tokyo)
- `tags` ← every `CATEGORY` value
- `legacyUrl` ← `/entry/YYYY/MM/DD/HHMMSS` derived from `BASENAME`

Body cleanup: strips Hatena keyword autolinks
(`<a class="keyword">…</a>` → text), converts `<pre class="code lang-X">`
blocks (with `<span class="syn*">` highlights) into fenced Markdown
code blocks, and decodes HTML entities. Other inline HTML is preserved
since Markdown allows it.

### `download-images.ts`

Walks every `_ja.md` / `_en.md` post, regex-matches Hatena CDN hosts
(`cdn-ak.f.st-hatena.com`, `cdn.image.st-hatena.com`,
`f.hatena.ne.jp`), downloads each image to
`public/images/posts/<slug>/<basename>`, and rewrites the post body to
reference the local path. Already-downloaded files are skipped.

### `build-redirects.ts`

Scans every post's `legacyUrl` and emits `public/_redirects`, one line
per entry, in the Cloudflare Pages format:

```text
/entry/2025/11/17/051856 /posts/2025-11-17-051856 301
```

Cloudflare Pages picks `_redirects` up automatically on deploy, so the
script is the entire redirect pipeline.

### `rename-slugs.ts`

Imported posts start with date-based slugs (`2025-11-17-051856`).
This script proposes readable slugs derived from the title (or the
first H1 in the body), renames the post file and its image directory,
and preserves `legacyUrl` so the 301 still maps to the new path. It
will not overwrite an existing readable slug or any slug that already
collides.

### `rewrite-internal-links.ts`

After `rename-slugs` (or after any slug change), intra-blog links
inside post bodies still point at old `/entry/YYYY/MM/DD/HHMMSS` URLs.
This script builds a `legacyUrl → slug` map from frontmatter and
rewrites those inline links to `/posts/<slug>`. Bare links to
`https://blog.garaemon.com/` get rewritten to `/`.
