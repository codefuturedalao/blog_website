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

## 

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

2. 

{{< /two-columns >}}