// Turns the k6 --summary-export JSON into a Markdown table for the job summary.
import { readFileSync } from 'node:fs';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/perf-summary.mjs <k6-summary.json>');
  process.exit(1);
}

const { metrics } = JSON.parse(readFileSync(file, 'utf8'));
const ms = (value) => (typeof value === 'number' ? `${value.toFixed(1)} ms` : 'n/a');
const duration = metrics.http_req_duration ?? {};
const failed = metrics.http_req_failed?.value ?? 0;
const checks = metrics.checks?.value ?? 0;

console.log('### Performance budget (k6)\n');
console.log('| Metric | Result |');
console.log('| --- | --- |');
console.log(`| Requests | ${metrics.http_reqs?.count ?? 'n/a'} |`);
console.log(`| p95 latency | ${ms(duration['p(95)'])} |`);
console.log(`| p99 latency | ${ms(duration['p(99)'])} |`);
console.log(`| Failed requests | ${(failed * 100).toFixed(2)} % |`);
console.log(`| Checks passed | ${(checks * 100).toFixed(2)} % |`);
