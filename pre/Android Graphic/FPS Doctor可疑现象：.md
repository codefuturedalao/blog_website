FPS Doctor可疑现象：

1. swapper进程在UI thread处于runnable时，调度存在一定的延迟

   下图为trace_governor_schedutil.html中的数据。

   ![image-20230620150402258](FPS Doctor可疑现象：.assets/image-20230620150402258.png)

2. 为什么有的binder调用非阻塞，有的就阻塞

   ![image-20230623114101752](FPS Doctor可疑现象：.assets/image-20230623114101752.png)