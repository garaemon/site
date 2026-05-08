---
title: "emacsでカーソル位置の単語をispellの辞書に追加する"
pubDate: 2018-04-24T09:00:00.000Z
description: "emacsでカーソル位置の単語をispellの辞書に追加するelispコード"
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/24/180000"
---

<p>emacsでカーソル位置の単語をispellの辞書に追加するelispコード</p>



```lisp
(require 'thingatpt)

(defun add-word-to-ispell-dictionary ()
  "Add word to dictionary file for ispell."
  (interactive)
  (let ((user-dictionary-file (expand-file-name "~/.aspell.en.pws")))
    (let ((buf (find-file-noselect user-dictionary-file)))
      (if (not (file-exists-p user-dictionary-file))
          (with-current-buffer buf
            (insert "personal_ws-1.1 en 0\n")
            (save-buffer)))
      (let ((theword (thing-at-point 'word)))
        (if theword
            (with-current-buffer buf
              (goto-char (point-max))
              (insert (format "%s\n" theword))
              (save-buffer))))
      )))

(global-set-key "\M-." 'add-word-to-ispell-dictionary)
```




-----
