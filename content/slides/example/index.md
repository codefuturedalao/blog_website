---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: /bg.jpg
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki 
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: slide-left
# use UnoCSS
css: unocss
hideInToc: true
---

# 终端设备性能功耗感知的调度调频技术研究

桑乾龙

武汉大学 2022级直博生

2023-05-18




<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
  <a href="https://github.com/slidevjs/slidev" target="_blank" alt="GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>
<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
layout: default
hideInToc: true
transition: fade-out
---

# Table of contents

<Toc></Toc>

---


# Introduction

With the advancements on mobile devices, various high-performance applications such as web
browser, video and game have been deployed, presenting challenges in balancing the power consumption and application QoE (Quality of Experience).

In Android, QoE -> Frame rate

Frame rate has two impact:
- ## 📲 **QoE** - As the frame rate increases, the display appears smoother, enhancing the user experience 

- ## 🔋 **Power** - high frame rates can significantly increase the system power consumption due to the rendering of frames

<br>
<br>

<!--
You can have `style` tag in markdown to override the style for the current page.
Learn more: https://sli.dev/guide/syntax#embedded-styles
-->

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

<!--
Here is another comment.
-->



---
hideInToc: true
layout: two-cols
transition: fade-out
---

# Introduction

Android applications usually have a target frame rate.

For example, 
* chat software requires 10 FPS
* video playback needs 24 FPS
* games choose 60 or 120 FPS depending on the hardware capacity.

Our Objective: reduce power consumption while meeting the target QoE

Power management techniques: Governing and Scheduling



::right::
<img src="/skype1-1684122669006.png" alt="skype1" position="absolute" left="130px" top="10px" style="zoom:20%;"  />

<img src="/tiktok.png" alt="tiktok" position="absolute" left="1280px" top="10px" style="zoom:20.5%;" />

<img src="/pubg1.png" alt="pubg1" position="absolute" left="100px" top="1350px" style="zoom:25%;" />




<!--
You can have `style` tag in markdown to override the style for the current page.
Learn more: https://sli.dev/guide/syntax#embedded-styles
-->

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

<!--
Here is another comment.
-->



---


# Background


1. Frame Rendering
3. Scheduling
3. Governing

![image-20230516115557617](/image-20230516115557617.png)


---
layout: two-cols
hideInToc: true
---

# Background
1. **Frame Rendering**
2. Scheduling
3. Governing

<br>

<br>

<br>

<img src="/image-20230515130905039.png" alt="image-20230515130905039" style="zoom:50%;" />

::right::

1. **UI Thread** processes input events, creates a tree of drawing commands, and then passes them to the Render Thread.
2. **Render Thread** fetches the buffer from SurfaceFlinger and sends a rendering request to the GPU. Then, the Render Thread enqueues the buffer into the BufferQueue managed
by SurfaceFlinger. 
3. **SurfaceFlinger** composites buffers from different sources such as foreground applications and navigation bars. 

In order to coordinate the rendering and display of frames, the system generates a Vertical Synchronization (**Vsync**) signal at certain intervals to update the display and three threads must complete their work within the interval

---
hideInToc: true

---

# Background
1. Frame Rendering
2. **Scheduling**
3. Governing



<br>

<br>

<br>



<img src="/image-20230515131444441.png" alt="image-20230515131444441" style="zoom: 50%;" />



<img src="/image-20230515132300434.png" position="absolute" left="870px" top="20px" alt="image-20230515132300434" style="zoom:50%;" />

---
layout: two-cols
hideInToc: true
---

# Background
1. Frame Rendering
2. **Scheduling**
3. Governing


Energy Aware Scheduling (or EAS) gives the scheduler the ability to predict the impact of its decisions on the energy consumed by CPUs. 

EAS relies on an Energy Model (EM) of the CPUs to select an energy efficient CPU for each task, with a minimal impact on throughput.

<img src="/EAS-image-15-421-af9b56.jpg" alt="AES blog image 15" align="right" style="zoom: 50%;" />

::right:: 

![Energy Aware Scheduling (EAS) progress update | Blog | Linaro](/EAS-image-14-469-e2a073.jpg)

EAS considers the energy costs of the two options:
* CPU#1: operating point must be moved up for both CPU#0 and CPU#1
* CPU#3: no operating point change, but higher power may be used 

---
hideInToc: true
---

# Background
1. Frame Rendering
2. Scheduling
3. **Governing**

<br>

<br>

<br>

![image-20230515155346597](/image-20230515155346597.png)



<img src="/DVFS-levels-and-Intel-P-states.png" alt="DVFS levels and Intel P-states | Download Scientific Diagram" position="absolute" left="1300px" top="50px" style="zoom:45%;" />

---
hideInToc: true
transition: fade-out
---

# Background

1. Frame Rendering
2. Scheduling
3. **Governing**

<br>

<br>


According to different purposes, there are many different governors on mobile devices to choose from. 
* performance governor sets the frequency to the maximum for best performance.
* powersave governor sets the frequency to the lowest value to save power as much as possible. 
* ondemand governor sets the CPU frequency depending on the current system load.
* **schedutil** adjusts the frequency based on the computing capacity of the cluster and the maximum load within the cluster.


---


# Motivation

* ## Scheduler -> Utilization -> Power

* ## Governor -> Utilization -> Perf/Power


<v-click>

<AutoFitText :max="120" :min="100" color="red" modelValue="FPS != Utilization"/>

* QoE-related threads' utlization may be low -> <text> QoE Degradation </text>
* QoE-unrelated threads' utlization may be high -> <text> Power Wastage </text>

</v-click>

<style>
text {
  color: red
}
</style>

---
hideInToc: true
---

# Motivation

Unwareness of QoE

1. Decouple Design of Governing and QoE
2. Decouple Design of Scheduling and QoE
3. Decouple Design of Governing and Scheduling

We conduct some measurements on Google Pixel 3. 



* Foreground APP: We use TikTok, Youtube, and Netflix applications as foreground applications with a target QoE of 60 FPS.
* Background APP: In addition, we run three different loads of CPU-stress, Memory-stress and I/O-stress in the background to simulate the system load of the smartphone.


---
hideInToc: true
layout: two-cols
---

# Motivation

Unwareness of QoE

1. **Decouple Design of Governing and QoE**
2. Decouple Design of Scheduling and QoE
3. Decouple Design of Governing and Scheduling

<br>

<br>

We use three applications as foreground applications, and the CPU stress runs in the background.

* *optimal*: traversing all the frequency points, we can find the frequency point that meets the user’s QoE and consumes the least power.
* *native*: schedutil

::right::

![image-20230516101732241](/image-20230516101732241.png)


---
hideInToc: true
layout: two-cols
---

# Motivation

Unwareness of QoE

1. Decouple Design of Governing and QoE
2. **Decouple Design of Scheduling and QoE**
3. Decouple Design of Governing and Scheduling

<br>

<br>

We use TikTok as the foreground application and run three different stress programs in the background.

* *optimal*: traversing all possible core assignments for threads, we select a scheduling policy that satisfies QoE and minimizes power consumption.
* *native*: EAS

::right::

![image-20230516102300335](/image-20230516102300335.png)


---
hideInToc: true
layout: two-cols
transition: fade-out
---

# Motivation

Unwareness of QoE

1. Decouple Design of Governing and QoE
2. Decouple Design of Scheduling and QoE
3. **Decouple Design of Governing and Scheduling**

<br>

<br>

We use TikTok as the foreground application.



::right::

![image-20230516102632131](/image-20230516102632131.png)

* U: UI Thread
* R: Render Thread
* SF: SurfaceFligner
* b: big cluster
* L: LITTLE cluster
* n: native choice

---
transition: fade-out
---

# Design

<img src="/image-20230516103317253.png" position="absolute" left="100px" top="200px" style="zoom:80%;" />

---


# Evaluation

* Testbed: Google Pixel 3 (4 + 4)
* Workloads: 
  * light: no background APP
  * medium: background APP
  * heavy: background + foreground APP

* Baselines:
	* Android default uses EAS scheduling algorithm and schedutil governing scheme.
	* SmartBalance uses the scheduling strategy with the best energy efficiency according to the IPS and power of different clusters of tasks.
	* zTT adopts a reinforcement learning algorithm to optimize governing.
	* AdaMD designs an adaptive thread-to-core mapping for each performance-constrained application and a DVFS algorithm to handle workload variations.

<img src="/image-20230516104943125.png" position="absolute" left="900px" top="150px" style="zoom:50%;" />

<img src="/image-20230516110025009.png" position="absolute" left="1660px" top="650px" style="zoom:30%;" />


---
hideInToc: true
---

# Evaluation

<img src="/image-20230516104549958.png" position="absolute" left="220px" top="250px" style="zoom:40%;" />

<img src="/image-20230516110221144.png" position="absolute" left="220px" top="800px" style="zoom:40%;" />

