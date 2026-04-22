# Sonic

## 安装Mysql-Server

```bash
sudo apt install mysql-server
```

![image-20241229171413898](C:\Users\1\AppData\Roaming\Typora\typora-user-images\image-20241229171413898.png)

确保 MySQL 配置文件中的 `bind-address` 设置正确。打开配置文件：

bash

复制

```
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

确保 `bind-address` 为：

```
bind-address = 0.0.0.0
```

如果之前是 `127.0.0.1`，则需要将其更改为 `0.0.0.0`，然后重启 MySQL 服务：

```
sudo systemctl restart mysql
```

## 安装Docker

教程：https://docs.docker.com/engine/install/ubuntu/

### 设置代理

```c
sudo systemctl daemon-reload
sudo systemctl restart docker
```





## 部署Sonic

```
wget https://ghproxy.com/https://github.com/SonicCloudOrg/sonic-server/releases/download/v2.7.2/sonic-server-v2.7.2.zip
```