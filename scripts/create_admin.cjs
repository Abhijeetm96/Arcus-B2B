const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');

const DB_FILE = path.join(__dirname, '..', 'server', 'data', 'db.json');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];
  const phone = process.env.ADMIN_PHONE || process.argv[4] || '9999999999';

  if (!email || !password) {
    console.error('Error: Admin email and password are required.');
    console.error('Usage: node scripts/create_admin.cjs <email> <password> [phone]');
    console.error('Alternatively, set environment variables: ADMIN_EMAIL and ADMIN_PASSWORD.');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const isDevDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('dev') || dbUrl.includes('test');
    if (!isDevDb) {
      console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Running create_admin script against a potentially non-development database URL: ' + dbUrl);
    }
  }

  try {
    if (!fs.existsSync(DB_FILE)) {
      console.error(`Database file not found at ${DB_FILE}`);
      return;
    }

    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(fileContent);

    if (!db.users) {
      db.users = [];
    }

    // Check if user already exists
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log(`Admin user with email ${email} already exists!`);
      // Update role and password just in case
      existingUser.role = 'Admin';
      const hash = await argon2.hash(password);
      existingUser.passwordSalt = 'argon2';
      existingUser.passwordHash = hash;
      existingUser.password_salt = 'argon2';
      existingUser.password_hash = hash;
      existingUser.email_verified = true;
      existingUser.customerType = 'BUSINESS';
      console.log(`Updated existing user to Admin.`);
    } else {
      const hash = await argon2.hash(password);
      const newAdmin = {
        id: `user_admin_${Date.now()}`,
        name: 'System Admin',
        fullName: 'System Admin',
        full_name: 'System Admin',
        email: email,
        phone: phone,
        phoneNumber: phone,
        phone_number: phone,
        email_verified: true,
        passwordSalt: 'argon2',
        passwordHash: hash,
        password_salt: 'argon2',
        password_hash: hash,
        role: 'Admin',
        customerType: 'BUSINESS',
        buildPoints: 0,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.users.push(newAdmin);
      console.log(`Created new Admin user with email "${email}"`);
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

createAdmin();
