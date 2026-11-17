import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

test('webhook signature generation and timingSafeEqual match', () => {
  const secret = 'test_happypix_webhook_secret';
  const payload = JSON.stringify({
    event: 'order.paid',
    payload: {
      order: { entity: { id: 'order_test_12345' } },
      payment: { entity: { id: 'pay_test_67890', order_id: 'order_test_12345' } },
    },
  });

  const validSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const expectedBuf = Buffer.from(validSig);
  const signatureBuf = Buffer.from(validSig);

  assert.equal(expectedBuf.length, signatureBuf.length);
  assert.equal(crypto.timingSafeEqual(expectedBuf, signatureBuf), true);

  // Altered signature must fail
  const badSig = crypto
    .createHmac('sha256', 'wrong_secret')
    .update(payload)
    .digest('hex');
  const badBuf = Buffer.from(badSig);
  assert.equal(crypto.timingSafeEqual(expectedBuf, badBuf), false);
});

