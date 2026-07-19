import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'arcus_secure_invoice_key_32_bytes_long!!'; // must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts an order ID or details into a hex token string.
 */
export function encryptOrderId(text: string): string {
  const key = Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a hex token string back to the original order ID or details.
 */
export function decryptOrderId(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const key = Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
