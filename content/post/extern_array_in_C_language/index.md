---
title: extern 1d and 2d array in C language
subtitle: C extern关键字引用数组
date: 2023-05-12T00:00:00Z
summary: C extern关键字引用数组
draft: false
featured: false
authors:
  - admin
lastmod: 2023-05-12T00:00:00Z
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

好久没用C语言编写代码了，其中的extern有些生疏了，尤其是对一维数组和多维数组的extern遇到了些坑，因此记录一下。

## 1-d array

* 在一个源文件里定义了一个[数组](https://so.csdn.net/so/search?q=数组&spm=1001.2101.3001.7020)：char a[6]; 
* 在另外一个文件里用下列语句进行了声明：extern char *a； 

请问，这样可以吗？ 
答案与分析： 
不可以，程序运行时会告诉你非法访问。原因在于，指向类型T的[指针](http://www.bc-cn.net/Article/Search.asp?Field=Title&ClassID=&keyword=%D6%B8%D5%EB&Submit=+%CB%D1%CB%F7+)并不等价于类型T的数组。extern char *a声明的是一个[指针](http://www.bc-cn.net/Article/Search.asp?Field=Title&ClassID=&keyword=%D6%B8%D5%EB&Submit=+%CB%D1%CB%F7+)变量而不是字符数组，因此与实际的定义不同，从而造成运行时非法访问。应该将声明改为extern char a[ ]。 

## 2-d array

```
/* main.c */
unsigned char LCD[8][64] = {0};
/* another file */
extern unsigned char LCD[][64];
```

