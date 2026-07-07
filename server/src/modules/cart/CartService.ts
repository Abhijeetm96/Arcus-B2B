/**
 * @file CartService.ts
 * @description Provides business operations for syncing shopping carts and tracking abandoned carts.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';

export const CartService = {
  /**
   * Synchronizes the client cart state to the database.
   * Calculates the total value and marks the cart status as ACTIVE.
   */
  async syncCart(userId: string, items: any[]): Promise<void> {
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.qty, 10) || 0), 0);
    const itemsJson = JSON.stringify(items);
    const timestamp = new Date().toISOString();

    if (usePostgres && pgPool) {
      await pgPool.query(
        `INSERT INTO carts (id, user_id, items, total_value, updated_at, status)
         VALUES ($1, $1, $2, $3, $4, 'ACTIVE')
         ON CONFLICT (id) 
         DO UPDATE SET items = EXCLUDED.items, total_value = EXCLUDED.total_value, updated_at = EXCLUDED.updated_at, status = 'ACTIVE'`,
        [userId, itemsJson, totalValue, timestamp]
      );
    } else {
      const db = await readJsonDb();
      db.carts = db.carts || [];
      const index = db.carts.findIndex((c: any) => c.id === userId);
      const cartData = {
        id: userId,
        userId,
        items,
        totalValue,
        updatedAt: timestamp,
        status: 'ACTIVE',
        reminderSentAt: index >= 0 ? db.carts[index].reminderSentAt : null
      };

      if (index >= 0) {
        db.carts[index] = cartData;
      } else {
        db.carts.push(cartData);
      }
      await writeJsonDb(db);
    }
  },

  /**
   * Marks the cart as checked out (COMPLETED) when the user places an order.
   */
  async completeCart(userId: string): Promise<void> {
    if (usePostgres && pgPool) {
      await pgPool.query(
        `UPDATE carts SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
        [userId]
      );
    } else {
      const db = await readJsonDb();
      db.carts = db.carts || [];
      const index = db.carts.findIndex((c: any) => c.userId === userId);
      if (index >= 0) {
        db.carts[index].status = 'COMPLETED';
        db.carts[index].updatedAt = new Date().toISOString();
        await writeJsonDb(db);
      }
    }
  },

  /**
   * Retrieves active, non-empty shopping carts for administration.
   * Filters by ACTIVE status and items containing at least 1 record.
   */
  async getAbandonedCarts(): Promise<any[]> {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(`
        SELECT c.id, c.user_id as "userId", c.items, c.total_value as "totalValue", 
               c.updated_at as "updatedAt", c.status, c.reminder_sent_at as "reminderSentAt",
               u.name as "userName", u.email as "userEmail", u.phone as "userPhone", 
               COALESCE(u.city, 'Unknown') as "userCity", COALESCE(u.state, 'Unknown') as "userState", 
               u.customer_type as "customerType", u.company_name as "companyName"
        FROM carts c
        JOIN users u ON c.user_id = u.id
        WHERE c.status = 'ACTIVE' AND jsonb_array_length(c.items) > 0
        ORDER BY c.updated_at DESC
      `);
      return res.rows;
    } else {
      const db = await readJsonDb();
      const carts = Array.isArray(db.carts) ? db.carts : [];
      const users = Array.isArray(db.users) ? db.users : [];

      const activeCarts = carts.filter((c: any) => c.status === 'ACTIVE' && Array.isArray(c.items) && c.items.length > 0);
      return activeCarts.map((c: any) => {
        const u = users.find((user: any) => user.id === c.userId) || {};
        return {
          id: c.id,
          userId: c.userId,
          items: c.items,
          totalValue: c.totalValue,
          updatedAt: c.updatedAt,
          status: c.status,
          reminderSentAt: c.reminderSentAt,
          userName: u.name || 'Unknown',
          userEmail: u.email || 'Unknown',
          userPhone: u.phone || 'Unknown',
          userCity: u.city || 'Unknown',
          userState: u.state || 'Unknown',
          customerType: u.customerType || 'INDIVIDUAL',
          companyName: u.companyName || ''
        };
      }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  },

  /**
   * Sets the reminder stamp for the specified cart.
   */
  async setReminderSent(cartId: string): Promise<void> {
    const timestamp = new Date().toISOString();
    if (usePostgres && pgPool) {
      await pgPool.query(
        `UPDATE carts SET reminder_sent_at = $1 WHERE id = $2`,
        [timestamp, cartId]
      );
    } else {
      const db = await readJsonDb();
      db.carts = db.carts || [];
      const index = db.carts.findIndex((c: any) => c.id === cartId);
      if (index >= 0) {
        db.carts[index].reminderSentAt = timestamp;
        await writeJsonDb(db);
      }
    }
  }
};
