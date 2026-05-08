---
title: "macでimagemagickとcocoaが有効になったemacsを使う"
pubDate: 2019-10-13T09:43:11.000Z
description: "結論から言うと, emacs-plusを使うと良い"
tags: ["emacs"]
legacyUrl: "/entry/2019/10/13/184311"
---

<p>結論から言うと, <a href="https://github.com/d12frosted/homebrew-emacs-plus">emacs-plus</a>を使うと良い</p>

<p>macでemacsをcocoa上で動かしたい時, homebrewでは<code>brew cask install emacs</code>のようにインストールする.</p>

<p>しかしこれだとimagemagickが有効になっていない.</p>

<p>imagemagickが有効化は以下のコマンドで調べられる.</p>



```lisp
(image-type-available-p 'imagemagick)
```




<p><a href="https://github.com/jrblevin/markdown-mode">markdown-mode</a>の
markdown-max-image-sizeを使いたかったのだが, これが
<a href="https://github.com/jrblevin/markdown-mode/blob/master/markdown-mode.el#L565">imagemagick必須だった</a>
ので,
<code>brew cask</code>経由で入れたemacsでは有効にならなかった.</p>

<p>mac上で簡単にimagemagickとcocoaが有効なemacsを使うには, <a href="https://github.com/d12frosted/homebrew-emacs-plus">emacs-plus</a>を使うと良い</p>

<pre class="code" data-lang="" data-unlink>brew tap d12frosted/emacs-plus
brew install emacs-plus --with-imagemagick@6 --without-spacemacs-icon</pre>


<p><code>--without-spacemacs-icon</code>は, とくにspacemacsを使っているわけでないのでつけてみた.</p>

-----
