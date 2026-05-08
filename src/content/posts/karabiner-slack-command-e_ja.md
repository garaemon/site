---
title: "karabinerを使ってslackでCommand+eでインラインコードが作れるようにする"
pubDate: 2021-02-14T01:52:15.000Z
description: "Notionのアプリでは Command+e でインラインコードが作れるので、slackでも同じキーバインドでインラインコードを作れるようにしたい。 slackでは Command+Shift+C でインラインコードが作れるので、この2つのキーをkarabinerでマッピングしてあげれば良い。"
tags: ["mac"]
legacyUrl: "/entry/2021/02/14/105215"
---

<p>Notionのアプリでは <code>Command+e</code> でインラインコードが作れるので、slackでも同じキーバインドでインラインコードを作れるようにしたい。
slackでは <code>Command+Shift+C</code> でインラインコードが作れるので、この2つのキーをkarabinerでマッピングしてあげれば良い。</p>

<script src="https://gist.github.com/garaemon/df5f78f04218c95f16fadf38a364babc.js"></script>


<p>このjsonを <code>~/.config/karabiner/karabiner.json</code> に追加すればよい。</p>

-----
