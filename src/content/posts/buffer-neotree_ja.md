---
title: "選択しているbufferに応じてneotreeのディレクトリを移動させる"
pubDate: 2019-10-14T02:57:37.000Z
description: "emacsでbufferを選択するたびにneotreeのディレクトリがそれに応じて変わると便利なのではないかと思い, 設定してみた."
tags: ["emacs"]
legacyUrl: "/entry/2019/10/14/115737"
---

<p>emacsでbufferを選択するたびに<a href="https://github.com/jaypei/emacs-neotree">neotree</a>のディレクトリがそれに応じて変わると便利なのではないかと思い,
設定してみた.</p>

<p>bufferの選択に応じて呼び出されるhookは<a href="https://stackoverflow.com/questions/47456134/emacs-lisp-hooks-for-detecting-change-of-active-buffer">存在しない</a>らしいので, <a href="http://emacs.rubikitch.com/switch-buffer-functions/">switch-buffer-functions</a>を利用する</p>



```lisp
(use-package switch-buffer-functions :ensure t)
```




<p><code>switch-buffer-functions</code>にhookを追加.</p>



```lisp
(add-hook 'switch-buffer-functions
          (lambda (prev current)
            (let ((neotree-buffer (neo-global--get-buffer)))
              (if (and
                   ;; Ignore if new buffer is neotree
                   (not (eq current neotree-buffer))
                   ;; Ignore if the buffer is not assosiated with a file
                   buffer-file-name
                   ;; Ignore if neotree is not active
                   (neo-global--window-exists-p))
                  (progn
                    (neo-buffer--change-root default-directory)
                    (switch-to-buffer current)
                    )
                )
              )
            ))
```




-----
