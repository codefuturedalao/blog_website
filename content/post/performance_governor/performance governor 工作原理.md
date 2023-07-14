---
title: performance governor 工作原理
subtitle: 上层修改scaling_max/min_freq时，内核发生了什么
date: 2023-07-14T00:00:00Z
summary: linux governor
draft: false
featured: false
authors:
  - admin
lastmod: 2023-07-14T00:00:00Z
tags:
  - Linux
  - governor
categories:
  - Linux
  - governor
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false


---

## 先将所有事情准备好：cpufreq_policy_alloc

内核启动时为CPU核心注册driver，层层调用cpufreq_register_driver->cpuhp_cpufreq_online->cpufreq_online->cpufreq_policy_alloc函数。该函数初始化policy很多信息，其中比较重要的是下面初始化了update函数。

```c++
	policy->nb_min.notifier_call = cpufreq_notifier_min;
	policy->nb_max.notifier_call = cpufreq_notifier_max;

	INIT_WORK(&policy->update, handle_update);

    static int cpufreq_notifier_min(struct notifier_block *nb, unsigned long freq,
                    void *data)
    {
        struct cpufreq_policy *policy = container_of(nb, struct cpufreq_policy, nb_min);

        schedule_work(&policy->update);
        return 0;
    }
```

其中handle_update函数调用了refresh_frequency_limits()函数，用于更新频率的min和max值。

```c++
static void handle_update(struct work_struct *work)
{
	struct cpufreq_policy *policy =
		container_of(work, struct cpufreq_policy, update);

	pr_debug("handle_update for cpu %u called\n", policy->cpu);
	down_write(&policy->rwsem);
	refresh_frequency_limits(policy);
	up_write(&policy->rwsem);
}
```

refresh_frequency_limits调用逻辑为调用cpufreq_set_policy->cpufreq_governor_limits()

```c++
static int cpufreq_set_policy(struct cpufreq_policy *policy,
			      struct cpufreq_governor *new_gov,
			      unsigned int new_pol)
{
	...
	if (new_gov == policy->governor) {
		pr_debug("governor limits update\n");
		cpufreq_governor_limits(policy);
		return 0;
	}
	...	
}
```

cpufreq_governor_limits函数体如下，它会调用governor的limits函数。

```c++
static void cpufreq_governor_limits(struct cpufreq_policy *policy)
{
	if (cpufreq_suspended || !policy->governor)
		return;

	pr_debug("%s: for CPU %u\n", __func__, policy->cpu);

	if (policy->governor->limits)
		policy->governor->limits(policy);
}
```

我们以performance为例，其中hook了limits函数，用于调用自己的cpufreq_gov_performance_limits函数，修改cpu频率。

```c++
static void cpufreq_gov_performance_limits(struct cpufreq_policy *policy)
{
	pr_debug("setting to %u kHz\n", policy->max);
	__cpufreq_driver_target(policy, policy->max, CPUFREQ_RELATION_H);
}

static struct cpufreq_governor cpufreq_gov_performance = {
	.name		= "performance",
	.owner		= THIS_MODULE,
	.flags		= CPUFREQ_GOV_STRICT_TARGET,
	.limits		= cpufreq_gov_performance_limits,
};

```

## 当修改scaling_max_freq的时候发生了什么

由上面我们知道了如果调用update函数，performance governor会根据最大值也就是scaling_max_freq的值修改cpu频率，但是scaling_max_freq是如何传入内核，且触发update函数的呢？

答案就是hook读写文件的函数，当读写文件时调用函数修改内核变量，触发更新函数。在cpufreq.c中存在非常多将文件名和函数名关联起来的的定义

```c++
#define cpufreq_freq_attr_rw(_name)		\
static struct freq_attr _name =			\
__ATTR(_name, 0644, show_##_name, store_##_name)

cpufreq_freq_attr_rw(scaling_min_freq);
cpufreq_freq_attr_rw(scaling_max_freq);
cpufreq_freq_attr_rw(scaling_governor);
cpufreq_freq_attr_rw(scaling_setspeed);
```

在common/include/linux/sysfs.h中__ATTR定义了读写文件时调用了哪个show（读取）函数和store（写入）函数。

```
#define __ATTR(_name, _mode, _show, _store) {				\
	.attr = {.name = __stringify(_name),				\
		 .mode = VERIFY_OCTAL_PERMISSIONS(_mode) },		\
	.show	= _show,						\
	.store	= _store,						\
}
```

cpufreq.c还有其他和sysfs有关的操作，和我们分析performance没太大关系，读者可以自行查看。上面我们发现scaling_max_freq和scaling_min_freq都被宏定义cpufreq_freq_attr_rw定义了读写函数，因此只需要找到store_scaling_max_freq和store_scaling_min_freq函数即可。

```c++
store_one(scaling_min_freq, min);
store_one(scaling_max_freq, max);

#define store_one(file_name, object)			\
static ssize_t store_##file_name					\
(struct cpufreq_policy *policy, const char *buf, size_t count)		\
{									\
	unsigned long val;						\
	int ret;							\
									\
	ret = kstrtoul(buf, 0, &val);					\
	if (ret)							\
		return ret;						\
									\
	ret = freq_qos_update_request(policy->object##_freq_req, val);\
	return ret >= 0 ? count : ret;					\
}
```

函数定义中调用freq_qos_update_request->freq_qos_apply->pm_qos_update_target函数

```c++
int pm_qos_update_target(struct pm_qos_constraints *c, struct plist_node *node,
			 enum pm_qos_req_action action, int value)
{
	...
	if (c->notifiers)
		blocking_notifier_call_chain(c->notifiers, curr_value, NULL);
	...
}

```

之后会调用前面的cpufreq_notifier_min函数，将之前注册好的handle_update函数通过schedule_work函数放入一个队列，当调用到handle_update函数时跟着上面的逻辑层层调用到limits函数，对cpu频率进行修改。

```c++
static int notifier_call_chain(struct notifier_block **nl,
			       unsigned long val, void *v,
			       int nr_to_call, int *nr_calls)
{
    	pm_qos_set_value(c, curr_value);		//修改policy->max的值
		...
		ret = nb->notifier_call(nb, val, v);	//调用回调函数，更新governor
		...
}
```

## 总结

当我们通过```echo xxx > /sys/devices/system/cpu/cpufreq/policy0/scaling_max_freq```时发生了如下的事情

1. echo程序底层实现使用write系统调用，write调用了sysfs中的store函数，该函数已经被hook为store_scaling_max_freq函数。
2. store_scaling_max_freq函数修改policy->max的值，但此时cpu频率并不会因此而修改。之后调用之前该文件注册好的notifier_call，也就是cpufreq_notifier_max函数，该函数内部调用了 schedule_work(&policy->update);，其中update在INIT_WORK中注册为handle_update函数。schedule_work将函数指针放入队列，等待系统空闲时调用。
3. handle_update函数得到调用，层层调用governor->limits函数，当governor为performance时，该函数指向cpufreq_gov_performance_limits，该函数最终调用__cpufreq_driver_target将cpu频率修改为policy->max的值。

## Reference

1. common/drivers/cpufreq/cpufreq.c