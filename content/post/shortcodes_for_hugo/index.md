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

类似于通过提前编写一些组件，然后就可以在Markdown中快捷地使用这些命令了。shortcodes不同于Partial template（Hugo的另一个功能，我博客的评论系统和toc都是根据此搞得），并不会直接生效，而是需要我们显示的调用，如`{{%/* shortcodename arguments */%}}`或`{{</* shortcodename arguments */>}}`，

{{< highlight go-html-template >}}

这两者还是略有区别的，但在我们这个例子没什么区别。

{{</ highlight >}}

## 实现two-columns

1. 将HTML的template放到`layouts/shortcodes`目录下，文件名字为我们后面使用的shortcodename。template如下，我命名为`two-colums.html`。

   ```html
   <div class="two-columns-container">
     <div class="column column-left">
       {{ with .Inner }} 
       {{ $parts := split . "###" }} 
       {{ if ge (len $parts) 1 }}
         {{ $left := index $parts 0 }} 
         {{ $left | $.Page.RenderString }} 
       {{ end }} 
       {{ end }}
     </div>
     <div class="column column-right">
       {{ with .Inner }} 
       {{ $parts := split . "###" }} 
       {{ if ge (len $parts) 2 }}
         {{ $right := index $parts 1 }} 
         {{ $right | $.Page.RenderString }} 
       {{ end }}
       {{ end }}
     </div>
   </div>
   ```

2. 如果存在scss文件，需要放在```assets\scss```中，我是直接放在了custon.scss文件中。scss文件内容如下

   ```scss
   .two-columns-container {
     display: flex;
     gap: 10px; /* 调整列之间的间距 */
     margin: 20px 0; /* 添加上下外边距以与其他内容区分 */
   }
   
   .column {
     flex: 1; /* 每列占据相等的空间 */
     padding: 10px; /* 内边距 */
     background-color: transparent; /* 透明背景 */
     border: 1px solid rgba(255, 255, 255, 0.6); /* 半透明边框 */
     border-radius: 8px;
     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
   }
   
   /* 添加适配小屏幕的响应式设计 */
   @media (max-width: 768px) {
     .two-columns-container {
       flex-direction: column;
     }
   }
   ```

3. 在markdown文件中使用命令来查看效果。

示例：

```
{{</* two-columns */>}}

​```cpp
status_t SurfaceFlinger::createEffectLayer(const LayerCreationArgs& args, sp<IBinder>* handle,
                                           sp<Layer>* outLayer) {
    *outLayer = getFactory().createEffectLayer(args);
    *handle = (*outLayer)->getHandle();
    return NO_ERROR;
}
​```

<--->

Hello test

{{</* /two-columns */>}}
```

效果如下：

{{< two-columns >}}

```cpp
status_t SurfaceFlinger::createEffectLayer(const LayerCreationArgs& args, sp<IBinder>* handle,
                                           sp<Layer>* outLayer) {
    *outLayer = getFactory().createEffectLayer(args);
    *handle = (*outLayer)->getHandle();
    return NO_ERROR;
}
```

<--->

Hello test

{{< /two-columns >}}

## 参考

[1] [Shortcodes](https://gohugo.io/content-management/shortcodes/#figure)
[2] [Hugo Book - Columns](https://hugo-book-demo.netlify.app/docs/shortcodes/columns/)