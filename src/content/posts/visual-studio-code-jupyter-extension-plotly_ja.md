---
title: "Visual Studio CodeのJupyter extensionからPlotlyを使う"
pubDate: 2017-12-25T03:19:16.000Z
description: "Visual Studio CodeのJupyter extensionをすごく便利なのだが、そのままだとPlotlyを利用することができない."
legacyUrl: "/entry/2017/12/25/121916"
---

<p><a href="https://www.microsoft.com/ja-jp/dev/products/code-vs.aspx">Visual Studio Code</a>の<a href="https://marketplace.visualstudio.com/items?itemName=donjayamanne.jupyter">Jupyter extension</a>をすごく便利なのだが、そのままだと<a href="https://plot.ly/python/">Plotly</a>を利用することができない.</p>

<p>これは<a href="http://requirejs.org/">Require.js</a>が読み込まれていないからなので、以下のように読み込ませてあげると良い.</p>



```python
from IPython.display import HTML
html_code = '''
<script src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.3.5/require.min.js"></script>
'''
HTML(html_code)
```




<p>実行例
<figure class="figure-image figure-image-fotolife" title="plotly on vscode jupyter"><span itemscope itemtype="http://schema.org/Photograph"><img src="/images/posts/visual-studio-code-jupyter-extension-plotly/20171225121545.gif" alt="plotly on vscode jupyter" title="f:id:garaemon1:20171225121545g:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>plotly on vscode jupyter</figcaption></figure></p>

<p>コードは<a href="https://plot.ly/python/3d-scatter-plots/">plotlyのexample</a>を参考にした.</p>

<p>ポイントは</p>

<ul>
<li><code>plotly.offline</code>の<code>init_notebook_mode</code>を最初に実行する</li>
<li><code>plotly.offline.iplot</code>を利用する</li>
</ul>




```python
#!/usr/bin/env python

#%%
from IPython.display import HTML
html_code = '''
<script src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.3.5/require.min.js"></script>
'''
HTML(html_code)

#%%
import plotly.graph_objs as go
from plotly.offline import init_notebook_mode, iplot

init_notebook_mode()

import numpy as np

x, y, z = np.random.multivariate_normal(np.array([0,0,0]), np.eye(3), 400).transpose()

trace1 = go.Scatter3d(
    x=x,
    y=y,
    z=z,
    mode='markers',
    marker=dict(
        size=12,
        color=z,                # set color to an array/list of desired values
        colorscale='Viridis',   # choose a colorscale
        opacity=0.8
    )
)

data = [trace1]
layout = go.Layout(
    margin=dict(
        l=0,
        r=0,
        b=0,
        t=0
    )
)
fig = go.Figure(data=data, layout=layout)
iplot(fig)
```




-----
