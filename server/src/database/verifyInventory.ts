import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { readJsonDb, usePostgres } from './db';

const connectionString = process.env.DATABASE_URL;

interface InventoryIssue {
  type: string;
  key: string;
  details: string;
}

async function run() {
  console.log('🔍 Starting Inventory Integrity Verification...');
  const reportPath = path.join('C:', 'Users', 'abhis', '.gemini', 'antigravity-ide', 'brain', '233a70f0-524a-4ecc-ae3d-469fadd59caa', 'inventory_integrity_report.md');
  
  const issues: InventoryIssue[] = [];
  let totalVariants = 0;
  let totalInventoryRecords = 0;

  if (usePostgres && connectionString) {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      // 1. Audit stock constraints
      const stockRes = await pool.query(`
        SELECT variant_id, available_stock, reserved_stock, reorder_level
        FROM inventory
      `);
      totalInventoryRecords = stockRes.rows.length;

      for (const row of stockRes.rows) {
        const available = row.available_stock;
        const reserved = row.reserved_stock;
        const reorder = row.reorder_level;

        if (available < 0) {
          issues.push({ type: 'Negative Available Stock', key: row.variant_id, details: `Available Stock is ${available}` });
        }
        if (reserved < 0) {
          issues.push({ type: 'Negative Reserved Stock', key: row.variant_id, details: `Reserved Stock is ${reserved}` });
        }
        if (reserved > available) {
          issues.push({ type: 'Reserved Exceeds Available', key: row.variant_id, details: `Reserved (${reserved}) > Available (${available})` });
        }
        if (reorder < 0) {
          issues.push({ type: 'Negative Reorder Level', key: row.variant_id, details: `Reorder Level is ${reorder}` });
        }
      }

      // 2. Active variants missing inventory
      const activeVarRes = await pool.query(`
        SELECT v.id, v.sku, v.name
        FROM product_variants v
        LEFT JOIN inventory i ON v.id = i.variant_id
        WHERE v.status = 'ACTIVE' AND i.variant_id IS NULL
      `);
      totalVariants = (await pool.query('SELECT COUNT(*) FROM product_variants')).rows[0].count;

      for (const row of activeVarRes.rows) {
        issues.push({ type: 'Missing Inventory Record', key: row.id, details: `Active variant ${row.sku} (${row.name}) has no inventory record.` });
      }

      // 3. Orphan inventory records
      const orphanRes = await pool.query(`
        SELECT i.variant_id
        FROM inventory i
        LEFT JOIN product_variants v ON i.variant_id = v.id
        WHERE v.id IS NULL
      `);
      for (const row of orphanRes.rows) {
        issues.push({ type: 'Orphan Inventory Record', key: row.variant_id, details: `Inventory record has no corresponding product variant.` });
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
    const variants = db.product_variants || [];
    const inventory = db.inventory || [];
    totalVariants = variants.length;
    totalInventoryRecords = inventory.length;

    // 1. Audit stock constraints
    for (const inv of inventory) {
      const available = inv.availableStock;
      const reserved = inv.reservedStock;
      const reorder = inv.reorderLevel;

      if (available < 0) {
        issues.push({ type: 'Negative Available Stock', key: inv.variantId, details: `Available Stock is ${available}` });
      }
      if (reserved < 0) {
        issues.push({ type: 'Negative Reserved Stock', key: inv.variantId, details: `Reserved Stock is ${reserved}` });
      }
      if (reserved > available) {
        issues.push({ type: 'Reserved Exceeds Available', key: inv.variantId, details: `Reserved (${reserved}) > Available (${available})` });
      }
      if (reorder < 0) {
        issues.push({ type: 'Negative Reorder Level', key: inv.variantId, details: `Reorder Level is ${reorder}` });
      }
    }

    // 2. Active variants missing inventory
    for (const v of variants) {
      if (v.status === 'ACTIVE') {
        const inv = inventory.find((i: any) => i.variantId === v.id);
        if (!inv) {
          issues.push({ type: 'Missing Inventory Record', key: v.id, details: `Active variant ${v.sku} (${v.name}) has no inventory record.` });
        }
      }
    }

    // 3. Orphan inventory records
    for (const inv of inventory) {
      const v = variants.find((x: any) => x.id === inv.variantId);
      if (!v) {
        issues.push({ type: 'Orphan Inventory Record', key: inv.variantId, details: `Inventory record has no corresponding product variant.` });
      }
    }
  }

  // Generate markdown report
  let md = `# Inventory Integrity Verification Report\n\n`;
  md += `* **Generated on**: ${new Date().toISOString()}\n`;
  md += `* **Database Mode**: ${usePostgres ? 'PostgreSQL (Neon)' : 'Local JSON Fallback'}\n`;
  md += `* **Total Product Variants**: ${totalVariants}\n`;
  md += `* **Total Inventory Records**: ${totalInventoryRecords}\n`;
  md += `* **Total Integrity Issues Found**: ${issues.length}\n\n`;
  md += `## Integrity Status: ${issues.length === 0 ? '🟢 PASSED' : '🔴 FAILED'}\n\n`;

  if (issues.length === 0) {
    md += `> [!NOTE]\n`;
    md += `> All inventory integrity checks passed successfully. No negative balances, missing records, or orphaned records were found.\n`;
  } else {
    md += `> [!WARNING]\n`;
    md += `> The following inventory integrity issues were detected. These must be addressed immediately.\n\n`;
    md += `| Variant/Record ID | Issue Type | Details |\n`;
    md += `| :--- | :--- | :--- |\n`;
    for (const issue of issues) {
      md += `| \`${issue.key}\` | **${issue.type}** | ${issue.details} |\n`;
    }
  }

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`✅ Inventory integrity report written to: ${reportPath}`);
}

run();
