---
title: "Emacsのスペルチェッカーをjinxに乗り換えた"
pubDate: 2025-09-13T19:50:42.000Z
description: "これまでEmacsのスペルチェックにはflyspellを使っていたが、いくつか不満な点があったのでjinxに乗り換えた。"
tags: ["emacs"]
legacyUrl: "/entry/2025/09/14/045042"
---

<p>これまでEmacsのスペルチェックにはflyspellを使っていたが、いくつか不満な点があったのでjinxに乗り換えた。</p>

<h1 id="flyspellで困っていたこと">flyspellで困っていたこと</h1>

<p>flyspell の一番の不満点は、辞書にない単語を登録する際の挙動だった。
GUI環境だとマウス操作を前提としたコンテキストメニューが表示されてしまい、キーボード中心のワークフローが崩れてしまう。
キーボードだけで操作することも不可能ではないけど，やりづらい。</p>

<p><figure class="figure-image figure-image-fotolife" title="flyspellのcontextメニュー"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-jinx/20250914045106.png" width="1136" height="606" loading="lazy" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>flyspellのcontextメニュー</figcaption></figure></p>

<p>また、flyspellのチェック範囲はカーソル周辺に限られるため、バッファ全体のスペルミスを見逃しがちという問題もあった。</p>

<h1 id="jinxへの乗り換え">jinxへの乗り換え</h1>

<p><a href="https://github.com/minad/jinx">jinx</a> というパッケージをflyspellの代わりに使うようにしてみた。</p>



```lisp
(use-package jinx
  :ensure t
  :config
  ;; Ignore non-English words.
  (add-to-list 'jinx-exclude-regexps '(t ".*[^[:ascii:]].*"))
  :bind
  ("\C-cd" . jinx-correct)
  ;; just executing (global-jinx-mode) does not turn on jinx.
  ;; We have to add a hook to emacs-start-hook
  :hook ('emacs-startup-hook . 'global-jinx-mode)
  )
```




<p>導入当初、日本語の単語がエラーとして扱われる問題があったが、これは <code>jinx-exclude-regexps</code> で非ASCII文字を除外することで解決できた。</p>

<p>単語登録も、 <code>jinx-correct</code> を呼び出せば, \"@\"をおすと単語登録に移れる。キーボードから手を離さずに完結できるようになった。
この例では<a href="https://github.com/tumashu/vertico-posframe">vertico-posframe</a>を使っているので，posframeで表示されている。</p>

<p><figure class="figure-image figure-image-fotolife" title="jinxの単語修正・追加のUI (vertico-posframeを利用)"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/emacs-jinx/20250914045144.png" width="1200" height="751" loading="lazy" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>jinxの単語修正・追加のUI (vertico-posframeを利用)</figcaption></figure></p>

<p>jinxに乗り換えたことで、スペルチェック周りのストレスがなくなり、快適になった気がする。
しばらくはこの設定で使ってみようと思う。</p>

-----
