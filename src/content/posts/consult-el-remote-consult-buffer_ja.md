---
title: "consult.elでremoteで走る外部プロセスをconsult-bufferに加える"
pubDate: 2025-03-29T23:34:10.000Z
description: "consult.elのconsult-bufferはいろんな情報源に対して絞り込み検索でアクセスできるので重宝している。 anything時代から絞り込み検索は素晴らしい。"
tags: ["emacs", "Programming", "ros"]
legacyUrl: "/entry/2025/03/30/083410"
---

<p><a href="https://github.com/minad/consult">consult.el</a>の<code>consult-buffer</code>はいろんな情報源に対して絞り込み検索でアクセスできるので重宝している。
anything時代から絞り込み検索は素晴らしい。</p>

<p>Emacsの<code>consult-buffer</code>に独自のソースを追加しようとした際に、非同期プロセス処理とリモートファイル操作に関して情報があまり見つからなかったので、今回はその解決方法について説明する。</p>

<h2 id="発生した問題点">発生した問題点</h2>

<h3 id="1-非同期ソースの実装">1. 非同期ソースの実装</h3>

<p>Consultの非同期ソースの実装例を見つけるのに苦労した。最終的に、<a href="https://github.com/minad/consult#creating-asynchronous-completion-commands">Consultのドキュメントにある「Hacking」の章</a>を参考に、以下のような実装にたどり着いた：</p>



```lisp
(defun my-consult-async-process (program process-function &rest program-args)
  "Create a consult dynamic collection by running PROGRAM asynchronously.

PROGRAM is the executable file path (can be local or remote via Tramp).
PROCESS-FUNCTION processes the raw output into candidate strings.
PROGRAM-ARGS are passed to the program."
  (lexical-let ((local-program (if (file-remote-p program)
                                   (tramp-file-name-localname 
                                    (tramp-dissect-file-name program))
                                 program))
                (program program)
                (program-args program-args)
                (process-function process-function))
    (consult--dynamic-collection
     (lambda (input callback)
       (with-temp-buffer
         (let ((default-directory (or (file-remote-p program) 
                                     default-directory)))
           (apply #'process-file local-program nil (current-buffer) nil 
                  program-args)
           (let* ((program-output (buffer-string))
                  (items (funcall process-function program-output))
                  (filtered-items 
                   (cl-remove-if-not 
                    (lambda (path) (string-match-p input path))
                    items)))
             (funcall callback filtered-items))))))))
```




<h3 id="2-リモートプロセスの実行">2. リモートプロセスの実行</h3>

<p>最初は <code>start-file-process</code> と sentinel を使ってリモートプロセスを実装しようとしたが、Consultのcallbackとタイミングの問題が発生した。結局、<code>process-file</code> を使って同期的に外部プロセスを呼び出す方法に切り替えた：</p>



```lisp
(let ((default-directory (or (file-remote-p program) default-directory)))
  (apply #'process-file local-program nil (current-buffer) nil program-args))
```




<h3 id="3-カスタムフィルタリングの実装">3. カスタムフィルタリングの実装</h3>

<p>Consultの標準的なフィルタリング機能が非同期ソースでうまく動作しなかったため、非同期プロセスハンドラ内でフィルタリングを実装することにした：</p>



```lisp
(filtered-items (cl-remove-if-not 
                 (lambda (path) (string-match-p input path))
                 items))
```




<h2 id="カスタムソースの作成方法">カスタムソースの作成方法</h2>

<p>以下のように、非同期プロセスハンドラを使用したカスタムソースを作成できる：</p>



```lisp
(defvar my-async-source
  (list :async
        (consult--async-pipeline
         (consult--async-min-input)
         (consult--async-throttle)
         (my-consult-async-process my-program
                                  #'my-process-function
                                  "arg1" "arg2")
         (consult--async-highlight))
        :name "Custom Source"
        :category 'my-category
        :require-match t
        :sort t
        :lookup #'consult--lookup-member
        :state #'consult--file-state))
```




<h2 id="具体的な使用例ROSパッケージの一覧表示">具体的な使用例：ROSパッケージの一覧表示</h2>

<p>例えば、リモートサーバー上のROSパッケージを一覧表示するソースを以下のように実装できる：</p>



```lisp
(defun my-process-rospack-list (env-sh program-output)
  "Process PROGRAM-OUTPUT from a 'rospack list'-like command.
ENV-SH is used to determine if the context is remote."
  (let* ((rospackage-paths
          (mapcar #'(lambda (rospack-line)
                      (cadr (string-split rospack-line " ")))
                  (split-string program-output "\n" t)))
         (file-prefix (or (file-remote-p env-sh) ""))
         (full-matched-package-paths
          (mapcar #'(lambda (path) 
                      (concat file-prefix path))
                  rospackage-paths)))
    full-matched-package-paths))

(defvar my-catkin-env-sh "/ssh:remote-host:~/catkin_ws/devel/env.sh")

(defvar my-async-rospackage-source
  (list :async
        (consult--async-pipeline
         (consult--async-min-input)
         (consult--async-throttle)
         (my-consult-async-process 
          my-catkin-env-sh
          #'(lambda (program-output)
              (my-process-rospack-list my-catkin-env-sh program-output))
          "rospack" "list")
         (consult--async-highlight))
        :name "catkin package source"
        :category 'my-category
        :require-match t
        :sort t
        :lookup #'consult--lookup-member
        :state #'consult--file-state))
        
 (setq consult-buffer-sources (append consult-buffer-sources '(my-async-rospackage-source)))
```




<p>この実装により、ローカルとリモートの両方でプロセス実行を扱えるConsultソースを作成できるようになった。</p>

<p>ROSパッケージの例のように、様々な用途に応用可能だといいな。</p>

-----
