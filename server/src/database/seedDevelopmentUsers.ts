import { pgPool, usePostgres, readJsonDb, writeJsonDb } from './db';

const salt = 'c76d0827a59b535f9736b215ae649e70';
const hash = '6877d764d4cbb63e60a9c4f1a1697a67bdf8a986302ed58acb9d6690e6355ddcbf84d7475055dcc942d6e3b11a2a1ba1539cb4490ee7dbbfa5e4a6d08348d97a';
// Password is "password"

export const devUsers = [
  {
    id: 'user_admin_test',
    name: 'System Admin',
    email: 'admin@arcus.com',
    role: 'ADMIN',
    customerType: 'BUSINESS',
    emailVerified: true,
    companyName: 'Arcus Admin Org',
    gstNumber: '29AABCP1234A1Z1',
    phone: '+91 99999 00001'
  },
  {
    id: 'user_business_test',
    name: 'Test Business',
    email: 'business@arcus.com',
    role: 'USER',
    customerType: 'BUSINESS',
    emailVerified: true,
    companyName: 'Arcus B2B Builder',
    gstNumber: '29AABCP9876C2Z3',
    phone: '+91 99999 00002'
  },
  {
    id: 'user_professional_test',
    name: 'Test Professional',
    email: 'professional@arcus.com',
    role: 'USER',
    customerType: 'PROFESSIONAL',
    emailVerified: true,
    serviceCategory: 'Plumbing',
    experienceYears: 5,
    city: 'Bangalore',
    state: 'Karnataka',
    phone: '+91 99999 00003'
  },
  {
    id: 'user_individual_test',
    name: 'Test Individual',
    email: 'individual@arcus.com',
    role: 'USER',
    customerType: 'INDIVIDUAL',
    emailVerified: true,
    phone: '+91 99999 00004'
  }
];

export async function seedDevelopmentUsers(): Promise<void> {
  console.log('🌱 Starting development users seeding...');

  if (usePostgres && pgPool) {
    console.log('Seeding PostgreSQL database...');
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      for (const u of devUsers) {
        console.log(`Seeding postgres user: ${u.email}`);
        // Delete existing to prevent primary key / unique index conflicts
        await client.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [u.email]);

        // Insert user
        await client.query(`
          INSERT INTO users (
            id, name, email, phone, password_hash, password_salt, role, email_verified, customer_type
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          u.id,
          u.name,
          u.email,
          u.phone,
          hash,
          salt,
          u.role,
          u.emailVerified,
          u.customerType
        ]);

        // Profiles
        if (u.role === 'ADMIN') {
          await client.query('DELETE FROM admin_profiles WHERE user_id = $1', [u.id]);
          await client.query(`
            INSERT INTO admin_profiles (user_id, admin_role, permissions)
            VALUES ($1, 'SUPER_ADMIN', '[]'::jsonb)
          `, [u.id]);
        }

        if (u.customerType === 'BUSINESS') {
          await client.query('DELETE FROM business_profiles WHERE user_id = $1', [u.id]);
          await client.query(`
            INSERT INTO business_profiles (user_id, company_name, gst_number, verification_status)
            VALUES ($1, $2, $3, 'APPROVED')
          `, [u.id, u.companyName, u.gstNumber]);
        } else if (u.customerType === 'PROFESSIONAL') {
          await client.query('DELETE FROM professional_profiles WHERE user_id = $1', [u.id]);
          await client.query(`
            INSERT INTO professional_profiles (user_id, service_category, experience_years, city, state, verification_status)
            VALUES ($1, $2, $3, $4, $5, 'APPROVED')
          `, [u.id, u.serviceCategory, u.experienceYears, u.city, u.state]);
        } else {
          await client.query('DELETE FROM individual_profiles WHERE user_id = $1', [u.id]);
          await client.query(`
            INSERT INTO individual_profiles (user_id, full_name, alternate_phone)
            VALUES ($1, $2, '+91 99999 99999')
          `, [u.id, u.name]);
        }

        // Wallet
        await client.query('DELETE FROM buildpoints_wallets WHERE user_id = $1', [u.id]);
        await client.query(`
          INSERT INTO buildpoints_wallets (user_id, balance, tier, lifetime_points_accumulated)
          VALUES ($1, 100, 'BRONZE', 100)
        `, [u.id]);
      }
      await client.query('COMMIT');
      console.log('✅ PostgreSQL seeding completed successfully.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Error seeding PostgreSQL:', err);
      throw err;
    } finally {
      client.release();
    }
  } else {
    console.log('Seeding JSON DB fallback file...');
    try {
      const db = await readJsonDb();
      if (!db.users) db.users = [];
      if (!db.business_profiles) db.business_profiles = [];
      if (!db.professional_profiles) db.professional_profiles = [];
      if (!db.individual_profiles) db.individual_profiles = [];
      if (!db.buildpoints_wallets) db.buildpoints_wallets = [];

      for (const u of devUsers) {
        console.log(`Seeding JSON DB user: ${u.email}`);
        // Filter out existing
        db.users = db.users.filter((x: any) => x.email.toLowerCase() !== u.email.toLowerCase());
        db.business_profiles = db.business_profiles.filter((x: any) => x.userId !== u.id);
        db.professional_profiles = db.professional_profiles.filter((x: any) => x.userId !== u.id);
        db.individual_profiles = db.individual_profiles.filter((x: any) => x.userId !== u.id);
        db.buildpoints_wallets = db.buildpoints_wallets.filter((x: any) => x.userId !== u.id);

        db.users.push({
          id: u.id,
          name: u.name,
          fullName: u.name,
          email: u.email,
          phone: u.phone,
          phoneNumber: u.phone,
          emailVerified: u.emailVerified,
          passwordHash: hash,
          passwordSalt: salt,
          role: u.role,
          customerType: u.customerType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        if (u.customerType === 'BUSINESS') {
          db.business_profiles.push({
            userId: u.id,
            companyName: u.companyName,
            gstNumber: u.gstNumber,
            verificationStatus: 'APPROVED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else if (u.customerType === 'PROFESSIONAL') {
          db.professional_profiles.push({
            userId: u.id,
            serviceCategory: u.serviceCategory,
            experienceYears: u.experienceYears,
            city: u.city,
            state: u.state,
            verificationStatus: 'APPROVED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          db.individual_profiles.push({
            userId: u.id,
            fullName: u.name,
            alternatePhone: '+91 99999 99999'
          });
        }

        db.buildpoints_wallets.push({
          userId: u.id,
          balance: 100,
          tier: 'BRONZE',
          lifetimePointsAccumulated: 100,
          updatedAt: new Date().toISOString()
        });
      }

      await writeJsonDb(db);
      console.log('✅ JSON DB seeding completed successfully.');
    } catch (err) {
      console.error('❌ Error seeding JSON DB:', err);
      throw err;
    }
  }
}
