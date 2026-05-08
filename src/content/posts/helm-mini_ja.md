---
title: "helm-miniのデフォルト値にカーソルのシンボルが渡ってしまう"
pubDate: 2018-04-19T09:00:00.000Z
description: "helm-miniをC-x bに割り振ってバッファ選択に使っているのだが、現在のカーソルがある位置のシンボル(いわゆるthing-at-point)がデフォルトで渡ってしまい、バッファの選択に不自由していた."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/19/180000"
---

<p><code>helm-mini</code>を<code>C-x b</code>に割り振ってバッファ選択に使っているのだが、現在のカーソルがある位置のシンボル(いわゆる<code>thing-at-point</code>)がデフォルトで渡ってしまい、バッファの選択に不自由していた.</p>

<p>どうやら, <code>helm</code>関数の<code>:default</code>キーワードを与えないと、thing-at-pointがデフォルトとして
渡ってしまう。<code>:default</code>が<code>nil</code>だとだめなので、空文字列を渡すようにすればいい.</p>



```lisp
(defun my-helm-mini ()
  "Customized version of helm-mini in order to disable 'thing-at-point'."
  (interactive)
  (require 'helm-x-files)
  (unless helm-source-buffers-list
    (setq helm-source-buffers-list
          (helm-make-source "Buffers" 'helm-source-buffers)))
  (helm :sources helm-mini-default-sources
        :buffer "*helm mini*"
        :default "" ;; important
        :ff-transformer-show-only-basename nil
        :truncate-lines helm-buffers-truncate-lines))
(define-key global-map (kbd "C-x b")   'my-helm-mini)
```




-----
