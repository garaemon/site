---
title: "emacs 26で入ったdisplay-line-numbersを利用する"
pubDate: 2018-07-08T09:10:03.000Z
description: "emacsで左側に行数を表示するlinum-modeは重いことで有名だった。 軽くするためにはいろいろと設定しなくてはいけなかった."
tags: ["emacs", "Programming"]
legacyUrl: "/entry/2018/07/08/181003"
---

<p>emacsで左側に行数を表示するlinum-modeは重いことで有名だった。
軽くするためには<a href="http://d.hatena.ne.jp/daimatz/20120215/1329248780">いろいろと設定しなくてはいけなかった</a>.</p>

<p>しかし, emacs26でついに行数表示のネイティブ実装である<a href="https://github.com/emacs-mirror/emacs/blob/master/etc/NEWS.26#L495">diplay-line-numbers-modeが実装された</a>.</p>



```lisp
(if (version<= "26.0.50" emacs-version)
      (global-display-line-numbers-mode))
```




<p>個人的には<code>emacs -nw</code>で起動したときに行数表示の色が見にくかったので以下のようにしている</p>



```lisp
(if (version<= "26.0.50" emacs-version)
    (progn
      (global-display-line-numbers-mode)
      (defun display-line-numbers-color-on-after-init (frame)
        "Hook function executed after FRAME is generated."
        (unless (display-graphic-p frame)
          (set-face-background
           'line-number
           (plist-get base16-solarized-dark-colors :base01))))
      (add-hook 'after-make-frame-functions
                (lambda (frame)
                  (display-line-numbers-color-on-after-init frame)))
      ))
```




-----
