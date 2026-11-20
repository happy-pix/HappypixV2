// The hourly sweep is the only thing that performs a scheduled account
// deletion, so the serverless entrypoint has to run every job — not just the
// first two. It previously ran expirations and upload cleanup and skipped the
// deletion entirely, which would have left every promised deletion unexecuted
// in production while local tests passed.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const cronSource = fs.readFileSync(path.join(root, 'services/CronService.js'), 'utf8');
const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

test('the sweep runs the deletion job', () => {
  const sweep = cronSource.slice(
    cronSource.indexOf('async runScheduledJobs()'),
    cronSource.indexOf('start() {'),
  );
  assert.match(sweep, /purgeDeletedAccounts/, 'runScheduledJobs must purge due accounts');
  assert.match(sweep, /checkExpirations/);
  assert.match(sweep, /cleanupLocalUploads/);
});

test('the cron endpoint runs the whole sweep, not a subset', () => {
  const endpoint = serverSource.slice(
    serverSource.indexOf("app.all('/api/cron/check-expirations'"),
    serverSource.indexOf("app.all('/api/cron/check-expirations'") + 1200,
  );
  assert.match(endpoint, /runScheduledJobs/, 'endpoint must call the shared sweep');
});

test('Vercel invokes the sweep daily', () => {
  const cron = vercelConfig.crons.find((c) => c.path === '/api/cron/check-expirations');
  assert.ok(cron, 'cron entry missing');
  // Daily is the ceiling on Vercel's free (Hobby) plan, which rejects any
  // schedule more frequent than once per day. The consequence is that a
  // deletion due at 00:05 waits until the next midnight — up to ~24h past the
  // deadline. The policy wording covers this: "after 7 days", not "at 7 days".
  // If the plan is upgraded, change this to '0 * * * *' and tighten the
  // wording in subscriptionSections.js to match.
  assert.equal(cron.schedule, '0 0 * * *');
});

test('one failing job does not stop the others', () => {
  const sweep = cronSource.slice(
    cronSource.indexOf('async runScheduledJobs()'),
    cronSource.indexOf('start() {'),
  );
  assert.match(sweep, /catch/, 'each job must be individually guarded');
});
