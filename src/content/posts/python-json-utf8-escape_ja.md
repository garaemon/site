---
title: "pythonでjsonのutf8の文字をescapeしない"
pubDate: 2018-05-02T10:22:04.000Z
description: "pythonでdictオブジェクトを文字列に変換すると、utf8の文字がエスケープされてしまう."
tags: ["Programming", "python"]
legacyUrl: "/entry/2018/05/02/192204"
---

<p>pythonでdictオブジェクトを文字列に変換すると、utf8の文字がエスケープされてしまう.</p>



```python
'hoge: %s' % json.dumps({'text': 'ほげ'})
=> 'hoge: {"text": "\\u307b\\u3052"}'
```




<p>これをエスケープしないようにするには<code>ensure_ascii=False</code>にすれば良い.</p>



```python
'hoge: %s' % json.dumps({'text': 'ほげ'}, ensure_ascii=False)
=> 'hoge: {"text": "ほげ"}'
```




-----
