---
# An instance of the Experience widget.
# Documentation: https://wowchemy.com/docs/page-builder/
widget: experience

# This file represents a page section.
headless: true

# Order that this section appears on the page.
weight: 40

title: Experience
subtitle:

# Date format for experience
#   Refer to https://wowchemy.com/docs/customization/#date-format
date_format: Jan 2006

# Experiences.
#   Add/remove as many `experience` items below as you like.
#   Required fields are `title`, `company`, and `date_start`.
#   Leave `date_end` empty if it's your current employer.
#   Begin multi-line descriptions with YAML's `|2-` multi-line prefix.
experience:
  - title: Qingyun Program Intern
    company: Tencent
    company_url: 'https://www.tencent.com/'
    location: Shenzhen
    date_start: '2026-06-01'
    date_end: ''

  - title: Project Collaborator / Research Intern
    company: Huawei
    company_url: 'https://www.huawei.com/'
    location: Wuhan
    date_start: '2025-06-01'
    date_end: '2026-04-30'
    description: |2-
        * Developed frame-load-aware models, latency-aware CPU scheduling, and coordinated CPU/GPU frequency-scaling strategies.
        * Validated the system across browser, video, conferencing, and office workloads, achieving about 5% weighted device-level power savings.

  - title: Research Intern
    company: OPPO
    company_url: 'https://www.oppo.com/'
    location: Shenzhen
    date_start: '2022-02-21'
    date_end: '2022-05-20'
    description: |2-
        * Analyzed mobile-system performance and power consumption, focusing on kernel scheduling and frequency scaling.
        * Identified system bottlenecks and designed power-optimization mechanisms for subsequent scheduling and governing work.

  - title: Teaching Assistant
    company: One Student One Chip (OSCPU), Phase 3
    company_url: 'https://ysyx.oscc.cc/'
    location: Wuhan
    date_start: '2021-07-01'
    date_end: '2021-10-31'
    description: |2-
        * Taught five-stage RISC-V pipeline concepts and provided technical guidance based on the Phase 2 CPU implementation.

design:
  columns: '1'
---
