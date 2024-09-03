---
title: Shortcodes for Hugo to implement two columns
subtitle: markdown extension
date: 2024-09-03T00:00:00Z
summary: markdown hugo
draft: false
featured: false
authors:
  - admin
lastmod: 2024-09-03T00:00:00Z
tags:
  - markdown 
  - hugo
categories:
  - markdown 
  - hugo
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

最近想做一个Android图形系统源码阅读系列，想要实现代码在左边，代码解释在右边，但是查了很多资料都无法实现这个功能。Markdown本身是不支持这个feature的，如果想要使用嵌入html的flex布局感觉也不是很优雅，因此决定使用hugo的shortcodes来对Markdown进行扩展

## What a shortcode is

> Hugo loves Markdown because of its simple content format, but there are times when Markdown falls short. Often, content authors are forced to add raw HTML (e.g., video `<iframe>`’s) to Markdown content. We think this contradicts the beautiful simplicity of Markdown’s syntax.

类似于通过提前编写一些组件，然后就可以在Markdown中快捷地使用这些命令了。shortcodes不同于Partial template（Hugo的另一个功能，我博客的评论系统和toc都是根据此搞得），并不会直接生效，而是需要我们显示的调用，如`{{% shortcodename arguments %}}`或`{{< shortcodename arguments >}}`，

{{< highlight go-html-template >}}

这两者还是略有区别的，但在我们这个例子没什么区别。

{{</ highlight >}}

## 实现two-columns

1. 将HTML的template放到`layouts/shortcodes`目录下，文件名字为我们后面使用的shortcodename。
2. 如果存在scss文件，需要放在```assets\scss```中，我是直接放在了custon.scss文件中
3. 在markdown文件中使用命令来查看效果。

示例：

```
{{< two-columns >}}

​```cpp
int test();
​```

###

Hello test

{{< /two-columns >}}
```

效果如下：

{{< two-columns >}}

```cpp
int test();
```

###

Hello test

{{< /two-columns >}}