---
title: "emacs-slackでShift+Enter, Ctrl+Enterをメッセージ内改行にする"
pubDate: 2018-10-14T05:15:50.000Z
description: "emacs-slack内ではEnterでメッセージ送信がされるので、メッセージ内で改行するときにwebのインターフェイスなどと同様にShift+Enter, Ctrl+Enterでメッセージ内改行するようにしたい."
tags: ["emacs", "slack", "Programming"]
legacyUrl: "/entry/2018/10/14/141550"
---

<p>emacs-slack内ではEnterでメッセージ送信がされるので、メッセージ内で改行するときにwebのインターフェイスなどと同様にShift+Enter, Ctrl+Enterでメッセージ内改行するようにしたい.</p>



```lisp
;; use Shift+Enter and Ctrl+Enter as newline
(define-key slack-mode-map '[S-return] 'newline)
(define-key slack-mode-map '[C-return] 'newline)
```




<p>参考</p>

<ul>
<li><a href="http://d.hatena.ne.jp/kobapan/20090429/1259971276">Emacs Lisp &#x30AD;&#x30FC;&#x30D0;&#x30A4;&#x30F3;&#x30C9;&#x306E;&#x5909;&#x66F4;&#x306E;&#x4ED5;&#x65B9; - &#x3010;&#x306F;&#x3066;&#x306A;&#x3011;&#x30AC;&#x30C3;&#x30C8;&#x30DD;&#x30F3;&#x30DD;&#x30B3;</a></li>
<li><a href="https://www20.atwiki.jp/kobapan/pages/238.html">emacs/&#x30AD;&#x30FC;&#x30D0;&#x30A4;&#x30F3;&#x30C9;&#x306E;&#x8A2D;&#x5B9A;&#x306E;&#x4ED5;&#x65B9; - kobapan @ wiki - &#x30A2;&#x30C3;&#x30C8;&#x30A6;&#x30A3;&#x30AD;</a></li>
</ul>


-----
