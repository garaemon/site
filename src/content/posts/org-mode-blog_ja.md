---
title: "org-modeでblog向けのテンプレートを作成する"
pubDate: 2025-07-08T05:54:19.000Z
description: "前回の記事でorg modeで書かれたファイルからはてなブログに投稿できるものを作った。"
tags: ["emacs", "org"]
legacyUrl: "/entry/2025/07/08/145419"
---

<p><a href="/posts/hatena-blog-org-mode">前回の記事</a>でorg
modeで書かれたファイルからはてなブログに投稿できるものを作った。</p>

<p>より便利にするため，ちょっとしたelispで簡単にblog記事をかけるようにしておく。</p>



```lisp
(defun my-create-dated-org-file (title)
  "Create a new org file with the current date and a user-provided title.
The filename will be in the format 'YYYY-MM-DD-your-title.org'.
Spaces in the title are replaced with hyphens.
If the file is new, it will be populated with a default template."
  ;; Using (interactive "s...") receives string input from the user
  ;; and binds it to the function's argument `title`.
  (interactive "sEnter file title: ")
  (let* (
         ;; Get the current date as a string in "YYYY-MM-DD" format.
         (date-str (format-time-string "%Y-%m-%d"))
         ;; Replace all spaces in the user-provided title with hyphens.
         (processed-title (replace-regexp-in-string " " "-" title))
         ;; Construct the filename in the format "date-title.org".
         (filename (concat date-str "-" processed-title ".org")))

    ;; find-file opens the file if it exists, or creates a new one if it doesn't.
    (find-file filename)

    ;; Check if the buffer size is zero.
    ;; If it's zero, it means the file was newly created.
    (when (zerop (buffer-size))
      ;; For a new file, insert the specified template.
      ;; Insert the original user-provided title into #+TITLE:.
      (insert (format "#+TITLE: %s\n" title))
      (insert "#+FILETAGS:\n"))))
```




<p>うまくyasnippetとかを使ってtemplateをかけるといいんだけど。もしかしたらorg-captureの枠組みを使ったほうが楽なのかもしれない。</p>

-----
