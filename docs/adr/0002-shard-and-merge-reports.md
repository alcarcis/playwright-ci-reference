# ADR 2 — Shard in CI and merge the reports

**Status:** accepted

## Context

Suites grow. Running everything on one machine makes the PR check slower every month, and one report per machine is hard to read.

## Decision

Run the tests in N shards (`--shard=i/N`, currently 2) with `fail-fast: false`, upload each shard's blob report, and merge them in a separate job into one HTML report and a Markdown summary. Browsers are cached by Playwright version.

## Consequences

- Wall-clock time drops roughly with the number of shards; the shard count is a single matrix value.
- A failure in one shard never hides failures in another.
- The merge job adds a short fixed cost; it is worth it once the suite takes more than a couple of minutes.
- With few tests, sharding gives little; the setup is meant to be ready before it is needed.
