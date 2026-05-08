---
title: "emacsで毎日のメモのためのmarkdownを自動的に作成する"
pubDate: 2018-04-14T05:25:38.000Z
description: "メモをとるのにmarkdownはとても便利."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/14/142538"
---

<p>メモをとるのにmarkdownはとても便利.</p>

<p>emacsで作業中のメモをとるためのmarkdownを日別に自動的に作成するemacs lispのコード.</p>

<p><code>~/daily-notes/</code>の下に日付の入ったファイル名を自動生成する.
また、先頭に日付も自動的に挿入するようにしている.</p>



```lisp
(defvar daily-markdown-memo-directory "~/daily-notes"
  "Directory to save daily markdown memos.")
(defun daily-markdown-memo-create-today-markdown ()
  "Create markdown file for today under DAILY-MARKDOWN-MEMO-DIRECTORY."
  (interactive)
  ;; If there is no memo directory, create it.
  (if (not (file-directory-p daily-markdown-memo-directory))
      (progn
        (message "Creating directory: %s" daily-markdown-memo-directory)
        (make-directory daily-markdown-memo-directory)))
  (let ((today-file-full-path
         (let ((today-file (format-time-string "%Y-%m-%d.md" (current-time))))
           (concat daily-markdown-memo-directory "/" today-file))))
    ;; Verify if the buffer is already opened for today-file-full-path.
    ;; If not,
    (let ((file-buffer (find-file-noselect today-file-full-path)))
      (with-current-buffer file-buffer
        (if (not (file-exists-p today-file-full-path))
            ;; If it is the first time to open the file, insert date and save it automatically.
            (progn
              (insert (format-time-string "# %Y-%m-%d" (current-time)))
              (save-buffer))))))
  )
;; Run daily-markdown-memo-create-today-markdown when emacs is opened.
(add-hook 'after-init-hook '(daily-markdown-memo-create-today-markdown))
;; Run daily-markdown-memo-create-today-markdown every 30 minutes
(run-with-timer 0 (* 30 60) 'daily-markdown-memo-create-today-markdown)
```




-----
