---
title: "emacsでmarkdown-modeのinline code blockに色を付ける"
pubDate: 2018-04-18T09:00:00.000Z
description: "code blockのフォントを変えないようにしたのは良いけど"
tags: ["emacs", "Programming"]
legacyUrl: "/entry/2018/04/18/180000"
---

<p><a href="/posts/emacs-markdown-mode-code-block">code blockのフォントを変えないようにしたのは良いけど</a></p>

<p>、色も変わらなくなってしまった。
これはみにくいので色を設定するようにする.</p>



```lisp
(set-face-attribute 'markdown-code-face nil
                    :inherit 'default)
(set-face-attribute 'markdown-inline-code-face nil
                    :inherit 'default
                    :foreground (face-attribute font-lock-type-face :foreground))
```




-----
