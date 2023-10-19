---
title: Use faddr2line on android
subtitle: android使用faddr2line
date: 2023-10-19T00:00:00Z
summary: android debug
draft: false
featured: false
authors:
  - admin
lastmod: 2023-10-19T00:00:00Z
tags:
  - android 
  - debug
  - Linux
categories:
  - android 
  - debug
  - Linux
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

当我们在用systrace分析系统情况时，会发现线程出现一些红色或者黄的情况，如果开了`sched_blocked_reason`追踪的话是可以获得阻塞的具体位置，如下图。

![image-20231019095512846](./img/uninter_sleep)

关于0x53c和0x5ec的含义：https://stackoverflow.com/questions/10171984/how-to-make-good-use-of-stack-trace-from-kernel-or-core-dump。53c是偏移地址，0x5ec是函数的大小。

但是如果进一步分析do_page_fault+0x53c/0x5ec是源文件的哪一行，则需要`faddr2line`工具。该工具实际上是一个脚本，通过使用`readelf`、`awk`和`addr2line`来定位函数。

由于之前我编译过源代码，所以我的`vmlinux`和`faddr2line`都可以找到，我也尝试通过在android上寻找boot.img来提取vmlinux的方法，但是没成功，所以就不在这里叙述了。

* 我的vmlinux路径:`out/android-msm-pixel-4.9/private/msm-google/vmlinux`

* 我的faddr2line路径:`private/msm-google/scripts/faddr2line`

由于我之前装bcc的时候是将一个debian环境“安装”在了手机上，因此上面已经有了这三个工具，原生的adb shell中貌似没有`addr2line`。

1. push两个文件到手机中
2. 执行命令`faddr2line vmlinux do_page_fault+0x53c/0x5ec`

