/**
 * @file RFQService.ts
 * @description Provides business operations for Requests For Quotes (RFQs), service bookings, and contractor quotes.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { RFQ, Booking, DirectQuote } from './RFQ';

/**
 * Creates and registers a new RFQ (Request for Quote).
 * Automatically generates a unique RFQ ID and sets the submission timestamp.
 * 
 * @param {RFQ} rfq - The RFQ properties to register.
 * @returns {Promise<RFQ>} The registered RFQ with populated ID and timestamp.
 */
export async function addRfq(rfq: RFQ): Promise<RFQ> {
  const generatedId = `rfq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();
  const status = rfq.status || 'Submitted';

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO rfqs (id, timestamp, name, phone, category, quantity, location, timeline, details, buyer_id, status, title, budget, attachment_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      generatedId,
      timestamp,
      rfq.name,
      rfq.phone,
      rfq.category,
      rfq.quantity || null,
      rfq.location || null,
      rfq.timeline || null,
      rfq.details || null,
      rfq.buyerId || null,
      status,
      rfq.title || null,
      rfq.budget || null,
      JSON.stringify(rfq.attachmentUrls || [])
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];

    // Insert items if present
    const insertedItems: any[] = [];
    if (rfq.items && Array.isArray(rfq.items)) {
      for (const item of rfq.items) {
        const itemId = `rfqi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const itemQuery = `
          INSERT INTO rfq_items (id, rfq_id, item_name, quantity, specification_requirements)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const specs = {
          description: item.description || '',
          unit: item.unit || 'Piece'
        };
        const itemRes = await pgPool.query(itemQuery, [
          itemId,
          generatedId,
          item.itemName || item.item_name || '',
          String(item.quantity || ''),
          JSON.stringify(specs)
        ]);
        const r = itemRes.rows[0];
        insertedItems.push({
          id: r.id,
          rfqId: r.rfq_id,
          itemName: r.item_name,
          quantity: r.quantity,
          description: specs.description,
          unit: specs.unit
        });
      }
    }

    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      name: row.name,
      phone: row.phone,
      category: row.category,
      quantity: row.quantity,
      location: row.location,
      timeline: row.timeline,
      details: row.details,
      buyerId: row.buyer_id,
      status: row.status,
      title: row.title,
      budget: row.budget,
      attachmentUrls: row.attachment_urls ? (typeof row.attachment_urls === 'string' ? JSON.parse(row.attachment_urls) : row.attachment_urls) : [],
      items: insertedItems
    };
  } else {
    const db = await readJsonDb();
    if (!db.rfq_items) db.rfq_items = [];

    const newRfq = {
      ...rfq,
      id: generatedId,
      timestamp,
      status,
      items: [] as any[]
    };

    if (rfq.items && Array.isArray(rfq.items)) {
      for (const item of rfq.items) {
        const itemId = `rfqi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newItem = {
          id: itemId,
          rfqId: generatedId,
          itemName: item.itemName || item.item_name || '',
          quantity: String(item.quantity || ''),
          description: item.description || '',
          unit: item.unit || 'Piece'
        };
        db.rfq_items.push(newItem);
        newRfq.items.push(newItem);
      }
    }

    db.rfqs.push(newRfq);
    await writeJsonDb(db);
    return newRfq;
  }
}

/**
 * Registers a new service booking appointment.
 * Automatically generates a unique booking ID and sets the creation timestamp.
 * 
 * @param {Booking} booking - Booking details to register.
 * @returns {Promise<Booking>} The registered booking record.
 */
export async function addBooking(booking: Booking): Promise<Booking> {
  const generatedId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO bookings (id, timestamp, service_name, name, phone, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      generatedId,
      timestamp,
      booking.serviceName,
      booking.name,
      booking.phone,
      booking.date,
      booking.notes || null,
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      serviceName: row.service_name,
      name: row.name,
      phone: row.phone,
      date: row.date,
      notes: row.notes,
    };
  } else {
    const db = await readJsonDb();
    const newBooking = {
      ...booking,
      id: generatedId,
      timestamp
    };
    db.bookings.push(newBooking);
    await writeJsonDb(db);
    return newBooking;
  }
}

/**
 * Submits a direct quote for professional services.
 * Automatically generates a unique quote ID and sets the submission timestamp.
 * 
 * @param {DirectQuote} quote - Direct quote details to register.
 * @returns {Promise<DirectQuote>} The registered direct quote details.
 */
export async function addQuote(quote: DirectQuote): Promise<DirectQuote> {
  const generatedId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO quotes (id, timestamp, contractor_id, contractor_company, name, phone, budget, timeline, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      generatedId,
      timestamp,
      quote.contractorId,
      quote.contractorCompany,
      quote.name,
      quote.phone,
      quote.budget,
      quote.timeline,
      quote.desc || null,
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      contractorId: row.contractor_id,
      contractorCompany: row.contractor_company,
      name: row.name,
      phone: row.phone,
      budget: row.budget,
      timeline: row.timeline,
      desc: row.description,
    };
  } else {
    const db = await readJsonDb();
    const newQuote = {
      ...quote,
      id: generatedId,
      timestamp
    };
    db.quotes.push(newQuote);
    await writeJsonDb(db);
    return newQuote;
  }
}

/**
 * Retrieves all registered RFQs from the active database.
 * 
 * @returns {Promise<RFQ[]>} Array of registered RFQs sorted by timestamp descending.
 */
export async function getAllRfqs(): Promise<RFQ[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM rfqs ORDER BY timestamp DESC');
    if (res.rows.length === 0) return [];
    
    // Fetch all RFQ items in a single batch query to eliminate N+1 latency
    const itemsRes = await pgPool.query('SELECT * FROM rfq_items');
    const itemsMap = new Map<string, any[]>();
    for (const r of itemsRes.rows) {
      const rfqId = r.rfq_id;
      if (!itemsMap.has(rfqId)) {
        itemsMap.set(rfqId, []);
      }
      const specs = typeof r.specification_requirements === 'string'
        ? JSON.parse(r.specification_requirements)
        : r.specification_requirements || {};
      itemsMap.get(rfqId)!.push({
        id: r.id,
        rfqId: r.rfq_id,
        itemName: r.item_name,
        quantity: r.quantity,
        description: specs.description || '',
        unit: specs.unit || 'Piece'
      });
    }

    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      name: row.name,
      phone: row.phone,
      category: row.category,
      quantity: row.quantity,
      location: row.location,
      timeline: row.timeline,
      details: row.details,
      buyerId: row.buyer_id,
      status: row.status,
      title: row.title,
      budget: row.budget,
      attachmentUrls: row.attachment_urls ? (typeof row.attachment_urls === 'string' ? JSON.parse(row.attachment_urls) : row.attachment_urls) : [],
      items: itemsMap.get(row.id) || []
    }));
  } else {
    const db = await readJsonDb();
    const rfqs = db.rfqs || [];
    return rfqs.map((rfq: any) => {
      const items = db.rfq_items?.filter((i: any) => i.rfqId === rfq.id) || [];
      return {
        ...rfq,
        items
      };
    });
  }
}

/**
 * Retrieves all service bookings from the database.
 * 
 * @returns {Promise<Booking[]>} Array of booking records.
 */
export async function getAllBookings(): Promise<Booking[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM bookings ORDER BY timestamp DESC');
    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      serviceName: row.service_name,
      name: row.name,
      phone: row.phone,
      date: row.date,
      notes: row.notes,
    }));
  } else {
    const db = await readJsonDb();
    return db.bookings || [];
  }
}

/**
 * Retrieves all direct contractor quotes from the database.
 * 
 * @returns {Promise<DirectQuote[]>} Array of direct quotes.
 */
export async function getAllQuotes(): Promise<DirectQuote[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM quotes ORDER BY timestamp DESC');
    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      contractorId: row.contractor_id,
      contractorCompany: row.contractor_company,
      name: row.name,
      phone: row.phone,
      budget: row.budget,
      timeline: row.timeline,
      desc: row.description,
    }));
  } else {
    const db = await readJsonDb();
    return db.quotes || [];
  }
}

/**
 * Updates the processing status of a specific RFQ.
 * 
 * @param {string} id - Unique identifier of the RFQ to update.
 * @param {string} status - The new status (e.g. 'Submitted', 'Quoted', 'Ordered').
 * @returns {Promise<RFQ | null>} The updated RFQ, or null if not found.
 */
export async function updateRfqStatus(id: string, status: string): Promise<RFQ | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      "UPDATE rfqs SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      name: row.name,
      phone: row.phone,
      category: row.category,
      quantity: row.quantity,
      location: row.location,
      timeline: row.timeline,
      details: row.details,
      buyerId: row.buyer_id,
      status: row.status,
      title: row.title,
      budget: row.budget,
      attachmentUrls: row.attachment_urls ? (typeof row.attachment_urls === 'string' ? JSON.parse(row.attachment_urls) : row.attachment_urls) : []
    };
  } else {
    const db = await readJsonDb();
    if (!db.rfqs) return null;
    const idx = db.rfqs.findIndex((r: any) => r.id === id);
    if (idx === -1) return null;
    db.rfqs[idx].status = status;
    await writeJsonDb(db);
    return db.rfqs[idx];
  }
}

