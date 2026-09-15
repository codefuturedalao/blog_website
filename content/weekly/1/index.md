---
title: "Weekly #1 · 回武汉吃饭"
date: 2026-09-13T23:59:00+08:00
lastmod: 2026-09-13T23:59:00+08:00
summary: "回武汉的一周：四顿惦记很久的饭，以及一个统一管理 AI coding sessions 的工具 Relai。"
issue: 1
interval: "2026.09.07–09.13"
draft: false
authors:
  - admin
tags:
  - Weekly
  - Wuhan
  - Food
  - Tools
cover_alt: "绿洲的牛脸颊拌饭"
cover_caption: "绿洲 · 牛脸颊拌饭"
---

## 写在前面

上周回了一趟武汉。比起列一张行程单，这一期更想记录几顿饭：有自己惦记的味道，也有和师兄弟们重新坐到一张桌前的时间。吃饭之外，本周还发现了一个很适合重度使用 AI coding agents 的工具——Relai。

## 回武汉吃饭

### 1. 春田小米豆乳火锅

{{< weekly-photo src="chuntian-soy-milk-hotpot.jpeg" alt="春田小米豆乳火锅" caption="春田小米豆乳火锅" >}}

回武汉后的第一顿是春田小米豆乳火锅。豆乳锅底看起来很温和，肉卷、菌菇和玉米慢慢下锅，适合一边吃、一边把最近发生的事聊完。热气升起来时，也有了真正“回来了”的感觉。

### 2. 和师兄弟一起吃东北菜

{{< weekly-photo src="dongbei-dinner.jpeg" alt="和师兄弟一起吃的东北菜" caption="和师兄弟们一起吃东北菜" >}}

这一顿的重点其实不只是菜，而是又和师兄弟们围坐在一起。许久没见的人，只要重新坐上同一张饭桌，话题很快就能从近况聊回以前。分量扎实的东北菜，也很适合这样热闹的一桌人。

### 3. 绿洲的牛脸颊拌饭

{{< weekly-photo src="oasis-beef-cheek-rice.jpeg" alt="绿洲的牛脸颊拌饭" caption="绿洲 · 牛脸颊拌饭" >}}

绿洲的牛脸颊拌饭是这一周里很有记忆点的一份主食。把温泉蛋拌开之后，米饭、牛脸颊和配菜连在一起，味道和口感都变得更完整。它不是特别张扬的一道菜，却很适合慢慢吃完。

### 4. 香钿楚菜

{{< weekly-photo src="xiangdian-hubei-cuisine.jpeg" alt="香钿楚菜" caption="香钿楚菜" >}}

最后还是回到熟悉的楚菜。鲜、辣、下饭，几道菜摆在一起就很有武汉的气质。离开一段时间后再回来，会发现想念一座城市时，想念的往往就是这些具体的味道。

## 本周工具：Relai

{{< weekly-photo src="relai-dashboard.jpg" alt="Relai 的 AI coding session dashboard" caption="Relai dashboard" credit="Relai 官方网站" credit_url="https://relai.fyi/" variant="wide" >}}

[Relai](https://relai.fyi/) 是一个本地优先的 AI coding session 管理工具。它会读取电脑里已有的会话记录，把 Claude Code、Codex、Cursor、Gemini、OpenCode、Aider 等不同工具的 sessions 汇总到同一个 dashboard 里。

我觉得它最实用的地方有几个：

- **统一查看。** 不必再回忆某次讨论究竟发生在哪一个 agent 里，可以在一个界面中搜索所有历史会话。
- **继续和交接。** 找到旧 session 后可以直接恢复，或者把上下文交给另一个支持的工具继续处理。
- **看清使用情况。** Token、成本、模型和活跃时间都有统一统计，更容易知道时间和额度花在了哪里。
- **数据留在本地。** 会话解析在本机完成，也可以配合本地 Ollama 生成摘要；需要整理时，再导出到 Obsidian、Notion 等工具。

它目前面向 Apple Silicon Mac。对于同时使用多个 coding agents、又经常需要回看旧对话的人，Relai 很像是散落会话之上的一层索引。工具本身不会替你完成工作，但能显著减少“我之前在哪里讨论过这个问题”的寻找成本。
