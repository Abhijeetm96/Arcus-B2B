import { test, describe } from 'node:test';
import assert from 'node:assert';
import { encryptOrderId, decryptOrderId } from './crypto';

describe('Crypto Service Tests', () => {
  test('should successfully encrypt and decrypt order/booking IDs', () => {
    const input = 'invoice:550e8400-e29b-41d4-a716-446655440000';
    const encrypted = encryptOrderId(input);
    
    assert.strictEqual(typeof encrypted, 'string');
    assert.ok(encrypted.includes(':'));
    
    const decrypted = decryptOrderId(encrypted);
    assert.strictEqual(decrypted, input);
  });

  test('should produce distinct ciphertexts for consecutive encryptions of the same input', () => {
    const input = 'booking:123456';
    const encrypted1 = encryptOrderId(input);
    const encrypted2 = encryptOrderId(input);
    
    assert.notStrictEqual(encrypted1, encrypted2);
    assert.strictEqual(decryptOrderId(encrypted1), input);
    assert.strictEqual(decryptOrderId(encrypted2), input);
  });

  test('should throw an error when attempting to decrypt invalid token structures', () => {
    assert.throws(() => {
      decryptOrderId('invalidtoken');
    });

    assert.throws(() => {
      decryptOrderId('nothex:anotherinvalidtoken');
    });
  });
});
