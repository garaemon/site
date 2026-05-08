---
title: "micropythonのPOSTでハマった件"
pubDate: 2018-04-17T10:00:00.000Z
description: "m5stackでmicropythonを動かして、spotifyで再生中の曲を表示するものを作っている."
tags: ["Programming", "m5stack", "micropython"]
legacyUrl: "/entry/2018/04/17/190000"
---

<p><a href="http://m5stack.com/">m5stack</a>で<a href="https://micropython.org/">micropython</a>を動かして、<a href="https://www.spotify.com">spotify</a>で再生中の曲を表示するものを作っている.</p>

<p><blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">m5stackで再生中のSpotifyの曲の画像が出るようなのを作ってみた <a href="https://t.co/59qnbYn47M">pic.twitter.com/59qnbYn47M</a></p>&mdash; がらえもん (@garaemon) <a href="https://twitter.com/garaemon/status/985176635925135360?ref_src=twsrc%5Etfw">2018年4月14日</a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></p>

<p>その過程で、micropythonに入っているurequestsライブラリでは, postメソッドを特に指定せずに使った時に<code>Content-Type</code>が指定されないというのでハマった.</p>

<p>よくあるライブラリではpostを呼び出すと <code>Content-Type: application/x-www-form-urlencoded</code> が指定される. しかしこれが指定されないのでちゃんと<code>Content-Type</code>を渡してあげる必要がある.</p>



```python
urequests.post(
    'http://example.com/foo',
    data=...,
    headers={
        'Content-Type': 'application/x-www-form-urlencoded',
})
```




<p>ただ、<code>json</code>オプションを利用すると、<code>Content-Type: application/json</code>が親切に自動的に指定される.</p>

<p>urequestsを使う場合は
<a href="https://github.com/micropython/micropython-lib/blob/master/urequests/urequests.py">ソースに目を通す</a>のが必要そうだ.</p>

-----
