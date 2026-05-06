---
title: "emacsで選択範囲or現在行のpythonを評価する"
pubDate: 2018-04-16T10:00:00.000Z
description: "elpyを使っています. elpyやemacs付属のpython-modeでも, pythonのインタプリタをemacs上で起動することができ、大変便利だ."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/16/190000"
---

<p><a href="https://github.com/jorgenschaefer/elpy">elpy</a>を使っています. elpyやemacs付属のpython-modeでも, pythonのインタプリタをemacs上で起動することができ、大変便利だ.</p>

<p>elpyの場合は<code>M-x elpy-shell-switch-to-shell</code>, python-modeなら<code>M-x run-python</code>でpythonインタプリタを立ち上げることができる.</p>

<p>emacs lispだと、S式もしくはregionの評価が<code>C-x C-e</code>でできて、とても便利。それと似たような挙動をpythonでも実現したい.</p>

<p>emacsでregionを選択していたらその範囲、選択していなかったら現在行のpythonを評価するようなelisp.</p>



```lisp
(elpy-enable) ;; enable elpy
(defun elpy-shell-send-region-or-statement ()
  "Send region or statement to python shell."
  (interactive)
  (if (use-region-p)
      (progn
        (elpy-shell-send-region-or-buffer)
        (deactivate-mark))
    (elpy-shell-send-statement)
    ))
(define-key python-mode-map "\C-x\C-E" 'elpy-shell-send-region-or-statement)
```




<p>ついでに、個人的にはpython shellの立ち上げを以下のようなキーバインドに設定している.</p>



```lisp
(define-key python-mode-map "\C-cE" 'elpy-shell-switch-to-shell)
(global-set-key "\C-cE" 'elpy-shell-switch-to-shell)
```




-----
