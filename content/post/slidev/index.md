---
title: Slidev + Netlify
subtitle: 使用slidev做ppt
date: 2023-05-16T00:00:00Z
summary: slidev的一些notes
draft: false
featured: false
authors:
  - admin
lastmod: 2023-05-16T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - Slidev
  - PPT
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false

---

Slidev (slide + dev, **/slʌɪdɪv/**) is a web-based slides maker and presenter. It's designed for developers to focus on writing content in Markdown while also having the power of HTML and Vue components to deliver pixel-perfect layouts and designs with embedded interactive demos in your presentations.

## 基础操作

### 初始化slidev仓库

```shell
npm init slidev
```

### 浏览器显示已有仓库

进入目录，然后运行以下命令

```
npx slidev
```

### 导出pdf

```
npx slidev export --output filename
```

### 快捷键

| Shortcuts     | Button | Description                                                  |
| :------------ | :----- | :----------------------------------------------------------- |
| f             |        | toggle fullscreen                                            |
| right / space |        | next animation or slide                                      |
| left          |        | previous animation or slide                                  |
| up            | -      | previous slide                                               |
| down          | -      | next slide                                                   |
| o             |        | toggle [slides overview](https://sli.dev/guide/navigation.html#slides-overview) |
| d             |        | toggle dark mode                                             |
| g             | -      | show goto...                                                 |

### 图像的放置

For local assets, put them into the [`public` folder](https://sli.dev/custom/directory-structure.html#public) and reference them with **leading slash**.

```
![Local Image](/pic.png)
```

For you want to apply custom sizes or styles, you can convert them to the `<img>` tag

```
<img src="/pic.png" class="m-40 h-40 rounded shadow" />
```

请按照以上要求进行放置，不然build和导出pdf的时候可能会出现问题。

## Netlify部署

1. 运行命令：

   ```
   npx slidev build
   ```

   会生成静态文件在dist目录下。

2. 在项目根目录下创建`netlify.toml` ，输入以下内容

   ```
   [build.environment]
     NODE_VERSION = "14"
   
   [build]
     publish = "dist"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. 进入netlify官网，点击创建新的site，manually deploy。选中dist文件，将dist文件夹下的文件进行上传。



参考文档：https://sli.dev/guide/hosting.html#examples