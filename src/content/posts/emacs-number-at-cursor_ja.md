---
title: "emacsでカーソル位置の数字を上下させる"
pubDate: 2018-04-23T15:45:36.000Z
description: "emacsでカーソル位置の数字を上下させるemacs lispコード. どこかから拾ってきたのかもしれないもの. 意外と便利."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/24/004536"
---

<p>emacsでカーソル位置の数字を上下させるemacs lispコード. どこかから拾ってきたのかもしれないもの. 意外と便利.</p>



```lisp
(defun increment-number-at-point ()
  "Increase number at current cursor."
  (interactive)
  (skip-chars-backward "0123456789")
  (or (looking-at "[0123456789]+")
      (error
       "No number at point"))
  (replace-match (number-to-string (1+ (string-to-number (match-string 0))))))

(defun decrement-number-at-point ()
  "Decrease number at current cursor."
  (interactive)
  (skip-chars-backward "0123456789")
  (or (looking-at "[0123456789]+")
      (error
       "No number at point"))
  (replace-match (number-to-string (1- (string-to-number (match-string 0))))))

(global-set-key (kbd "C-c C-+") 'increment-number-at-point)
(global-set-key (kbd "C-c C--") 'decrement-number-at-point)
```




-----
