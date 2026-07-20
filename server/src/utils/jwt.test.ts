import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateToken, verifyToken } from './jwt';

describe('JWT Service Tests', () => {
  test('should generate a token with three dot-separated parts', () => {
    const token = generateToken('user-id-123');
    assert.strictEqual(typeof token, 'string');
    const parts = token.split('.');
    assert.strictEqual(parts.length, 3);
    assert.strictEqual(parts[0], 'user-id-123');
  });

  test('should verify a valid token and return the user ID', () => {
    const userId = 'user-id-456';
    const token = generateToken(userId);
    const verified = verifyToken(token);
    assert.strictEqual(verified, userId);
  });

  test('should return null for expired or manipulated signatures', () => {
    const token = generateToken('user-id-789');
    const parts = token.split('.');
    
    // Manipulate payload
    const manipulated = `another-user.${parts[1]}.${parts[2]}`;
    assert.strictEqual(verifyToken(manipulated), null);

    // Manipulate signature
    const badSignature = `${parts[0]}.${parts[1]}.badsignaturehere`;
    assert.strictEqual(verifyToken(badSignature), null);

    // Malformed token structure
    assert.strictEqual(verifyToken('malformed_token_string'), null);
  });
});
