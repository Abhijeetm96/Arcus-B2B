import { addUser, getUserByEmail, updateUser, deleteUserByEmail } from '../server/src/db';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import assert from 'assert';
import { execSync } from 'child_process';

function hashPasswordLegacy(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function run() {
  console.log('--- PART A: TESTING JWT_SECRET FAIL-FAST ---');
  try {
    console.log('Testing JWT_SECRET fail-fast...');
    const cleanEnv = { ...process.env };
    delete cleanEnv.JWT_SECRET;
    
    execSync('npx ts-node -P server/tsconfig.json -e "require(\'./server/src/utils/jwt\')"', { 
      stdio: 'pipe',
      env: cleanEnv
    });
    console.error('FAIL: Server did not throw when JWT_SECRET was missing!');
    process.exit(1);
  } catch (err: any) {
    const errorString = err.stderr ? err.stderr.toString() : err.message;
    assert(errorString.includes('JWT_SECRET environment variable is not set!'));
    console.log('PASS: Server successfully failed to start without JWT_SECRET.');
  }

  console.log('\n--- PART B: TESTING PBKDF2 TO ARGON2 MIGRATION ---');
  const testEmail = 'migration-test-user@arcus.com';
  const testPassword = 'TestPassword123!';
  const legacySalt = crypto.randomBytes(16).toString('hex');
  const legacyHash = hashPasswordLegacy(testPassword, legacySalt);

  console.log('Seeding legacy PBKDF2 user...');
  await deleteUserByEmail(testEmail);

  await addUser({
    name: 'Migration Test',
    email: testEmail,
    phone: '+919999988888',
    passwordHash: legacyHash,
    passwordSalt: legacySalt,
    role: 'USER',
    customerType: 'INDIVIDUAL',
    email_verified: true
  });

  console.log('Verifying login with legacy credentials...');
  const user = await getUserByEmail(testEmail);
  assert(user, 'User should exist in database');

  let isValid = false;
  let needsMigration = false;
  
  if (user.passwordHash && user.passwordHash.startsWith('$argon2')) {
    isValid = await argon2.verify(user.passwordHash, testPassword);
  } else {
    const computedLegacyHash = hashPasswordLegacy(testPassword, user.passwordSalt);
    isValid = (computedLegacyHash === user.passwordHash);
    if (isValid) {
      needsMigration = true;
    }
  }

  assert(isValid, 'Legacy password verification should succeed');
  assert(needsMigration, 'Should flag legacy password for migration');

  console.log('Migrating password to Argon2...');
  if (needsMigration) {
    const argonHash = await argon2.hash(testPassword);
    await updateUser(user.id!, {
      passwordHash: argonHash,
      passwordSalt: 'argon2'
    });
  }

  console.log('Verifying login using migrated Argon2 credentials...');
  const updatedUser = await getUserByEmail(testEmail);
  assert(updatedUser, 'Updated user should exist');
  assert(updatedUser.passwordHash.startsWith('$argon2'), 'Password hash should be in Argon2 format');
  assert(updatedUser.passwordSalt === 'argon2', 'Password salt should be updated to argon2 placeholder');

  const verifyArgon = await argon2.verify(updatedUser.passwordHash, testPassword);
  assert(verifyArgon, 'Argon2 verification should succeed');

  await deleteUserByEmail(testEmail);
  console.log('PASS: PBKDF2 to Argon2 migration verified successfully!');
}

run().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
