---
title: "web-modeでeslintをflycheck経由で使う"
pubDate: 2018-06-24T08:42:49.000Z
description: "flycheck-add-modeで設定する"
tags: ["emacs", "Programming", "javascript"]
legacyUrl: "/entry/2018/06/24/174249"
---

<p><code>flycheck-add-mode</code>で設定する</p>



```lisp
(flycheck-add-mode 'javascript-eslint 'web-mode)
```




<p>eslintの設定で, <a href="https://www.npmjs.com/package/eslint-plugin-html">eslint-plugin-html</a>が必要なので、その設定を忘れないようにする.</p>



```javascript
module.exports = {
...
    "plugins": [
        "html",
    ],
...
}
```




-----
