---
title: "display-fill-column-indicator-modeを試す"
pubDate: 2020-05-10T10:32:57.000Z
description: "display-fill-column-indicator-modeという, モードがemacs27から実装されている. これは, 指定した行に目印を表示して、横に長過ぎるコード・文章を書かないようにするminor modeだ."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2020/05/10/193257"
---

<h2>display-fill-column-indicator-modeの使い方</h2>

<p>display-fill-column-indicator-modeという, モードが<a href="https://github.com/emacs-mirror/emacs/blob/master/etc/NEWS.27#L553">emacs27から実装されている</a>.
これは, 指定した行に目印を表示して、横に長過ぎるコード・文章を書かないようにするminor modeだ.</p>

<p><figure class="figure-image figure-image-fotolife" title="display-fill-column-indicator-mode"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/display-fill-column-indicator-mode/20200510191510.png" alt="f:id:garaemon1:20200510191510p:plain" title="f:id:garaemon1:20200510191510p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>display-fill-column-indicator-mode</figcaption></figure></p>

<p>ちなみに、表示しているソースコードは<a href="https://github.com/cquery-project/cquery">cquery</a>.</p>

<p>設定方法は以下のような感じ.</p>



```lisp
(setq-default display-fill-column-indicator-column 100)
(global-display-fill-column-indicator-mode)
```




<p>これはもともと, <a href="https://www.emacswiki.org/emacs/FillColumnIndicator">fci-mode</a>として提供されていたものが, <a href="https://github.com/emacs-lsp/lsp-ui/issues/339#issuecomment-554761708">native実装になった</a>ものらしい.</p>

<h2>company-lspとの併用</h2>

<p>そもそも, fci-modeでは, <code>emacs -nw</code>環境下で<code>company-lsp</code>を表示するとUIが崩れてしまうという問題があった(個人の環境依存かもしれない)</p>

<p><figure class="figure-image figure-image-fotolife" title="broken company-lsp UI with fci-mode and emacs -nw"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/display-fill-column-indicator-mode/20200510192146.png" alt="f:id:garaemon1:20200510192146p:plain" title="f:id:garaemon1:20200510192146p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>broken company-lsp UI with fci-mode and emacs -nw</figcaption></figure></p>

<p>一方, display-fill-column-indicator-modeにすると表示崩れがなくなった!
<figure class="figure-image figure-image-fotolife" title="company-lsp with display-fill-column-indicator-mode"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/display-fill-column-indicator-mode/20200510192934.png" alt="f:id:garaemon1:20200510192934p:plain" title="f:id:garaemon1:20200510192934p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>company-lsp with display-fill-column-indicator-mode</figcaption></figure></p>

<h2><code>(set-language-environment "Japanese")</code> との相性</h2>

<p>また、<code>(set-language-environment "Japanese")</code>をdisplay-fill-column-indicator-modeと同時につかうと、以下のように表示が崩れる.
<figure class="figure-image figure-image-fotolife" title="Broken UI with (set-language-environment &quot;Japanese&quot;)"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/display-fill-column-indicator-mode/20200510192851.png" alt="f:id:garaemon1:20200510192851p:plain" title="f:id:garaemon1:20200510192851p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>Broken UI with (set-language-environment &quot;Japanese&quot;)</figcaption></figure></p>

-----
