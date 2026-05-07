# garaemon/site

Source for `blog.garaemon.com`: a static [Astro](https://astro.build/) site
that hosts the blog (migrated from Hatena Blog) and a portfolio page,
deployed to Cloudflare Pages.

Most posts are written in Japanese and migrated from Hatena Blog.
English versions are produced by machine translation and live alongside
the JA original. The full migration plan and locked decisions live in
[`docs/MIGRATION.md`](docs/MIGRATION.md).

## Stack

- [Astro 5](https://astro.build/) — static output, no SSR adapter
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [`@astrojs/rss`](https://docs.astro.build/en/guides/rss/) and
  [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- TypeScript, with Astro Content Collections for type-safe frontmatter
- ESLint + markdownlint, run in GitHub Actions CI

## Layout

```text
site/
├── astro.config.mjs
├── eslint.config.mjs
├── .markdownlint-cli2.jsonc
├── .github/workflows/ci.yml      # lint, type-check, build, npm audit
├── docs/MIGRATION.md             # migration plan and locked decisions
├── public/
│   ├── favicon.svg
│   ├── _redirects                # Cloudflare Pages 301s (generated)
│   └── images/posts/<slug>/      # post images
└── src/
    ├── components/{Header,Footer,PostList}.astro
    ├── content/
    │   ├── config.ts             # Content Collections schema
    │   ├── posts/<slug>_<lang>.md
    │   └── pages/<slug>.md       # English-only
    ├── layouts/{Base,Post}.astro
    ├── lib/{posts,site}.ts       # routing helpers + site identity
    ├── pages/
    │   ├── {index,about}.astro
    │   ├── posts/index.astro
    │   ├── posts/[slug].astro          # JA canonical
    │   ├── posts/[slug]/en.astro       # EN translation
    │   ├── tags/{index,[tag]}.astro
    │   └── rss.xml.ts
    ├── styles/global.css
    └── utils/date.ts
```

## Conventions

- **Shell language.** The site chrome — header, footer, listings,
  about page, RSS — is **English only**. Only individual articles
  carry a language.
- **Article translations.** A post may exist as `<slug>_ja.md`,
  `<slug>_en.md`, or both. JA is canonical at `/posts/<slug>`; the
  EN translation, when it exists, lives at `/posts/<slug>/en`.
  EN-only posts have no bare `/posts/<slug>` URL.
- **URLs.** `trailingSlash: 'never'`. Old Hatena URLs are preserved via
  301s in `public/_redirects`.
- **Theme.** Light only, system font with CJK fallback, monochrome,
  bearblog-inspired. No JS shipped to the client.

## Common commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run check` | Astro/TypeScript type check |
| `npm run lint` | ESLint over JS/TS/Astro |
| `npm run lint:md` | markdownlint over `*.md` (excludes `src/content/`) |

CI in `.github/workflows/ci.yml` runs all of the above plus
`npm audit --audit-level=high`.
