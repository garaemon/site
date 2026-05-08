---
title: "Macで右クリックからpdf2zhを呼び出せるようにする"
pubDate: 2025-11-16T20:18:56.000Z
description: "pdf2zhは、PDFのレイアウトを保持したまま翻訳を行うソフトウェア。ollamaを含む様々なLLMを翻訳に利用できる。 オリジナルと翻訳済みのページを左右に並べて表示するPDFも生成でき、その有用性は高い。"
tags: ["Mac", "Automator", "pdf2z"]
legacyUrl: "/entry/2025/11/17/051856"
---

<h1 id="pdf2zhをより便利に活用する">pdf2zhをより便利に活用する</h1>

<p><a href="https://github.com/Byaidu/PDFMathTranslate">pdf2zh</a>は、PDFのレイアウトを保持したまま翻訳を行うソフトウェア。ollamaを含む様々なLLMを翻訳に利用できる。
オリジナルと翻訳済みのページを左右に並べて表示するPDFも生成でき、その有用性は高い。</p>

<p><figure class="figure-image figure-image-fotolife" title="Attention is All You Needをpdf2zhとGeminiで翻訳した例"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/mac-pdf2zh/20251117052016.png" width="1200" height="722" loading="lazy" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>Attention is All You Needをpdf2zhとGeminiで翻訳した例</figcaption></figure></p>

<p>Terminalからの実行はちょっと手間なので、右クリックメニューから呼び出せるよう設定する。</p>

<h1 id="Automatorを利用して右クリックから呼び出す">Automatorを利用して右クリックから呼び出す</h1>

<p>MacのAutomatorを使えば、シェルスクリプトを右クリックメニューから簡単に実行可能。</p>

<p><figure class="figure-image figure-image-fotolife" title="右クリックからpdf2zhを利用したQuick Actionを呼び出す様子"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/mac-pdf2zh/20251117052100.png" width="1200" height="927" loading="lazy" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>右クリックからpdf2zhを利用したQuick Actionを呼び出す様子</figcaption></figure></p>

<p><figure class="figure-image figure-image-fotolife" title="Automatorでpdf2zhを呼び出すQuick Actionを作成している様子"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/mac-pdf2zh/20251117052133.png" width="1131" height="1200" loading="lazy" title="" class="hatena-fotolife" itemprop="image"></span><figcaption>Automatorでpdf2zhを呼び出すQuick Actionを作成している様子</figcaption></figure></p>

<p>設定手順は以下の通り。</p>

<ol>
<li><p>Automatorで「クイックアクション」を新規作成。</p></li>
<li><p>"Workflow receives current"を「PDFファイル」に指定し、「アプリケーション」を「Finder」に設定。</p></li>
<li><p>左メニューから「シェルスクリプトを実行」を選択。</p></li>
<li><p>右上の"Pass input"で"as arguments"を選択。</p></li>
<li><p>シェルスクリプトを記述。以下はGeminiとGemma3をOllamaで使用する例。</p>



```shell
#!/bin/zsh

PDF2ZH_PATH="$HOME/.local/bin/pdf2zh"

notification(){
  /usr/bin/osascript -e "display notification \"$@\" with title \"pdf2ja-gemini\""
}

if [ -z "$@" ]; then
  notification The arguments are empty
  exit 1
fi

# Load zshrc file which defines GEMINI_API_KEY
if [ -e "$HOME/.zshrc.mine" ]; then
  source $HOME/.zshrc.mine
fi

if ! command -v ${PDF2ZH_PATH} &> /dev/null; then
  notifiaction Error: pdf2zh is not installed
  exit 1
fi

if [ -z "${GEMINI_API_KEY}" ]; then
  notification Error: GEMINI_API_KEY is empty
  exit 1
fi


for f in "$@"
do
  notification "Translating: $f"

  "$PDF2ZH_PATH" -lo ja -li en -s gemini:gemini-2.5-flash "$f" --output $(dirname "$f") >>/tmp/pdf2zh.log 2>&1
  if [ "$?" != "0" ]; then
    notification "Failed to convert $f"
    exit 1
  fi
  notification "Done: $f"
done
```



<p>ollamaを使うならこんな感じ。</p>



```shell
#!/bin/zsh

PDF2ZH_PATH="$HOME/.local/bin/pdf2zh"
OLLAMA_MODEL="gemma3:4b"
args="$@"

notification(){
  /usr/bin/osascript -e "display notification \"$@\" with title \"pdf2ja-gemma3\""
}

if [ -z "$@" ]; then
  notification The arguments are empty
  exit 1
fi

if ! command -v ${PDF2ZH_PATH} &> /dev/null; then
  notification Error: pdf2zh is not installed
  exit 1
fi

if ! command -v ollama &> /dev/null; then
  notification Error: ollama is not installed. Please install ollama from ollama.com
  return 1
fi

# Check if ollama is running
if ! ollama ps &> /dev/null; then
  notification "Error: ollama server is not running. Please start ollama."
  return 1
fi

for f in "$args"
do
  notification "Translating: $f"

  "$PDF2ZH_PATH" -lo ja -li en -s ollama:"$OLLAMA_MODEL" --output $(dirname "$f") "$f" >>/tmp/pdf2zh.log 2>&1
  if [ "$?" != "0" ]; then
    notification "Failed to convert $f"
    exit 1
  fi
  notification "Done: $f"
done
```

</li>
</ol>


-----
