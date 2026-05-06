---
title: "Alfredから特定のweb pageを開く"
pubDate: 2021-01-31T05:39:38.000Z
description: "仕事などでGithubのプルリクエスト一覧ページ (https://github.com/pulls) を開くことが多い。 その場合、ブラウザのURL欄に直接 https://github.com/pulls もしくは pulls と打ってプルリクエスト一覧ページに移動している。"
tags: ["Alfred"]
legacyUrl: "/entry/2021/01/31/143938"
---

<p>仕事などでGithubのプルリクエスト一覧ページ (<a href="https://github.com/pulls">https://github.com/pulls</a>) を開くことが多い。
その場合、ブラウザのURL欄に直接 <code>https://github.com/pulls</code> もしくは <code>pulls</code> と打ってプルリクエスト一覧ページに移動している。</p>

<p>しかしこのような操作は、複数の動作が必要である。</p>

<ol>
<li>ブラウザのwindowを探す</li>
<li>ブラウザのURL欄をマウスでクリックする</li>
<li><code>pulls</code>と打つ</li>
</ol>


<p>複数の動作が必要なのが煩わしいなと思っていたが、<a href="https://www.alfredapp.com/">Alfred</a>から直接開けるようにすれば良いと気づいた。
<figure class="figure-image figure-image-fotolife" title="Open github pulls page from alfred"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/alfred-web-page/20210131142837.png" alt="f:id:garaemon1:20210131142837p:plain" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>Open github pulls page from alfred</figcaption></figure></p>

<h2>設定方法</h2>

<p>AlfredのWeb Searchに特定のwebページを追加すると、Alfredから直接web pageを開くことができる。</p>

<p>Alfredの設定から<code>Features &gt; Web Search &gt; 右下のAdd Custom Search</code>から追加
<figure class="figure-image figure-image-fotolife" title="Configure Github pull request page as custom search"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/alfred-web-page/20210131143212.png" alt="f:id:garaemon1:20210131143212p:plain" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>Configure Github pull request page as custom search</figcaption></figure></p>

<h2>Alfredのbrowser bookmark機能について</h2>

<p>ここまでやって、Alfredのweb browser機能で良かったのではないか?という気がしてきた。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fqiita.com%2Fashidaka%2Fitems%2Fe783cd2fc9a317321c84" title="Alfredの「Bookmark検索」が便利すぎて、Bookmark整理を辞めた件 - Qiita" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://qiita.com/ashidaka/items/e783cd2fc9a317321c84">qiita.com</a></cite></p>

-----
