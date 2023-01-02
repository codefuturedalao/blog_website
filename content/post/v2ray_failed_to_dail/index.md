---
title: [转载] v2ray failed to dial WebSocket 解决方法_ find an available destination
subtitle: VPN
date: 2022-11-06T00:00:00Z
summary: 翻墙问题集合 
draft: false
featured: false
authors:
  - admin
lastmod: 2022-11-06T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - VPN
  - Network
projects: []
image:
  caption: "Image credit: [**Unsplash**](./v2ray.jpg)"
  focal_point: ""
  placement: 2
  preview_only: false
---

原文链接：https://woj.app/7223.html

今天最近使用v2ray经常遇到下面的情况，简直是一脸蒙圈，有的时候过很长一阵时间就好了，然后又不好了，今天则是彻底就一直这种状况。下面就说一下这种问题的解决方案。

```
2021/07/20 08:59:47 [Warning] [1125995626] github.com/v2fly/v2ray-core/v4/app/proxyman/outbound: failed to process outbound traffic > github.com/v2fly/v2ray-core/v4/proxy/vmess/outbound: failed to find an available destination > github.com/v2fly/v2ray-core/v4/common/retry: [github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial WebSocket > github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial to (wss://xxx.xx.xx.xx:443/search):  > dial tcp xxx.xx.xx.xx:443: connectex: No connection could be made because the target machine actively refused it.] > github.com/v2fly/v2ray-core/v4/common/retry: all retry attempts failed
2021/07/20 08:59:47 tcp:127.0.0.1:51035 accepted tcp:sdk.split.io:443 [proxy]
2021/07/20 08:59:58 [Warning] [59391995] github.com/v2fly/v2ray-core/v4/app/proxyman/outbound: failed to process outbound traffic > github.com/v2fly/v2ray-core/v4/proxy/vmess/outbound: failed to find an available destination > github.com/v2fly/v2ray-core/v4/common/retry: [github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial WebSocket > github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial to (wss://xxx.xx.xx.xx:443/search):  > dial tcp xxx.xx.xx.xx:443: connectex: No connection could be made because the target machine actively refused it. github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial WebSocket > github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial to (wss://xxx.xx.xx.xx:443/search):  > dial tcp xxx.xx.xx.xx:443: operation was canceled] > github.com/v2fly/v2ray-core/v4/common/retry: all retry attempts failed
2021/07/20 08:59:58 [Warning] [2497832095] github.com/v2fly/v2ray-core/v4/app/proxyman/outbound: failed to process outbound traffic > github.com/v2fly/v2ray-core/v4/proxy/vmess/outbound: failed to find an available destination > github.com/v2fly/v2ray-core/v4/common/retry: [github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial WebSocket > github.com/v2fly/v2ray-core/v4/transport/internet/websocket: failed to dial to (wss://xxx.xx.xx.xx:443/search):  > dial tcp xxx.xx.xx.xx:443: connectex: No connection could be made because the target machine actively refused it.] > github.com/v2fly/v2ray-core/v4/common/retry: all retry attempts failed
```

## 解决方案：

### 第一步：

判断当前VPS主机时间是否有问题。判断方法参考“[v2ray 主机时间同步问题](https://woj.app/6566.html)”，如果确定没问题，则进行下一步，如果有问题则按照文章中的步骤同步一下时间即可。然后再次尝试v2ray客户端连接，看看还会不会报错，如果还是会报错，则进行第二步判断。

### 第二步：

判断当前VPS主机端口是否有问题。首先安装一个nc

```
yum install -y nc
```

安装完后，随意开启监听一个端口，例如直接执行下面的命令。监听8181

```
nc -lv -p 8181
```

然后在本机打开cmd，尝试连接一下VPS的8181端口

```
telnet xxx.你VPS的IP.xx.xx 8181
```

如果没连进去，这里就要分析多种可能了。
例如：1、可能是你VPS没有关闭防火墙
2、可能是你电脑网络没办法访问互联网其他主机的端口，可能公司限制
3、你的VPS被墙了，只能考虑使用CloudFlare来做中转帮你自己恢复被墙的限制 ([CloudFlare恢复被墙方法](https://woj.app/7225.html))

如果没问题，那么你要注意以下你的V2RAY的配置，是否使用的WebSocket+TLS模式，或者你v2ray对外开放的是什么端口。是什么端口，你连接一下什么端口。WebSocket+TLS这个默认是443 你继续在你的电脑中telnet连接一下，我这边尝试连接我自己的VPS结果就是443端口是不通的，其他任何端口都没问题。

那就只能证明一个结果，我VPS的IP的443端口被墙了，所以只能更换其他端口。v2ray WebSocket+TLS 模式更换其他端口的方法如下：

1. 修改nginx中配置文件的端口/etc/nginx/conf.d/v2ray.conf中的端口，从443换成其他
2. 修改v2ray客户端的端口

如果你用的是caddy

```
vi /etc/caddy/Caddyfile
##注意，里面的内容第一行，绝对是你自己配置的域名，这里更改为如下，英文冒号，端口随意设置
www.你自己配置的域名.com:8080 {
    gzip
timeouts none
    proxy / https://www.baidu.com {
        except /ddd
    }
    proxy /ddd 127.0.0.1:40507 {
        without /ddd
        websocket
    }
}
http://www.你自己配置的域名.com {
    gzip
timeouts none
    proxy / https://woj.app {
    }
}
import sites/*
```
