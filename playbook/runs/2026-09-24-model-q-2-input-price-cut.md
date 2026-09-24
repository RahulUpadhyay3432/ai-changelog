# Kapyn Blog Run Report: 2026-09-24 - model-q-2-input-price-cut

- **Mission ID:** `m_e2e_happy_98769b13`
- **Playbook SHA:** `7064bd84a7cea7f68fa511857bde2a39655e9d37`
- **Agy Version:** `1.2.9`
- **Final Mission Status:** `completed`
- **Stopping Reason / Gate:** `None (Completed)`
- **Total Duration:** `9.0s`
- **Branch:** `hermes/model-q-2-input-price-cut`
- **PR URL:** https://github.com/RahulUpadhyay3432/ai-changelog/pull/71

## Steps Summary

| Step | Action | Status | Duration |
|---|---|---|---|
| 1 | `blog.load_config` | `succeeded` | `0.01s` |
| 2 | `api.call` | `succeeded` | `0.01s` |
| 3 | `llm.generate` | `succeeded` | `0.17s` |
| 4 | `blog.check` | `succeeded` | `0.00s` |
| 5 | `llm.generate` | `succeeded` | `0.18s` |
| 6 | `llm.generate` | `succeeded` | `0.18s` |
| 7 | `blog.check` | `succeeded` | `0.01s` |
| 8 | `llm.generate` | `succeeded` | `0.16s` |
| 9 | `llm.generate` | `succeeded` | `0.17s` |
| 10 | `blog.check` | `succeeded` | `0.01s` |
| 11 | `llm.generate` | `succeeded` | `0.17s` |
| 12 | `blog.check` | `succeeded` | `0.00s` |
| 13 | `llm.generate` | `succeeded` | `0.17s` |
| 14 | `image.generate` | `succeeded` | `0.52s` |
| 15 | `blog.select_hero` | `succeeded` | `0.00s` |
| 16 | `blog.assemble` | `succeeded` | `0.01s` |
| 17 | `blog.publish` | `succeeded` | `3.81s` |
| 18 | `blog.open_pr` | `succeeded` | `3.46s` |
| 19 | `blog.report` | `running` | `0.00s` |

## Models Used

- **step_11:** `gemini-3.1-pro-high`
- **step_13:** `gemini-3.8-flash-high`
- **step_3:** `gemini-3.8-flash-medium`
- **step_5:** `gemini-3.8-flash-high`
- **step_6:** `gemini-3.1-pro-high`
- **step_8:** `gemini-3.1-pro-high`
- **step_9:** `gemini-3.1-pro-high`

## Critique Scores

- **grounding:** 5/5
- **synthesis:** 4/5
- **voice:** 4/5
- **value:** 4/5
- **structure:** 4/5

## Image Candidates & Gates

- Candidate #1: passed=True, lower_left_p95=20.0
- Candidate #2: passed=True, lower_left_p95=20.0
- Candidate #3: passed=True, lower_left_p95=20.0

## Selected Hero Image: `artifacts/candidates/hero_c1.webp`
