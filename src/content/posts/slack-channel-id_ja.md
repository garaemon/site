---
title: "slackのchannnel idを名前に変換する"
pubDate: 2018-05-04T01:00:00.000Z
description: "slackのメッセージにはchannelのidが入っているが、名前にはなっていない."
tags: ["Programming", "typescript", "slack"]
legacyUrl: "/entry/2018/05/04/100000"
---

<p>slackのメッセージにはchannelのidが入っているが、名前にはなっていない.</p>

<p>名前に変換するには<a href="https://api.slack.com/methods/channels.info"><code>channels.info</code></a>を使う必要がありそう.</p>

<p>以下はtypescriptを利用したサンプル.<br/>
ライブラリには
<a href="https://github.com/slackapi/node-slack-sdk">slack-node-sdk</a>を利用</p>



```typescript
import { WebClient, WebAPICallResult, RTMClient } from '@slack/client';
const web = new WebClient(token);
const rtm = new RTMClient(token);

interface ChannelInfoResponse extends WebAPICallResult {
  channel: {
    id: string;
    name: string;
    // rest fields are omitted
  };
}

interface EventMessage {
  subtype?: string;
  type: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
}

rtm.on('message', async (message: EventMessage) => {
  const channelId = message.channel;
  const info = (await web.channels.info({
    channel: channelId,
  })) as ChannelInfoResponse;
  const name = info.channel.name;
  console.log(`channel name is ${name}`);
});
```




-----
