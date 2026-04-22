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
date: "2026-01-01T00:00:00Z"
doi: ""


# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ["paper-conference"]

# Publication name and optional abbreviated publication name.
publication: In *USENIX Symposium on Operating Systems Design and Implementation (OSDI)*
publication_short: In *OSDI*

abstract: Modern mobile CPUs typically adopt asymmetric multi-core architectures, where the large performance gap between big and little cores becomes a key bottleneck for on-device DNN inference. Existing inference engines fail to fully exploit all cores because naive parallelization suffers from load imbalance, while big-core-only execution wastes little-core compute capacity. We present SANI, an asymmetry-aware scalable DNN inference system for mobile CPUs. SANI combines core-aware task partitioning that matches per-core compute capability, dynamic load scheduling that rebalances work at runtime, and asymmetry-aware kernel transformation that reshapes operator implementations for heterogeneous cores. The evaluation on commercial mobile SoCs shows that SANI effectively balances core utilization, substantially reducing inference latency and energy consumption compared with state-of-the-art mobile inference engines.

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
url_source: ''
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
