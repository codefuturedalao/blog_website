---
title: Pixel 3 Kernel打开KPROBES编译选项
subtitle: android刷内核
date: 2023-10-07T00:00:00Z
summary: android graphics
draft: false
featured: false
authors:
  - admin
lastmod: 2023-10-07T00:00:00Z
tags:
  - android 
  - Makefile
  - Linux
categories:
  - android 
  - Makefile
  - Linux
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false

---

## 前言

最近在探索BPF在Android上的应用，通过以下命令

```bash
zcat /proc/config.gz | grep KPROBE
```

发现自己的kernel貌似没有开启kprobe，应该是编译的时候没有设置`CONFIG_KPROBES`，于是想要重新编译一下kernel，添加编译选项。

硬件：Google Pixel 3

## 下载Repo

1. 创建一个工作目录，后面的文件都会放这下面

   ```bash
   mkdir ~/Documents/kernel
   export WORK_DIR=~/Documents/Kernel
   cd ${WORK_DIR}
   ```

2. 选择内核分支

   根据链接https://source.android.com/docs/setup/build/building-kernels选择对应分支，为了能对应上手机的内核版本，这里没有加上--depth=1，后面需要checkout。

   ```
   repo init -u https://mirrors.tuna.tsinghua.edu.cn/git/AOSP/kernel/manifest -b android-msm-crosshatch-4.9-android11-qpr2
   repo sync
   ```

   **最新版的内核编译脚本会使用自带的编译工具，不需要自己设置clang环境变量**。如果你同步的内核源代码没有编译工具，需要自己手动同步一下，如下

   ```bash
   cd prebuilts
   git clone https://android.googlesource.com/kernel/prebuilts/build-tools
   mv build-tools kernel-build-tools
   export PATH=${WORK_DIR}/prebuilts/kernel-build-tools/linux-x86/bin:$PATH
   ```

3. 选择内核版本

   代码同步好之后，进入`private/msm-google`文件夹，通过下面的命令切换到和手机内核版本一致的commit。我的内核版本是`5bded8e40b62`，那么对应的commit id就是`5bded8e40b62`。可以通过uname -r 或者手机设置中查看。

   ```bash
   git checkout 5bded8e40b62
   ```

## 修改编译脚本

1. 首先进入内核源码目录

   ```
   cd private/msm-google
   ```

2. 生成b1c1_defconfig对应的`.config`配置文件，这一步是基于`arch/arm64/configs/b1c1_defconfig`配置文件进行的生成。

   ```
   make ARCH=arm64 b1c1_defconfig
   ```

3. 打开内核编译配置的可视化界面，修改选项。

   ```
   make ARCH=arm64 menuconfig
   ```

   按`/`可以进行搜索，这样可以知道一些选项在哪里，以及选项的限制条件等等

   ![img](https://blog.seeflower.dev/images/Snipaste_2022-10-02_17-30-05.png)

   修改选项状态之后，按`TAB`键可以切换底部的选项，先选择`Save`保存`.config`文件，然后选择`Exit`退出编辑

4. 然后根据`.config`配置文件生成`defconfig`配置文件。

   注意这里生成的`defconfig`是精简的，有些选项你可能明明设置了但是里面没有。实际上在编译的时候会生成完整的版本，不用担心，如果说编译阶段（out文件夹下）生成的`.config`文件没有你之前设置的，那么可能有选项冲突了

   ```
   make ARCH=arm64 savedefconfig
   ```

5. 覆盖原有的`floral_defconfig`配置文件

   ```
   cp defconfig arch/arm64/configs/floral_defconfig
   ```

6. 删除`.config`配置文件，不然编译时会提示你需要清理

   ```
   rm .config
   ```

至此完成了内核编译配置的修改，可以开始正式编译了

## 正式编译

若没有build.sh, 则找一个能用的[build.sh](https://pastebin.ubuntu.com/p/ZZJ7RdhQWd/), 然后直接编译。

```Bash
cd ${WORK_DIR}/kernel
./build/build.sh
```

## 刷入设备

### 方法1 刷入image.lz4-dtb

找到Image.lz4-dtb文件的位置

通常在${WORK_DIR}/out目录下```find ./ -name 'Imge.lz4-dtb'```即可找到

如./android-msm-pixel-4.9/private/msm-google/arch/arm64/boot/Image.lz4-dtb

```bash
adb reboot bootloader
fastboot flash boot image-new.img
fastboot reboot
```

如果不确定内核一定没问题，可以临时刷入，这样再次重启的时候会使用之前的内核

```bash
adb reboot bootloader
fastboot boot image-new.img
```

### 方法2  使用magsikboot对boot.img重新解包打包

```Bash
./magsiskboot unpack boot.img
mv Image kernel
./magiskboot repack boot.img new.img
adb reboot bootloader
fastboot boot new.img
```

## 遇到问题

### 触摸无反应，隔一段时间重启

1. 创建文件夹保存ko文件

   ```
   adb shell "mkdir /data/local/tmp/vendor_ko"
   ```

2. push ko文件

   需要将./out/android-msm-pixel-4.9/dist 下的所有ko文件push到/data/local/tmp/vendor_ko中，并且需要将脚本文件push到相同位置。

3. 加载ko模块

   编写一个用于装载模块的sh文件

   ```
   # load_module.sh
   # 定义模块加载函数，传入模块名并加载该模块 
   mod_dir="/data/local/tmp/vendor_ko/" 
   load_module() { 
       insmod $mod_dir$1 
   } 
   
   echo "start loading modules" 
   # 按照依赖顺序加载模块 
   load_module videobuf2-vmalloc.ko 
   load_module wcd-dsp-glink.ko 
   load_module videobuf2-memops.ko 
   load_module pinctrl-wcd.ko 
   load_module wcd-core.ko 
   load_module snd-soc-wcd-spi.ko 
   load_module snd-soc-wcd934x.ko 
   load_module heatmap.ko 
   load_module ftm5.ko 
   load_module sec_touch.ko 
   load_module snd-soc-cs35l36.ko 
   load_module snd-soc-sdm845-max98927.ko 
   load_module snd-soc-wcd9xxx.ko 
   load_module snd-soc-sdm845.ko 
   load_module snd-soc-sdm845.ko 
   load_module wlan.ko 
   
   echo "All modules loaded successfully.
   
   ```

   通过以下命令将ko文件和sh文件push到android设备中

   ```
   adb push ./out/android-msm-pixel-4.9/dist/*.ko /data/local/tmp/vendor_ko
   adb push load_module.sh /data/local/tmp/vendor_ko
   ```

4. 在刷入内核，重启时，等待adb连接上以后执行上述脚本数次即可（因为暂时没有考虑模块的依赖的顺序，但是多从装载几次就把前面依赖也装载上了）

   ```
   fastboot boot ./out/android-msm-pixel-4.9/private/msm-google/arch/arm64/boot/Image.lz4-dtb
   
   adb shell su -c "chmod +x /data/local/tmp/vendor_ko/load_module.sh"
   adb shell su -c "/data/local/tmp/vendor_ko/load_module.sh"
   ```

## 参考链接

1. [eBPF on Android之打补丁和编译内核修正版](https://blog.seeflower.dev/archives/174/#title-2)
2. [Building Kernels](https://source.android.com/docs/setup/build/building-kernels)