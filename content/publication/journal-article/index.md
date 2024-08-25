---
title: "QoS-Aware Power Management via Scheduling and Governing Co-Optimization on Mobile Devices"
authors:
- admin
- Jinqi Yan
- Rui Xie
- Chuang Hu
- Kun Suo
- Dazhao Cheng
date: "2024-08-25T00:00:00Z"
doi: ""


# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ["article-journal"]

# Publication name and optional abbreviated publication name.
publication: In *IEEE Transactions on Mobile Computing*
publication_short: In *IEEE TMC*

abstract: Scheduling and governing are two key technologies to trade off the Quality of Service (QoS) against the power consumption on mobile devices with heterogeneous cores. However, there are still defects in the use of them, among which two of the decoupling issues are critical and need to be resolved. First, both the scheduling and governing decouple from QoS, one of the most important metrics of user experience on mobile platforms. Second, scheduling and governing also decouple from each other in mobile systems and they might weaken each other when being effective at the same time. To address the above issues, we propose Orthrus, a comprehensive QoS-aware power management approach that involves a governing approach based on deep reinforcement learning to adjust the frequency of heterogeneous cores, a scheduling algorithm based on finite state machine that assigns cores to QoS-related threads, and expert fuzzy control-based coordination mechanism between the two to manage the impact between scheduling and governing. Our proposed approach aims to minimize power consumption while guaranteeing the QoS. We implement Orthrus on Google Pixel 3 as the system service of Android and evaluate it using several widespread mobile applications. The performance evaluation demonstrates that Orthrus reduces the average power consumption by up to 35.7% compared to three state-of-the-art techniques while ensuring the QoS on mobile platforms.

# Summary. An optional shortened abstract.
# summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis posuere tellus ac convallis placerat. Proin tincidunt magna sed ex sollicitudin condimentum.

tags:
- Power management
- Quality of Service
- Scheduling
- Governing
- Mobile devices
- Reinforcement learning.
featured: true

# links:
# - name: ""
#   url: ""
url_pdf: 'uploads/Orthrus.pdf'
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
image:
  caption: 'Image credit: [**Unsplash**](https://unsplash.com/photos/jdD8gXaTZsc)'
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: [EAS]

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: example
---

{{% callout note %}}
Click the *Cite* button above to demo the feature to enable visitors to import publication metadata into their reference management software.
{{% /callout %}}

{{% callout note %}}
Create your slides in Markdown - click the *Slides* button to check out the example.
{{% /callout %}}

Add the publication's **full text** or **supplementary notes** here. You can use rich formatting such as including [code, math, and images](https://docs.hugoblox.com/content/writing-markdown-latex/).
