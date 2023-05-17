---
title: libc and glibc
subtitle: libc
date: 2023-05-17T00:00:00Z
summary: libc
draft: false
featured: false
authors:
  - admin
lastmod: 2023-05-17T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - C
  - Linux
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

## libc

（C standard library，缩写：libc）。标准函数库通常会随附在编译器上。windows系统和Linux系统下都可以尽情使用。是最基本的C函数库，也叫 ANSI C 函数库。总而言之，几乎在任何平台上的 C 语言 (包括非 UNIX 平台) 都支持此标准。

 ANSI C 函数库是基本的 C 语言函数库，包含了 C 语言最基本的库函数。这个库可以根据头文件划分为 15 个部分，其中包括： 

1. <ctype.h>：包含用来测试某个特征字符的函数的函数原型，以及用来转换大小写字母的函数原型；
2. <errno.h>：定义用来报告错误条件的宏；
3. <float.h>：包含系统的浮点数大小限制；
4. <math.h>：包含数学库函数的函数原型；
5. <stddef.h>：包含执行某些计算 C 所用的常见的函数定义；
6. <stdio.h>：包含标准输入输出库函数的函数原型，以及他们所用的信息；
7. <stdlib.h>：包含数字转换到文本，以及文本转换到数字的函数原型，还有内存分配、随机数字以及其他实用函数的函数原型；
8. <string.h>：包含字符串处理函数的函数原型；
9. <time.h>：包含时间和日期操作的函数原型和类型；
10. <stdarg.h>：包含函数原型和宏，用于处理未知数值和类型的函数的参数列表；
11. <signal.h>：包含函数原型和宏，用于处理程序执行期间可能出现的各种条件；
12. <setjmp.h>：包含可以绕过一般函数调用并返回序列的函数的原型，即非局部跳转；
13. <locale.h>：包含函数原型和其他信息，使程序可以针对所运行的地区进行修改。
14. 地区的表示方法可以使计算机系统处理不同的数据表达约定，如全世界的日期、时间、美元数和大数字；
15. <assert.h>：包含宏和信息，用于进行诊断，帮助程序调试。

上述库函数在其各种支持 C 语言的 IDE 中都是有的。

 Linux libc released major versions 2, 3, 4, and 5, as well as many minor versions of those releases.  Linux libc4 was the last  version to use the a.out binary format, and the first version to provide (primitive) shared library support.  Linux libc 5 was the first version to support the ELF binary format; this version used the shared library soname libc.so.5.  For a while, Linux libc was the standard C library in many Linux distributions.

- *libc4*: Version 4 of the C library is based on the a.out binary format; it was the first version to support dynamic linking (shared libraries). However, a.out dynamic linking had a lot of problems (for example, you had to build the library twice, so you could add a jump table to the library on the second pass, and the library was non-relocatable, so every library had to be allocated a block of space to load into), so it was abandoned (at least on m68k; Intel users may still need it for some esoteric applications). You should not be using libc4 for anything any more. If you do use it, we will hunt you down and execute you as an example to others. (Not really, but you get the point...)
- *libc5*: Version 5 of the C library was a fairly big improvement over version 4. However, it still had some problems (adding new functions or changing structure sizes introduced subtle bugs) so it is no longer being actively developed. It was the first version of the Linux C Library based on ELF, a different file format that made programs loadable in more flexible ways (it uses hunks, similar to the AmigaOS executable file format). libc5 is officially deprecated on m68k; use libc6 for new compilations.

## glibc

The GNU C Library project provides *the* core libraries for the GNU system and GNU/Linux systems, as well as many other systems that use Linux as the kernel. These libraries provide critical APIs including ISO C11, POSIX.1-2008, BSD, OS-specific APIs and more. These APIs include such foundational facilities as `open`, `read`, `write`, `malloc`, `printf`, `getaddrinfo`, `dlopen`, `pthread_create`, `crypt`, `login`, `exit` and more.

glibc的release 1.0在1992年发布，2.0在1997年发布，取代libc成为Linux发行版的标准C库，使用libc.so.6的名字。

* *libc6*: Version 6 of the Linux C Library is version 2 of the GNU C Library; the confusion is because Linux has had multiple C library versions. This is the newest technology available, and includes features (like "weak symbols") that theoretically allow new functions and modified structures in the library without breaking existing code that uses version 6, and avoid kernel version dependency problems. You should be coding and compiling all code against this version.

## glibc和libc区别

glibc和libc都是Linux下的C函数库，libc是Linux下的ANSI C的函数库；glibc是Linux下的GUN C的函数库；GNU C是一种ANSI C的扩展实现。glibc本身是GNU旗下的C标准库，后来逐渐成为了Linux的标准c库，而Linux下原来的标准c库Linux libc逐渐不再被维护。Linux下面的标准c库不仅有这一个，如uclibc、klibc，以及上面被提到的Linux libc，但是glibc无疑是用得最多的。glibc在/lib目录下的.so文件为libc.so.6

## glibc与MSVC CRT

glibc和MSVCRT事实上是标准C语言运行库的超集，它们各自对C标准库进行了一些扩展。
glibc除了C标准库之外，还有几个辅助程序运行的运行库，这几个文件可以称得上是真正的“运行库”。它们就是/usr/lib/crt1.o、/usr/lib/crti.o和/usr/lib/crtn.o。