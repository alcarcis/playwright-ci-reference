// Prints a Markdown summary of a Playwright JSON report (used for $GITHUB_STEP_SUMMARY).
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'results.json';
const { stats } = JSON.parse(readFileSync(file, 'utf8'));
const { expected = 0, unexpected = 0, flaky = 0, skipped = 0, duration = 0 } = stats;
const status =
  unexpected > 0 ? '❌ Failed' : flaky > 0 ? '⚠️ Passed with flaky tests' : '✅ Passed';

console.log(`## Test results: ${status}\n`);
console.log('| Passed | Failed | Flaky | Skipped | Duration |');
console.log('| ---: | ---: | ---: | ---: | ---: |');
console.log(
  `| ${expected} | ${unexpected} | ${flaky} | ${skipped} | ${(duration / 1000).toFixed(1)} s |`,
);
console.log('\nFull HTML report: download the `playwright-report` artifact of this run.');
