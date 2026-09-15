---
title: "Weekly #0 · 本期标题"
date: {{ .Date }}
lastmod: {{ .Date }}
summary: "用一句话概括这一周的主要内容。"
issue: 0
interval: "YYYY.MM.DD–MM.DD"
draft: true
authors:
  - admin
tags:
  - Weekly
cover_alt: "封面图片内容"
cover_caption: "封面图片说明"
---

<!--
Weekly 模板约定：

1. 每一期使用 content/weekly/<issue>/index.md 页面资源包。
2. 将首页和文章顶部使用的图片命名为 cover.jpg、cover.jpeg 或 cover.png。
   模板会自动生成 800×480 的列表封面和 1320×702 的文章封面。
3. 正文照片必须使用 weekly-photo shortcode，默认自动裁剪为 1000×667（3:2）。
4. 工具截图或宽屏图片增加 variant="wide"，自动裁剪为 1200×675（16:9）。
5. 图片主体偏离中央时可增加 anchor="Top"、"Bottom"、"Left" 或 "Right"。
6. interval 始终填写该期覆盖的周一至周日，例如 2026.09.07–09.13。
7. 如果封面图片还要出现在正文，请保留一份语义清晰的文件名并在正文引用。
8. 来自外部网站的图片必须填写 credit 和 credit_url。

创建方式：hugo new --kind weekly weekly/<issue>/index.md
完成内容和图片后，将 draft 改为 false。
-->

## 写在前面

用一小段话概括这一周，并自然引出下面要记录的内容。

## 本周记录

### 1. 第一件事

{{ printf "{{< weekly-photo src=\"photo-1.jpg\" alt=\"图片内容\" caption=\"图片说明\" >}}" }}

记录事情本身，以及为什么值得留下。

### 2. 第二件事

{{ printf "{{< weekly-photo src=\"photo-2.jpg\" alt=\"图片内容\" caption=\"图片说明\" anchor=\"Center\" >}}" }}

保持段落简洁，避免重复图片已经表达的信息。

## 本周工具：工具名称

{{ printf "{{< weekly-photo src=\"tool.jpg\" alt=\"工具界面\" caption=\"工具名称\" credit=\"官方网站\" credit_url=\"https://example.com/\" variant=\"wide\" >}}" }}

用一段话说明工具是什么、适合解决什么问题。

- **核心能力。** 简要说明。
- **使用感受。** 简要说明。
- **适合谁。** 简要说明。
