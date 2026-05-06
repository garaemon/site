---
title: "emacsの文字サイズの変更をよくあるキーバインドにする"
pubDate: 2018-04-09T14:49:54.000Z
description: "emacsで文字サイズを大きくおよび小さくするキーバインドはC-x C-+, C-x C--に割り振ってあるが、最近は(macだと) ⌘-+/-に割り振ってあるものが多い."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/09/234954"
---

<p>emacsで文字サイズを大きくおよび小さくするキーバインドは<code>C-x C-+</code>, <code>C-x C--</code>に割り振ってあるが、最近は(macだと) <code>⌘-+/-</code>に割り振ってあるものが多い.</p>

<p>以下のように.emacsに書いておくと, macならそのようなキーバインドになる. Linuxだと<code>\M</code>のかわりに<code>\C</code>にしたほうが良いかも.</p>



```lisp
(defun text-scale-increase ()
  "Increase the size of text of CURRENT-BUFFER."
  (interactive)
  (text-scale-adjust +1))

(defun text-scale-decrease ()
  "Decrease the size of text of CURRENT-BUFFER."
  (interactive)
  (text-scale-adjust -1))

(defun text-scale-reset ()
  "Reset the size of text of CURRENT-BUFFER."
  (interactive)
  (text-scale-adjust 0))

(global-set-key "\M-+" 'text-scale-increase)
(global-set-key "\M--" 'text-scale-decrease)
(global-set-key "\M-0" 'text-scale-reset)
```




-----
