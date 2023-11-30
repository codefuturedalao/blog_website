---
title: 编译Arm Compute Library
subtitle: Arm NNLib
date: 2023-11-30T00:00:00Z
summary: Arm compute lib
draft: false
featured: false
authors:
  - admin
lastmod: 2023-11-30T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - Arm
  - Android
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

操作系统：Arch Linux

1. clone repo

   ```
   git clone https://github.com/ARM-software/ComputeLibrary.git
   ```

2. 编译lib，需要下载ndk

   我的ndk在`/opt/android-ndk`目录下，因此直接设置环境变量NDK和PATH，等会编译lib会直接用交叉编译的clang和clang++。

   1. zshrc中设置环境变量

      ```bash
      export NDK="/opt/android-ndk"
      export PATH="$NDK/:$PATH"
      ```

   2. 软连接```aarch64-linux-android-clang++```和```aarch64-linux-android-clang```，由于我的机子是Google Pixel 4，所以架构是armv8的，也是aarch64（通过```adb shell getprop | grep cpu.abi```获得），且我的android api版本是32（通过```adb shell getprop | grep build.version.sdk```获得），因此链接对应版本呢的clang和clang++

      ```bash
      # /opt/android-ndk/toolchains/llvm/prebuilt/linux-x86_64/bin/
      sudo ln -s aarch64-linux-android32-clang++ aarch64-linux-android-clang++
      sudo ln -s aarch64-linux-android32-clang aarch64-linux-android-clang
      ```

   3. 获取```aarch64-linux-android-ar```和```aarch64-linux-android-ranlib```，这个不在ndk中，而是需要去网上自行获取，我机器上编译过android中的linux内核，自带有，所以直接拷贝到NDK的bin目录下就行。

   4. 编译Lib

      运行官网命令，由于我们是CPU和GPU都想尝试一下，所以neon和opencl都标为了1。

      ```bash
      CXX=clang++ CC=clang scons Werror=1 -j8 debug=0 asserts=1 neon=1 opencl=1 embed_kernels=1 os=android arch=armv8a
      ```

      生成的lib会在build文件夹下

3. 编译示例

   我们尝试编译graph_mobilenet，根据官网的说法，我们使用了Graph AI，所以使用以下命令，其中注意我们加了额外的```-Lbuild/```来将build目录下的lib放入链接路径中。

   ```bash
   aarch64-linux-android-clang++ examples/graph_mobilenet.cpp utils/Utils.cpp utils/GraphUtils.cpp utils/CommonGraphOptions.cpp -I. -Iinclude -std=c++14 -Wl,--whole-archive -Lbuild/ -larm_compute_graph-static -Wl,--no-whole-archive -larm_compute-static -larm_compute_core-static -L. -o graph_lenet_aarch64 -static-libstdc++ -pie -DARM_COMPUTE_CL
   ```

   

