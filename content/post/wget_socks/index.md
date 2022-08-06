---
title: wget encounter error: Unsupported scheme 'socks5'
subtitle: VPN
date: 2022-08-06T00:00:00Z
summary: 翻墙问题集合
draft: false
featured: false
authors:
  - admin
lastmod: 2022-08-06T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - VPN
  - Network
projects: []
image:
  caption: "Image credit: [**Unsplash**](./featured.jpg)"
  focal_point: ""
  placement: 2
  preview_only: false
---

In my .bashrc, i configure the proxy like this

```shell
export http=http://127.0.0.1:8000
export https=http://127.0.0.1:8000

export http_proxy=socks5://127.0.0.1:1080
export https_proxy=socks5://127.0.0.1:1080

export ALL_PROXY=socks5://127.0.0.1:1080
```

and when i use ```wget``` to download some file, i encounter this error:

```shell
Error parsing proxy URL socks5://127.0.0.1:1080: Unsupported scheme ‘socks5’.
```

Actually i don't know the reason behind this, but i find one solution that can solve this problem

## Solution-tsocks

we can use a tscocks to make wget use proxy

1. install tsocks

   arch linux:

   ```shell
   sudo pacman -S tsocks
   ```

   ubuntu:

   ```shell
   sudo apt install tsocks
   ```

2. modifty configure file of tsocks

   my ```/etc/tsocks.conf``` doesn't exist, so we need copy file from ```/usr/share/tsocks/tsocks.conf.simple.example```

   ```
   sudo cp /usr/share/tsocks/tsocks.conf.simple.example /etc/tsocks.conf 
   ```

   modify the content of ```/etc/tsocks.conf```  as follows

   ```shell
   # This is the configuration for libtsocks (transparent socks)
   # Lines beginning with # and blank lines are ignored
   #
   # This sample configuration shows the simplest (and most common) use of
   # tsocks. This is a basic LAN, this machine can access anything on the
   # local ethernet (192.168.0.*) but anything else has to use the SOCKS version
   # 4 server on the firewall. Further details can be found in the man pages,
   # tsocks(8) and tsocks.conf(5) and a more complex example is presented in
   # tsocks.conf.complex.example
   
   # We can access 192.168.0.* directly
   # local = 192.168.0.0/255.255.255.0
   
   # Otherwise we use the server
   server = 127.0.0.1
   # Server type defaults to 4 so we need to specify it as 5 for this one
   server_type = 5
   # The port defaults to 1080 but I've stated it here for clarity 
   server_port = 1080
   
   ```

3. unset your proxy environment variable

   ```shell
   unset https_proxy
   ```

4. add ```tsocks``` before ```wget```

   ```
   tsocks wget ...
   ```

   

Done~~

## Reference

1. [linux shell走socks5代理](https://blog.csdn.net/zhuogoulu4520/article/details/103178539)

2. [wget socks5 代理](https://mixboot.blog.csdn.net/article/details/105028544?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1-105028544-blog-117678332.pc_relevant_multi_platform_whitelistv3&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1-105028544-blog-117678332.pc_relevant_multi_platform_whitelistv3&utm_relevant_index=1)
3. [wget:不支持的协议类型 “socks5”](https://blog.csdn.net/weixin_43932656/article/details/117678332)
