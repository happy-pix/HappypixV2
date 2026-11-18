import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import {
  issueAccessToken, issueRefreshToken, hashToken, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_DAYS,
} from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshSchema, eventCreateSchema } from '../schemas/index.js';

test('Two-Token System — issueAccessToken generates a valid 15-minute JWT', () => {
  process.env.JWT_SECRET = 'test-secret-key-32-bytes-minimum-happypix';
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    role: 'ORG_ADMIN',
    organizationId: '507f1f77bcf86cd799439022',
    sessionVersion: 1,
  };

  const token = issueAccessToken(mockUser);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(decoded.id, mockUser._id);
  assert.equal(decoded.role, 'ORG_ADMIN');
  assert.equal(decoded.organizationId, mockUser.organizationId);
  assert.equal(decoded.type, 'access');

  // Verify expiry is ~15 minutes (900 seconds)
  const diffSec = decoded.exp - decoded.iat;
  assert.equal(diffSec, 15 * 60);
});

test('Two-Token System — issueRefreshToken creates hashed token and prunes expired', async () => {
  const mockUser = {
    refreshTokens: [
      { tokenHash: 'old-expired-hash', expiresAt: new Date(Date.now() - 1000) },
    ],
  };

  const rawToken = await issueRefreshToken(mockUser, '127.0.0.1');
  assert.ok(typeof rawToken === 'string' && rawToken.length >= 64);

  // The expired token should be pruned
  assert.equal(mockUser.refreshTokens.length, 1);
  const activeEntry = mockUser.refreshTokens[0];
  assert.equal(activeEntry.tokenHash, hashToken(rawToken));
  assert.ok(activeEntry.expiresAt > new Date(Date.now() + 29 * 24 * 60 * 60 * 1000));
  assert.equal(activeEntry.deviceInfo, '127.0.0.1');
});

test('Validation Middleware — passes valid payload and sanitizes req.body', () => {
  const schema = z.object({
    name: z.string().trim(),
    age: z.number().int().positive(),
  });

  const middleware = validate(schema);
  const req = { body: { name: '  Test User  ', age: 25, extra: 'dropped' } };
  let nextCalled = false;
  const res = {
    status: () => res,
    json: () => res,
  };

  middleware(req, res, () => { nextCalled = true; });
  assert.ok(nextCalled);
  assert.equal(req.body.name, 'Test User');
  assert.equal(req.body.age, 25);
});

test('Validation Middleware — rejects invalid payload with 400 and VALIDATION_ERROR code', () => {
  const schema = z.object({
    name: z.string('Event name is required.').min(1, 'Event name is required.'),
  });

  const middleware = validate(schema);
  const req = { body: {} };
  let statusCode = null;
  let jsonPayload = null;
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (payload) => { jsonPayload = payload; return res; },
  };

  middleware(req, res, () => {});
  assert.equal(statusCode, 400);
  assert.equal(jsonPayload.code, 'VALIDATION_ERROR');
  assert.equal(jsonPayload.error, 'Event name is required.');
});

test('Central Schemas — eventCreateSchema enforces required event name and passthrough', () => {
  const invalid = eventCreateSchema.safeParse({});
  assert.equal(invalid.success, false);

  const valid = eventCreateSchema.safeParse({
    name: 'Diwali Photo Booth 2026',
    clientName: 'Sharma Wedding',
    digitalCopy: true,
    customField: 'allowed',
  });
  assert.equal(valid.success, true);
  assert.equal(valid.data.name, 'Diwali Photo Booth 2026');
  assert.equal(valid.data.customField, 'allowed');
});

test('Central Schemas — refreshSchema requires refreshToken string', () => {
  const invalid = refreshSchema.safeParse({});
  assert.equal(invalid.success, false);

  const valid = refreshSchema.safeParse({ refreshToken: 'mock-refresh-token-value' });
  assert.equal(valid.success, true);
  assert.equal(valid.data.refreshToken, 'mock-refresh-token-value');
});
