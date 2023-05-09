---
title: Kconfig Makefile menuconfig探索
subtitle: Makefile
date: 2023-05-09T00:00:00Z
summary: Linux中Make机制构建简单探索
draft: false
featured: false
authors:
  - admin
lastmod: 2023-05-09T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - Makefile
  - Linux
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

# Kconfig Makefile menuconfig

Linux内核Build system主要有以下四个组件：

- Config symbols：一些可以用来在源文件中条件编译代码和在kernel image中是否包含module的compilation options。通常由两种符号，boolean和tristate。Boolean符号接收两种值：true或者false。Tristate 变量包含三种：yes、no或者module。并不是内核内所有的东西都可以配置成模块，因为他们非常的intrusive，比如SMP或者kernel preemption。
- Kconfig files: **define** each con fig symbol and its attributes, such as its type, description and dependencies. Programs that generate an option menu tree (for example, **`make menuconfig`**) read the menu entries from these files.`menuconfig`的使用方式通常是在编译系统之前在系统源代码根目录下执行`make menuconfig`命令从而打开一个图形化配置界面，再通过对各项的值按需配置从而达到影响系统编译结果的目的。`menuconfig`通常会读取Kconfig文件配置后的结果将会保存在对应模块根目录下的 .config 文件中。在编译时会加载.config文件中的配置项来决定编译结果。每条选项的前面可以看到[ ]、< >、（ ）三种表示方式[ ] 有两种状态，*代表选中，没有*代表未选中；选中的意思是对应的选项功能会被编译进内核镜像文件中；< > 有三种状态，*代表选中，没有*代表未选中，M代表模块；( ) 存放十进制或十六进制或字符串；
- .config file: stores each config symbol's selected value. You can edit this file manually or use one of the many **`make`** configuration targets, such as menuconfig and xconfig, that call specialized programs to build a tree-like menu and automatically update (and create) the .config file for you.
- Makefiles: normal GNU makefiles that describe the relationship between source files and the commands needed to generate each make target, such as kernel images and modules.

因此编译流程通常如下：

1. 编写C语言，其中包含一些条件宏控制一些代码。
2. make menuconfig勾选一些配置，保存在.config文件中。
3. conf程序读取.config文件加载这些宏，写入头文件中，通常是/include/generated/autoconf.h控制代码的开关
4. Makefile进行编译

参考：

1. https://dl.acm.org/doi/fullHtml/10.5555/2392896.2392897
2. https://docs.kernel.org/kbuild/makefiles.html
3. https://blog.csdn.net/weixin_41182157/article/details/83312861

