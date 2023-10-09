---
title: ebpf on Android (Google pixel 3)
subtitle: android使用ebpf
date: 2023-10-09T00:00:00Z
summary: android ebpf
draft: false
featured: false
authors:
  - admin
lastmod: 2023-10-09T00:00:00Z
tags:
  - android 
  - ebpf
  - Linux
categories:
  - android 
  - ebpf
  - Linux
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

目前Android上使用ebpf的方式大概可以分为以下三种

1. 使用adeb编译

   adeb类似于linux deploy等，利用chroot技术在安卓手机上运行一个Debian虚拟机，可以利用这个环境安装BCC（eBPF的一个工具库）等。这个方法测试可行，但是比较麻烦，还要解决很多依赖问题，体验不是很好。

   1. [eBPF on Android](http://www.caveman.work/2019/01/29/eBPF-on-Android/)
   2. [eBPF on Android之bcc编译与体验](https://blog.seeflower.dev/archives/111/)

2. 完全下载AOSP项目，增加代码后进行编译

   需要根据AOSP的环境编译BPF的测试程序（而不需要编译整个项目），这种方法没特别复杂，只是占用相当多的空间且完全无用，非常不优雅。

   1. [Android-eBPF监控所有系统调用 with Magisk](https://pshocker.github.io/2022/06/18/Android-eBPF%E7%9B%91%E6%8E%A7%E6%89%80%E6%9C%89%E7%B3%BB%E7%BB%9F%E8%B0%83%E7%94%A8/)
   2. [在 Android 中开发 eBPF 程序学习总结（一）](https://paper.seebug.org/2003/)

3. 手动编译

   通过编写Makefile来替换谷歌的Soong编译，目前只找到一篇博客[为 Android 平台编译 eBPF 程序](https://blog.yllhwa.com/2022/06/15/%E4%B8%BAAndroid%E5%B9%B3%E5%8F%B0%E7%BC%96%E8%AF%91eBPF%E7%A8%8B%E5%BA%8F/)，但只能编译bpf的内核态程序，并不能编译用户态来读取map的cli程序，因此不予考虑。

本文主要讲解如何使用第二种方法来在android上实现ebpf的使用。

## 环境

* Google pixel3 with Magisk
  * user版本，所以后续想要向/system文件夹下写文件不能使用`disable-verify`命令，采用magisk方法。
* Arch Linux （任何一个Linux发行版应该都可以）

## KPROBES选项编译

> eBPF 作为内核的一个功能，它的启用需要依赖特定的内核编译配置，如果某个内核没有开启某编译选项，eBPF 可能就用不了；在 Android 内核碎片化的年代，想要搞到能完整支持 eBPF 的设备，那是挺难的；如果想用 eBPF 这个功能，只有自己去改内核代码然后自己编译，然而你会遇到各种设备驱动问题，比如触屏失灵，Wifi 不工作等等等等。。当你好不容易在自己设备上折腾好，想要在别的设备上运行时，哦豁，它不支持 BTF，你的 eBPF 程序跑不了。GKI 通过统一核心内核，把其他功能（如 SoC，ODM 等提供的）从内核剥离并提供稳定接口（KMI），一举解决了碎片化问题。并且，Google 强制要求，Android 12 以上版本的设备，出厂必须使用 GKI 内核。更重要的是，GKI 内核的编译选项，完整支持 eBPF 的几乎所有功能！！也就是说，你拿到一个 GKI 的设备，无需自己编译内核代码，它必然支持 eBPF；你在一个 GKI 设备上编写 的 eBPF 程序，可以轻松地拓展到其他的 GKI 设备！[6]

由于我们使用的Google Pixel3，上面的版本是Android11，所以还是需要苦逼的自己打开一些相关的编译选项。参考博客[Pixel 3 Kernel打开KPROBES编译选项](https://codefuturesql.top/post/android_kernel_recompile/)在编译选项中加上CONFIG_KPROBES选项重新编译kernel，然后临时刷入Google Pixel 3（使用永久刷入会出现一些校验不通过的问题，慎重！），否则后面运行bpf程序会报以下错误：

```
ioctl(PERF_EVENT_IOC_SET_BPF): Bad file descriptor
```

## AOSP环境配置

### 下载repo

```bash
curl https://mirrors.tuna.tsinghua.edu.cn/git/git-repo -o repo
chmod +x repo
```

### 下载源码

```bash
export REPO_URL='https://mirrors.tuna.tsinghua.edu.cn/git/git-repo/'
python3 repo init -u https://aosp.tuna.tsinghua.edu.cn/platform/manifest -b android-11.0.0_r45
repo sync
```

## 编写BPF代码

按照Google官方文档，我们需要三个文件

* Android eBPF C执行程序（内核态执行）

  Bpf程序在Android上有严格的权限控制，在bpfloader.te 中有限制bpf执行的sepolicy，限定了bpfloader是唯一可以加载bpf程序的程序。

* Android eBPF C加载程序（用户态执行），用于激活追踪点

  Bpf程序被加载之后，并没有附着到内核函数上，此时bpf程序不会有任何执行，还需要经过attach操作。attach指定把bpf程序hook到哪个内核监控点上，具体有tracepoint，kprobe等几十种类型。成功attach上的话，bpf程序就转换为内核代码的一个函数。

* Android.bp

三个文件参见目录。

## 编译BPF代码

1. 打开AOSP环境external目录，创建mybpf目录。将bpf_test.c，bpf_cli.cpp和Android.bp移到mybpf目录下。

2. 在 AOSP 环境下，执行以下命令

   ```bash
   # 获取lunch等命令
   source build/envsetup.sh
   # 这里主要是针对整体构建，由于我们只build自己的文件，所以有没有这一步无所谓，以防万一，还是lunch上好。
   lunch aosp_crosshatch-user
   cd external/my_bpf/
   m bpf_test.o
   m bpf_cli.cpp
   ```

## 上传BPF代码

代码均处于`out/target/product/croesshatch/system/bin/`下

1. bpf_cli程序

   直接通过adb push，push到`/data/local/tmp`目录下

2. bpf_test.o程序

   需要上传到`/system/etc/bpf`下，但是由于system是只读的，而且我是用remount也无法重新挂载，于是借助Magisk进行挂载。

   1. 下载Magisk示例模块

      下载zip文件：https://github.com/victor141516/httpcanary-magisk/releases/tag/v1

   2. 解压缩后，更改customize.sh的RPLACE变量为`/system/etc/bpf`

   3. 在模块文件夹下创建文件夹`system/etc/bpf`文件夹，并把`bpf_test.o`放进去，Magisk加载模块后重启会把当前目录下的`bpf_test.o`自动放到系统的`/system/etc/bpf`中

   4. 打包文件为zip，push到手机`/sdcard/Download`，然后打开Magisk刷入该模块。

      zip打包时不要包含顶层目录，直接在模块文件夹下通过`zip -r httpcanary-magisk.zip ./*`命令进行打包

重新启动手机（此时可能会导致之前临时刷入的内核恢复到之前的版本，因此这一步完成之后需要重新刷入dtb文件），发现`/sys/fs/bpf`出现关于bpf_test的map和prog文件。

## 运行bpf_cli程序

```text
$ adb shell /data/bpf_cli
last PID running on CPU 0 is 4371
last PID running on CPU 0 is 4371
last PID running on CPU 0 is 4371
... ....
last PID running on CPU 0 is 4371
last PID running on CPU 0 is 1833
last PID running on CPU 0 is 0
... ...
```

## 参考：

1. [Android S下的eBPF](https://zhuanlan.zhihu.com/p/482266243)

2. [基于AOSP+WSL2+platform-tools搭建安卓开发ebpf环境](http://jiahuan.tech/%E5%9F%BA%E4%BA%8EAOSP+WSL2+platform-tools%E6%90%AD%E5%BB%BA%E5%AE%89%E5%8D%93%E5%BC%80%E5%8F%91ebpf%E7%8E%AF%E5%A2%83.html)

3. [eBPF on Android之TRACEPOINT Hello World](https://blog.seeflower.dev/archives/89/)

4. [为 Android 平台编译 eBPF 程序](https://blog.yllhwa.com/2022/06/15/%E4%B8%BAAndroid%E5%B9%B3%E5%8F%B0%E7%BC%96%E8%AF%91eBPF%E7%A8%8B%E5%BA%8F/)

5. [eBpf在Android上的集成和调试 内核工匠](https://blog.csdn.net/feelabclihu/article/details/130652632)

6. [在 Android 中使用 eBPF：开篇](https://weishu.me/2022/06/12/eBPF-on-Android/)

7. [eBPF on Android之stackplz从0到1](https://blog.seeflower.dev/archives/176/)

   包含了作者的ebpf经验和总结

## 附录

bpf_test.c

```c
#include <linux/bpf.h>
#include <stdbool.h>
#include <stdint.h>
#include <bpf_helpers.h>

DEFINE_BPF_MAP(cpu_pid_map, ARRAY, int, uint32_t, 1024);

struct switch_args {
    unsigned long long ignore;
    char prev_comm[16];
    int prev_pid;
    int prev_prio;
    long long prev_state;
    char next_comm[16];
    int next_pid;
    int next_prio;
};

// SEC("tracepoint/sched/sched_switch")
DEFINE_BPF_PROG("tracepoint/sched/sched_switch", AID_ROOT, AID_NET_ADMIN, tp_sched_switch) (struct switch_args* args) {
// int tp_sched_switch(struct switch_args* args) {
    int key;
    uint32_t val;

    key = bpf_get_smp_processor_id();
    val = args->next_pid;

    bpf_cpu_pid_map_update_elem(&key, &val, BPF_ANY);
    return 0;
}

// char _license[] SEC("license") = "GPL";
LICENSE("Apache 2.0");
```

bpf_cli.cpp

```cpp
#include <android-base/macros.h>
#include <stdlib.h>
#include <unistd.h>
#include <iostream>
#include <bpf/BpfMap.h>
#include <bpf/BpfUtils.h>
#include <libbpf_android.h>

int main() {
    constexpr const char tp_prog_path[] = "/sys/fs/bpf/prog_bpf_test_tracepoint_sched_sched_switch";
    constexpr const char tp_map_path[] = "/sys/fs/bpf/map_bpf_test_cpu_pid_map";
    // Attach tracepoint and wait for 4 seconds
    int mProgFd = bpf_obj_get(tp_prog_path);
    // int mMapFd = bpf_obj_get(tp_map_path);
    bpf_attach_tracepoint(mProgFd, "sched", "sched_switch");
    sleep(1);
    android::bpf::BpfMap<int, int> myMap(tp_map_path);

    while(1) {
        usleep(40000);

        // Read the map to find the last PID that ran on CPU 0
        // android::bpf::BpfMap<int, int> myMap(mMapFd);
        printf("last PID running on CPU %d is %d\n", 0, *myMap.readValue(0));
    }

    exit(0);
}
```

Android.bp

```json
bpf {
    name: "bpf_test.o",
    srcs: ["bpf_test.c"],
    cflags: [
        "-Wall",
        "-Werror",
    ],
}

cc_binary {
    name: "bpf_cli",

    cflags: [
        "-Wall",
        "-Werror",
        "-Wthread-safety",
    ],
    clang: true,
    shared_libs: [
        "libcutils",
        "libbpf_android",
        "libbase",
        "liblog",
        "libnetdutils",
        "libbpf",
    ],
    srcs: [
        "bpf_cli.cpp",
    ],
}
```