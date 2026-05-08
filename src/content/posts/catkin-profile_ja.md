---
title: "catkin profileが便利"
pubDate: 2020-08-23T08:18:48.000Z
description: "catkin tools (catkinコマンド)を用いてソースコードをビルドする時に、ビルドオプションを変更したいことがあります。 たとえば、RelaseビルドとDebugビルドを切り替えたいときです。"
tags: ["ros", "Programming"]
legacyUrl: "/entry/2020/08/23/171848"
---

<p>catkin tools (catkinコマンド)を用いてソースコードをビルドする時に、ビルドオプションを変更したいことがあります。
たとえば、RelaseビルドとDebugビルドを切り替えたいときです。</p>

<p>このようなビルドオプションの切り替えには、catkin profileの機能が便利です。</p>

<p>catkin profileは異なるビルドオプションなど<code>catkin config</code>の設定を保存することができます。</p>

<p>下のコマンドでは、<code>RelWithDebInfo</code>と<code>Debug</code>というprofileに、それぞれのcmakeのオプションを設定しています。</p>

<pre class="code shell" data-lang="shell" data-unlink>catkin config --profile RelWithDebInfo --cmake-args -DCMAKE_CXX_COMPILER_LAUNCHER=ccache -DCMAKE_CC_COMPILER_LAUNCHER=ccache -DCMAKE_EXPORT_COMPILE_COMMANDS=ON -DCMAKE_BUILD_TYPE=RelWithDebInfo
catkin config --profile Debug --cmake-args -DCMAKE_CXX_COMPILER_LAUNCHER=ccache -DCMAKE_CC_COMPILER_LAUNCHER=ccache -DCMAKE_EXPORT_COMPILE_COMMANDS=ON -DCMAKE_BUILD_TYPE=Debug</pre>


<p>現在のprofileを確認するためには、<code>catkin profile list</code>というコマンドを利用します。</p>

<pre class="code shell" data-lang="shell" data-unlink>$ catkin profile list
[profile] Available profiles:
- default
- Debug
- RelWithDebInfo (active)</pre>


<p><code>catkin config</code>の先頭にも有効なprofileが表示されます。</p>

<pre class="code shell" data-lang="shell" data-unlink>$ catkin config
--------------------------------------------------------------------------------------------------------------------
Profile:                     RelWithDebInfo
Extending:          [cached] /opt/ros/melodic
Workspace:                   /home/garaemon/catkin_ws
(略)
Additional CMake Args:       -DCMAKE_CXX_COMPILER_LAUNCHER=ccache -DCMAKE_CC_COMPILER_LAUNCHER=ccache -DCMAKE_EXPORT_COMPILE_COMMANDS=ON -DCMAKE_BUILD_TYPE=RelWithDebInfo
(略)</pre>


<p>profileを切り替えるには、<code>catkin profile set</code>というコマンドを利用します。</p>

<pre class="code shell" data-lang="shell" data-unlink>$ catkin profile set RelWithDebInfo
[profile] Activated catkin metadata profile: RelWithDebInfo
[profile] Available profiles:
- default
- Debug
- RelWithDebInfo (active)</pre>


-----
