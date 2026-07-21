import assert from 'node:assert';
import { test, describe } from 'node:test';
import { checkIpThrottled, getAccountLockState, recordAccountFailure, recordAccountSuccess } from './bruteForceGuard';

describe('Layer 1 & Layer 2 Brute Force Security Guard', () => {

  test('Layer 1 (Per-IP): Allows normal login requests and throttles after 10 attempts in 60 seconds', () => {
    const testIp = `192.168.10.${Math.floor(Math.random() * 200 + 10)}`;

    // First 10 requests are allowed
    for (let i = 1; i <= 10; i++) {
      const throttled = checkIpThrottled(testIp);
      assert.strictEqual(throttled, false, `Request ${i} should be allowed`);
    }

    // 11th request is throttled
    const isThrottled = checkIpThrottled(testIp);
    assert.strictEqual(isThrottled, true, '11th request should be throttled');
  });

  test('Layer 2 (Per-Account): Applies progressive delays and triggers lockout on 5th failed attempt', async () => {
    const testEmail = `target_user_${Date.now()}@arcus.com`;
    const testIp = '10.0.0.1';

    // Initial state: unlocked, 0 failures
    let state = getAccountLockState(testEmail);
    assert.strictEqual(state.isLocked, false);
    assert.strictEqual(state.failures, 0);

    // Failures 1-3: no delay
    const delay1 = await recordAccountFailure(testEmail, testIp);
    assert.strictEqual(delay1, 0);

    const delay2 = await recordAccountFailure(testEmail, testIp);
    assert.strictEqual(delay2, 0);

    const delay3 = await recordAccountFailure(testEmail, testIp);
    assert.strictEqual(delay3, 0);

    // 4th failure: 500ms progressive delay
    const delay4 = await recordAccountFailure(testEmail, testIp);
    assert.strictEqual(delay4, 500);

    state = getAccountLockState(testEmail);
    assert.strictEqual(state.isLocked, false);
    assert.strictEqual(state.failures, 4);

    // 5th failure: 1500ms progressive delay + 15 minute lockout
    const delay5 = await recordAccountFailure(testEmail, testIp);
    assert.strictEqual(delay5, 1500);

    state = getAccountLockState(testEmail);
    assert.strictEqual(state.isLocked, true);
    assert.strictEqual(state.failures, 5);
    assert.strictEqual(state.remainingLockoutMs > 0, true);
  });

  test('Successful login clears failure count and account lockout state', async () => {
    const testEmail = `recovering_user_${Date.now()}@arcus.com`;
    const testIp = '10.0.0.2';

    // Cause failures
    await recordAccountFailure(testEmail, testIp);
    await recordAccountFailure(testEmail, testIp);

    let state = getAccountLockState(testEmail);
    assert.strictEqual(state.failures, 2);

    // Record success
    recordAccountSuccess(testEmail);

    state = getAccountLockState(testEmail);
    assert.strictEqual(state.failures, 0);
    assert.strictEqual(state.isLocked, false);
  });

});
