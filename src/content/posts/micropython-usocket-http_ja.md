---
title: "micropythonのusocketで大きなファイルをHTTP越しに読む"
pubDate: 2018-04-30T03:00:00.000Z
description: "micropythonを動かす環境はm5stackといったメモリが貧弱であることが多く, 普段は気にならないサイズでもMemory Allocation Errorが発生して読み込めないことがある."
tags: ["Programming", "m5stack", "micropython"]
legacyUrl: "/entry/2018/04/30/120000"
---

<p>micropythonを動かす環境はm5stackといったメモリが貧弱であることが多く, 普段は気にならないサイズでもMemory Allocation Errorが発生して読み込めないことがある.</p>

<p>micropythonのurequestsパッケージは便利だけど、データを逐次的に読み出すインタフェイスがないのが問題. なので直接usocketオブジェクトに触ってサイズを区切って読み出すようにすればいい. 最後に忘れずにrequestをcloseするのを忘れないように。これを忘れるとmemory allocation errorを引き起こす.</p>



```python
from m5stack import lcd
import urequests

def download_to_file(image_url, filename, step_size=1024):
    r = urequests.get(image_url)
    try:
        with open(filename, 'wb') as f:
            while True:
                c = r.raw.read(step_size)
                if c:
                    f.write(c)
                else:
                    return
    except Exception as e:
        lcd.println('Exception(download_image): ' + str(e))
        raise e
    finally:
        r.close()
```




-----
