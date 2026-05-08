---
title: "keyboard macroの最中はhelmを使わない"
pubDate: 2018-10-07T05:37:42.000Z
description: "個人的にC-sでの検索に通常のisearch-forwardではなく, helm-swoopを利用している."
tags: ["emacs", "Programming"]
legacyUrl: "/entry/2018/10/07/143742"
---

<p>個人的に<code>C-s</code>での検索に通常の<a href="http://flex.phys.tohoku.ac.jp/texi/emacs-jp/emacs-jp_49.html"><code>isearch-forward</code></a>ではなく,
<a href="https://github.com/ShingoFukuyama/helm-swoop"><code>helm-swoop</code></a>を利用している.</p>

<p>しかしこうすると, keyboard macroを入力している間にhelmが走り、これがどうやら後ほどkeyboard macroを再生するときに問題があるようだ.</p>

<p>keyboard macroを記録中かどうかは<code>defining-kbd-macro</code>という変数を見ればわかるようだ.  また, keyboard macroの実行中は<code>executing-kdb-macro</code>を見ればわかる.</p>

<p><code>defining-kbd-macro</code>が<code>t</code>のときは<code>isearch-forward</code>を利用するようにする.</p>



```lisp
;; (global-set-key (kbd "C-s") 'helm-swoop)
(defun my-search-forward ()
  "Customized search function to use helm-swoop except for in defining keyboard macro."
  (interactive)
  (if (or defining-kbd-macro executing-kbd-macro)
       (isearch-forward)
     (helm-swoop)))
(global-set-key (kbd "C-s") 'my-search-forward)
```




<p>同様のkeyboard macroが有効かに応じて挙動を切り替える設定は他の色々なものに利用できるはず.</p>

-----
