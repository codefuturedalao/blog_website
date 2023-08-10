# Android Graphics——Vsync

[TOC]

## 1. 什么是FrameBuffer

framebuffer名为帧缓冲区，实质上是一片内存区域，存储了一整屏画面的像素值，用于存储图像涂到屏幕上之前的像素。实际上他是一块虚拟空间，其对应的物理空间可能在物理内存，也可能在显存。假设屏幕的分辨率是 1920×1080，即屏幕网格有 1920×1080 个像素格子，那么 framebuffer 就是一个长度为 1920×1080=2073600 的一维数组，数组中的每个元素对应一个屏幕格子中的像素值。

在 Linux 中，framebuffer 既是一块缓冲区，也是一个设备，其设备文件名为 `/dev/fb[0|1|...|31]`，主设备号为29，每个设备文件表示一个显示设备，因为允许多个屏幕。所以，理论上，可以通过 open、mmap、ioctl 系统调用来读写 framebuffer，从而实现图像绘制。[2]

需要注意的是，要将 framebuffer 中的数据真正显示到屏幕上，还必须通过总线将数据拷贝到显示屏存储空间。所以在分析绘制原理的时候，我们可以把 framebuffer 直接表示为显示设备，而在分析显示过程的时候应该还有一个 framebuffer -> display 的过程。

### 1.1 CPU和GPU共享内存

CPU和GPU共用RAM，存在两次数据传输。[1]

- CPU->GPU: GPU通过AXI bus读取textures（比如这个1080P的buffer），shaders等；
- GPU->CPU: GPU渲染后直接写回DDR，这个buffer称为FrameBuffer；

![内存类型](https://developer.android.com/static/images/games/memory-types.svg?hl=zh-cn)

## 2. Vsync

显示屏幕动画，我们要设置两个时机：

**时机一：生成帧**，产生了新的画面（帧），将其填充到 framebuffer 中，这个过程由 CPU（计算绘制需求）和 GPU（完成数据绘制）完成；

**时机二：显示帧**，显示屏显示完一帧图像之后，等待一个固定的间隔后，从 framebuffer 中取下一帧图像并显示，这个过程由 GPU 完成。

对于设备而言，其 **屏幕的刷新频率** 就相当于显示帧的时机和速度，可以看做是额定不变的（而生成帧速度对应我们通常说的帧率）。

### 2.1 显示器的扫描顺序

对于一帧画面，在屏幕上的显示是按照先从左往右扫描完一行，然后从上往下扫描下一行的顺序来渲染的。当扫描完一屏之后，需要重新回到第一行继续刚才的过程，而在进入下一轮扫描之前有一个空隙，这段空隙时间叫做 VBI（Vertical Blanking Interval）。在 VBI 期间，正好就是用于生成帧的最佳时间。而要保证这一点，我们需要在一屏扫描完进入下一轮扫描之前，即在一个 VBI 的开始时刻通知 CPU/GPU 去立即产生下一帧。恰好，硬件会在这个时刻触发垂直同步脉冲（Vertical Sync Pulse），正好可以用来进行通知，这个机制就叫 Vsync。

在 Android 中，Vsync 需要做的事是：产生 Vsync 信号，通知 CPU/GPU 立即生成下一帧，通知 GPU 从 framebuffer 中将当前帧 post 到显示屏。即，生成帧时机必须和 Vsync 信号保持同步。

## 3. 多缓冲实现原理

对 framebuffer 扩展为多缓冲包含两个意思：

1. 现在的 framebuffer 很多本身都实现了至少两个缓冲区，等一下将具体分析 famebuffer双缓冲实现原理。
2. 在 Android 显示系统中，在将帧数据写入 framebuffer 之前对于帧数据的绘制和生成也提供了多级缓冲，即所谓的绘制缓冲区，它们和 framebuffer 一起组成了多缓冲的结构。绘制缓冲区对应 Android 显示系统中一个重要的组件——BufferQueue

framebuffer双缓冲一般有两种实现方法，其共同点是都会把缓冲分为两部分：

- **背景缓冲（backbuffer）**：用于保存正在生成的帧。
- **前景缓冲（frontbuffer）**：用于保存即将显示的帧。

## 3. 多种刷新率

Android 11增加了对多种刷新率的设备的支持

## Reference

[1] [Android上的CPU和GPU是共享内存，为什么有的手机从GPU读取数据还是很慢？](https://blog.csdn.net/tujidi1csd/article/details/119380690 )

[2] [技术 / Android / Android显示系统之——多缓冲和Vsync](https://github.com/huanzhiyazi/articles/issues/28#top)