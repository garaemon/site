---
title: "find-name-diredから.gitディレクトリを除く"
pubDate: 2020-08-23T07:26:34.000Z
description: "find-name-diredは, あるディレクトリ以下のファイルの文字列を一括で変換したりする際に、便利な関数です。"
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2020/08/23/162634"
---

<p><code>find-name-dired</code>は, あるディレクトリ以下のファイルの文字列を一括で変換したりする際に、便利な関数です。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fqiita.com%2Fmasa16%2Fitems%2Fe9ddaecfd514552153b1" title="Emacsでディレクトリ以下の複数ファイルに対して一括置換する - Qiita" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://qiita.com/masa16/items/e9ddaecfd514552153b1">qiita.com</a></cite></p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fwww.gnu.org%2Fsoftware%2Femacs%2Fmanual%2Fhtml_node%2Femacs%2FDired-and-Find.html" title="Dired and Find - GNU Emacs Manual" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://www.gnu.org/software/emacs/manual/html_node/emacs/Dired-and-Find.html">www.gnu.org</a></cite></p>

<p>しかし, <code>.git</code>ディレクトリが候補に含まれてしまうと, 何かと不便なことが多いです。</p>

<p>以下のように<code>find-name-arg</code>を変更すると、検索結果から<code>.git</code>ディレクトリを削除できて便利です。</p>



```lisp
;; The default of find-name-arg is "-name".
(setq find-name-arg "-not -path '*/\.git*' -name")
```




-----
