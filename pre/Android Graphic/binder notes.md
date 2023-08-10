binder notes



* ProcessState：进程的单实例。  

  * 构造函数：open_driver()打开了/dev/binder节点，binder为每个进程创建binder_proc记录。然后执行mmap，设置binder_proce->buffer指向某虚拟内存地址
  * getContextObject()：有一个全局列表来记录所有和binder对象相关的信息，通过查找然后返回BpBinder对象。

* IPCThreadState：线程的单实例。负责与Binder进行具体的命令交互。

  * 构造函数：设置mIn和mOut容量

  * transact函数

    * writeTransactionData：打包成Binder驱动协议规定的格式，此时将handle值写入，binder驱动会根据该值处理请求。

    * waitForResponce：发送命令

      * while(1){ if(talkWithDriver() < NO_ERROR) {break} } ：发送给Binder驱动

        * (ioctl)binder_ioctl函数: case BINDER_WRITE_READ: ret = binder_ioctl_write_read(filep, arg, thread);

          * binder_ioctl_write_read函数

            * binder_thread_write函数：写入数据，生成binder_transaction变量加入target_thread->todo队列中，并唤醒目标线程。

              tcomplete被加入调用者自己的todo队列。

              ```tcomplete->type = BINDER_WORK_TRANSACTION_COMPLETE```

            * binder_thread_read函数：```binder_thread_read->binder_wait_for_work->schedule```进入等待。

      * 处理cmd

        * BR_NOOP： executeCommand():

          ```c++
          case BR_NOOP:
          	break;
          
          case BR_SPAWN_LOOPER:
              mProcess->spawnPooledThread(false);
              break;
          ```

          

        * BR_TRANSACTION_COMPLETE





```c++
public static Runnable zygoteInit(int targetSdkVersion, long[] disabledCompatChanges,
                                  String[] argv, ClassLoader classLoader) {
    if (RuntimeInit.DEBUG) {
        Slog.d(RuntimeInit.TAG, "RuntimeInit: Starting application from zygote");
    }

    Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "ZygoteInit");
    RuntimeInit.redirectLogStreams();

    RuntimeInit.commonInit();
    ZygoteInit.nativeZygoteInit(); //其中创建binder thread pool
    return RuntimeInit.applicationInit(targetSdkVersion, disabledCompatChanges, argv,
                                       classLoader);
}

static void com_android_internal_os_ZygoteInit_nativeZygoteInit(JNIEnv* env, jobject clazz)
{
    gCurRuntime->onZygoteInit();
}

virtual void onZygoteInit()
{
    sp<ProcessState> proc = ProcessState::self();			//打开binder驱动并mmap
    ALOGV("App process: starting thread pool.\n");
    proc->startThreadPool();
}

void ProcessState::spawnPooledThread(bool isMain)
{
    if (mThreadPoolStarted) {
        String8 name = makeBinderThreadName();
        ALOGV("Spawning new pooled thread, name=%s\n", name.string());
        sp<Thread> t = sp<PoolThread>::make(isMain);
        t->run(name.string());
        pthread_mutex_lock(&mThreadCountLock);
        mKernelStartedThreads++;
        pthread_mutex_unlock(&mThreadCountLock);
    }
    // TODO: if startThreadPool is called on another thread after the process
    // starts up, the kernel might think that it already requested those
    // binder threads, and additional won't be started. This is likely to
    // cause deadlocks, and it will also cause getThreadPoolMaxTotalThreadCount
    // to return too high of a value.
}

class PoolThread : public Thread
{
public:
    explicit PoolThread(bool isMain)
        : mIsMain(isMain)
    {
    }

protected:
    virtual bool threadLoop()
    {
        IPCThreadState::self()->joinThreadPool(mIsMain);		//创建IPCThreadState单实例
        return false;
    }

    const bool mIsMain;
};

void IPCThreadState::joinThreadPool(bool isMain)
{
    LOG_THREADPOOL("**** THREAD %p (PID %d) IS JOINING THE THREAD POOL\n", (void*)pthread_self(), getpid());
    pthread_mutex_lock(&mProcess->mThreadCountLock);
    mProcess->mCurrentThreads++;
    pthread_mutex_unlock(&mProcess->mThreadCountLock);
    mOut.writeInt32(isMain ? BC_ENTER_LOOPER : BC_REGISTER_LOOPER);

    mIsLooper = true;
    status_t result;
    do {
        processPendingDerefs();
        // now get the next command to be processed, waiting if necessary
        result = getAndExecuteCommand();	//talkwithDriver and executeCommand()

        if (result < NO_ERROR && result != TIMED_OUT && result != -ECONNREFUSED && result != -EBADF) {
            LOG_ALWAYS_FATAL("getAndExecuteCommand(fd=%d) returned unexpected error %d, aborting",
                  mProcess->mDriverFD, result);
        }

        // Let this thread exit the thread pool if it is no longer
        // needed and it is not the main process thread.
        if(result == TIMED_OUT && !isMain) {
            break;
        }
    } while (result != -ECONNREFUSED && result != -EBADF);

    LOG_THREADPOOL("**** THREAD %p (PID %d) IS LEAVING THE THREAD POOL err=%d\n",
        (void*)pthread_self(), getpid(), result);

    mOut.writeInt32(BC_EXIT_LOOPER);
    mIsLooper = false;
    talkWithDriver(false);
    pthread_mutex_lock(&mProcess->mThreadCountLock);
    LOG_ALWAYS_FATAL_IF(mProcess->mCurrentThreads == 0,
                        "Threadpool thread count = 0. Thread cannot exist and exit in empty "
                        "threadpool\n"
                        "Misconfiguration. Increase threadpool max threads configuration\n");
    mProcess->mCurrentThreads--;
    pthread_mutex_unlock(&mProcess->mThreadCountLock);
}

    
```

