---
title: "リモートサーバ上のファイルに対してEmacsのblamerを使う方法"
pubDate: 2025-03-16T17:58:39.000Z
description: "Emacsのblamerを使っていて、リモートサーバ上のファイルに対して使おうとすると動かなかった。今回はその原因と解決方法について説明する。"
tags: ["emacs"]
legacyUrl: "/entry/2025/03/17/025839"
---

<p>Emacsの<a href="https://github.com/Artawower/blamer.el">blamer</a>を使っていて、リモートサーバ上のファイルに対して使おうとすると動かなかった。今回はその原因と解決方法について説明する。</p>

<h1 id="原因">原因</h1>

<p>問題は2つあった：</p>

<ul>
<li><code>async-start</code>が非同期プロセスで実行される際、default-directoryがリモートディレクトリの場合でもローカルで実行されてしまう</li>
<li>blamerがリモートファイルをローカルファイルに変換しようとする必要のない処理を行っている</li>
</ul>


<p>ちなみに動作環境としては、homebrewで入れたEmacs 30.1をmac OS 15.3.2で走らせている。</p>

<h2 id="解決方法">解決方法</h2>

<p>以下の2つの関数を修正することで解決できる：</p>



```lisp
(defun blamer--async-start (start-func finish-func)
  "Optional wrapper over 'async-start function.

Needed for toggling async execution for better debug.
START-FUNC - function to start
FINISH-FUNC - callback which will be printed after main function finished"
  (let ((async-prompt-for-password nil))
    (ignore async-prompt-for-password)
    (if blamer-enable-async-execution-p
        ;; サブプロセスでdefault-directoryを一時的に変更
        (async-start `(lambda()
                       (let ((default-directory ,default-directory))
                         (funcall ,start-func))) finish-func)
      (if finish-func
          (funcall finish-func (funcall start-func))
        (funcall start-func)))))

;; リモートファイルをそのまま扱えるようにする
(defun blamer--get-local-name (filename)
  filename)
```




<h1 id="解説">解説</h1>

<p>この修正には以下の2つのポイントがある：</p>

<ul>
<li><code>async-start</code>で実行される関数内で、<code>let</code>を使って<code>default-directory</code>を親プロセスと同じ値に設定する。これにより、リモートディレクトリでの実行が可能になる。以前の記事では <code>cd</code>で作業ディレクトリを変更していたが、ファイルがremoteにある場合は動かない。また、今回の変更はmacのEmacs.appでもちゃんと動く。</li>
<li><code>blamer--get-local-name</code>をオーバーライドして、ファイル名をそのまま返すようにする。基の実装では、<code>/ssh:</code> のようなremoteファイルを示すprefixがついていると消してしまう。しかし、blamer内部で使っている <code>vc-git—*</code>などの関数はリモートファイルをそのまま扱える。なので、わざわざローカルファイルの名前に変更する必要はない。</li>
</ul>


<h1 id="結論">結論</h1>

<p><code>blamer--async-start</code>と<code>blamer—get-local-name</code> の修正により、リモートサーバ上のファイルに対してもblamerが正常に動作するようになる。ただ、tramp経由ではやはりちょっとパフォーマンスはいまいち。</p>

-----
