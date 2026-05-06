---
title: "emacsのmarkdown-modeでcode blockをsyntax higlightする"
pubDate: 2018-04-14T06:06:23.000Z
description: "emacsでmarkdownを書いてる時に、markdown-modeでcode block (triple backquotes) にsyntax higlightを有効にできる."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/14/150623"
---

<p>emacsでmarkdownを書いてる時に、<a href="https://jblevins.org/projects/markdown-mode/">markdown-mode</a>でcode block (triple backquotes) にsyntax higlightを有効にできる.</p>



```lisp
(setq markdown-fontify-code-blocks-natively t)
```




<p>コレはかなり良さそう.</p>

<p>before
<span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-markdown-mode-code-block-syntax-higlight/20180414150419.png" alt="f:id:garaemon1:20180414150419p:plain" title="f:id:garaemon1:20180414150419p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>after
<span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-markdown-mode-code-block-syntax-higlight/20180414150433.png" alt="f:id:garaemon1:20180414150433p:plain" title="f:id:garaemon1:20180414150433p:plain" class="hatena-fotolife" itemprop="image"></span></p>

-----
