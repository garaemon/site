---
title: "vscodeのterminalでdelete keyを押したときにはEOTを送るようにする"
pubDate: 2025-01-04T22:51:53.000Z
description: "自分の環境ではKarabiner Elementsを使っている影響で、どうやらvscode上でCtrl+Dを打つと、deleteとして捉えられているようだ。 大抵の場合は問題ないのだが、vscode上のterminalではCtrl+Dでインタプリタを終了したりshellを閉じるようにしたい。"
tags: ["Programming", "vscode"]
legacyUrl: "/entry/2025/01/05/075153"
---

<p>自分の環境ではKarabiner Elementsを使っている影響で、どうやらvscode上でCtrl+Dを打つと、deleteとして捉えられているようだ。
大抵の場合は問題ないのだが、vscode上のterminalではCtrl+Dでインタプリタを終了したりshellを閉じるようにしたい。</p>

<p>これを実現するには、keybindings.jsonに以下のような設定を追加すれば良いみたい。</p>



```json
{
        "key": "delete",
        "command": "workbench.action.terminal.sendSequence",
        "args": {
            "text": "\u0004"
        },
        "when": "terminalFocus"
}
```




<p>参考</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fcode.visualstudio.com%2Fdocs%2Fterminal%2Fadvanced%23_custom-sequence-keybindings" title="Advanced Terminal Usage in Visual Studio Code" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;" loading="lazy"></iframe><cite class="hatena-citation"><a href="https://code.visualstudio.com/docs/terminal/advanced#_custom-sequence-keybindings">code.visualstudio.com</a></cite></p>

-----
