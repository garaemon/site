---
title: "Yasnippetでorg-mode用のキーワード展開を行う"
pubDate: 2025-07-16T05:39:55.000Z
description: "Google Docsを使っていると @ を打った後に色々出てくるのが便利。そこで，org-modeでも似たようなことをしたくて yasnippetを使ってみた。"
tags: ["emacs", "org", "yasnippets"]
legacyUrl: "/entry/2025/07/16/143955"
---

<p>Google Docsを使っていると <code>@</code> を打った後に色々出てくるのが便利。そこで，org-modeでも似たようなことをしたくて
yasnippetを使ってみた。</p>

<p>Google Docsの <code>@</code> の展開は，例えば， <code>@today</code> とか <code>@yesterday</code> とかが日付に変換される。
主にそれを参考にこれらのテンプレートを作ってみた。</p>

<p><code>@date</code></p>

<pre class="code snippet" data-lang="snippet" data-unlink># -*- mode: snippet -*-
# name: today
# key: @today
# --
`(format-time-string &#34;&lt;%Y-%m-%d&gt;&#34;)`</pre>


<p><code>@yesterday</code></p>

<pre class="code snippet" data-lang="snippet" data-unlink># -*- mode: snippet -*-
# name: yesterday
# key: @yesterday
# --
`(format-time-string &#34;&lt;%Y-%m-%d&gt;&#34; (time-subtract (current-time) (seconds-to-time (* 24 60 60))))`</pre>


<p><code>@tomorrow</code></p>

<pre class="code snippet" data-lang="snippet" data-unlink># -*- mode: snippet -*-
# name: tomorrow
# key: @tomorrow
# --
`(format-time-string &#34;&lt;%Y-%m-%d&gt;&#34; (time-add (current-time) (seconds-to-time (* 24 60 60))))`</pre>


<p><code>@now</code></p>

<pre class="code snippet" data-lang="snippet" data-unlink># -*- mode: snippet -*-
# name: now
# key: @now
# --
`(format-time-string &#34;&lt;%Y-%m-%d %a %H:%M&gt;&#34;)`</pre>


<p><code>@date</code></p>

<pre class="code snippet" data-lang="snippet" data-unlink># -*- mode: snippet -*-
# name: Org Date from Calendar
# key: @date
# --
&lt;`(org-read-date)`&gt;</pre>


-----
