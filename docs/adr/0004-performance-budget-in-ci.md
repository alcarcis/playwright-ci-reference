# 4. Performance budget in CI with k6, app run as a container

## Status

Accepted

## Context

Functional tests say the product works, not that it still works fast enough. Performance regressions are usually found late, by users. A full load test on every pull request is too slow and too noisy on shared runners, but no check at all leaves the gap open.

## Decision

- A short **k6 smoke/load test** (10 virtual users, 20 s) exercises the real purchase flow: login, browse, add to cart, checkout.
- **Thresholds are the contract**: error rate below 1 %, checks above 99 %, p95 latency below 300 ms, p99 below 600 ms. k6 exits non-zero when one is crossed, and the `perf` job fails, so the single `CI gate` fails.
- The app runs from the repository **Dockerfile** (non-root, health check, credentials injected at run time) so the test targets a deployable artifact and the image build itself is verified on every change.
- The budgets are intentionally generous: the goal is to catch order-of-magnitude regressions on shared hardware without flaky failures. Tighten them from real history, not guesses.

## Consequences

- One more parallel job (about a minute); it does not slow the Playwright shards.
- Latency numbers on hosted runners vary; a threshold failure should be re-read in the summary before being treated as a regression.
- A deeper load or soak test belongs in a scheduled workflow, not in the pull request path.
