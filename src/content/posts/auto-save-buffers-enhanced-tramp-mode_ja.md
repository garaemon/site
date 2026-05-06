---
title: "auto-save-buffers-enhancedを使っているとtramp-modeがハングする"
pubDate: 2018-04-08T09:37:24.000Z
description: "tramp-modeはemacsでssh越しにリモートのファイルを編集することができて大変便利な機能だ."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/08/183724"
---

<p><a href="https://www.gnu.org/software/tramp/">tramp-mode</a>はemacsでssh越しにリモートのファイルを編集することができて大変便利な機能だ.</p>

<p>しかし最近で<a href="https://www.gnu.org/software/tramp/">tramp-mode</a>を利用してssh越しにファイルを開こうとするとemacsが固まってしまい困っていた.</p>

<p>長いこと問題を放置してきたけれども, 色々調べてみると<a href="https://github.com/kentaro/auto-save-buffers-enhanced">auto-save-buffers-enahanced</a>が入っているとハングしてしまうようだ.</p>

<p>とくに<code>auto-save-buffers-enhanced-include-only-checkout-path</code>を有効にしていると挙動が怪しい.
使ってない機能だったので無効にして解決.</p>

<p>ちなみに, auto-save-buffers-enhancedはファイルを自動的に保存してくれるような機能. 以下の記事の紹介が詳しい</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=http%3A%2F%2Femacs.rubikitch.com%2Fauto-save-buffers-enhanced%2F" title="auto-save-buffers-enhanced.el : 【自動保存】Emacsから「ファイル保存」という概念を消し飛ばす。*scratch*も自動保存" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="http://emacs.rubikitch.com/auto-save-buffers-enhanced/">emacs.rubikitch.com</a></cite></p>

-----
