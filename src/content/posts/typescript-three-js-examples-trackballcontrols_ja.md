---
title: "typescriptでthree.jsのexamplesにあるTrackballControlsなどを使う"
pubDate: 2018-06-05T15:48:04.000Z
description: "imports-loaderとexports-loaderというパッケージを利用すると良いらしい。"
tags: ["typescript", "three.js"]
legacyUrl: "/entry/2018/06/06/004804"
---

<p><code>imports-loader</code>と<code>exports-loader</code>というパッケージを利用すると良いらしい。</p>



```sh
npm install --save imports-loader exports-loader
```




<p><code>TrackballControls</code>を使うには下のようにする.</p>



```typescript
const THREE = require('three');
THREE.TrackballControls = require('imports-loader?THREE=three!exports-loader?THREE.TrackballControls!../node_modules\/three\/examples\/js\/controls\/TrackballControls');
```




-----
