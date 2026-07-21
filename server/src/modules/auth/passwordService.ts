import argon2 from 'argon2';
import crypto from 'crypto';
import { updateUser } from '../../db';

/**
 * Argon2id OWASP-recommended hashing configuration:
 * - Variant: Argon2id (hybrid data-independent and data-dependent memory access)
 * - Memory Cost: 65,536 KB (64 MB)
 * - Time Cost: 3 iterations
 * - Parallelism: 4 threads
 */
export const ARGON2ID_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/** Hash password using Argon2id with high cost parameters */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2ID_OPTIONS);
}

/** Verify password against an Argon2 / Argon2id hash using constant-time comparison */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!passwordHash || typeof passwordHash !== 'string') return false;
  try {
    return await argon2.verify(passwordHash, password);
  } catch (err) {
    console.error('[PASSWORD VERIFY ERROR]', err);
    return false;
  }
}

/**
 * Legacy PBKDF2 hash calculator
 */
export function hashPasswordLegacy(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

/**
 * Constant-time comparison for legacy PBKDF2 hashes using crypto.timingSafeEqual
 * Prevents side-channel timing attacks during password verification.
 */
export function verifyLegacyPasswordConstantTime(password: string, salt: string, expectedHash: string): boolean {
  if (!password || !salt || !expectedHash) return false;
  const legacyHashStr = hashPasswordLegacy(password, salt);
  const bufA = Buffer.from(legacyHashStr, 'utf8');
  const bufB = Buffer.from(expectedHash, 'utf8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * On-the-fly Migration Handler:
 * Rehashes existing legacy passwords (PBKDF2/plaintext) to Argon2id the next time the user logs in.
 */
export async function migrateUserPasswordToArgon2id(userId: string, plainPassword: string): Promise<boolean> {
  try {
    const newArgon2idHash = await hashPassword(plainPassword);
    await updateUser(userId, {
      passwordHash: newArgon2idHash,
      passwordSalt: 'argon2id',
    });
    console.log(`[PASSWORD MIGRATION SUCCESS] 🔐 User ID ${userId} password migrated to Argon2id.`);
    return true;
  } catch (err) {
    console.error(`[PASSWORD MIGRATION FAILED] Could not rehash password for user ID ${userId}:`, err);
    return false;
  }
}
