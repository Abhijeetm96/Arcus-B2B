import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load env variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const salt = 'c76d0827a59b535f9736b215ae649e70';
const hash = '6877d764d4cbb63e60a9c4f1a1697a67bdf8a986302ed58acb9d6690e6355ddcbf84d7475055dcc942d6e3b11a2a1ba1539cb4490ee7dbbfa5e4a6d08348d97a';
// Password is "password"

const devUsers = [
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

async function seedPostgres() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("No DATABASE_URL found. Skipping PostgreSQL seeding.");
    return;
  }

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined
  });
  await client.connect();

  for (const u of devUsers) {
    console.log(`Seeding postgres user ${u.email}...`);
    // Delete existing user if email is taken to ensure clean insert
    await client.query("DELETE FROM users WHERE LOWER(email) = LOWER($1)", [u.email]);
    
    // Insert into users
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

    // Insert corresponding profiles
    if (u.role === 'ADMIN') {
      await client.query("DELETE FROM admin_profiles WHERE user_id = $1", [u.id]);
      await client.query(`
        INSERT INTO admin_profiles (user_id, admin_role, permissions)
        VALUES ($1, 'SUPER_ADMIN', '[]'::jsonb)
      `, [u.id]);
    }

    if (u.customerType === 'BUSINESS') {
      await client.query("DELETE FROM business_profiles WHERE user_id = $1", [u.id]);
      await client.query(`
        INSERT INTO business_profiles (user_id, company_name, gst_number, verification_status)
        VALUES ($1, $2, $3, 'APPROVED')
      `, [u.id, u.companyName, u.gstNumber]);
    } else if (u.customerType === 'PROFESSIONAL') {
      await client.query("DELETE FROM professional_profiles WHERE user_id = $1", [u.id]);
      await client.query(`
        INSERT INTO professional_profiles (user_id, service_category, experience_years, city, state, verification_status)
        VALUES ($1, $2, $3, $4, $5, 'APPROVED')
      `, [u.id, u.serviceCategory, u.experienceYears, u.city, u.state]);
    } else {
      await client.query("DELETE FROM individual_profiles WHERE user_id = $1", [u.id]);
      await client.query(`
        INSERT INTO individual_profiles (user_id, full_name, alternate_phone)
        VALUES ($1, $2, '+91 99999 99999')
      `, [u.id, u.name]);
    }

    // Initialize wallet
    await client.query("DELETE FROM buildpoints_wallets WHERE user_id = $1", [u.id]);
    await client.query(`
      INSERT INTO buildpoints_wallets (user_id, balance, tier, lifetime_points_accumulated)
      VALUES ($1, 100, 'BRONZE', 100)
    `, [u.id]);
  }

  await client.end();
  console.log("PostgreSQL seeding completed successfully.");
}

async function seedJsonDb() {
  const dbPath = path.join(__dirname, '..', '..', '..', 'server', 'data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.log("No JSON DB file found. Skipping JSON seeding.");
    return;
  }

  console.log(`Loading JSON DB from ${dbPath}...`);
  const data = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(data);

  if (!db.users) db.users = [];
  if (!db.business_profiles) db.business_profiles = [];
  if (!db.professional_profiles) db.professional_profiles = [];
  if (!db.individual_profiles) db.individual_profiles = [];
  if (!db.buildpoints_wallets) db.buildpoints_wallets = [];

  for (const u of devUsers) {
    console.log(`Seeding JSON DB user ${u.email}...`);
    // Delete existing
    db.users = db.users.filter((x: any) => x.email.toLowerCase() !== u.email.toLowerCase());
    db.business_profiles = db.business_profiles.filter((x: any) => x.userId !== u.id);
    db.professional_profiles = db.professional_profiles.filter((x: any) => x.userId !== u.id);
    db.individual_profiles = db.individual_profiles.filter((x: any) => x.userId !== u.id);
    db.buildpoints_wallets = db.buildpoints_wallets.filter((x: any) => x.userId !== u.id);

    // Insert user
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

    // Insert profiles
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

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  console.log("JSON DB seeding completed successfully.");
}

async function main() {
  try {
    await seedPostgres();
    await seedJsonDb();
    console.log("Development user seeding finished.");
  } catch (err) {
    console.error("Error seeding development users:", err);
    process.exit(1);
  }
}

main();
