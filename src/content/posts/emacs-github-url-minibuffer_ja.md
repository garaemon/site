---
title: "emacsで対応するgithubのURLをminibufferに表示する"
pubDate: 2021-03-13T03:24:50.000Z
description: "browse-at-remoteは非常に素晴らしいelispで、emacsで開いているバッファから対応するgithubのページをブラウザで開くことができる。"
tags: ["emacs", "mac"]
legacyUrl: "/entry/2021/03/13/122450"
---

<p>browse-at-remoteは非常に素晴らしいelispで、emacsで開いているバッファから対応するgithubのページをブラウザで開くことができる。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fgithub.com%2Frmuslimov%2Fbrowse-at-remote" title="rmuslimov/browse-at-remote" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://github.com/rmuslimov/browse-at-remote">github.com</a></cite></p>

<p>しかし、個人的には仮想マシンや他の計算機にsshして、そこでtmuxを立ち上げてemacsを<code>emacs -nw</code>で立ち上げている。
そのため、<code>(browse-at-remote)</code>を実行すると、仮想マシン内や他の計算機の画面でブラウザが立ち上がってしまい、手元の計算機の画面でブラウザを開くことができないという問題がある。</p>

<p>この問題を解消するため、emacsのminibufferにgithubのリンクを表示するようにした。</p>



```lisp
(defun echo-url-at-remote ()
  (interactive)
  (message "URL: %s" (browse-at-remote-get-url)))
)
```




<p><figure class="figure-image figure-image-fotolife" title="echo-url-at-remoteの実行時の様子"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-github-url-minibuffer/20210313122104.png" alt="f:id:garaemon1:20210313122104p:plain" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>echo-url-at-remoteの実行時の様子</figcaption></figure></p>

<p>terminalとしては<a href="https://iterm2.com/">iTerm2</a>を使っているので、Command+左クリックで手元の計算機の画面でブラウザを開くことができる。</p>

-----
