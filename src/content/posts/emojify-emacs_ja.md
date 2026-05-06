---
title: "emojifyを使ってemacsで絵文字を表示する😺"
pubDate: 2019-10-12T07:06:51.000Z
description: "emacsで絵文字を表示するにはemacs-emojifyを入れると良い."
tags: ["emacs"]
legacyUrl: "/entry/2019/10/12/160651"
---

<p>emacsで絵文字を表示するには<a href="https://github.com/iqbalansari/emacs-emojify">emacs-emojify</a>を入れると良い.</p>

<p>use-packageを使って, こんな感じで設定</p>

<pre class="code emacs-lisp" data-lang="emacs-lisp" data-unlink>(use-package emojify :ensure t
  :if (display-graphic-p)
  :hook (after-init . global-emojify-mode)
  :bind
  (&#34;C-x e&#34; . &#39;emojify-insert-emoji)
  )</pre>


<p>絵文字を挿入するときは<code>emojify-insert-emoji</code>を呼び出すと良い.</p>

<p>プログラミング言語系のモードだと, <a href="https://github.com/iqbalansari/emacs-emojify#controlling-the-display-of-emojis-in-programming-modes">コメントと文字列の中だけ表示されるらしい</a>
<figure class="figure-image figure-image-fotolife" title="emacs-emojify"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emojify-emacs/20191012154542.png" alt="f:id:garaemon1:20191012154542p:plain" title="f:id:garaemon1:20191012154542p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>emacs-emojify</figcaption></figure></p>

-----
