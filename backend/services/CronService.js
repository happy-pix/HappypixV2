import fs from 'fs';
import path from 'path';
import Organization from '../models/Organization.js';
import { purgeDueOrganizations } from './accountDeletionService.js';

class CronService {
  /**
   * One pass of every scheduled job.
   *
   * On a long-lived server this is called hourly by start(); on Vercel it is
   * called by the `/api/cron/check-expirations` endpoint instead, because a
   * `setInterval` registered inside a serverless function dies with the
   * invocation that created it. Both callers use this method so the two paths
   * cannot drift: the endpoint previously ran only expirations and uploads and
   * silently skipped account deletion, which would have left every promised
   * seven-day deletion unexecuted in production.
   *
   * Each job is isolated — one failure is logged and the rest continue, and the
   * failed job is retried on the next pass because its inputs are unchanged.
   */
  async runScheduledJobs() {
    const results = {};
    const jobs = [
      ['expirations', () => this.checkExpirations()],
      ['uploads', () => this.cleanupLocalUploads(7)],
      ['deletions', () => this.purgeDeletedAccounts()],
    ];
    for (const [name, run] of jobs) {
      try {
        results[name] = await run();
      } catch (err) {
        console.error(`❌ Cron job “${name}” failed:`, err.message);
        results[name] = { error: err.message };
      }
    }
    return results;
  }

  start() {
    console.log('⏳ Starting background CronService...');
    // Run immediately on start
    this.runScheduledJobs();

    // Then run every hour (60 * 60 * 1000 = 3600000 ms)
    setInterval(() => {
      this.runScheduledJobs();
    }, 3600000);
  }

  /**
   * Account deletion: anything whose seven-day window has closed is archived
   * into DeletedRecord and then removed. Each tenant is handled independently:
   * one failure is logged and the sweep continues, and the failed tenant is
   * retried next pass because its dates are unchanged.
   */
  async purgeDeletedAccounts() {
    try {
      const results = await purgeDueOrganizations();
      if (!results.length) return results;
      for (const result of results) {
        if (result.error) {
          console.error(`❌ Account deletion failed for ${result.name}: ${result.error}`);
          continue;
        }
        console.log(
          `🗑️  Deleted “${result.name}”: archived as ${result.archiveId} — ` +
            Object.entries(result.removed || {})
              .map(([k, v]) => `${k} ${v}`)
              .join(', '),
        );
      }
      return results;
    } catch (error) {
      console.error('❌ Account deletion sweep failed:', error.message);
      return { error: error.message };
    }
  }

  /**
   * P3: 7-day cleanup cron job for local test photos and temporary files.
   * Cleans up temporary uploads, test files, and local session photos older than 7 days,
   * while strictly protecting persistent assets like templates and branding logos.
   */
  async cleanupLocalUploads(maxAgeDays = 7) {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) return;

      const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
      let removedFiles = 0;
      let freedBytes = 0;

      // 1. Clean uploads/temp directory
      const tempDir = path.join(uploadsDir, 'temp');
      if (fs.existsSync(tempDir)) {
        const tempFiles = fs.readdirSync(tempDir);
        for (const file of tempFiles) {
          try {
            const filePath = path.join(tempDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile() && stat.mtimeMs < cutoffTime) {
              freedBytes += stat.size;
              fs.unlinkSync(filePath);
              removedFiles++;
            }
          } catch {
            // ignore individual file error
          }
        }
      }

      // 2. Clean temporary/test photos in uploads/photos older than 7 days
      const photosDir = path.join(uploadsDir, 'photos');
      if (fs.existsSync(photosDir)) {
        const sweepDir = (dir) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              sweepDir(fullPath);
              // Clean empty directory if empty
              try {
                if (fs.readdirSync(fullPath).length === 0) {
                  fs.rmdirSync(fullPath);
                }
              } catch {}
            } else if (entry.isFile()) {
              try {
                const stat = fs.statSync(fullPath);
                const isTestFile = entry.name.startsWith('test-') || entry.name.includes('demo') || entry.name.startsWith('temp-');
                if (stat.mtimeMs < cutoffTime || (isTestFile && stat.mtimeMs < (Date.now() - 24 * 60 * 60 * 1000))) {
                  freedBytes += stat.size;
                  fs.unlinkSync(fullPath);
                  removedFiles++;
                }
              } catch {}
            }
          }
        };
        sweepDir(photosDir);
      }

      if (removedFiles > 0) {
        const mb = (freedBytes / (1024 * 1024)).toFixed(2);
        console.log(`🧹 Disk Cleanup: Removed ${removedFiles} temporary files older than ${maxAgeDays} days (${mb} MB freed).`);
      }
    } catch (err) {
      console.error('❌ CronService - cleanupLocalUploads error:', err.message);
    }
  }

  async checkExpirations() {
    try {
      const now = new Date();
      
      // 1. Check trials that have ended
      const expiredTrials = await Organization.updateMany(
        { 
          status: 'trial', 
          trialEndsAt: { $lt: now } 
        },
        { 
          $set: { status: 'expired' } 
        }
      );

      // 2. Check active plans that have expired (where planExpiresAt is not null)
      const expiredPlans = await Organization.updateMany(
        { 
          status: 'active', 
          planExpiresAt: { $ne: null, $lt: now } 
        },
        { 
          $set: { status: 'expired' } 
        }
      );

      if (expiredTrials.modifiedCount > 0 || expiredPlans.modifiedCount > 0) {
        console.log(`✅ Auto-Expiry: Expired ${expiredTrials.modifiedCount} trials and ${expiredPlans.modifiedCount} active plans.`);
      }
    } catch (error) {
      console.error('❌ CronService - checkExpirations error:', error);
    }
  }
}

export default new CronService();
