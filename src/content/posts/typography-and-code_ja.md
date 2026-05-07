---
title: Typography and Code Sample
pubDate: 2026-04-22
description: A post that exercises headings, lists, blockquotes, inline code, and code blocks.
tags: [meta, typography]
---

This post is here to exercise every Markdown construct the theme should
handle gracefully.

## Headings

### Subheading

Inline code looks like `const x = 42` and should sit comfortably in the
flow of text without breaking the line height.

## Lists

- One
- Two
- Three
  - Three point one
  - Three point two

1. First
2. Second
3. Third

## Blockquote

> Make it work, make it right, make it fast.
>
> &mdash; Kent Beck

## Code block

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseNumber(input: string): Result<number, string> {
  const value = Number(input);
  if (Number.isNaN(value)) {
    return { ok: false, error: `not a number: ${input}` };
  }
  return { ok: true, value };
}
```

## Horizontal rule

---

Closing paragraph after a horizontal rule.
