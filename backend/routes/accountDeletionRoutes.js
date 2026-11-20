import express from 'express';
import rateLimit from 'express-rate-limit';

import { asyncRoute, sendError } from '../utils/httpError.js';
import { writeAudit } from '../utils/auditLogger.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import {
  GRACE_DAYS,
  deletionStatus,
  requestDeletion,
} from '../services/accountDeletionService.js';

/**
 * The public half of account deletion — the only tenant-data endpoints
 * that are deliberately reachable without a session.
 *
 * These are mounted on the MAIN API at /api/account, because the page
 * that calls them is on the marketing website (happypix.com.au), not the
 * CRM. Authorisation is the account password, checked server-side; the
 * website never holds a token.
 *
 * Two limits, both tight: a password endpoint on the open internet is a
 * credential-stuffing target, and the status endpoint would otherwise be
 * an account-enumeration oracle if it were cheap to poll.
 */
const router = express.Router();

const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many deletion requests from this address. Try again in an hour.', code: 'RATE_LIMITED' },
});

const statusLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many lookups from this address. Try again in an hour.', code: 'RATE_LIMITED' },
});

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.ip || null;
}

/** What the page shows before anything is typed. */
router.get(
  '/policy',
  asyncRoute(async (_req, res) => {
    res.json({
      graceDays: GRACE_DAYS,
      // The page renders these two sentences verbatim, so the wording
      // lives with the rule rather than in a translation of it.
      // "after 7 days", never "in 7 days": the sweep runs once a day, so the
      // purge lands somewhere in the following 24 hours. Promising an exact
      // moment would be a promise this deployment cannot keep.
      notice:
        'Your account is scheduled for deletion. The 7-day window starts now, and sign in to the CRM at any time before it closes to stop the deletion.',
      stopPath: 'Sign in to the CRM and the deletion is cancelled automatically.',
    });
  }),
);

/**
 * Request deletion. Body: { email, password, confirm }.
 * `confirm` must be the literal string "DELETE" — the slide control on
 * the page cannot be completed without it, and the server does not trust
 * the browser to enforce that.
 */
router.post(
  '/request',
  requestLimiter,
  asyncRoute(async (req, res) => {
    const { email, password, confirm } = req.body || {};
    if (String(confirm || '') !== 'DELETE') {
      return res.status(400).json({
        error: 'Slide the confirmation across to enable deletion.',
        code: 'CONFIRMATION_REQUIRED',
      });
    }

    const result = await requestDeletion({
      email,
      password,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || null,
    });

    // The audit log outlives the tenant — it is one of the two retained
    // collections — so this record is what survives to explain the gap.
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });
    await writeAudit({
      actorId: user ? user._id : null,
      actorName: user ? user.name : String(email || 'unknown'),
      actorRole: user ? user.role : 'ORG_ADMIN',
      organizationId: user ? user.organizationId : null,
      action: 'organization.deletion.requested',
      entity: 'organization',
      summary: result.alreadyPending
        ? `Deletion re-confirmed for “${result.organizationName}” (already scheduled)`
        : `Deletion requested for “${result.organizationName}” — scheduled for ${new Date(result.scheduledFor).toISOString().slice(0, 10)}`,
      severity: 'danger',
      ip: clientIp(req),
    });

    res.json({
      ok: true,
      alreadyPending: result.alreadyPending,
      organizationName: result.organizationName,
      scheduledFor: result.scheduledFor,
      graceDays: GRACE_DAYS,
      message: result.alreadyPending
        ? `${result.organizationName} is already scheduled for deletion. Sign in to the CRM to stop it.`
        : `Your account is under deletion. It will be deleted in ${GRACE_DAYS} days. Sign in to the CRM to stop the deletion.`,
    });
  }),
);

/** Public status, by registered organization email. */
router.get(
  '/status',
  statusLimiter,
  asyncRoute(async (req, res) => {
    const result = await deletionStatus({ email: req.query.email });
    res.json(result);
  }),
);

/**
 * Cancel from the public page. Requires the password again — the page
 * must not become a "cancel anyone's deletion" button — and is offered
 * only after the status lookup has confirmed a pending request.
 */
router.post(
  '/cancel',
  requestLimiter,
  asyncRoute(async (req, res) => {
    const { email, password } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalized });
    if (!user || !(await user.comparePassword(String(password || '')))) {
      return res.status(401).json({ error: 'Those details do not match an account.', code: 'INVALID_CREDENTIALS' });
    }
    const org = user.organizationId ? await Organization.findById(user.organizationId) : null;
    if (!org || !org.deletionRequestedAt || org.deletionCancelledAt) {
      return res.status(400).json({ error: 'There is no pending deletion for this account.', code: 'NOTHING_TO_CANCEL' });
    }
    org.deletionCancelledAt = new Date();
    org.deletionCancelledByUserId = user._id;
    org.deletionScheduledFor = null;
    if (org.status === 'paused') org.status = 'active';
    await org.save();

    await writeAudit({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      organizationId: org._id,
      action: 'organization.deletion.cancelled',
      entity: 'organization',
      summary: `Deletion cancelled for “${org.name}” from the website`,
      ip: clientIp(req),
    });

    res.json({ ok: true, message: 'Deletion cancelled. Your account is active again.' });
  }),
);

export default router;
