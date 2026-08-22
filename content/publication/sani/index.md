---
title: "Unleash All Cores: Asymmetry-aware Scalable DNN Inference on Mobile CPUs"
authors:
- admin
- Puyi He
- Huanghuang Liang
- Yili Gong
- Chuang Hu
- Xiaobo Zhou
- Dazhao Cheng
date: "2026-07-13T00:00:00Z"
doi: ""


# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ["paper-conference"]

# Publication name and optional abbreviated publication name.
publication: In *20th USENIX Symposium on Operating Systems Design and Implementation (OSDI)*
publication_short: In *OSDI*
ccf_rank: A

abstract: Asymmetric multiprocessing CPUs are central to mobile devices, but naive DNN scheduling across heterogeneous cores can degrade throughput because of workload imbalance. SANI combines an affinity-aware kernel issuer, an adaptive-granularity scheduler, and an on-demand kernel switcher to preserve core-kernel affinity while dynamically balancing work. Across five mobile SoCs, SANI reduces inference latency by 17.6%–23.7% on average, reaches up to 29.5% on individual models, and lowers energy consumption by up to 39% compared with state-of-the-art baselines.

# Summary. An optional shortened abstract.
# summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis posuere tellus ac convallis placerat. Proin tincidunt magna sed ex sollicitudin condimentum.

tags:
- DNN Inference
- Mobile CPU
- Asymmetric Multi-core
- Scheduling
- Systems for Machine Learning
featured: true

# links:
# - name: ""
#   url: ""
url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: 'https://www.usenix.org/conference/osdi26/presentation/sang'
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: ""
---
