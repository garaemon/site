---
title: "vscodeのtabの挙動をemacsっぽくする"
pubDate: 2020-05-02T08:50:31.000Z
description: "customize-indentation-rules"
tags: ["emacs", "Programming", "vscode"]
legacyUrl: "/entry/2020/05/02/175031"
---

<p><figure class="figure-image figure-image-fotolife" title="customize-indentation-rules + vscode-emacs-indent"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/vscode-tab-emacs/20200502174644.gif" alt="f:id:garaemon1:20200502174644g:plain" title="f:id:garaemon1:20200502174644g:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>customize-indentation-rules</figcaption></figure></p>

<p>visual studio codeのtabの挙動をemacsのようにしたい.</p>

<p>そのために, 以下の2つのextensionを利用する.
* vscode-emacs-indent
* customize-indentation-rules</p>

<hr />

<p>emacsにおけるtabを押したときの挙動は以下のようなものだ.</p>

<ul>
<li>tabを押すと, その行がインデントされる. インデント幅を単純に増やすのではなく, 一つ前の行の文法とインデントによって決定される. したがって、tabを連打してもインデントは増えたりしない.</li>
<li>カーソル位置は相対的に保存される. ただし, 文字よりも左側にカーソルがある場合、最も左の文字まで移動する.</li>
</ul>


<p>一方で, vscodeの標準のtabの挙動は押すたびにインデントが増えていく挙動になっている.</p>

<p>このような挙動をemacsのように変更するextensionがvscode-emacs-indentだ.
このextensionを入れることでjavascript, typescriptなどは所望の挙動をするようになる。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fgithub.com%2Fsakapoko%2Fvscode-emacs-indent" title="sakapoko/vscode-emacs-indent" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://github.com/sakapoko/vscode-emacs-indent">github.com</a></cite></p>

<p>一方で, C++やPythonではvscode-emacs-indentを使ったとしてもtabを押してもインデントされない.
これらの言語では, indentationRulesが設定されていないからである.</p>

<ul>
<li><a href="https://github.com/microsoft/vscode/blob/master/extensions/go/language-configuration.json#L27">goのindentationRulesの設定(language-configuration.json)</a></li>
<li><a href="https://github.com/microsoft/vscode/blob/master/extensions/typescript-language-features/src/features/languageConfiguration.ts#L16">typescriptのindentationRulesの設定 (.tsファイルから設定している)</a></li>
<li><a href="https://github.com/microsoft/vscode/blob/master/extensions/cpp/language-configuration.json">c++のlanguage-configuration.json. indentationRulesの設定がない.</a></li>
</ul>


<p>そこで, customize-indetation-rulesという各言語のindentationRulesを上書き可能なextensionを作成した。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fgithub.com%2Fgaraemon%2Fvscode-customize-indentation-rules" title="garaemon/vscode-customize-indentation-rules" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://github.com/garaemon/vscode-customize-indentation-rules">github.com</a></cite></p>

<p>customize-indentation-rulesを利用すると, settings.jsonに設定を書けばindentationRulesが定義されていない言語に対して追加で定義することができる。
例えば、C++だと以下のような設定を書くと、インデントされるようになる. (<a href="https://github.com/microsoft/vscode/commit/872ecf2a4e2747f3da65bce312196ae5435d2279">元ネタは以前vscodeから削除されたC++のインデントルール</a>)</p>

<p><script src="https://gist.github.com/garaemon/a2ee915f4a100cec0df7e473944724ec.js"> </script><cite class="hatena-citation"><a href="https://gist.github.com/garaemon/a2ee915f4a100cec0df7e473944724ec">gist.github.com</a></cite></p>

<p>以上のように, vscode-emacs-indentとcustomize-indentation-rulesを組み合わせると, vscodeのtabの挙動がemacsでの挙動を近づけることができる.</p>

-----
