---
title: "はてなブログからAstroに移行した"
pubDate: 2026-05-10T21:31:47.410Z
draft: false
tags: [astro, hatena, cloudflare]
---

# 背景

今までは[はてなブログ](https://garaemon.hatenadiary.jp/)を使ってブログを管理していた。
はてなブログは広告をなくすためには月1000円くらいの有料プランにする必要があった(支払額は契約期間で変化する。)
しかし，ほとんど更新しないのに月1000円近く払うのはいかがなものかと思ったので，
この度[Astro](https://astro.build/)で静的サイトとして再構築することにした。

# アプローチ

まず，全体はシンプルなAstroのサイトとして構築する。
各記事はMarkdownで記述する。
ソースコードは[GitHub](https://github.com/garaemon/site)でホスティングし，
デプロイ先としてCloudflare Workersを利用することにした。

# はてなブログからの移行に関して

はてなブログはMovableType形式でバックアップを作ることができる。これをMarkdownに変換してAstro上で扱うようにする。
画像とかはスクリプトを作ってバックアップ内に書かれているURLから別途ダウンロードするようにする。

## 日付ベースのURLからslugへ

URLも変えることにした。
はてなのURLは `/entry/YYYY/MM/DD/HHMMSS` となっている。この移行のタイミングで `/posts/<slug>` にすることとした。
この変更に伴って，元のURLからredirectするために， `_redirects` というファイルを作ってリダイレクトするようにした。
`_redirects`は[Cloudflare Workersの機能](https://developers.cloudflare.com/workers/static-assets/redirects/)。
`_redirects`の生成は[build-redirects.ts](https://github.com/garaemon/site/blob/main/scripts/build-redirects.ts)というスクリプトを使った。

# 実装

便利になったもので，claude codeにお願いしたらかなりの部分をやってくれた。

こちらからの指示としては以下のようなもの。

- [bearblog.dev](https://bearblog.dev/)みたいなシンプルな構成にすること
- 背景色はベージュ
- CSSは全部指定していたので，[tailwind](https://tailwindcss.com/)を使うこと
- RSSとtagをサポートすること

## はてなブログからの移行スクリプト

はてなブログからの移行スクリプトは[scripts](https://github.com/garaemon/site/tree/main/scripts)以下においてある。他のブログでも機能するはず。

# 移行してみて

Astroのおかげなのか，Cloudflare Workersのおかげなのかは判断が難しいけれども，最終的なパフォーマンスには満足している。
特に計測はしていないが，十分に高速だと感じる。

うまくいかなかった点はclaude codeにデザインをよくするようにというぼんやりした指示を与えたら，mobile向けの表示が
崩れてしまった点だ。なので，tailwindを必ず使うように支持するのが良く効いた。

# その他

このタイミングでドメインのホストもSquarespaceからcloudflareに移した。
手順は[こちらのブログ](https://wakaapps.com/posts/dxpa-eex4)を参考にした。

# 今後

デザインはもう少し手を加えたい。例えば箇条書きの表示とかは調整しないといけないなと思っている。
英語版の記事の生成とかは自動化したいなと思ってる。
