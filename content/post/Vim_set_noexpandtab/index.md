---
title: Vim set noexpandtab doesn't work
subtitle: Vim
date: 2022-07-29T00:00:00Z
summary: Vim 小白之路
draft: false
featured: false
authors:
  - admin
lastmod: 2022-07-29T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - Vim
  - Tools
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

Recently i was writing some python code, i always encountered this error:

![image-20220728120446489](./error.png)

And what confuses me is that i have use ```set noexpandtab``` command in ```~/.vimrc```, but it doesn't work. Today i cannot stand it anymore, so i search it and find that [answer](https://vi.stackexchange.com/questions/13537/why-is-set-noexpandtab-in-my-vimrc-ignored-when-i-open-a-file/13538#13538?newreg=0e319cf574ca4183b1303c18a3ae8fac). It seems like python plugin overwrite my setting.

## Solution

1. use ```:verbose set noexpandtab?``` to find the pulgin file

   ![image-20220728120914214](./verbose.png)

2. search expandtab in that file

   ![image-20220728121003564](fix.png)

3. change it to noexpandtab

   
