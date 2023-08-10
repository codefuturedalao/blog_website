# Android Graphics(1) 帧渲染总体流程

![image-20230624103307451](Android Graphics(1) 帧渲染总体流程.assets/image-20230624103307451.png)

1. Vsync信号到来，唤醒对应的EventThread线程

   ![img](Android Graphics(1) 帧渲染总体流程.assets/979092-20220517150629443-1577251438.png)

兵分两路：（APP线程和Surfaceflinger）

* APP线程

  ![image-20230624103704631](Android Graphics(1) 帧渲染总体流程.assets/image-20230624103704631.png)

  1. 主线程唤醒，Choreographer回调`FrameDisplayEventReceiver.onVsync()`开始一帧的绘制
  2. `onVsync()`中发送msg，msg.callback中的run函数调用`doFrame()`函数开始绘制，`doFrame()`函数处理以下回调（如果有的话）。
     1. Input
     2. Animation
     3. Traversal
        1. Measure
        2. Layout
        3. Draw：
           1. `updateRootDisplayList()`: 主线程与渲染线程同步数据，将draw的内容记录到DisplayList中
           2. `syncAndDrawFrame()`: 同步给RenderThread，通知渲染线程开始工作，主线程释放。
  3. 同步结束后，主线程结束一帧的绘制，可以继续处理下一个 Message(如果有的话，IdleHandler 如果不为空，这时候也会触发处理)，或者进入 Sleep 状态等待下一个 Vsync。
  4. 渲染线程dequeueBuffer从BufferQueue 里面取一个 Buffer，
  5. 渲染线程queueBuffer讲渲染好的线程还给BufferQueue。

* SurfaceFlinger

