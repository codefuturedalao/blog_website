Android Graphics(3) SurfaceFlinger

## SurfaceFlinger的启动和初始化

### 类定义

```cpp
* /frameworks/native/services/surfaceflinger/SurfaceFlinger.h
class SurfaceFlinger : public BnSurfaceComposer,
                       public PriorityDumper,
                       private IBinder::DeathRecipient,
                       private HWC2::ComposerCallback,
                       private ISchedulerCallback {
```

* SurfaceComposer继承自BnSurfaceComposer，即为实现了ISurfaceComposer接口的Bn服务端；
* 实现了HWC2的ComposerCallback回调，监听Composer HAL的一些事件，比如Hotplug, Vsync ...

### main函数

对于其main函数，简简单单把握一下几点就可以了：

1. 创建SurfaceFlinger对象（`createSurfaceFlinger()`)，触发执行 SurfaceFlinger::onFirstRef()

   ```onFirstRef```中对消息队列进行了初始化

   ```c++
   void SurfaceFlinger::onFirstRef() {
       mEventQueue->init(this);
   }
   
   * /frameworks/native/services/surfaceflinger/Scheduler/MessageQueue.cpp
   
   void MessageQueue::init(const sp<SurfaceFlinger>& flinger) {
       mFlinger = flinger;
       mLooper = new Looper(true);
       mHandler = new Handler(*this);
   }
   ```

2. 调用SurfaceFlinger::init()进行初始化

   1. 初始化HWComposer，注册回调接口mCompositionEngine->getHwComposer().setCallback(this)，HAL会回调一些方法。SurfaceFlinger::init方法中设置完HWC的回调后，会立即收到一个Hotplug事件，并在SurfaceFlinger::onComposerHalHotplug中去处理。进而到SurfaceFlinger::processDisplayHotplugEventsLocked() ，其中也是在完成一些初始化的工作，特别是调用到SurfaceFlinger::initScheduler去完成有关VSYNC信号接收处理的内容。
   2. 初始化显示设备initializeDisplays;

3. 注册服务到ServiceManager(名字是"SurfaceFlinger")

4. 调用SurfaceFlinger::run()

   无限循环等待message的到来。





而bufferQueue是在SF中创建的，应用端的dequeue、queue Buffer操作都是通过binder和SF进行交互。但是在Android S上，BufferQueue的创建从SF中移出来，变成BLASTBufferQueue去完成BufferQueue的创建，dequeue、queue、acquire、release Buffer 的操作均由 App 进行。当App绘制完一帧后，会通过BLASTBufferQueue接口执行onFrameAvailable回调，并通过transaction事务将该buffer提交到SF。
