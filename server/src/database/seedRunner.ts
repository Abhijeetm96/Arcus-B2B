import { seedDevelopmentUsers } from './seedDevelopmentUsers';
import { pgPool, usePostgres, readJsonDb } from './db';
import { waitForInit } from './initDb';

/**
 * Checks if the users table (Postgres or JSON DB) is empty.
 * If empty, automatically seeds the development data.
 */
export async function checkAndSeedDevUsers(): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) {
    return; // Safety guard: never run auto-seeding in production environment
  }

  try {
    let usersEmpty = false;

    if (usePostgres && pgPool) {
      const uRes = await pgPool.query('SELECT COUNT(*)::int AS count FROM users');
      usersEmpty = uRes.rows[0].count === 0;
    } else {
      const db = await readJsonDb();
      usersEmpty = !db.users || db.users.length === 0;
    }

    if (usersEmpty) {
      console.log('🔍 Users database is empty. Automatically triggers seeding development users...');
      await seedDevelopmentUsers();
    } else {
      console.log('✅ Users database is populated. Skipping users auto-seeding.');
    }
  } catch (err: any) {
    console.error('⚠️ Startup Seeding Check failed:', err.message);
  }
}

// Enable direct script execution via ts-node / node
if (require.main === module) {
  (async () => {
    try {
      await waitForInit();
      await seedDevelopmentUsers();
      process.exit(0);
    } catch (err) {
      console.error('❌ Manual Seeding Script Failed:', err);
      process.exit(1);
    }
  })();
}
