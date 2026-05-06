---
title: "Journellyにorg-captureから書き込む"
pubDate: 2025-08-09T19:07:56.000Z
description: "最近，JournellyというアプリをiPhoneで使い始めた。"
tags: ["emacs", "org", "journelly", "ios"]
legacyUrl: "/entry/2025/08/10/040756"
---

<h1 id="Journelly">Journelly</h1>

<p>最近，JournellyというアプリをiPhoneで使い始めた。</p>

<ul>
<li><a href="https://lmno.lol/alvaro/the-mac-observer-showcases-journelly">https://lmno.lol/alvaro/the-mac-observer-showcases-journelly</a></li>
<li><a href="https://www.macobserver.com/tips/round-ups/journelly-journal-app-ios/">https://www.macobserver.com/tips/round-ups/journelly-journal-app-ios/</a></li>
</ul>


<p>Journelly は有料のアプリなんだけど，Twitterみたいな感覚で個人のノートを書き込めるというアプリ。
ちょっとしたメモを書き込むときに便利。</p>

<p>ポイントは，保存フォーマットが org-mode になっているということ。
Journellyは iCloud に保存することができる。
なので，macでEmacsを使っている時に，直接ファイルに書き込むことができる。</p>

<h1 id="org-captureでJournellyに書き込む">org-captureでJournellyに書き込む</h1>

<p>Journellyのファイルは
<code>~/Library/Mobile Documents/iCloud~com~xenodium~Journelly/Documents/Journelly.org</code>
からアクセスできる。</p>

<p>org-capture-templatesに以下を追加することで， org-capture起動->j で Journellyに書き込み可能。</p>



```lisp
(setq org-capture-templates
  (("j" "Journelly" entry (file (expand-file-name "~/Library/Mobile Documents/iCloud~com~xenodium~Journelly/Documents/Journelly.org"))
        "* %T @ %(system-name) by %(user-login-name)\n%?"
        :prepend t
        :jump-to-captured t
        )))
```




-----
