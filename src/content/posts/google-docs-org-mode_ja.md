---
title: "Google Docsみたいに，org-mode上で@で補完候補を出るようにする"
pubDate: 2025-07-25T06:09:54.000Z
description: "Google Docs上で @ を打つと，いろんな補完候補が表示されるのが便利。似たような機能はNotionだと / で呼び出すことができる。"
tags: ["org", "emacs", "yasnippet", "corfu"]
legacyUrl: "/entry/2025/07/25/150954"
---

<h1 id="Google-Docsのからの補完は便利">Google Docsの@からの補完は便利</h1>

<p>Google Docs上で <code>@</code> を打つと，いろんな補完候補が表示されるのが便利。似たような機能はNotionだと <code>/</code> で呼び出すことができる。</p>

<p>これと似たようなことをorg-mode上でやるためには，yasnippet+yasnippet-capf+corfuでできそうだったので組んでみた。
yasnippetのテンプレートに関しては，<a href="/posts/yasnippet-org-mode">以前の記事</a>に書いた。</p>

<h1 id="-を補完対象に含める"><code>@</code> を補完対象に含める</h1>

<p>yasnippet，というか completion-at-point は <code>@</code> を単語の一部として認識しないので，少し修正する必要がある。
<code>modify-syntax-entry</code> というので <code>@</code> も単語の一部ということにする。</p>

<pre class="code elisp" data-lang="elisp" data-unlink>(defun my-add-at-sign-to-syntax ()
  &#34;Add @ to word syntax.&#34;
  (modify-syntax-entry ?@ &#34;w&#34;))
(add-hook &#39;org-mode-hook #&#39;my-add-at-sign-to-syntax)</pre>


<h1 id="実際の挙動">実際の挙動</h1>

<p>前述のものも含めて，こんな感じにしている。</p>

<pre class="code elisp" data-lang="elisp" data-unlink>(use-package yasnippet :ensure t
  :config
  (setq yas-snippet-dirs &#39;(&#34;~/.emacs.d/snippets&#34;
                           &#34;~/.emacs.d/yasnippet-snippets/snippets&#34;))
  (setq yas-trigger-key &#34;Enter&#34;)
  (yas-global-mode 1)
  )

(use-package yasnippet-capf
  :ensure t
  :after cape
  :config
  (add-to-list &#39;completion-at-point-functions #&#39;yasnippet-capf)
  (defun my-add-at-sign-to-syntax ()
    &#34;Add @ to word syntax.&#34;
    (modify-syntax-entry ?@ &#34;w&#34;))
  (add-hook &#39;org-mode-hook #&#39;my-add-at-sign-to-syntax)
  )

(use-package corfu
  :ensure t
  :config
  (global-corfu-mode)
  (corfu-popupinfo-mode)
  )</pre>


<p>corfuは一部抜粋。</p>

<p>実行時はこんな感じ。
<span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/google-docs-org-mode/20250725151019.png" width="568" height="298" loading="lazy" title="" class="hatena-fotolife" itemprop="image"></span></p>

-----
