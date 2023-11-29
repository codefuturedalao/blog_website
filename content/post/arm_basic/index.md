---
title: 芯片授权基础知识
subtitle: 一些Arm架构的基础知识
date: 2023-11-29T00:00:00Z
summary: 手机Arm芯片简介
draft: false
featured: false
authors:
  - admin
lastmod: 2023-11-29T00:00:00Z
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

# 指令集角度

## X86授权方式

Intel授权x86架构给AMD，AMD设计的芯片和Intel是兼容的，但架构的具体实现方法并不一样。

## Arm授权方式

1. core licenses (Built on Cortex, BoC license)

   贩卖已经设计好的IP，包括CPU。厂商可以修改core的配置，但不能修改core本身的设计。高通、联发科、华为应该也是得到了core licenses，因为他们的SoC里面CPU其实也都是Cortex系列。

   Arm本身也设计CPU，有四条CPU的线路

   * Neoverse (infrastructure processors)

   * Cortex-A (Application processors)

     * ARMv9-A

       Cortex-X2, Cortex-A715, Cortex-A510

     * ARMv8.2-A

        Cortex-A77, Cortex-A65AE, Cortex-A76, Cortex-A75 and Cortex-A55

     * ARMv8-A

        Cortex-A73, Cortex-A72, Cortex-A32, Cortex-A35, Cortex-A57 and Cortex-A53.

     * 32-bit

       Cortex-A32, Cortex-A15, Cortex-A12, Cortex-A17, Cortex-A9, Cortex-A8, Cortex-A7 and Cortex-A5, 

   * Cortex-R (real-time processors)

   * Cortex-M (microcontrollers)

   GPU的IP有两种

   * Mali
   * Immortalis (with hardware-based ray-tracing) June 28, 2022

2. architectural license

   法脉指令集架构，允许芯片长生可以自行设计ARM架构的core，只要与指令集兼容即可。目前获得这种授权方式的公司包括高通、三星、苹果、华为。

   * 高通

     SoC

     * Snapdragon骁龙系列(S, 2, 4, 6, 7, 8)
       * 6 series (入门级和终端市场)
       * 7 series (中高端)
       * 8 series (高端)
         - Snapdragon 800 series (2013–2021)
         - Snapdragon 8/8+ Gen 1 (2022)
         - Snapdragon 8 Gen 2 (2023)
         - Snapdragon 8 Gen 3 (2024)

     CPU

     * Krait

     * Kryo （200,300,400,500,600)

       * 200: 半定制化 ARMv8.2-A
         * Gold cluster来源于Cortex-A73
         * Silver cluster来源于Cortex-A53
       * 300: 半定制化 ARMv8-A, arranged in configurations with **DynamIQ**
         * Gold cluster来源于Cortex-A75
         * Silver cluster来源于Cortex-A55
       * 400, 500, 600递推

       On November 22 2021, Qualcomm updated its Snapdragon branding and removed the numbering scheme on their Kryo CPUs and Adreno GPUs

     GPU

     * Adreno (100-700系列)

   * 联发科

     * Helio (曦力)
       - Helio X Series (2014–2017)
       - Helio A Series (2018–2020)
       - Helio P Series (2015–2020)
       - Helio G Series (2019–present)
     * Demensity(天玑)
       - Dimensity 700 Series
       - Dimensity 800 Series
       - Dimensity 900 Series
       - Dimensity 1000 Series
       - Dimensity 6000 Series
       - Dimensity 7000 Series
       - Dimensity 8000 Series
       - Dimensity 9000 Series

   * 华为

     * 麒麟 （手机）
       - Kirin 620
       - Kirin 650, 655, 658, 659
       - Kirin 710
       - ......
       - Kirin 990 4G, Kirin 990 5G and Kirin 990E 5G
       - Kirin 9000 5G/4G and Kirin 9000E, Kirin 9000L
       - Kirin 9000S
     * 鲲鹏 （数据中心）
     * 昇腾（人工智能场景）

# 分工角度

## IDM模式

Intel、三星

## 各有分工

* 指令集设计
  * Arm
  * RISC-V
  * Intel x86

* Fabless 芯片设计
  * 华为海思
    * 麒麟系列
  * AMD
  * 高通
    * 骁龙系列
  * 联发科 MediaTek
    * 天玑系列5G SoC

* Foundry 芯片制造
  * 台积电
  * 中芯国际
  * 三星
* 封装测试
  * 日月光
  * 安靠
  * 三星

