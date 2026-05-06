---
title: "micropythonでm5stackをwifiにつなげる"
pubDate: 2018-04-20T09:00:00.000Z
description: "m5stackでmicropythonを使ってwifiを利用するときは, wifisetupを利用すれば簡単に実装できる."
tags: ["Programming", "m5stack", "micropython"]
legacyUrl: "/entry/2018/04/20/180000"
---

<p>m5stackでmicropythonを使ってwifiを利用するときは, <code>wifisetup</code>を利用すれば簡単に実装できる.</p>



```python
import wifisetup
```




<p>ただ、再接続などを実現するためにどうしても自前で実装したかったので試してみた.</p>



```python
from m5stack import lcd
import utime
import network


def connect_wifi(target_ssid, target_passwd, timeout_sec=10):
    wlan = network.WLAN(network.STA_IF)  # create station interface
    wlan.active(True)                    # activate the interface
    for net in wlan.scan():
        ssid = net[0].decode()
        if ssid == target_ssid:
            lcd.println('Connecting to ' + ssid)
            wlan.connect(ssid, target_passwd)
            start_date = utime.time()
            while not wlan.isconnected():
                now = utime.time()
                lcd.print('.')
                if now - start_date > timeout_sec:
                    break
                utime.sleep(1)
            if wlan.isconnected():
                lcd.println('Success to connect')
                return True
            else:
                lcd.println('Failed to connect')
                return False
    return False
```




-----
