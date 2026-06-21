const { Client } = require('pg');
require('dotenv').config();

async function checkDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in the environment.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.\n');

    console.log('--- USERS ---');
    const usersRes = await client.query('SELECT id, name, email, phone, role FROM users');
    console.log(JSON.stringify(usersRes.rows, null, 2));

    console.log('\n--- ORDERS ---');
    const ordersRes = await client.query('SELECT * FROM orders');
    console.log(JSON.stringify(ordersRes.rows, null, 2));

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
  }
}

checkDb();
