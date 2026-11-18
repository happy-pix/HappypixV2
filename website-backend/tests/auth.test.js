import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

const secret = 'test_secret_key_happypix_auth_2026';

function signJwt(payload, expiresInSec = 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  if (signature.length !== expectedSig.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

test('signJwt and verifyJwt works with valid token', () => {
  const payload = { id: 'user_123', email: 'test@happypix.in', role: 'ORG_ADMIN' };
  const token = signJwt(payload, 3600);
  assert.equal(typeof token, 'string');
  assert.equal(token.split('.').length, 3);

  const decoded = verifyJwt(token);
  assert.ok(decoded);
  assert.equal(decoded.id, 'user_123');
  assert.equal(decoded.email, 'test@happypix.in');
  assert.equal(decoded.role, 'ORG_ADMIN');
});

test('verifyJwt rejects tampered token', () => {
  const token = signJwt({ id: 'user_123' }, 3600);
  const parts = token.split('.');
  const tampered = `${parts[0]}.${parts[1]}x.${parts[2]}`;
  assert.equal(verifyJwt(tampered), null);
});

test('verifyJwt rejects expired token', () => {
  const expiredToken = signJwt({ id: 'user_123' }, -10); // expired 10s ago
  assert.equal(verifyJwt(expiredToken), null);
});

