---
title: "helmを立ち上げたときにhelm-source-ls-gitを強制的に更新させる"
pubDate: 2018-06-07T15:55:33.000Z
description: "helm-ls-gitはgitで管理されているファイルをhelmの候補に加えてくれるとても便利なパッケージ."
tags: ["emacs", "Programming"]
legacyUrl: "/entry/2018/06/08/005533"
---

<p><a href="https://github.com/emacs-helm/helm-ls-git">helm-ls-git</a>はgitで管理されているファイルをhelmの候補に加えてくれるとても便利なパッケージ.</p>

<p>これをhelm-miniなどを立ち上げたときにも使うようにしたいのだが、<code>helm-source-ls-git</code>を<code>helm-mini-default-sources</code>に加えるだけでは不十分だった。自分で<code>helm-source-ls-git</code>を更新してあげる必要がある.</p>



```lisp
(setq
   helm-mini-default-sources
   '(... helm-source-ls-git ...))

(defun my-helm-mini ()
   (interactive)
    (require 'helm-x-files)
    (unless helm-source-buffers-list
      (setq helm-source-buffers-list
            (helm-make-source "Buffers" 'helm-source-buffers)))
     (setq helm-source-ls-git (helm-ls-git-build-ls-git-source)) ; important!
     (helm :sources helm-mini-default-sources
          :buffer "*helm mini*"
          :default ""
          :ff-transformer-show-only-basename nil
          :truncate-lines helm-buffers-truncate-lines))
```




-----
