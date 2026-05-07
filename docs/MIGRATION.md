# Hatena Blog → Astro Migration Plan

## Context

`blog.garaemon.com` was on Hatena Blog with multiple years of Japanese-language posts (Emacs, macOS automation, Go, Claude, etc.). We are migrating to a self-hosted Astro static site to:

- Own content and URLs; write posts in Markdown.
- Add a portfolio (`/about`) alongside the blog.
- Keep the visual style bearblog-minimal: no JS, system font, monochrome.
- Deploy to Cloudflare Pages on the existing `blog.garaemon.com` domain.

Migration is implemented top-down: shell first, then content import, then redirects/RSS/polish.

## Status (2026-05-05)

| Phase | Status |
|---|---|
| 1. Bootstrap | Done |
| 2. Shell + theme | Done |
| 3. Bilingual support | Done |
| 4. Hatena export → Markdown | Done (68 JA posts imported) |
| 5. Image migration | Done |
| 6. Redirects | Done (68 entries in `public/_redirects`) |
| 7. RSS, sitemap, tags | Done |
| 8. Portfolio `/about` | Done (JA + EN) |
| 9. Theme polish | Pending |
| 10. Deploy | Pending |

Notes:

- All migrated posts are currently JA-only. The bilingual scaffolding is in place; per-post EN translations can be added incrementally.
- Two extra utility scripts emerged during migration and are now part of the toolchain: `scripts/rename-slugs.ts` (rename date-based slugs to readable ones while preserving `legacyUrl`) and `scripts/rewrite-internal-links.ts` (rewrite intra-blog links from old Hatena paths to new `/posts/<slug>` paths).
- Seed fixture posts (`hello_*`, `image-sample_ja`, `typography-and-code_ja`, `english-only-fixture_en`) were deleted once real content landed.

## Locked Decisions

| Area | Choice |
|---|---|
| Framework | Astro (static output, no SSR/adapter) |
| Hosting | Cloudflare Pages, custom domain `blog.garaemon.com` |
| Content authoring | Markdown via Astro Content Collections (type-safe frontmatter) |
| Languages | Bilingual: Japanese (default) + English. Each post may exist in JA, EN, or both. |
| File layout | Single flat collection per type; language is a filename suffix (`<slug>_ja.md` / `<slug>_en.md`) |
| Post URLs | `/posts/<slug>` (JA) and `/en/posts/<slug>` (EN) |
| Old URL handling | 301 redirects from `/entry/YYYY/MM/DD/HHMMSS` via `public/_redirects` |
| Migration source | Hatena export (Movable Type format) → Markdown |
| Images | Downloaded into the repo under `public/images/posts/<slug>/` |
| Portfolio | Single `/about` Markdown page (bio, projects, links), bilingual via the `pages` collection |
| Comments | None |
| Theme | Light only, system font (Verdana w/ CJK fallback), monochrome, bearblog-style CSS |
| RSS | `@astrojs/rss`; one feed per language (`/rss.xml`, `/en/rss.xml`) |
| Sitemap | `@astrojs/sitemap` |
| Tags | `/tags/index` (cloud) + `/tags/<tag>`, mirrored under `/en/tags/...` |
| Lang switcher | `JA / EN` in header. Per-content (post / about) link to the matching translation; aggregate listings (post index, tag pages) fall back to the other language's home rather than mirror. |

Out of scope for v1: dark mode, on-site search, comments, syntax-theme switching beyond Shiki defaults.

## Repository Layout

```text
site/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── _redirects              # Cloudflare Pages 301 redirects (generated)
│   ├── robots.txt
│   └── images/posts/<slug>/    # Downloaded post images
├── src/
│   ├── content/
│   │   ├── config.ts           # Content Collections schema (posts, pages)
│   │   ├── posts/<slug>_<lang>.md
│   │   └── pages/<slug>_<lang>.md
│   ├── pages/
│   │   ├── index.astro         # JA home
│   │   ├── about.astro
│   │   ├── posts/{index,[slug]}.astro
│   │   ├── tags/{index,[tag]}.astro
│   │   ├── rss.xml.ts
│   │   └── en/                 # Mirror tree for English
│   │       ├── index.astro
│   │       ├── about.astro
│   │       ├── posts/{index,[slug]}.astro
│   │       ├── tags/{index,[tag]}.astro
│   │       └── rss.xml.ts
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── Post.astro
│   ├── components/
│   │   ├── Header.astro        # Title + nav + JA/EN switcher
│   │   ├── Footer.astro
│   │   └── PostList.astro
│   ├── lib/posts.ts            # Lang-aware helpers (parsePostId, postUrl, ...)
│   ├── styles/global.css
│   └── utils/date.ts
└── scripts/
    ├── import-hatena.ts            # MT export → src/content/posts/*_ja.md
    ├── download-images.ts          # Pull Hatena-CDN images into public/images
    ├── build-redirects.ts          # Emit public/_redirects from legacyUrl frontmatter
    ├── rename-slugs.ts             # Rename date-based slugs to readable ones; legacyUrl preserved
    └── rewrite-internal-links.ts   # Rewrite intra-blog links to new /posts/<slug> URLs
```

## Frontmatter Schemas

```ts
// src/content/config.ts
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    legacyUrl: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});
```

Filename convention: `<slug>_<lang>.md` (e.g., `hello_ja.md`, `hello_en.md`). The `parsePostId` helper splits on the trailing `_xx` segment, so slugs may themselves contain underscores.

## Implementation Phases

Each phase is independently shippable; the site stays deployable throughout.

### 1. Bootstrap — Done

- `npm create astro@latest` (minimal template); add `@astrojs/rss`, `@astrojs/sitemap`.
- `astro.config.mjs`: `site: 'https://blog.garaemon.com'`, sitemap integration, `output: 'static'`, `trailingSlash: 'never'`.
- Work on a dated branch (`2026.05.03-astro-shell`).

### 2. Shell + theme (review checkpoint) — Done

- `Base.astro`, `Post.astro` layouts; `Header`, `Footer`, `PostList` components.
- Stub pages and an RSS feed.
- `global.css` based on bearblog.dev: Verdana stack with CJK fallback, 1em base, 800px max width, 1.5/1.6 line height, dashed `<hr>`, monospace `<time>`, soft beige background (`#faf6ee`), monochrome links.
- Seed 2-3 fixture posts to exercise plain prose, code blocks, and inline images. (Removed once real content landed.)
- Verify all routes render.

**Stop here for theme sign-off before bulk content work.**

### 3. Bilingual support — Done

- Add a `pages` collection mirroring posts.
- Convert all content to `<slug>_<lang>.md` flat layout.
- Mirror routes under `/en/*`. Add per-language RSS.
- Add a JA/EN switcher in the header with the active language bolded. Per-content pages (`/about`, individual posts) link the inactive label to the matching translation when one exists; aggregate listings fall back to the other language's home.

### 4. Hatena export → Markdown (`scripts/import-hatena.ts`) — Done

- Source: Hatena Blog 設定 → 詳細設定 → エクスポート (MT format `.txt`, kept locally outside git).
- Parser reads MT records (`TITLE`, `BASENAME`, `DATE`, `CATEGORY`, `STATUS`, `BODY`).
- For each `Publish` record, write `src/content/posts/<slug>_ja.md` with frontmatter:
  - `title` ← `TITLE`
  - `pubDate` ← `DATE` (Asia/Tokyo)
  - `tags` ← all `CATEGORY` values
  - `legacyUrl` ← `/entry/YYYY/MM/DD/HHMMSS` from `BASENAME`
- Slug = `BASENAME` with slashes replaced by dashes (`YYYY-MM-DD-HHMMSS`). Stable, unique, sortable; user can rename later if desired.
- Body cleanup:
  - Strip Hatena keyword autolinks (`<a class="keyword" href="...">TEXT</a>` → `TEXT`).
  - Convert `<pre class="code lang-X" ...>` (with `<span class="syn*">` highlights) into fenced Markdown code blocks, decoding HTML entities.
  - Convert plain `<pre><code class="X">…</code></pre>` similarly.
  - Otherwise preserve HTML; Markdown allows inline HTML so `<figure>`, `<iframe>`, etc. render.
- Run as `node --experimental-strip-types scripts/import-hatena.ts`.

### 5. Image migration (`scripts/download-images.ts`) — Done

- Walk all `_ja.md` / `_en.md` posts; regex-match Hatena CDN hosts (`cdn-ak.f.st-hatena.com`, `cdn.image.st-hatena.com`, `f.hatena.ne.jp`).
- Download each image to `public/images/posts/<slug>/<basename>` (preserve filename; dedupe by hash on collision).
- Rewrite Markdown `<img src>` references to `/images/posts/<slug>/<basename>`.
- Idempotent: skip already-downloaded files.

### 6. Redirects (`scripts/build-redirects.ts`) — Done

- Scan all posts' `legacyUrl` and emit `public/_redirects`:

  ```text
  /entry/2025/11/17/051856 /posts/2025-11-17-051856 301
  ```

- Cloudflare Pages reads `_redirects` automatically.

### 7. RSS, sitemap, tags — Done

- Per-language RSS at `/rss.xml` and `/en/rss.xml`. Both linked from `<head rel="alternate">` (per-page based on current language).
- Sitemap: zero-config.
- Tags: derived per-language at build time.

### 8. Portfolio `/about` — Done

- `src/content/pages/about_ja.md` + `about_en.md`.
- Rendered via `src/pages/about.astro` and `src/pages/en/about.astro`.

### 9. Theme polish — Pending

- Pass once over CSS for typography rhythm, code block padding, list spacing.
- Confirm Lighthouse perf ≥95, a11y ≥95 on a post page.

### 10. Deploy — Pending

- Push to GitHub.
- Connect repo to Cloudflare Pages: build `npm run build`, output `dist`.
- First deploy to a `*.pages.dev` preview; verify before DNS cutover.
- Switch DNS for `blog.garaemon.com`.
- Verify 301s with `curl -I` against ~5 known old URLs.
- Submit new sitemap to Google Search Console.

## Critical Files

- `astro.config.mjs`
- `src/content/config.ts`
- `src/layouts/{Base,Post}.astro`
- `src/components/{Header,Footer,PostList}.astro`
- `src/lib/posts.ts`
- `src/pages/{index,about}.astro`, `src/pages/posts/{index,[slug]}.astro`, `src/pages/tags/{index,[tag]}.astro`, `src/pages/rss.xml.ts`
- `src/pages/en/...` (mirror tree)
- `src/styles/global.css`
- `scripts/{import-hatena,download-images,build-redirects}.ts`
- `public/{_redirects,robots.txt,favicon.svg}`

## Verification

1. `npm run dev` — every route renders: `/`, `/about`, `/posts`, `/posts/<slug>` (sample 3), `/tags`, `/tags/<tag>` (sample 2), `/rss.xml`, plus the `/en/*` mirror.
2. `npm run build && npm run preview` — clean build, no warnings.
3. RSS validates at <https://validator.w3.org/feed/>.
4. Spot-check 5 migrated posts: title, date, tags, body, images, internal links.
5. On Cloudflare preview, `curl -I` 5 sampled old Hatena URLs → `301` to expected new paths.
6. Lighthouse on `/posts/<slug>`: perf ≥95, a11y ≥95, best-practices ≥95, SEO ≥95.
7. View source on home: `<html lang="ja">`, OG tags present, RSS `<link rel="alternate">` present.
8. After DNS cutover, retest `curl -I` against `https://blog.garaemon.com/entry/...`.

## Open Items

- Slug for migrated posts is currently date-based (`YYYY-MM-DD-HHMMSS`). Renaming individual posts to nicer slugs is a manual, optional cleanup.
- Whether to retain Shiki default highlighting or strip it — current default is `github-light` via the Astro Markdown integration.
- iframe-heavy embeds from Hatena (Spotify / SoundCloud / YouTube) are preserved as-is; may want to lazy-load or replace with simpler links later.
