---
title: "forgeを導入してpull requestをemacs上で作る"
pubDate: 2021-05-03T02:20:45.000Z
description: "forgeを導入することで、emacsからpull requestを作成できるようにする。"
tags: ["emacs"]
legacyUrl: "/entry/2021/05/03/112045"
---

<p>forgeを導入することで、emacsからpull requestを作成できるようにする。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fgithub.com%2Fmagit%2Fforge" title="magit/forge" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://github.com/magit/forge">github.com</a></cite></p>

<p><code>use-package</code>を使っていると導入はかんたん。</p>



```lisp
(use-package forge :after magit :ensure t)
```




<p>forgeを使うには少し設定が必要。</p>

<p>githubのユーザ名の設定は <code>git config --global github.user</code>で行う。</p>

<pre class="code shell" data-lang="shell" data-unlink>git config --global github.user USER_NAME</pre>


<p>また、アクセスするためのtokenをgithubから<a href="https://github.com/settings/tokens">取得</a>。
scopeは<code>repo</code>, <code>user</code>, <code>read:org</code>の3つを<a href="https://magit.vc/manual/forge/Token-Creation.html#Token-Creation">有効にする</a>。</p>

<p>取得したtokenは<code>~/.authinfo</code>に書き込む。
<code>~/.authinfo</code>のフォーマットは以下のような感じ。<code>USER_NAME</code>と<code>TOKEN</code>は適切なものに置き換える。</p>

<pre class="code" data-lang="" data-unlink>machine api.github.com login USER_NAME^forge password TOKEN</pre>


<p>ここまで行うと、<code>forge-pull</code>を実行すればmagitのstatus画面にプルリクエスト一覧が出てくる。</p>

<p>また、<code>forge-create-pullreq</code>でpull requestを作成できる。
レポジトリをforkするには、<code>forge-fork</code>を実行すればよい。</p>

-----
