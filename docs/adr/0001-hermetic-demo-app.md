# ADR 1 — A hermetic demo app instead of a public site

**Status:** accepted

## Context

A reference pipeline needs something to test. Public demo sites change, go down or rate-limit CI, so a red build could mean "the internet" rather than "the code".

## Decision

Ship a minimal shop (`app/`, plain Node, no dependencies) and start it from Playwright's `webServer`. The same command starts it locally and in CI.

## Consequences

- Runs are deterministic and offline; failures point at the tests or the app, not at a third party.
- Credentials come from the environment, so the same mechanism used for real systems (injected, masked, per run) is exercised.
- The app is deliberately small; it demonstrates the pipeline, not application complexity.
