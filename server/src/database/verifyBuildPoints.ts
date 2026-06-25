import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { readJsonDb, usePostgres } from './db';

const connectionString = process.env.DATABASE_URL;

async function run() {
  console.log('🔍 Starting BuildPoints Integrity Verification...');
  const reportPath = path.join('C:', 'Users', 'abhis', '.gemini', 'antigravity-ide', 'brain', '147ec9a2-e5b6-4d99-9f6e-5365a3a3af66', 'buildpoints_integrity_report.md');
  
  let totalUsers = 0;
  let mismatchedUsersCount = 0;
  const discrepancies: Array<{ userId: string; email: string; walletBalance: number; ledgerSum: number }> = [];

  if (usePostgres && connectionString) {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const res = await pool.query(`
        SELECT 
          u.id, 
          u.email, 
          COALESCE(w.balance, 0) AS wallet_balance, 
          COALESCE(SUM(l.points), 0)::integer AS ledger_sum
        FROM users u
        LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
        LEFT JOIN buildpoints_ledger l ON w.user_id = l.wallet_user_id
        GROUP BY u.id, u.email, w.balance;
      `);

      totalUsers = res.rows.length;
      for (const row of res.rows) {
        if (row.wallet_balance !== row.ledger_sum) {
          mismatchedUsersCount++;
          discrepancies.push({
            userId: row.id,
            email: row.email,
            walletBalance: row.wallet_balance,
            ledgerSum: row.ledger_sum
          });
        }
      }
    } catch (err) {
      console.error('PostgreSQL query error:', err);
      process.exit(1);
    } finally {
      await pool.end();
    }
  } else {
    // JSON DB fallback mode
    const db = await readJsonDb();
    const users = db.users || [];
    totalUsers = users.length;

    for (const u of users) {
      const wallet = db.buildpoints_wallets?.find((w: any) => w.userId === u.id);
      const ledger = db.buildpoints_ledger?.filter((l: any) => l.walletUserId === u.id) || [];
      const walletBalance = wallet ? wallet.balance : 0;
      const ledgerSum = ledger.reduce((sum: number, entry: any) => sum + entry.points, 0);

      if (walletBalance !== ledgerSum) {
        mismatchedUsersCount++;
        discrepancies.push({
          userId: u.id,
          email: u.email,
          walletBalance,
          ledgerSum
        });
      }
    }
  }

  // Generate markdown report
  let md = `# BuildPoints wallet-ledger Integrity Report\n\n`;
  md += `* **Generated on**: ${new Date().toISOString()}\n`;
  md += `* **Database Mode**: ${usePostgres ? 'PostgreSQL (Neon)' : 'Local JSON Fallback'}\n`;
  md += `* **Total Users Audited**: ${totalUsers}\n`;
  md += `* **Total Discrepancies Found**: ${mismatchedUsersCount}\n\n`;
  md += `## Integrity Status: ${mismatchedUsersCount === 0 ? '🟢 PASSED' : '🔴 FAILED'}\n\n`;

  if (mismatchedUsersCount === 0) {
    md += `> [!NOTE]\n`;
    md += `> All users have perfectly matched wallet balance and transaction ledger sum. \`wallet.balance = SUM(ledger.points)\` holds true for all records.\n`;
  } else {
    md += `> [!WARNING]\n`;
    md += `> Discrepancies were detected for the following accounts. These must be resolved individually before database cleanup approval.\n\n`;
    md += `| User ID | Email | Wallet Balance | Ledger Transaction Sum | Discrepancy |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    for (const d of discrepancies) {
      md += `| \`${d.userId}\` | ${d.email} | ${d.walletBalance} | ${d.ledgerSum} | ${d.walletBalance - d.ledgerSum} |\n`;
    }
  }

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`✅ BuildPoints integrity report written to: ${reportPath}`);
}

run();
