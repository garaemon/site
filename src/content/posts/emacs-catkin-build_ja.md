---
title: "emacsからcatkin buildを走らせる"
pubDate: 2019-10-05T02:48:25.000Z
description: "emacs編集中に, ターミナルに移動することなくcatkin buildを走らせられると便利."
tags: ["emacs", "ros"]
legacyUrl: "/entry/2019/10/05/114825"
---

<p>emacs編集中に, ターミナルに移動することなくcatkin buildを走らせられると便利.</p>



```lisp
(defun ros-catkin-make (dir)
  "Run catkin_make command in DIR."
  (interactive (list default-directory))
  ;; clear compilation buffer first not to occupy memory space.
  (if (get-buffer "*catkin_make*")
      (kill-buffer "*catkin_make*"))
  (let* ((default-directory dir)
         (compilation-buffer-name-function (lambda (major-mode-name) "*catkin_make*")))
    (compile "catkin bt --no-status"))
  (switch-to-buffer-other-window (get-buffer-create "*catkin_make*"))
  )
```




<p>具体的には編集中のbufferのディレクトリに対して, <code>catkin build --this</code>を走らせている.</p>

<p>適当に<code>C-x C-m</code>とかに割り当てる.</p>



```lisp
(global-set-key (kbd "C-x C-m") 'ros-catkin-make)
```




-----
