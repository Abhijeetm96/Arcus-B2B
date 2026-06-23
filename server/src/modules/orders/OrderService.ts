/**
 * @file OrderService.ts
 * @description Provides business operations for managing orders, checkout logic, and order history tracking.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { Order } from './Order';
import { sanitizeText } from '../../../../shared/validation';

/**
 * Helper to enrich local JSON DB order record with normalized tables.
 * Construct a clean object containing only non-legacy fields plus the normalized ones.
 */
function enrichOrderWithNormalized(o: any, db: any, caller: string): any {
  if (!o) return null;
  const items = db.order_items?.filter((item: any) => item.orderId === o.id) || [];
  const shAddr = db.user_addresses?.find((addr: any) => addr.userId === o.userId && (addr.addressType === 'SHIPPING' || addr.addressType === 'BOTH') && addr.isDefault);
  const biAddr = db.user_addresses?.find((addr: any) => addr.userId === o.userId && (addr.addressType === 'BILLING' || addr.addressType === 'BOTH') && addr.isDefault);



  const mappedItems = items.map((item: any) => {
    const variant = db.product_variants?.find((v: any) => v.id === item.variantId);
    return {
      productId: item.variantId,
      name: variant?.name || 'Unknown',
      qty: item.quantity,
      price: item.unitPrice
    };
  });

  const constructAddressString = (addr: any) => {
    if (!addr) return null;
    return `${addr.recipientName}, ${addr.phoneNumber}, ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} - ${addr.postalCode}`;
  };

  return {
    id: o.id,
    userId: o.userId,
    timestamp: o.timestamp,
    date: o.date,
    products: o.products,
    status: o.status,
    amount: o.amount,
    gst_number: o.gstNumber || o.gst_number,
    payment_method: o.paymentMethod || o.payment_method,
    points_earned: o.pointsEarned || o.points_earned,

    variant_items: mappedItems.length > 0 ? mappedItems : undefined,
    variant_shipping_address: constructAddressString(shAddr),
    variant_billing_address: constructAddressString(biAddr)
  };
}

/**
 * Standard row mapper to construct Order objects from DB rows.
 */
export function mapRowToOrder(row: any, caller = 'OrderService'): Order {
  if (!row) return null as any;



  // 1. Items from variant_items
  let items = [];
  if (row.variant_items !== undefined && row.variant_items !== null) {
    items = typeof row.variant_items === 'string' ? JSON.parse(row.variant_items) : row.variant_items;
  }

  // 2. Shipping Address from variant_shipping_address
  const shippingAddress = row.variant_shipping_address || '';

  // 3. Billing Address from variant_billing_address
  const billingAddress = row.variant_billing_address || '';

  return {
    id: row.id,
    userId: row.user_id || row.userId,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp || row.createdAt || Date.now()).toISOString(),
    date: row.date || new Date(row.timestamp || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    products: row.products,
    status: row.status as any,
    amount: typeof row.amount === 'number' ? row.amount : parseFloat(String(row.amount).replace(/[^\d.]/g, '')) || 0,
    items,
    shippingAddress,
    billingAddress,
    gstNumber: row.gst_number || row.gstNumber || undefined,
    paymentMethod: row.payment_method || row.paymentMethod,
    pointsEarned: row.points_earned || row.pointsEarned || 0
  };
}

function parseAddressString(addressStr: string, userName: string, userPhone: string) {
  if (!addressStr || typeof addressStr !== 'string') {
    return {
      recipientName: userName,
      phoneNumber: userPhone,
      addressLine1: 'Unknown Address',
      city: 'Unknown',
      state: 'Unknown',
      postalCode: '560036'
    };
  }

  const parts = addressStr.split(',').map(p => p.trim());
  let recipientName = userName;
  let phoneNumber = userPhone;
  let addressLine1 = '';
  let city = 'Unknown';
  let state = 'Unknown';
  let postalCode = '560036';

  if (parts.length >= 4) {
    recipientName = parts[0] || userName;
    phoneNumber = parts[1] || userPhone;
    addressLine1 = parts[2] || '';
    
    const lastPart = parts[parts.length - 1];
    const zipMatch = lastPart.match(/(\d{5,6})/);
    if (zipMatch) {
      postalCode = zipMatch[1];
    }
    
    const cleanedLastPart = lastPart.replace(/[-\s]*\d{5,6}/g, '').trim();
    
    if (parts.length === 4) {
      city = cleanedLastPart || parts[3];
    } else if (parts.length === 5) {
      city = parts[3];
      state = cleanedLastPart;
    } else {
      addressLine1 += `, ${parts[3]}`;
      city = parts[4];
      state = cleanedLastPart;
    }
  } else {
    addressLine1 = parts[0] || 'Unknown';
    if (parts[1]) city = parts[1];
    const zipMatch = addressStr.match(/(\d{5,6})/);
    if (zipMatch) {
      postalCode = zipMatch[1];
    }
  }

  return {
    recipientName,
    phoneNumber,
    addressLine1,
    city,
    state,
    postalCode
  };
}

const constructAddressString = (addr: any) => {
  if (!addr) return null;
  return `${addr.recipientName || addr.recipient_name}, ${addr.phoneNumber || addr.phone_number}, ${addr.addressLine1 || addr.address_line_1}${addr.addressLine2 || addr.address_line_2 ? ', ' + (addr.addressLine2 || addr.address_line_2) : ''}, ${addr.city}, ${addr.state} - ${addr.postalCode || addr.postal_code}`;
};

/**
 * Creates and registers a new order in the system.
 * Automatically generates a unique Order ID and sets the order timestamp/date if not provided.
 * 
 * @param {Order} order - The order details to create.
 * @returns {Promise<Order>} The registered order.
 */
export async function addOrder(order: Order): Promise<Order> {
  const generatedId = order.id || `ARC-${Math.floor(10000 + Math.random() * 90000)}`;
  const timestamp = order.timestamp || new Date().toISOString();
  const formattedDate = order.date || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const finalOrder: Order = {
    ...order,
    id: generatedId,
    timestamp,
    date: formattedDate
  };

  const pointsEarned = finalOrder.pointsEarned !== undefined ? finalOrder.pointsEarned : Math.floor(finalOrder.amount / 100);



  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get user details for address parsing fallbacks
      const userRes = await client.query('SELECT name, phone FROM users WHERE id = $1', [finalOrder.userId]);
      const userName = userRes.rows[0]?.name || 'Guest';
      const userPhone = userRes.rows[0]?.phone || '';

      // 2. Insert order (excluding legacy columns)
      const orderQuery = `
        INSERT INTO orders (
          id, user_id, timestamp, date, products, status, amount,
          gst_number, payment_method, points_earned
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, user_id, timestamp, date, products, status, amount, gst_number, payment_method, points_earned
      `;
      const orderValues = [
        finalOrder.id,
        finalOrder.userId,
        finalOrder.timestamp,
        finalOrder.date,
        finalOrder.products,
        finalOrder.status,
        String(finalOrder.amount),
        finalOrder.gstNumber || null,
        finalOrder.paymentMethod,
        pointsEarned
      ];
      await client.query(orderQuery, orderValues);

      // 3. Address Deduplication: Shipping
      const shParsed = parseAddressString(finalOrder.shippingAddress, userName, userPhone);
      const existingAddressesRes = await client.query('SELECT * FROM user_addresses WHERE user_id = $1', [finalOrder.userId]);
      let shAddressId = null;

      for (const addr of existingAddressesRes.rows) {
        if (constructAddressString(addr) === constructAddressString(shParsed)) {
          shAddressId = addr.id;
          break;
        }
      }

      if (!shAddressId) {
        shAddressId = `addr_${finalOrder.userId.substring(0, 8)}_${Date.now()}_sh_${Math.random().toString(36).substring(2, 5)}`;
        await client.query(`
          INSERT INTO user_addresses (id, user_id, address_type, recipient_name, phone_number, address_line_1, city, state, postal_code, is_default)
          VALUES ($1, $2, 'SHIPPING', $3, $4, $5, $6, $7, $8, FALSE)
        `, [
          shAddressId,
          finalOrder.userId,
          shParsed.recipientName,
          shParsed.phoneNumber,
          shParsed.addressLine1,
          shParsed.city,
          shParsed.state,
          shParsed.postalCode
        ]);
      }

      // 4. Address Deduplication: Billing
      let biAddressId = null;
      if (finalOrder.shippingAddress === finalOrder.billingAddress) {
        biAddressId = shAddressId;
      } else {
        const biParsed = parseAddressString(finalOrder.billingAddress, userName, userPhone);
        for (const addr of existingAddressesRes.rows) {
          if (constructAddressString(addr) === constructAddressString(biParsed)) {
            biAddressId = addr.id;
            break;
          }
        }

        if (!biAddressId) {
          biAddressId = `addr_${finalOrder.userId.substring(0, 8)}_${Date.now()}_bi_${Math.random().toString(36).substring(2, 5)}`;
          await client.query(`
            INSERT INTO user_addresses (id, user_id, address_type, recipient_name, phone_number, address_line_1, city, state, postal_code, is_default)
            VALUES ($1, $2, 'BILLING', $3, $4, $5, $6, $7, $8, FALSE)
          `, [
            biAddressId,
            finalOrder.userId,
            biParsed.recipientName,
            biParsed.phoneNumber,
            biParsed.addressLine1,
            biParsed.city,
            biParsed.state,
            biParsed.postalCode
          ]);
        }
      }

      // 5. Insert order items
      for (const item of finalOrder.items) {
        const itemId = item.productId || item.id;
        const qty = parseInt(String(item.quantity || item.qty), 10) || 1;
        const unitPrice = parseFloat(String(item.unitPrice || item.price)) || 0;
        const taxAmt = qty * unitPrice * 0.18;
        const totalAmt = qty * unitPrice + taxAmt;

        await client.query(`
          INSERT INTO order_items (order_id, variant_id, quantity, unit_price, gst_rate, tax_amount, total_amount)
          VALUES ($1, $2, $3, $4, 18.00, $5, $6)
          ON CONFLICT (order_id, variant_id) DO NOTHING
        `, [finalOrder.id, itemId, qty, unitPrice, taxAmt, totalAmt]);
      }

      // 6. BuildPoints & Ledger updates
      if (pointsEarned > 0) {
        const ledgerRes = await client.query(`
          INSERT INTO buildpoints_ledger (wallet_user_id, points, transaction_type, reference_type, description, reference_id)
          VALUES ($1, $2, 'EARNED', 'ORDER', $3, $4)
          ON CONFLICT (wallet_user_id, reference_type, reference_id, transaction_type) DO NOTHING
          RETURNING id
        `, [finalOrder.userId, pointsEarned, `Earned from checkout order ${finalOrder.id}`, finalOrder.id]);

        if (ledgerRes.rows.length > 0) {
          // Update buildpoints_wallets balance
          await client.query(`
            INSERT INTO buildpoints_wallets (user_id, balance, tier, lifetime_points_accumulated, updated_at)
            VALUES ($1, $2, 'BRONZE', $2, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
              balance = buildpoints_wallets.balance + EXCLUDED.balance,
              lifetime_points_accumulated = buildpoints_wallets.lifetime_points_accumulated + EXCLUDED.balance,
              updated_at = CURRENT_TIMESTAMP
          `, [finalOrder.userId, pointsEarned]);
        }
      }

      await client.query('COMMIT');
      return finalOrder;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = await readJsonDb();
    if (!db.orders) db.orders = [];
    if (!db.user_addresses) db.user_addresses = [];
    if (!db.order_items) db.order_items = [];
    if (!db.buildpoints_ledger) db.buildpoints_ledger = [];
    if (!db.buildpoints_wallets) db.buildpoints_wallets = [];

    // Strip legacy columns from orders array
    const cleanOrder = { ...finalOrder };
    const legacyKeys = ['items', 'shippingAddress', 'shipping_address', 'billingAddress', 'billing_address'];
    for (const key of legacyKeys) {
      delete (cleanOrder as any)[key];
    }
    db.orders.push(cleanOrder);

    const u = db.users?.find((x: any) => x.id === finalOrder.userId);
    const userName = u?.name || 'Guest';
    const userPhone = u?.phone || '';

    // Address deduplication shipping
    const shParsed = parseAddressString(finalOrder.shippingAddress, userName, userPhone);
    let shAddressId = null;
    for (const addr of db.user_addresses) {
      if (addr.userId === finalOrder.userId && constructAddressString(addr) === constructAddressString(shParsed)) {
        shAddressId = addr.id;
        break;
      }
    }

    if (!shAddressId) {
      shAddressId = `addr_${finalOrder.userId.substring(0, 8)}_${Date.now()}_sh_${Math.random().toString(36).substring(2, 5)}`;
      db.user_addresses.push({
        id: shAddressId,
        userId: finalOrder.userId,
        addressType: 'SHIPPING',
        recipientName: shParsed.recipientName,
        phoneNumber: shParsed.phoneNumber,
        addressLine1: shParsed.addressLine1,
        city: shParsed.city,
        state: shParsed.state,
        postalCode: shParsed.postalCode,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Address deduplication billing
    let biAddressId = null;
    if (finalOrder.shippingAddress === finalOrder.billingAddress) {
      biAddressId = shAddressId;
    } else {
      const biParsed = parseAddressString(finalOrder.billingAddress, userName, userPhone);
      for (const addr of db.user_addresses) {
        if (addr.userId === finalOrder.userId && constructAddressString(addr) === constructAddressString(biParsed)) {
          biAddressId = addr.id;
          break;
        }
      }

      if (!biAddressId) {
        biAddressId = `addr_${finalOrder.userId.substring(0, 8)}_${Date.now()}_bi_${Math.random().toString(36).substring(2, 5)}`;
        db.user_addresses.push({
          id: biAddressId,
          userId: finalOrder.userId,
          addressType: 'BILLING',
          recipientName: biParsed.recipientName,
          phoneNumber: biParsed.phoneNumber,
          addressLine1: biParsed.addressLine1,
          city: biParsed.city,
          state: biParsed.state,
          postalCode: biParsed.postalCode,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Order items
    for (const item of finalOrder.items) {
      const itemId = item.productId || item.id;
      const qty = parseInt(String(item.quantity || item.qty), 10) || 1;
      const unitPrice = parseFloat(String(item.unitPrice || item.price)) || 0;
      const taxAmt = qty * unitPrice * 0.18;
      const totalAmt = qty * unitPrice + taxAmt;

      const exists = db.order_items.some((oi: any) => oi.orderId === finalOrder.id && oi.variantId === itemId);
      if (!exists) {
        db.order_items.push({
          id: db.order_items.length + 1,
          orderId: finalOrder.id,
          variantId: itemId,
          quantity: qty,
          unitPrice,
          gstRate: 18.00,
          taxAmount: taxAmt,
          totalAmount: totalAmt
        });
      }
    }

    // Buildpoints & Ledger
    if (pointsEarned > 0) {
      const ledgerExists = db.buildpoints_ledger.some(
        (l: any) => l.walletUserId === finalOrder.userId &&
                    l.referenceType === 'ORDER' &&
                    l.referenceId === finalOrder.id &&
                    l.transactionType === 'EARNED'
      );

      if (!ledgerExists) {
        db.buildpoints_ledger.push({
          id: db.buildpoints_ledger.length + 1,
          walletUserId: finalOrder.userId,
          points: pointsEarned,
          transactionType: 'EARNED',
          referenceType: 'ORDER',
          referenceId: finalOrder.id,
          description: `Earned from checkout order ${finalOrder.id}`,
          createdAt: new Date().toISOString()
        });

        let wallet = db.buildpoints_wallets.find((w: any) => w.userId === finalOrder.userId);
        if (!wallet) {
          wallet = {
            userId: finalOrder.userId,
            balance: 0,
            tier: 'BRONZE',
            lifetimePointsAccumulated: 0,
            updatedAt: new Date().toISOString()
          };
          db.buildpoints_wallets.push(wallet);
        }
        wallet.balance += pointsEarned;
        wallet.lifetimePointsAccumulated += pointsEarned;
        wallet.updatedAt = new Date().toISOString();
      }
    }

    await writeJsonDb(db);
    return finalOrder;
  }
}

/**
 * Retrieves all orders associated with a specific user.
 * 
 * @param {string} userId - Unique identifier of the user.
 * @returns {Promise<Order[]>} Array of user orders, sorted by timestamp descending.
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT o.id, o.user_id, o.timestamp, o.date, o.products, o.status, o.amount, o.gst_number, o.payment_method, o.points_earned,
             (
                 SELECT COALESCE(
                     json_agg(json_build_object(
                         'productId', v.product_id,
                         'productName', v.name,
                         'qty', oi.quantity,
                         'price', oi.unit_price,
                         'unitPrice', oi.unit_price
                     )),
                     '[]'::json
                 )
                 FROM order_items oi
                 LEFT JOIN product_variants v ON oi.variant_id = v.id
                 WHERE oi.order_id = o.id
             ) AS variant_items,
             (
                 SELECT sa.recipient_name || ', ' || sa.phone_number || ', ' || sa.address_line_1 || COALESCE(', ' || sa.address_line_2, '') || ', ' || sa.city || ', ' || sa.state || ' - ' || sa.postal_code
                 FROM user_addresses sa
                 WHERE sa.user_id = o.user_id AND sa.address_type IN ('SHIPPING', 'BOTH')
                 ORDER BY sa.is_default DESC, sa.created_at DESC
                 LIMIT 1
             ) AS variant_shipping_address,
             (
                 SELECT ba.recipient_name || ', ' || ba.phone_number || ', ' || ba.address_line_1 || COALESCE(', ' || ba.address_line_2, '') || ', ' || ba.city || ', ' || ba.state || ' - ' || ba.postal_code
                 FROM user_addresses ba
                 WHERE ba.user_id = o.user_id AND ba.address_type IN ('BILLING', 'BOTH')
                 ORDER BY ba.is_default DESC, ba.created_at DESC
                 LIMIT 1
             ) AS variant_billing_address
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.timestamp DESC
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows.map(row => mapRowToOrder(row, 'getOrdersByUserId'));
  } else {
    const db = await readJsonDb();
    if (!db.orders) return [];
    const list = db.orders.filter((o: any) => o.userId === userId);
    return list
      .map((o: any) => mapRowToOrder(enrichOrderWithNormalized(o, db, 'getOrdersByUserId'), 'getOrdersByUserId'))
      .sort((a: any, b: any) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
  }
}

/**
 * Retrieves an order by its unique identifier.
 * 
 * @param {string} id - Unique identifier of the order.
 * @returns {Promise<Order | null>} The order details, or null if not found.
 */
export async function getOrderById(id: string): Promise<Order | null> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT o.id, o.user_id, o.timestamp, o.date, o.products, o.status, o.amount, o.gst_number, o.payment_method, o.points_earned,
             (
                 SELECT COALESCE(
                     json_agg(json_build_object(
                         'productId', v.product_id,
                         'productName', v.name,
                         'qty', oi.quantity,
                         'price', oi.unit_price,
                         'unitPrice', oi.unit_price
                     )),
                     '[]'::json
                 )
                 FROM order_items oi
                 LEFT JOIN product_variants v ON oi.variant_id = v.id
                 WHERE oi.order_id = o.id
             ) AS variant_items,
             (
                 SELECT sa.recipient_name || ', ' || sa.phone_number || ', ' || sa.address_line_1 || COALESCE(', ' || sa.address_line_2, '') || ', ' || sa.city || ', ' || sa.state || ' - ' || sa.postal_code
                 FROM user_addresses sa
                 WHERE sa.user_id = o.user_id AND sa.address_type IN ('SHIPPING', 'BOTH')
                 ORDER BY sa.is_default DESC, sa.created_at DESC
                 LIMIT 1
             ) AS variant_shipping_address,
             (
                 SELECT ba.recipient_name || ', ' || ba.phone_number || ', ' || ba.address_line_1 || COALESCE(', ' || ba.address_line_2, '') || ', ' || ba.city || ', ' || ba.state || ' - ' || ba.postal_code
                 FROM user_addresses ba
                 WHERE ba.user_id = o.user_id AND ba.address_type IN ('BILLING', 'BOTH')
                 ORDER BY ba.is_default DESC, ba.created_at DESC
                 LIMIT 1
             ) AS variant_billing_address
      FROM orders o
      WHERE o.id = $1
    `;
    const res = await pgPool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return mapRowToOrder(res.rows[0], 'getOrderById');
  } else {
    const db = await readJsonDb();
    if (!db.orders) return null;
    const order = db.orders.find((o: any) => o.id === id);
    if (!order) return null;
    return mapRowToOrder(enrichOrderWithNormalized(order, db, 'getOrderById'), 'getOrderById');
  }
}

/**
 * Updates the order processing status.
 * 
 * @param {string} id - Unique identifier of the order to update.
 * @param {Order['status']} status - The new status of the order.
 * @returns {Promise<Order | null>} The updated order record, or null if not found.
 */
export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (res.rows.length === 0) return null;
    return await getOrderById(id);
  } else {
    const db = await readJsonDb();
    if (!db.orders) return null;
    const orderIdx = db.orders.findIndex((o: any) => o.id === id);
    if (orderIdx === -1) return null;
    db.orders[orderIdx].status = status;
    await writeJsonDb(db);
    return await getOrderById(id);
  }
}

/**
 * Retrieves all registered orders in the platform catalog.
 * 
 * @returns {Promise<Order[]>} Array of all orders, sorted by timestamp descending.
 */
export async function getAllOrders(): Promise<Order[]> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT o.id, o.user_id, o.timestamp, o.date, o.products, o.status, o.amount, o.gst_number, o.payment_method, o.points_earned,
             (
                 SELECT COALESCE(
                     json_agg(json_build_object(
                         'productId', v.product_id,
                         'productName', v.name,
                         'qty', oi.quantity,
                         'price', oi.unit_price,
                         'unitPrice', oi.unit_price
                     )),
                     '[]'::json
                 )
                 FROM order_items oi
                 LEFT JOIN product_variants v ON oi.variant_id = v.id
                 WHERE oi.order_id = o.id
             ) AS variant_items,
             (
                 SELECT sa.recipient_name || ', ' || sa.phone_number || ', ' || sa.address_line_1 || COALESCE(', ' || sa.address_line_2, '') || ', ' || sa.city || ', ' || sa.state || ' - ' || sa.postal_code
                 FROM user_addresses sa
                 WHERE sa.user_id = o.user_id AND sa.address_type IN ('SHIPPING', 'BOTH')
                 ORDER BY sa.is_default DESC, sa.created_at DESC
                 LIMIT 1
             ) AS variant_shipping_address,
             (
                 SELECT ba.recipient_name || ', ' || ba.phone_number || ', ' || ba.address_line_1 || COALESCE(', ' || ba.address_line_2, '') || ', ' || ba.city || ', ' || ba.state || ' - ' || ba.postal_code
                 FROM user_addresses ba
                 WHERE ba.user_id = o.user_id AND ba.address_type IN ('BILLING', 'BOTH')
                 ORDER BY ba.is_default DESC, ba.created_at DESC
                 LIMIT 1
             ) AS variant_billing_address
      FROM orders o
      ORDER BY o.timestamp DESC
    `;
    const res = await pgPool.query(query);
    return res.rows.map(row => mapRowToOrder(row, 'getAllOrders'));
  } else {
    const db = await readJsonDb();
    if (!db.orders) return [];
    return db.orders
      .map((o: any) => mapRowToOrder(enrichOrderWithNormalized(o, db, 'getAllOrders'), 'getAllOrders'))
      .sort((a: any, b: any) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
  }
}

