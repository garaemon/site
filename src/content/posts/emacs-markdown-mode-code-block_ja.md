---
title: "emacsのmarkdown-modeのcode blockでフォントを変えない"
pubDate: 2018-04-14T22:00:00.000Z
description: "emacsのmarkdown-modeはcode blockでフォントが変わるのが嫌だったのでこれを変更しないように設定。"
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/15/070000"
---

<p>emacsの<a href="https://jblevins.org/projects/markdown-mode/">markdown-mode</a>はcode blockでフォントが変わるのが嫌だったのでこれを変更しないように設定。</p>

<p>emacを使うような人は、デフォルトで等幅フォントを指定してるんじゃないのかな?</p>



```lisp
;; Do not change font in code block
(set-face-attribute 'markdown-code-face nil :inherit 'default)
```




<p>before
<span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-markdown-mode-code-block/20180414155744.png" alt="f:id:garaemon1:20180414155744p:plain" title="f:id:garaemon1:20180414155744p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>after
<span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-markdown-mode-code-block/20180414155755.png" alt="f:id:garaemon1:20180414155755p:plain" title="f:id:garaemon1:20180414155755p:plain" class="hatena-fotolife" itemprop="image"></span></p>

-----
