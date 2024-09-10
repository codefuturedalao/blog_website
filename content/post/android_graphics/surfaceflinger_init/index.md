---
title: SurfaceFlinger启动
subtitle: SurfaceFlinger
date: 2024-09-10T00:00:00Z
summary: android graphics
draft: false
featured: false
authors:
  - admin
lastmod: 2024-09-10T00:00:00Z
tags:
  - android 
  - graphics
categories:
  - android
  - graphics
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---



SurfaceFlinger代码目录在`frameworks/native/services/surfaceflinger/`。

{{< two-columns >}}

```rc
// frameworks/native/services/surfaceflinger/surfaceflinger.rc

service surfaceflinger /system/bin/surfaceflinger
    class core animation
    user system
    group graphics drmrpc readproc
    capabilities SYS_NICE
    onrestart restart --only-if-running zygote
    task_profiles HighPerformance
```

<--->



{{< /two-columns >}}



