# Android Graphics(2) Choregrapher和UI/Render Thread

## Choreographer 的初始化

在 Activity 启动过程，执行完 onResume 后，会调用 Activity.makeVisible()，然后再调用到 addView()， 层层调用会进入如下方法。

```c++
ActivityThread.handleResumeActivity(IBinder, boolean, boolean, String) (android.app) 
-->WindowManagerImpl.addView(View, LayoutParams) (android.view) 
  -->WindowManagerGlobal.addView(View, LayoutParams, Display, Window) (android.view) 
    -->ViewRootImpl.ViewRootImpl(Context, Display) (android.view) 
    public ViewRootImpl(Context context, Display display) {
        ......
        mChoreographer = Choreographer.getInstance();
        ......    
}
```

Choreographer 的 getInstance 方法中调用 ThreadLocal.get 方法，对choregrapher进行单例初始化。**由此我们可以得出 Choreographer 是线程单例的, 并且它只能运行在存在 Looper 的线程中**, 下面看看它的构造函数：

```c++
public final class Choreographer {
    
    private static final boolean USE_VSYNC = SystemProperties.getBoolean(
            "debug.choreographer.vsync", true);
    
    
    // 触摸事件
    public static final int CALLBACK_INPUT = 0;
    // 动画的 Callback
    public static final int CALLBACK_ANIMATION = 1;
    // View 遍历的 Callback
    public static final int CALLBACK_TRAVERSAL = 2;
    // 在 Traversals 之后, 优先级最低的 Callback
    public static final int CALLBACK_COMMIT = 3;

    private static final int CALLBACK_LAST = CALLBACK_COMMIT;
    
    private Choreographer(Looper looper, int vsyncSource) {
        mLooper = looper;
        // 1. 用于处理 Frame 相关消息的 Handler
        mHandler = new FrameHandler(looper);
        // 2. 创建垂直同步信号的接收器
        mDisplayEventReceiver = USE_VSYNC
                ? new FrameDisplayEventReceiver(looper, vsyncSource)
                : null;
        // 记录最后绘制的时间
        mLastFrameTimeNanos = Long.MIN_VALUE;
        // 记录每帧间隔: 1s / 屏幕刷新率
        mFrameIntervalNanos = (long)(1000000000 / getRefreshRate());
        // 3. 创建 CallbackQueue 数组, 一共有 4 个 CallbackQueue
        mCallbackQueues = new CallbackQueue[CALLBACK_LAST + 1];
        for (int i = 0; i <= CALLBACK_LAST; i++) {
            mCallbackQueues[i] = new CallbackQueue();
        }
        // b/68769804: 用于 Low FPS 实验
        setFPSDivisor(SystemProperties.getInt(ThreadedRenderer.DEBUG_FPS_DIVISOR, 1));
    }
    
} 
```

从 Choreographer 的构造中, 我们可以看到它主要做了三件事情

- 创建当前线程的 FrameHandler, 用于处理帧操作
- 创建 FrameDisplayEventReceiver, 用于接收硬件信号, 即 SurfaceFlinger 的 EventThread-app 发出的 VSYNC 信号
- 创建 CallbackQueue 数组, 每个数组的槽位如下
  - 0: 触摸事件的 Callback
  - 1: 动画的 Callback
  - 2: Traversals 的 Callback
  - 3: Commit 的 Callback

### FrameDisplayEventRecevier

Vsync 的注册、申请、接收都是通过 FrameDisplayEventReceiver 这个类，所以可以先简单介绍一下。 FrameDisplayEventReceiver 继承 DisplayEventReceiver ， 有三个比较重要的方法

1. onVsync – Vsync 信号回调
2. run – 执行 doFrame
3. scheduleVsync – 请求 Vsync 信号

简单来说，FrameDisplayEventReceiver 的初始化过程中，通过 BitTube(本质是一个 socket pair)，来传递和请求 Vsync 事件，当 SurfaceFlinger 收到 Vsync 事件之后，通过 appEventThread 将这个事件通过 BitTube 传给 DisplayEventDispatcher ，DisplayEventDispatcher 通过 BitTube 的接收端监听到 Vsync 事件之后，回调 Choreographer.FrameDisplayEventReceiver.onVsync ，触发开始一帧的绘制

## RenderThread的启动

从ViewRootImpl #setView 开始->enableHardwareAcceleration(attrs);

```c++
mAttachInfo.mThreadedRenderer = ThreadedRenderer.create(mContext, translucent,                         attrs.getTitle().toString());


public final class ThreadedRenderer extends HardwareRenderer {
    public static ThreadedRenderer create(Context context, boolean translucent, String name) {
    	return new ThreadedRenderer(context, translucent, name);
	}
    ThreadedRenderer(Context context, boolean translucent, String name) {
        super();
        setName(name);
        setOpaque(!translucent);

        final TypedArray a = context.obtainStyledAttributes(null, R.styleable.Lighting, 0, 0);
        mLightY = a.getDimension(R.styleable.Lighting_lightY, 0);
        mLightZ = a.getDimension(R.styleable.Lighting_lightZ, 0);
        mLightRadius = a.getDimension(R.styleable.Lighting_lightRadius, 0);
        float ambientShadowAlpha = a.getFloat(R.styleable.Lighting_ambientShadowAlpha, 0);
        float spotShadowAlpha = a.getFloat(R.styleable.Lighting_spotShadowAlpha, 0);
        a.recycle();
        setLightSourceAlpha(ambientShadowAlpha, spotShadowAlpha);
    }
}
```

父类HardwareRenderer初始化时创建RenderProxy节点

```
RenderProxy::RenderProxy(bool translucent, RenderNode* rootRenderNode,
                         IContextFactory* contextFactory)
        : mRenderThread(RenderThread::getInstance()), mContext(nullptr) {
    mContext = mRenderThread.queue().runSync([&]() -> CanvasContext* {
        return CanvasContext::create(mRenderThread, translucent, rootRenderNode, contextFactory);
    });
    mDrawFrameTask.setContext(&mRenderThread, mContext, rootRenderNode,
                              pthread_gettid_np(pthread_self()), getRenderThreadTid());
}
```

其中RenderThread::getInstance()创建线程并运行

```
RenderThread& RenderThread::getInstance() {
    [[clang::no_destroy]] static sp<RenderThread> sInstance = []() {
        sp<RenderThread> thread = sp<RenderThread>::make();
        thread->start("RenderThread");
        return thread;
    }();
    gHasRenderThreadInstance = true;
    return *sInstance;
}
```

层层返回后mRenderProxy->mRenderThread以及mRenderProxy->mDrawFrameTask->thread均指向该线程。该线程threadLoop中也循环等待着message的到来

```c++
bool RenderThread::threadLoop() {
    setpriority(PRIO_PROCESS, 0, PRIORITY_DISPLAY);
    Looper::setForThread(mLooper);
    if (gOnStartHook) {
        gOnStartHook("RenderThread");
    }
    initThreadLocals();

    while (true) {
        waitForWork();
        processQueue();

        if (mPendingRegistrationFrameCallbacks.size() && !mFrameCallbackTaskPending) {
            mVsyncSource->drainPendingEvents();
            mFrameCallbacks.insert(mPendingRegistrationFrameCallbacks.begin(),
                                   mPendingRegistrationFrameCallbacks.end());
            mPendingRegistrationFrameCallbacks.clear();
            requestVsync();
        }

        if (!mFrameCallbackTaskPending && !mVsyncRequested && mFrameCallbacks.size()) {
            // TODO: Clean this up. This is working around an issue where a combination
            // of bad timing and slow drawing can result in dropping a stale vsync
            // on the floor (correct!) but fails to schedule to listen for the
            // next vsync (oops), so none of the callbacks are run.
            requestVsync();
        }
    }

    return false;
}
```



## Workflow w/ source code

![image-20230624105403140](Android Graphics(2) Choregrapher和UIRender Thread.assets/image-20230624105403140.png)

1. app-event thread将主线程唤醒，Choreographer回调`FrameDisplayEventReceiver.onVsync()`开始一帧的绘制

2. `onVsync()`中发送msg，msg.callback中的run函数调用`doFrame()`函数开始绘制

   1. 计算掉帧逻辑

      ```c++
      void doFrame(long frameTimeNanos, int frame) {
          final long startNanos;
          synchronized (mLock) {
              ......
              long intendedFrameTimeNanos = frameTimeNanos;
              startNanos = System.nanoTime();
              final long jitterNanos = startNanos - frameTimeNanos;
              if (jitterNanos >= mFrameIntervalNanos) {
                  final long skippedFrames = jitterNanos / mFrameIntervalNanos;
                  if (skippedFrames >= SKIPPED_FRAME_WARNING_LIMIT) {
                      Log.i(TAG, "Skipped " + skippedFrames + " frames!  "
                              + "The application may be doing too much work on its main thread.");
                  }
              }
              ......
          }
          ......
      }
      ```

      Choreographer.doFrame 的掉帧检测比较简单，从下图可以看到，Vsync 信号到来的时候会标记一个 start_time ，执行 doFrame 的时候标记一个 end_time ，这两个时间差就是 Vsync 处理时延，也就是掉帧

      ![15717421364722](Android Graphics(2) Choregrapher和UIRender Thread.assets/15717421364722.jpg)

      我们以 Systrace 的掉帧的实际情况来看掉帧的计算逻辑

      ![15717421441350](Android Graphics(2) Choregrapher和UIRender Thread.assets/15717421441350.jpg)

      这里需要注意的是，这种方法计算的掉帧，是前一帧的掉帧情况，而不是这一帧的掉帧情况，这个计算方法是有缺陷的，会导致有的掉帧没有被计算到

   2. `doFrame()`函数处理以下回调（如果有的话）。

      1. Input: 输入事件

      2. Animation: 动画处理

      3. InsetsAnimation

      4. Traversal: 和UI空间绘制有关

         doTraversal->performTraversals()

         ```c++
         private void performTraversals() {
               // measure 操作
               if (focusChangedDueToTouchMode || mWidth != host.getMeasuredWidth() || mHeight != host.getMeasuredHeight() || contentInsetsChanged || updatedConfiguration) {
                     performMeasure(childWidthMeasureSpec, childHeightMeasureSpec);
               }
               // layout 操作
               if (didLayout) {
                   performLayout(lp, mWidth, mHeight);
               }
               // draw 操作
               if (!cancelDraw && !newSurface) {
                   performDraw();
               }
         }
         ```

         1. Measure

         2. Layout

         3. Draw：ViewRootImpl::peformDraw()->ViewRootImpl::draw()->mAttachInfo.mThreadedRenderer.draw(mView, mAttachInfo, this);

            1. `updateRootDisplayList()`: 主线程与渲染线程同步数据，将draw的内容记录到DisplayList中

               ```c++
               private void updateRootDisplayList(View view, DrawCallbacks callbacks) {
                       Trace.traceBegin(Trace.TRACE_TAG_VIEW, "Record View#draw()");
               }
               ```

            2. `syncAndDrawFrame()`: 同步给RenderThread，通知渲染线程开始工作，主线程释放。

               ```c++
               int RenderProxy::syncAndDrawFrame() {
                   return mDrawFrameTask.drawFrame();
               }
               
               int DrawFrameTask::drawFrame() {
               	...
                   postAndWait();
                   return mSyncResult;
               }
               
               void DrawFrameTask::postAndWait() {
                   ATRACE_CALL();
                   AutoMutex _lock(mLock);
                   mRenderThread->queue().post([this]() { run(); });
                   mSignal.wait(mLock);
               }
               
               void DrawFrameTask::run() {
                   const int64_t vsyncId = mFrameInfo[static_cast<int>(FrameInfoIndex::FrameTimelineVsyncId)];
                   ATRACE_FORMAT("DrawFrames %" PRId64, vsyncId);
                   nsecs_t syncDelayDuration = systemTime(SYSTEM_TIME_MONOTONIC) - mSyncQueued;
               
                   bool canUnblockUiThread;
                   bool canDrawThisFrame;
                   {
                       TreeInfo info(TreeInfo::MODE_FULL, *mContext);
                       info.forceDrawFrame = mForceDrawFrame;
                       mForceDrawFrame = false;
                       canUnblockUiThread = syncFrameState(info);
                       canDrawThisFrame = info.out.canDrawThisFrame;
               
                       if (mFrameCommitCallback) {
                           mContext->addFrameCommitListener(std::move(mFrameCommitCallback));
                           mFrameCommitCallback = nullptr;
                       }
                   }
               
                   // Grab a copy of everything we need
                   CanvasContext* context = mContext;
                   std::function<std::function<void(bool)>(int32_t, int64_t)> frameCallback =
                           std::move(mFrameCallback);
                   std::function<void()> frameCompleteCallback = std::move(mFrameCompleteCallback);
                   mFrameCallback = nullptr;
                   mFrameCompleteCallback = nullptr;
                   int64_t intendedVsync = mFrameInfo[static_cast<int>(FrameInfoIndex::IntendedVsync)];
                   int64_t frameDeadline = mFrameInfo[static_cast<int>(FrameInfoIndex::FrameDeadline)];
                   int64_t frameStartTime = mFrameInfo[static_cast<int>(FrameInfoIndex::FrameStartTime)];
               
                   // From this point on anything in "this" is *UNSAFE TO ACCESS*
                   if (canUnblockUiThread) {
                       unblockUiThread();
                   }
               
                   // Even if we aren't drawing this vsync pulse the next frame number will still be accurate
                   if (CC_UNLIKELY(frameCallback)) {
                       context->enqueueFrameWork([frameCallback, context, syncResult = mSyncResult,
                                                  frameNr = context->getFrameNumber()]() {
                           auto frameCommitCallback = std::move(frameCallback(syncResult, frameNr));
                           if (frameCommitCallback) {
                               context->addFrameCommitListener(std::move(frameCommitCallback));
                           }
                       });
                   }
               
                   nsecs_t dequeueBufferDuration = 0;
                   if (CC_LIKELY(canDrawThisFrame)) {
                       dequeueBufferDuration = context->draw();
                   } else {
                       // Do a flush in case syncFrameState performed any texture uploads. Since we skipped
                       // the draw() call, those uploads (or deletes) will end up sitting in the queue.
                       // Do them now
                       if (GrDirectContext* grContext = mRenderThread->getGrContext()) {
                           grContext->flushAndSubmit();
                       }
                       // wait on fences so tasks don't overlap next frame
                       context->waitOnFences();
                   }
               
                   if (CC_UNLIKELY(frameCompleteCallback)) {
                       std::invoke(frameCompleteCallback);
                   }
               
                   if (!canUnblockUiThread) {
                       unblockUiThread();
                   }
               
                   if (!mHintSessionWrapper) mHintSessionWrapper.emplace(mUiThreadId, mRenderThreadId);
                   constexpr int64_t kSanityCheckLowerBound = 100000;       // 0.1ms
                   constexpr int64_t kSanityCheckUpperBound = 10000000000;  // 10s
                   int64_t targetWorkDuration = frameDeadline - intendedVsync;
                   targetWorkDuration = targetWorkDuration * Properties::targetCpuTimePercentage / 100;
                   if (targetWorkDuration > kSanityCheckLowerBound &&
                       targetWorkDuration < kSanityCheckUpperBound &&
                       targetWorkDuration != mLastTargetWorkDuration) {
                       mLastTargetWorkDuration = targetWorkDuration;
                       mHintSessionWrapper->updateTargetWorkDuration(targetWorkDuration);
                   }
                   int64_t frameDuration = systemTime(SYSTEM_TIME_MONOTONIC) - frameStartTime;
                   int64_t actualDuration = frameDuration -
                                            (std::min(syncDelayDuration, mLastDequeueBufferDuration)) -
                                            dequeueBufferDuration;
                   if (actualDuration > kSanityCheckLowerBound && actualDuration < kSanityCheckUpperBound) {
                       mHintSessionWrapper->reportActualWorkDuration(actualDuration);
                   }
               
                   mLastDequeueBufferDuration = dequeueBufferDuration;
               }
               ```

      5. COMMIT: 主要是是用于执行组件 Application/Activity/Service 的 onTrimMemory，在 ApplicationThread 的 scheduleTrimMemory 方法中向 Choreographer 插入的；另外这个 Callback 也提供了一个监测一帧耗时的时机

3. 同步结束后，主线程结束一帧的绘制，可以继续处理下一个 Message(如果有的话，IdleHandler 如果不为空，这时候也会触发处理)，或者进入 Sleep 状态等待下一个 Vsync。

   ```c++
   void DrawFrameTask::run() {
   	...
       // From this point on anything in "this" is *UNSAFE TO ACCESS*
       if (canUnblockUiThread) {
           unblockUiThread();
       }
       ...
   }
   ```

   

4. 渲染线程dequeueBuffer从BufferQueue 里面取一个 Buffer，

5. 渲染线程queueBuffer讲渲染好的线程还给BufferQueue