---
title: "emacsでカーソルの行番号を取得する"
pubDate: 2018-05-03T04:33:08.000Z
description: "line-number-at-posを使えば良い"
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/05/03/133308"
---

<p><code>line-number-at-pos</code>を使えば良い</p>



```lisp
(line-number-at-pos (point))
```




-----
