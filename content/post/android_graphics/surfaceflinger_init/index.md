---
title: SurfaceFlinger启动
subtitle: SurfaceFlinger
date: 2024-09-10T00:00:00Z
summary: android graphics
draft: false
featured: false
authors:
  - admin
lastmod: 2024-09-10T00:00:00Z
tags:
  - android 
  - graphics
categories:
  - android
  - graphics
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false
---

# SurfaceFlinger启动

SurfaceFlinger代码目录在`frameworks/native/services/surfaceflinger/`。

{{< two-columns >}}

```rc
// frameworks/native/services/surfaceflinger/surfaceflinger.rc

service surfaceflinger /system/bin/surfaceflinger
    class core animation
    user system
    group graphics drmrpc readproc
    capabilities SYS_NICE
    onrestart restart --only-if-running zygote
    task_profiles HighPerformance
```

<--->

surfaceflinger服务属于core和animation class

TODO

{{< /two-columns >}}

## Main函数入口

SF启动首先调用`main_surfaceflinger.cpp`的`main`函数

{{< two-columns >}}

```c++
//  frameworks/native/services/surfaceflinger/main_surfaceflinger.cpp

int main(int, char**) {
    signal(SIGPIPE, SIG_IGN);

    hardware::configureRpcThreadpool(1 /* maxThreads */,
            false /* callerWillJoin */);

    startGraphicsAllocatorService();

    // When SF is launched in its own process, limit the number of
    // binder threads to 4.
    ProcessState::self()->setThreadPoolMaxThreadCount(4);

    // Set uclamp.min setting on all threads, maybe an overkill but we want
    // to cover important threads like RenderEngine.
    if (SurfaceFlinger::setSchedAttr(true) != NO_ERROR) {
        ALOGW("Failed to set uclamp.min during boot: %s", strerror(errno));
    }

    // The binder threadpool we start will inherit sched policy and priority
    // of (this) creating thread. We want the binder thread pool to have
    // SCHED_FIFO policy and priority 1 (lowest RT priority)
    // Once the pool is created we reset this thread's priority back to
    // original.
    int newPriority = 0;
    int origPolicy = sched_getscheduler(0);
    struct sched_param origSchedParam;

    int errorInPriorityModification = sched_getparam(0, &origSchedParam);
    if (errorInPriorityModification == 0) {
        int policy = SCHED_FIFO;
        newPriority = sched_get_priority_min(policy);

        struct sched_param param;
        param.sched_priority = newPriority;

        errorInPriorityModification = sched_setscheduler(0, policy, &param);
    }

    // start the thread pool
    sp<ProcessState> ps(ProcessState::self());
    ps->startThreadPool();

    // Reset current thread's policy and priority
    if (errorInPriorityModification == 0) {
        errorInPriorityModification = sched_setscheduler(0, origPolicy, &origSchedParam);
    } else {
        ALOGE("Failed to set SurfaceFlinger binder threadpool priority to SCHED_FIFO");
    }

    // instantiate surfaceflinger
    sp<SurfaceFlinger> flinger = surfaceflinger::createSurfaceFlinger();

    // Set the minimum policy of surfaceflinger node to be SCHED_FIFO.
    // So any thread with policy/priority lower than {SCHED_FIFO, 1}, will run
    // at least with SCHED_FIFO policy and priority 1.
    if (errorInPriorityModification == 0) {
        flinger->setMinSchedulerPolicy(SCHED_FIFO, newPriority);
    }

    setpriority(PRIO_PROCESS, 0, PRIORITY_URGENT_DISPLAY);

    set_sched_policy(0, SP_FOREGROUND);

    // initialize before clients can connect
    flinger->init();

    // publish surface flinger
    sp<IServiceManager> sm(defaultServiceManager());
    sm->addService(String16(SurfaceFlinger::getServiceName()), flinger, false,
                   IServiceManager::DUMP_FLAG_PRIORITY_CRITICAL | IServiceManager::DUMP_FLAG_PROTO);

    // publish gui::ISurfaceComposer, the new AIDL interface
    sp<SurfaceComposerAIDL> composerAIDL = sp<SurfaceComposerAIDL>::make(flinger);
    if (FlagManager::getInstance().misc1()) {
        composerAIDL->setMinSchedulerPolicy(SCHED_FIFO, newPriority);
    }
    sm->addService(String16("SurfaceFlingerAIDL"), composerAIDL, false,
                   IServiceManager::DUMP_FLAG_PRIORITY_CRITICAL | IServiceManager::DUMP_FLAG_PROTO);

    startDisplayService(); // dependency on SF getting registered above

    if (SurfaceFlinger::setSchedFifo(true) != NO_ERROR) {
        ALOGW("Failed to set SCHED_FIFO during boot: %s", strerror(errno));
    }

    // run surface flinger in this thread
    flinger->run();

    return 0;
}
```

<--->

1. `setThreadPoolMaxThreadCount`函数设置线程池最大的数量为4。

   1. 首先调用`ProcessState::self()`函数。

      ```c++
      // frameworks/native/libs/binder/ProcessState.cpp
      #ifdef __ANDROID_VNDK__
      const char* kDefaultDriver = "/dev/vndbinder";
      #else
      const char* kDefaultDriver = "/dev/binder";
      #endif
      
      sp<ProcessState> ProcessState::self()
      {
          return init(kDefaultDriver, false /*requireDefault*/);
      }
      
      sp<ProcessState> ProcessState::init(const char* driver, bool requireDefault) {
          ...
          [[clang::no_destroy]] static std::once_flag gProcessOnce;
          std::call_once(gProcessOnce, [&](){
              if (access(driver, R_OK) == -1) {
                  driver = "/dev/binder";
              }
      
              int ret = pthread_atfork(ProcessState::onFork, ProcessState::parentPostFork,  ProcessState::childPostFork);
              std::lock_guard<std::mutex> l(gProcessMutex);
              gProcess = sp<ProcessState>::make(driver);
          });
      	...
          verifyNotForked(gProcess->mForked);
          return gProcess;
      }
      ```

      `self()`函数调用了`ProcessState::init()`函数，在`init`函数中初始化了全局变量`gProcess`，该变量是类`ProcessState`的对象指针，其初始化函数中完成了对Binder文件的初始化。参见TODO。

   2. 然后调用`setThreadPoolMaxThreadCount`函数

      ```c++
      status_t ProcessState::setThreadPoolMaxThreadCount(size_t maxThreads) {
      	...
          if (ioctl(mDriverFD, BINDER_SET_MAX_THREADS, &maxThreads) != -1) {
              mMaxThreads = maxThreads;
          }
      }
      ```

      通过`ioctl`函数向mDriverFD写入设置`BINDER_SET_MAX_THREADS`来设置binder最大线程的数量。

2. 调用`SurfaceFlinger::setSchedAttr`函数设置调度参数中uclamp.min的值，uclamp用于修正负载追踪模块对线程负载的衡量。

3. 设置Binder Thread pool里面的线程的调度策略为`SCHED_FIFO`，以及优先级为1。创建完binder线程后（isMain为`true`），将SF主线程的优先级进行重置。此时binder线程应该通过函数调用链`run->threadLoop->joinThreadPool->getAndExecuteCommand->talkWithDriver`等待命令

4. 重头戏来了，调用`surfaceflinger::createSurfaceFlinger()`函数创建SurfaceFlinger对象。

   ```c++
   // frameworks/native/services/surfaceflinger/SurfaceFlingerFactory.cpp
   
   sp<SurfaceFlinger> createSurfaceFlinger() {
       static DefaultFactory factory;
       return sp<SurfaceFlinger>::make(factory);
   }
   
   SurfaceFlinger::SurfaceFlinger(Factory& factory) : SurfaceFlinger(factory, SkipInitialization) {
       ATRACE_CALL();
       ALOGI("SurfaceFlinger is starting");
   
       hasSyncFramework = running_without_sync_framework(true);
   
       dispSyncPresentTimeOffset = present_time_offset_from_vsync_ns(0);
   
       maxFrameBufferAcquiredBuffers = max_frame_buffer_acquired_buffers(2);
       minAcquiredBuffers = SurfaceFlingerProperties::min_acquired_buffers().value_or(minAcquiredBuffers);
   
       maxGraphicsWidth = std::max(max_graphics_width(0), 0);
       maxGraphicsHeight = std::max(max_graphics_height(0), 0);
   	...
   }
   ```

   该函数中初始化了大量的成员变量，我们节选了几个可能比较重要的变量如`maxFrameBufferAcquiredBuffers`，`minAcquiredBuffers`，`maxGraphicsWidth`和`maxGraphicsHeight`等。

{{< /two-columns >}}

5. 调用函数`setpriority`设置当前进程（第二个参数为0标识调用者进程）的prio为-8（越小越容易得到调度）。

   ```c++
   // system/core/libutils/include/utils/ThreadDefs.h
   
   enum {
       ...
       PRIORITY_URGENT_DISPLAY = ANDROID_PRIORITY_URGENT_DISPLAY,
       ...
   };
   
   // system/core/libsystem/include/system/thread_defs.h
   
   enum {
       ANDROID_PRIORITY_LOWEST         =  19,
       /* use for background tasks */
       ANDROID_PRIORITY_BACKGROUND     =  10,
       /* most threads run at normal priority */
       ANDROID_PRIORITY_NORMAL         =   0,
       /* threads currently running a UI that the user is interacting with */
       ANDROID_PRIORITY_FOREGROUND     =  -2,
       /* the main UI thread has a slightly more favorable priority */
       ANDROID_PRIORITY_DISPLAY        =  -4,
       /* ui service treads might want to run at a urgent display (uncommon) */
       ANDROID_PRIORITY_URGENT_DISPLAY =  HAL_PRIORITY_URGENT_DISPLAY,
       /* all normal video threads */
       ANDROID_PRIORITY_VIDEO          = -10,
       /* all normal audio threads */
       ANDROID_PRIORITY_AUDIO          = -16,
       /* service audio threads (uncommon) */
       ANDROID_PRIORITY_URGENT_AUDIO   = -19,
       /* should never be used in practice. regular process might not
        * be allowed to use this level */
       ANDROID_PRIORITY_HIGHEST        = -20,
       ANDROID_PRIORITY_DEFAULT        = ANDROID_PRIORITY_NORMAL,
       ANDROID_PRIORITY_MORE_FAVORABLE = -1,
       ANDROID_PRIORITY_LESS_FAVORABLE = +1,
   };
   
   // system/core/libsystem/include/system/graphics.h
   #define HAL_PRIORITY_URGENT_DISPLAY     (-8)
   ```

   接下来还根据`set_sched_policy`函数设置了线程的profile，大概就是对cpu、io的cgroup和timerslack等参数进行覆写，我们暂时按下不表。

6. 调用`flinger->init`函数进行初始化。代码篇幅太长，我们放到下面进行讲解。

## flinger->init初始化surfaceflinger

{{< two-columns >}}

```c++
void SurfaceFlinger::init() FTL_FAKE_GUARD(kMainThreadContext) {
    ATRACE_CALL();

    // Get a RenderEngine for the given display / config (can't fail)
    // TODO(b/77156734): We need to stop casting and use HAL types when possible.
    // Sending maxFrameBufferAcquiredBuffers as the cache size is tightly tuned to single-display.
    auto builder = renderengine::RenderEngineCreationArgs::Builder()
                      .setPixelFormat(static_cast<int32_t>(defaultCompositionPixelFormat))
                      .setImageCacheSize(maxFrameBufferAcquiredBuffers)
        			  ...
    chooseRenderEngineType(builder);
    mRenderEngine = renderengine::RenderEngine::create(builder.build());
    mCompositionEngine->setRenderEngine(mRenderEngine.get());
    mMaxRenderTargetSize =
            std::min(getRenderEngine().getMaxTextureSize(), getRenderEngine().getMaxViewportDims());

    // Set SF main policy after initializing RenderEngine which has its own policy.
    if (!SetTaskProfiles(0, {"SFMainPolicy"})) {
        ALOGW("Failed to set main task profile");
    }

    mCompositionEngine->setTimeStats(mTimeStats);
    mCompositionEngine->setHwComposer(getFactory().createHWComposer(mHwcServiceName));
    auto& composer = mCompositionEngine->getHwComposer();
    composer.setCallback(*this);
    mDisplayModeController.setHwComposer(&composer);

    ClientCache::getInstance().setRenderEngine(&getRenderEngine());

    mHasReliablePresentFences =
            !getHwComposer().hasCapability(Capability::PRESENT_FENCE_IS_NOT_RELIABLE);

    enableLatchUnsignaledConfig = getLatchUnsignaledConfig();

    if (base::GetBoolProperty("debug.sf.enable_hwc_vds"s, false)) {
        enableHalVirtualDisplays(true);
    }

    // Process hotplug for displays connected at boot.
    LOG_ALWAYS_FATAL_IF(!configureLocked(),
                        "Initial display configuration failed: HWC did not hotplug");

    // Commit primary display.
    sp<const DisplayDevice> display;
    if (const auto indexOpt = mCurrentState.getDisplayIndex(getPrimaryDisplayIdLocked())) {
        const auto& displays = mCurrentState.displays;

        const auto& token = displays.keyAt(*indexOpt);
        const auto& state = displays.valueAt(*indexOpt);

        processDisplayAdded(token, state);
        mDrawingState.displays.add(token, state);

        display = getDefaultDisplayDeviceLocked();
    }

    LOG_ALWAYS_FATAL_IF(!display, "Failed to configure the primary display");
    LOG_ALWAYS_FATAL_IF(!getHwComposer().isConnected(display->getPhysicalId()),
                        "Primary display is disconnected");

    // TODO(b/241285876): The Scheduler needlessly depends on creating the CompositionEngine part of
    // the DisplayDevice, hence the above commit of the primary display. Remove that special case by
    // initializing the Scheduler after configureLocked, once decoupled from DisplayDevice.
    initScheduler(display);

    // Start listening after creating the Scheduler, since the listener calls into it.
    mDisplayModeController.setActiveModeListener(
            display::DisplayModeController::ActiveModeListener::make(
                    [this](PhysicalDisplayId displayId, Fps vsyncRate, Fps renderRate) {
                        // This callback cannot lock mStateLock, as some callers already lock it.
                        // Instead, switch context to the main thread.
                        static_cast<void>(mScheduler->schedule([=,
                                                                this]() FTL_FAKE_GUARD(mStateLock) {
                            if (const auto display = getDisplayDeviceLocked(displayId)) {
                                display->updateRefreshRateOverlayRate(vsyncRate, renderRate);
                            }
                        }));
                    }));

    mLayerTracing.setTakeLayersSnapshotProtoFunction([&](uint32_t traceFlags) {
        auto snapshot = perfetto::protos::LayersSnapshotProto{};
        mScheduler
                ->schedule([&]() FTL_FAKE_GUARD(mStateLock) FTL_FAKE_GUARD(kMainThreadContext) {
                    snapshot = takeLayersSnapshotProto(traceFlags, TimePoint::now(),
                                                       mLastCommittedVsyncId, true);
                })
                .wait();
        return snapshot;
    });

    // Commit secondary display(s).
    processDisplayChangesLocked();

    // initialize our drawing state
    mDrawingState = mCurrentState;

    onActiveDisplayChangedLocked(nullptr, *display);

    static_cast<void>(mScheduler->schedule(
            [this]() FTL_FAKE_GUARD(kMainThreadContext) { initializeDisplays(); }));

    mPowerAdvisor->init();

    if (base::GetBoolProperty("service.sf.prime_shader_cache"s, true)) {
        if (setSchedFifo(false) != NO_ERROR) {
            ALOGW("Can't set SCHED_OTHER for primeCache");
        }

        mRenderEnginePrimeCacheFuture.callOnce([this] {
            renderengine::PrimeCacheConfig config;
            config.cacheHolePunchLayer =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.hole_punch"s, true);
            config.cacheSolidLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.solid_layers"s, true);
            config.cacheSolidDimmedLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.solid_dimmed_layers"s, true);
            config.cacheImageLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.image_layers"s, true);
            config.cacheImageDimmedLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.image_dimmed_layers"s, true);
            config.cacheClippedLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.clipped_layers"s, true);
            config.cacheShadowLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.shadow_layers"s, true);
            config.cachePIPImageLayers =
                    base::GetBoolProperty("debug.sf.prime_shader_cache.pip_image_layers"s, true);
            config.cacheTransparentImageDimmedLayers = base::
                    GetBoolProperty("debug.sf.prime_shader_cache.transparent_image_dimmed_layers"s,
                                    true);
            config.cacheClippedDimmedImageLayers = base::
                    GetBoolProperty("debug.sf.prime_shader_cache.clipped_dimmed_image_layers"s,
                                    true);
            // ro.surface_flinger.prime_chader_cache.ultrahdr exists as a previous ro property
            // which we maintain for backwards compatibility.
            config.cacheUltraHDR =
                    base::GetBoolProperty("ro.surface_flinger.prime_shader_cache.ultrahdr"s, false);
            return getRenderEngine().primeCache(config);
        });

        if (setSchedFifo(true) != NO_ERROR) {
            ALOGW("Can't set SCHED_FIFO after primeCache");
        }
    }

    // Avoid blocking the main thread on `init` to set properties.
    mInitBootPropsFuture.callOnce([this] {
        return std::async(std::launch::async, &SurfaceFlinger::initBootProperties, this);
    });

    initTransactionTraceWriter();
    ALOGV("Done initializing");
}
```



<--->



{{< /two-columns >}}



## flinger->run开始运行

