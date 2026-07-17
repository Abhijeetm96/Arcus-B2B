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
  throw new Error('RFQ operations are disabled.');
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
  const defaultStatus = booking.status || 'Pending';

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO bookings (id, timestamp, service_name, name, phone, date, notes, user_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      booking.userId || null,
      defaultStatus
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
      userId: row.user_id || undefined,
      status: row.status as any
    };
  } else {
    const db = await readJsonDb();
    if (!db.bookings) db.bookings = [];
    const newBooking = {
      ...booking,
      id: generatedId,
      timestamp,
      status: defaultStatus
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
  return [];
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
      userId: row.user_id || undefined,
      status: row.status || 'Pending'
    }));
  } else {
    const db = await readJsonDb();
    return db.bookings || [];
  }
}

/**
 * Retrieves service bookings belonging to a specific user by userId or phone fallback.
 */
export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
  if (usePostgres && pgPool) {
    const userRes = await pgPool.query('SELECT phone FROM users WHERE id = $1', [userId]);
    const phone = userRes.rows[0]?.phone || '';
    const query = `
      SELECT * FROM bookings 
      WHERE user_id = $1 OR phone = $2 
      ORDER BY timestamp DESC
    `;
    const res = await pgPool.query(query, [userId, phone]);
    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      serviceName: row.service_name,
      name: row.name,
      phone: row.phone,
      date: row.date,
      notes: row.notes,
      userId: row.user_id || undefined,
      status: row.status || 'Pending'
    }));
  } else {
    const db = await readJsonDb();
    const user = db.users?.find((u: any) => u.id === userId);
    const phone = user?.phone || '';
    return (db.bookings || []).filter((b: any) => b.userId === userId || b.phone === phone);
  }
}

/**
 * Updates the service booking status.
 */
export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      serviceName: row.service_name,
      name: row.name,
      phone: row.phone,
      date: row.date,
      notes: row.notes,
      userId: row.user_id || undefined,
      status: row.status || 'Pending'
    };
  } else {
    const db = await readJsonDb();
    if (!db.bookings) return null;
    const idx = db.bookings.findIndex((b: any) => b.id === id);
    if (idx === -1) return null;
    db.bookings[idx].status = status;
    await writeJsonDb(db);
    return db.bookings[idx];
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
  return null;
}

