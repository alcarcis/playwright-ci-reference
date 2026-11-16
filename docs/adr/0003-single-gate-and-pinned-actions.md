# ADR 3 — One required check and SHA-pinned actions

**Status:** accepted

## Context

Branch protection that lists individual job names breaks whenever a job is renamed, split or added. Separately, third-party actions referenced by tag can change under the same tag.

## Decision

- Add a final `CI gate` job that depends on every other job and fails if any of them failed, was cancelled or was skipped. It is the only required status.
- Pin every third-party action to a full commit SHA, with the human-readable version as a comment. Keep default workflow permissions at `contents: read` and grant more per job only where needed.

## Consequences

- The pipeline can evolve without touching repository settings.
- Updating an action is a deliberate, reviewable change (a Dependabot config for `github-actions` can propose the bumps).
- Slightly noisier workflow files in exchange for a smaller supply-chain surface.
