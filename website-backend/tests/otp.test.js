import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

test('OTP generation, bcrypt hashing, and verification flow', async () => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  assert.equal(otp.length, 6);
  assert.equal(/^\d{6}$/.test(otp), true);

  const hash = await bcrypt.hash(otp, 10);
  assert.equal(await bcrypt.compare(otp, hash), true);
  assert.equal(await bcrypt.compare('000000', hash), false);
});

test('OTP expiry time calculation (10 minutes window)', () => {
  const now = Date.now();
  const expiresAt = new Date(now + 10 * 60 * 1000);
  assert.equal(expiresAt.getTime() > now, true);
  assert.equal(Math.round((expiresAt.getTime() - now) / 60000), 10);
});

