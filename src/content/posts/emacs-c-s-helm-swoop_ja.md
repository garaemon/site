---
title: "emacsのC-sをhelm-swoopで置き換える"
pubDate: 2018-04-13T17:45:19.000Z
description: "最近emacsの検索のキーバインドであるC-sをhelm-swoopに置き換えてみている."
tags: ["Programming", "emacs"]
legacyUrl: "/entry/2018/04/14/024519"
---

<p>最近emacsの検索のキーバインドである<code>C-s</code>を<a href="https://github.com/ShingoFukuyama/helm-swoop">helm-swoop</a>に置き換えてみている.</p>

<p>helm-swoopに関する説明はこちらが詳しい</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=http%3A%2F%2Femacs.rubikitch.com%2Fhelm-swoop%2F" title="helm-swoop.el : 【これはすごい】バッファ全体をMigemo絞り込み検索して走り回れ！Emacs Advent Calendar 2014" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="http://emacs.rubikitch.com/helm-swoop/">emacs.rubikitch.com</a></cite></p>

<p><code>C-s</code>のたびにバッファがかちゃかちゃしてうるさい気もするけど、使いこなせれば作業効率が上がりそうな気がする.</p>

<p>僕が使っている設定は以下のような感じ.</p>



```lisp
(global-set-key (kbd "C-s") 'helm-swoop)
(define-key helm-swoop-map (kbd "C-r") 'helm-previous-line)
(define-key helm-swoop-map (kbd "C-s") 'helm-next-line)
(define-key helm-multi-swoop-map (kbd "C-r") 'helm-previous-line)
(define-key helm-multi-swoop-map (kbd "C-s") 'helm-next-line)
;; Disable pre-input for helm-swoop
(setq helm-swoop-pre-input-function (lambda () nil))
```




-----
