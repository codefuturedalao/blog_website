#  搭建一个jupyter服务器

## 环境

* 一台服务器：本人使用的是Vultr的一台服务器，操作系统为CentOS

## 安装Conda和Python

1. 安装Conda

   Conda不是必须安装的，但我在CentOS中直接安装Python并编译，卡了两个小时，使用Conda配置Python只花了两分钟就配好了，所以强烈推荐使用Conda。

   * CentOS
     ```
     yum -y install conda
     ```

   * Ubuntu

     1. 下载Anaconda 官方的shell脚本

        ```
        wget https://repo.anaconda.com/archive/Anaconda3-2022.05-Linux-x86_64.sh
        ```

     2. 执行脚本，一路enter或者yes

        ```
        bash Anaconda3-2022.05-Linux-x86_64.sh
        ```

     3. 修改bashrc文件

        ```
        sudo vim ~/.bashrc
        ```

        增加下面两句

        ```
        export PATH="~/anaconda3/bin":$PATH
        source ~/anaconda3/bin/activate #修改终端的默认 python 为 anaconda
        ```

        保存文件后关闭，然后在终端执行，用于保存环境配置

        ```
        source ~/.bashrc
        ```

     4. 可以使用`conda -V`验证是否安装完毕，若安装完成，则会出现版本号。

        ```
        conda -V
        ```

2. 安装python3.7（注意版本）并激活该环境

   ```
   conda create -n py37 python=3.7
   conda activate py37
   ```

## 安装Jupyter并设置相关信息

### 下载Jupyter

```
conda install tornado
conda install jupyter
```

### 创建文件夹

在家目录下创建文件夹

```shell
mkdir jupyter
```

### 设置密码

```
python
```

```
from notebook.auth import passwd
passwd()
```

输入两次密码后就可以了，然后会返回一串加密字符串，类似于下面

```
'argon2:$argon2id$v=19$m=10240,t=10,p=8$FHzCgsHgxd3xlHKe8c/rBw$QvnrU7vo57szC+UbJ+LKYpRxVBwAKDXcGaQ+GpicKmI'
```

![image-20220917144503645](C:\Users\1\AppData\Roaming\Typora\typora-user-images\image-20220917144503645.png)

对密码进行复制。

### 更改配置文件

```
jupyter notebook --generate-config
```

该命令会生成一个配置文件，并告诉你配置文件的路径。

必要设置项如下（这些句子在配置文件中都存在，只不过被注释掉了）

```python
c.NotebookApp.ip = '*'
c.NotebookApp.notebook_dir = '/root/jupyter' # 之前创建的文件夹，jupyter会视为根目录
c.NotebookApp.open_browser = False
c.NotebookApp.password = u'argon2:$argon2id$v=19$m=10240,t=10,p=8$S8BF4Fjd2490uD8/fjuSlA$a7GX9tVlq1HmEqpYjRGYV6C9vBS1hufzVA2zGZ8oInY'
c.NotebookApp.port = 8888 # 这里就是你要访问的端口
```

![image-20220917144956712](C:\Users\1\AppData\Roaming\Typora\typora-user-images\image-20220917144956712.png)

## 启动Jupyter 

为了保证我退出ssh后，jupyter服务依然运行，使用nohup命令。

```
nohup jupyter notebook --allow-root
```

关闭ssh链接，在机器上打开浏览器，输入```IP地址:端口（上面的port）```即可

![在这里插入图片描述](https://img-blog.csdnimg.cn/82a6298659664ec4b3cc72fa723c1f76.png#pic_center)

然后输入密码即可





## 缺少Times New Roman字体

问题来源：
在CentOS7下运行py文件，报错：

 UserWarning: findfont: Font family ['Times New Roman'] not found. Falling back to DejaVu Sans.
原因分析：
系统中没有’Times New Roman’字体

解决方案：
从window上C:\Windows\Fonts目录下找到Times New Roman字体

将该字体复制到CentOS的/usr/share/fonts目录下，会自动分成四个文件

删除matplotlib的缓存：
rm -rf ~/.cache/matplotlib

