---
title: "結局blamerではemacs-asyncを無効にするのが良い"
pubDate: 2025-03-23T20:14:23.000Z
description: "blamerではblamer-enable-async-execution-pをnilにして、emacs-asyncを無効にするといろんな問題が解決されてよい。"
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2025/03/24/051423"
---

<h1 id="結論">結論</h1>

<p>blamerでは<code>blamer-enable-async-execution-p</code>を<code>nil</code>にして、emacs-asyncを無効にするといろんな問題が解決されてよい。</p>

<h1 id="blamerの問題点">blamerの問題点</h1>

<p>自分が知っているだけで、以下のような問題点があった。</p>

<ul>
<li><a href="/posts/mac-emacs-app-blamer">Emacs.appをダブルクリックやraycastなどから起動すると、うまく動かない。</a></li>
<li><a href="/posts/emacs-blamer">trampでssh越しのファイルに対してうまく動かない。</a></li>
<li>非同期にgitコマンドなどを使っているせいで、時々カーソルのある現在行とblamerが表示している行がずれる。</li>
</ul>


<p>このような問題は、blamer.elがgit blameコマンドを<a href="https://github.com/jwiegley/emacs-async">emacs-async</a>経由で動かしているのが原因になっている。</p>

<p>git blameの実行に時間がかかるとemacsの操作をブロックしてしまうため、このような構成が採用されていると思われる。</p>

<h1 id="blamer-enable-async-execution-pを無効にする">blamer-enable-async-execution-pを無効にする</h1>

<p><code>blamer-enable-async-execution-p</code>を<code>nil</code>にすると、blamerはemacs-asyncを使わなくなる。</p>

<p><code>blamer-idle-time</code>を短くしすぎなければ、tramp越しでも特にパフォーマンスに問題は感じない。</p>

<p>もしかしたら大きなgitレポジトリなどではパフォーマンスに問題が発生するかもしれない。</p>



```lisp
(setq blamer-idle-time 1.0)
(setq blamer-enable-async-execution-p nil)
;; for tramp
(defun blamer--get-local-name (filename)
    filename)
```




<p>個人的には全体としてこのように設定している。</p>



```lisp
(use-package blamer
  :ensure t
  :custom
  (blamer-idle-time 1.0)
  (blamer-min-offset 70)
  (blamer-show-avatar-p nil)
  (blamer-enable-async-execution-p nil)
  (blamer-max-commit-message-length 100)
  (blamer-type 'visual)
  :custom-face
  (blamer-face ((t :foreground "#7a88cf"
                   ;; Have to specify a bit shorter font than the default font.
                   :height 0.9
                   :italic t)))
  :config
  ;; blamer tries to use local file name for remote files. However, we don't need to do this.
  ;; All the vc functions such as `vc-backend', `vc-git--run-command-string' can handle remote files.
  (defun blamer--get-local-name (filename)
    filename)
  (global-blamer-mode t)
  )
```




-----
