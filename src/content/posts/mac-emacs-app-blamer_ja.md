---
title: "macのEmacs.appでblamerが動作しない問題について"
pubDate: 2025-03-13T06:13:52.000Z
description: "mac上でEmacsのblamerが特定の環境でうまく動かなかった。原因と対応を記録しておく。"
tags: ["emacs", "Programming"]
legacyUrl: "/entry/2025/03/13/151352"
---

<p>mac上でEmacsの<a href="https://github.com/Artawower/blamer.el">blamer</a>が特定の環境でうまく動かなかった。原因と対応を記録しておく。</p>

<h1 id="現象のまとめ">現象のまとめ</h1>

<ul>
<li>Emacs.app をダブルクリックで起動するとblamerが動かない。gitのコミット情報が表示されない。</li>
<li>ターミナルから起動すると正常に動く。</li>
<li>init.el に最小構成で書いてもダブルクリックでEmacs.appを起動すると、blamer が機能せず。</li>
</ul>


<h1 id="原因の特定">原因の特定</h1>

<p>色々調べていくと、問題は、Emacs.app で <code>async-start</code> を使ったときの作業ディレクトリ継承にあった。</p>

<p>blamerは内部で <code>git blame</code>を呼び出すときにデフォルトでは<a href="https://github.com/jwiegley/emacs-async">emacs-async</a>の<code>async-start</code>を利用している。</p>

<p><code>async-start</code> は内部で別プロセスを起動している。どうやらEmacs.appから<code>async-start</code>を起動すると、その別プロセスが親プロセスとは異なる作業ディレクトリを使ってしまうようだった</p>

<h1 id="対応策">対応策</h1>

<p><code>blamer--async-start</code> に以下のようなパッチを当てる。<code>async-start</code> の実行前に default-directory を明示的に設定した。</p>



```lisp
(defun blamer--async-start (start-func finish-func)
    "Optional wrapper over \\\\='async-start function.

Needed for toggling async execution for better debug.
START-FUNC - function to start
FINISH-FUNC - callback which will be printed after main function finished"
    (let ((async-prompt-for-password nil))
      (ignore async-prompt-for-password)
      (message "blamer--async-start: %s" blamer-enable-async-execution-p)
      (if blamer-enable-async-execution-p
          ;; The subprocess of Emacs.app does not inherit default-directory.
          (async-start `(lambda() (cd ,default-directory) (funcall ,start-func)) finish-func)
        (if finish-func
            (funcall finish-func (funcall start-func))
          (funcall start-func)))))
```




<p>これで、Emacs.app からでも blamer が正常に動くようになった 🙌</p>

<p>同じような問題に遭遇した人の参考になれば。</p>

-----
