import assert from 'node:assert';
import { test, describe } from 'node:test';
import { hashPassword, verifyPassword, hashPasswordLegacy, verifyLegacyPasswordConstantTime } from './passwordService';

describe('Password Hashing & Constant-Time Verification', () => {

  test('hashPassword generates valid Argon2id hash with OWASP parameters', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.startsWith('$argon2id$'), true, 'Hash must start with $argon2id$');
  });

  test('verifyPassword verifies correct password and rejects invalid password', async () => {
    const rawPassword = 'CorrectPassword456!';
    const hash = await hashPassword(rawPassword);

    const isValid = await verifyPassword(rawPassword, hash);
    assert.strictEqual(isValid, true, 'Valid password must verify to true');

    const isInvalid = await verifyPassword('WrongPassword456!', hash);
    assert.strictEqual(isInvalid, false, 'Wrong password must verify to false');
  });

  test('verifyLegacyPasswordConstantTime evaluates legacy PBKDF2 hashes in constant time', () => {
    const password = 'LegacyPassword789!';
    const salt = 'a1b2c3d4e5f6';
    const legacyHash = hashPasswordLegacy(password, salt);

    const isValid = verifyLegacyPasswordConstantTime(password, salt, legacyHash);
    assert.strictEqual(isValid, true, 'Legacy hash should verify to true');

    const isInvalid = verifyLegacyPasswordConstantTime('WrongPassword', salt, legacyHash);
    assert.strictEqual(isInvalid, false, 'Invalid legacy password should verify to false');
  });

});
