const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'server', 'data', 'db.json');

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function createAdmin() {
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

    const email = 'admin@arcus.com';
    const password = 'adminpassword';
    const phone = '9999999999';

    // Check if user already exists
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log(`Admin user with email ${email} already exists!`);
      // Update role and password just in case
      existingUser.role = 'Admin';
      const salt = generateSalt();
      existingUser.passwordSalt = salt;
      existingUser.passwordHash = hashPassword(password, salt);
      existingUser.email_verified = true;
      existingUser.customerType = 'BUSINESS';
      console.log(`Updated existing user to Admin with password "${password}"`);
    } else {
      const salt = generateSalt();
      const hash = hashPassword(password, salt);
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
        passwordSalt: salt,
        passwordHash: hash,
        password_salt: salt,
        password_hash: hash,
        role: 'Admin',
        customerType: 'BUSINESS',
        buildPoints: 0,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.users.push(newAdmin);
      console.log(`Created new Admin user with email "${email}" and password "${password}"`);
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

createAdmin();
