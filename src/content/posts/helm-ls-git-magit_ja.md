---
title: "helm-ls-gitでmagitをバックエンドに利用する"
pubDate: 2018-05-15T15:22:55.000Z
description: "helm-ls-gitを使うと, helmの一覧にgitで管理されてるファイル一覧が列挙されて便利. しかしデフォルトでvc-dirが利用されているためかうまく動かなかった. これをmagitを使うように設定したら意図通り動くにようなった."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/05/16/002255"
---

<p><a href="https://github.com/emacs-helm/helm-ls-git">helm-ls-git</a>を使うと, helmの一覧にgitで管理されてるファイル一覧が列挙されて便利. しかしデフォルトで<code>vc-dir</code>が利用されているためかうまく動かなかった. これをmagitを使うように設定したら意図通り動くにようなった.</p>



```lisp
(require 'helm-ls-git)

(setq helm-ls-git-status-command 'magit-status-internal)
(setq
   helm-mini-default-sources
   '(helm-source-buffers-list helm-source-ls-git ...))
```




-----
