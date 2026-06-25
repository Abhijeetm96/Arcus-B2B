/**
 * @file QuotationService.ts
 * @description Provides database and business logic for ARCUS Quotation Management.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { Quotation, QuotationItem } from './RFQ';
import { addOrder } from '../orders/OrderService';
import { Order } from '../orders/Order';

/**
 * Creates or revises a quotation for an RFQ.
 * If the quotation number exists, it increments the version.
 */
export async function createQuotation(
  rfqId: string,
  quoteData: Partial<Quotation>,
  items: Omit<QuotationItem, 'id' | 'quotationId'>[],
  createdBy?: string
): Promise<Quotation> {
  const version = Number(quoteData.version) || 1;
  const discountType = quoteData.discountType || 'NONE';
  const discountValue = Number(quoteData.discountValue) || 0;
  const shippingCharges = Number(quoteData.shippingCharges) || 0;
  const freeShipping = !!quoteData.freeShipping;
  const subtotal = Number(quoteData.subtotal) || 0;
  const gstAmount = Number(quoteData.gstAmount) || 0;
  const grandTotal = Number(quoteData.grandTotal) || 0;
  const status = quoteData.status || 'SENT';

  // Determine quotation number and version
  let quotationNumber = quoteData.quotationNumber;
  let finalVersion = version;

  if (usePostgres && pgPool) {
    if (!quotationNumber) {
      // Generate a new sequential quotation number
      const countRes = await pgPool.query("SELECT COUNT(DISTINCT quotation_number) as count FROM quotations");
      const nextNum = parseInt(countRes.rows[0].count) + 101;
      quotationNumber = `QT-${nextNum}`;
      finalVersion = 1;
    } else {
      // Find latest version of existing quote
      const verRes = await pgPool.query(
        "SELECT MAX(version) as max_ver FROM quotations WHERE quotation_number = $1",
        [quotationNumber]
      );
      const maxVer = verRes.rows[0].max_ver;
      finalVersion = maxVer ? parseInt(maxVer) + 1 : 1;
    }

    const quotationId = `${quotationNumber}-V${finalVersion}`;
    const validityDate = quoteData.validityDate ? new Date(quoteData.validityDate) : null;

    const quoteQuery = `
      INSERT INTO quotations (
        id, quotation_number, version, rfq_id, status, subtotal,
        discount_type, discount_value, shipping_charges, free_shipping,
        gst_amount, grand_total, delivery_terms, payment_terms,
        validity_date, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const quoteValues = [
      quotationId,
      quotationNumber,
      finalVersion,
      rfqId,
      status,
      subtotal,
      discountType,
      discountValue,
      shippingCharges,
      freeShipping,
      gstAmount,
      grandTotal,
      quoteData.deliveryTerms || null,
      quoteData.paymentTerms || null,
      validityDate,
      quoteData.notes || null,
      createdBy || null
    ];

    await pgPool.query(quoteQuery, quoteValues);

    // Insert items
    const insertedItems: QuotationItem[] = [];
    for (const item of items) {
      const itemId = `qti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const itemQuery = `
        INSERT INTO quotation_items (
          id, quotation_id, item_name, description, unit, quantity,
          unit_price, discount_percentage, gst_rate, line_total
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const itemValues = [
        itemId,
        quotationId,
        item.itemName,
        item.description || null,
        item.unit,
        item.quantity,
        item.unitPrice,
        item.discountPercentage || 0,
        item.gstRate || 18,
        item.lineTotal
      ];
      const itemRes = await pgPool.query(itemQuery, itemValues);
      const r = itemRes.rows[0];
      insertedItems.push({
        id: r.id,
        quotationId: r.quotation_id,
        itemName: r.item_name,
        description: r.description,
        unit: r.unit,
        quantity: parseInt(r.quantity),
        unitPrice: parseFloat(r.unit_price),
        discountPercentage: parseFloat(r.discount_percentage),
        gstRate: parseFloat(r.gst_rate),
        lineTotal: parseFloat(r.line_total)
      });
    }

    // Also update RFQ status to Quoted
    await pgPool.query("UPDATE rfqs SET status = 'Quoted' WHERE id = $1", [rfqId]);

    const resQuote = await getQuotationById(quotationId);
    return resQuote!;
  } else {
    // JSON DB Fallback
    const db = await readJsonDb();
    if (!db.quotations) db.quotations = [];
    if (!db.quotation_items) db.quotation_items = [];

    if (!quotationNumber) {
      const distinctQuotes = new Set(db.quotations.map((q: any) => q.quotationNumber));
      const nextNum = distinctQuotes.size + 101;
      quotationNumber = `QT-${nextNum}`;
      finalVersion = 1;
    } else {
      const versions = db.quotations
        .filter((q: any) => q.quotationNumber === quotationNumber)
        .map((q: any) => q.version);
      const maxVer = versions.length > 0 ? Math.max(...versions) : 0;
      finalVersion = maxVer + 1;
    }

    const quotationId = `${quotationNumber}-V${finalVersion}`;
    const newQuote: Quotation = {
      id: quotationId,
      quotationNumber,
      version: finalVersion,
      rfqId,
      status,
      subtotal,
      discountType,
      discountValue,
      shippingCharges,
      freeShipping,
      gstAmount,
      grandTotal,
      deliveryTerms: quoteData.deliveryTerms,
      paymentTerms: quoteData.paymentTerms,
      validityDate: quoteData.validityDate,
      notes: quoteData.notes,
      createdAt: new Date().toISOString(),
      createdBy
    };

    db.quotations.push(newQuote);

    const insertedItems: QuotationItem[] = [];
    for (const item of items) {
      const itemId = `qti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newQuoteItem: QuotationItem = {
        ...item,
        id: itemId,
        quotationId
      };
      db.quotation_items.push(newQuoteItem);
      insertedItems.push(newQuoteItem);
    }

    // Update RFQ status
    const rfqIdx = db.rfqs.findIndex((r: any) => r.id === rfqId);
    if (rfqIdx !== -1) {
      db.rfqs[rfqIdx].status = 'Quoted';
    }

    await writeJsonDb(db);

    return {
      ...newQuote,
      items: insertedItems
    };
  }
}

/**
 * Retrieves a single quotation with its line items.
 */
export async function getQuotationById(id: string): Promise<Quotation | null> {
  if (usePostgres && pgPool) {
    const qRes = await pgPool.query("SELECT * FROM quotations WHERE id = $1", [id]);
    if (qRes.rows.length === 0) return null;
    const r = qRes.rows[0];

    const itemsRes = await pgPool.query("SELECT * FROM quotation_items WHERE quotation_id = $1", [id]);
    const items = itemsRes.rows.map((row) => ({
      id: row.id,
      quotationId: row.quotation_id,
      itemName: row.item_name,
      description: row.description,
      unit: row.unit,
      quantity: parseInt(row.quantity),
      unitPrice: parseFloat(row.unit_price),
      discountPercentage: parseFloat(row.discount_percentage),
      gstRate: parseFloat(row.gst_rate),
      lineTotal: parseFloat(row.line_total)
    }));

    return {
      id: r.id,
      quotationNumber: r.quotation_number,
      version: parseInt(r.version),
      rfqId: r.rfq_id,
      status: r.status as any,
      subtotal: parseFloat(r.subtotal),
      discountType: r.discount_type as any,
      discountValue: parseFloat(r.discount_value),
      shippingCharges: parseFloat(r.shipping_charges),
      freeShipping: r.free_shipping,
      gstAmount: parseFloat(r.gst_amount),
      grandTotal: parseFloat(r.grand_total),
      deliveryTerms: r.delivery_terms,
      paymentTerms: r.payment_terms,
      validityDate: r.validity_date ? new Date(r.validity_date).toISOString().split('T')[0] : undefined,
      notes: r.notes,
      customerComments: r.customer_comments,
      declineReason: r.decline_reason,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      createdBy: r.created_by,
      items
    };
  } else {
    const db = await readJsonDb();
    const quote = db.quotations?.find((q: any) => q.id === id);
    if (!quote) return null;

    const items = db.quotation_items?.filter((i: any) => i.quotationId === id) || [];
    return {
      ...quote,
      items
    };
  }
}

/**
 * Retrieves all quotation versions for a given RFQ.
 */
export async function getQuotationsForRfq(rfqId: string): Promise<Quotation[]> {
  if (usePostgres && pgPool) {
    const qRes = await pgPool.query(
      "SELECT * FROM quotations WHERE rfq_id = $1 ORDER BY version DESC",
      [rfqId]
    );
    const quotations: Quotation[] = [];
    for (const r of qRes.rows) {
      const itemsRes = await pgPool.query("SELECT * FROM quotation_items WHERE quotation_id = $1", [r.id]);
      const items = itemsRes.rows.map((row) => ({
        id: row.id,
        quotationId: row.quotation_id,
        itemName: row.item_name,
        description: row.description,
        unit: row.unit,
        quantity: parseInt(row.quantity),
        unitPrice: parseFloat(row.unit_price),
        discountPercentage: parseFloat(row.discount_percentage),
        gstRate: parseFloat(row.gst_rate),
        lineTotal: parseFloat(row.line_total)
      }));

      quotations.push({
        id: r.id,
        quotationNumber: r.quotation_number,
        version: parseInt(r.version),
        rfqId: r.rfq_id,
        status: r.status as any,
        subtotal: parseFloat(r.subtotal),
        discountType: r.discount_type as any,
        discountValue: parseFloat(r.discount_value),
        shippingCharges: parseFloat(r.shipping_charges),
        freeShipping: r.free_shipping,
        gstAmount: parseFloat(r.gst_amount),
        grandTotal: parseFloat(r.grand_total),
        deliveryTerms: r.delivery_terms,
        paymentTerms: r.payment_terms,
        validityDate: r.validity_date ? new Date(r.validity_date).toISOString().split('T')[0] : undefined,
        notes: r.notes,
        customerComments: r.customer_comments,
        declineReason: r.decline_reason,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        createdBy: r.created_by,
        items
      });
    }
    return quotations;
  } else {
    const db = await readJsonDb();
    const quotations = db.quotations?.filter((q: any) => q.rfqId === rfqId) || [];
    const enriched = quotations.map((q: any) => {
      const items = db.quotation_items?.filter((i: any) => i.quotationId === q.id) || [];
      return { ...q, items };
    });
    return enriched.sort((a: any, b: any) => b.version - a.version);
  }
}

/**
 * Updates status of a quotation (Accept / Reject / Renegotiate).
 */
export async function updateQuotationStatus(
  id: string,
  status: 'SENT' | 'APPROVED' | 'DECLINED' | 'NEGOTIATION_REQUESTED',
  details?: { declineReason?: string; customerComments?: string }
): Promise<Quotation | null> {
  if (usePostgres && pgPool) {
    const qQuery = `
      UPDATE quotations
      SET status = $1, decline_reason = $2, customer_comments = $3
      WHERE id = $4
      RETURNING *
    `;
    const qValues = [
      status,
      details?.declineReason || null,
      details?.customerComments || null,
      id
    ];
    const res = await pgPool.query(qQuery, qValues);
    if (res.rows.length === 0) return null;

    // Sync RFQ status based on Quotation Status
    const rfqId = res.rows[0].rfq_id;
    let rfqStatus = 'Under Review';
    if (status === 'APPROVED') rfqStatus = 'Completed';
    else if (status === 'DECLINED') rfqStatus = 'Cancelled';
    else if (status === 'NEGOTIATION_REQUESTED') rfqStatus = 'Quotes Received'; // Or negotiation requested status

    await pgPool.query("UPDATE rfqs SET status = $1 WHERE id = $2", [rfqStatus, rfqId]);

    return getQuotationById(id);
  } else {
    const db = await readJsonDb();
    const idx = db.quotations?.findIndex((q: any) => q.id === id);
    if (idx === -1 || idx === undefined) return null;

    db.quotations[idx].status = status;
    if (details?.declineReason) db.quotations[idx].declineReason = details.declineReason;
    if (details?.customerComments) db.quotations[idx].customerComments = details.customerComments;

    // Sync RFQ status
    const rfqId = db.quotations[idx].rfqId;
    const rfqIdx = db.rfqs?.findIndex((r: any) => r.id === rfqId);
    if (rfqIdx !== -1 && rfqIdx !== undefined) {
      let rfqStatus = 'Under Review';
      if (status === 'APPROVED') rfqStatus = 'Completed';
      else if (status === 'DECLINED') rfqStatus = 'Cancelled';
      else if (status === 'NEGOTIATION_REQUESTED') rfqStatus = 'Quotes Received';
      db.rfqs[rfqIdx].status = rfqStatus;
    }

    await writeJsonDb(db);
    return getQuotationById(id);
  }
}

/**
 * Approves a quotation and auto-converts it to a formal Order.
 */
export async function convertQuotationToOrder(quotationId: string): Promise<any> {
  const quote = await getQuotationById(quotationId);
  if (!quote) throw new Error('Quotation not found.');

  // Update status to approved
  await updateQuotationStatus(quotationId, 'APPROVED');

  // Load RFQ details
  let buyerId: string | undefined;
  let buyerName = 'B2B Customer';
  let buyerPhone = '';
  let buyerEmail = '';
  let companyName = '';
  let gstNumber = '';
  let shippingAddress = 'Project Site Location';
  let billingAddress = 'Company Address';

  if (usePostgres && pgPool) {
    const rfqRes = await pgPool.query("SELECT * FROM rfqs WHERE id = $1", [quote.rfqId]);
    if (rfqRes.rows.length > 0) {
      const rfqRow = rfqRes.rows[0];
      buyerId = rfqRow.buyer_id;
      buyerName = rfqRow.name;
      buyerPhone = rfqRow.phone;
      shippingAddress = rfqRow.location || shippingAddress;
      billingAddress = rfqRow.location || billingAddress;
    }

    // Attempt to enrich with User/Business profile details
    if (buyerId) {
      const userRes = await pgPool.query("SELECT * FROM users WHERE id = $1", [buyerId]);
      if (userRes.rows.length > 0) {
        buyerEmail = userRes.rows[0].email;
      }
      const bRes = await pgPool.query("SELECT * FROM business_profiles WHERE user_id = $1", [buyerId]);
      if (bRes.rows.length > 0) {
        companyName = bRes.rows[0].company_name;
        gstNumber = bRes.rows[0].gst_number;
      }
    }
  } else {
    const db = await readJsonDb();
    const rfq = db.rfqs?.find((r: any) => r.id === quote.rfqId);
    if (rfq) {
      buyerId = rfq.buyerId || rfq.userId;
      buyerName = rfq.name;
      buyerPhone = rfq.phone;
      shippingAddress = rfq.location || shippingAddress;
      billingAddress = rfq.location || billingAddress;
    }

    if (buyerId) {
      const user = db.users?.find((u: any) => u.id === buyerId);
      if (user) {
        buyerEmail = user.email;
        companyName = user.companyName || '';
        gstNumber = user.gstNumber || '';
      }
    }
  }

  // Construct full addresses
  const fullShipping = `${buyerName}, ${buyerPhone}, ${shippingAddress}`;
  const fullBilling = companyName 
    ? `${companyName} (Attn: ${buyerName}), ${buyerPhone}, ${billingAddress}`
    : `${buyerName}, ${buyerPhone}, ${billingAddress}`;

  // Format order items
  const orderItems = (quote.items || []).map((item) => {
    // Generate a default product ID fallback if none is mapped
    const prodId = 'prod_custom_bulk';
    return {
      productId: prodId,
      productName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.lineTotal / item.quantity, // inclusive rate
      // compatibility fields
      id: prodId,
      name: item.itemName,
      qty: item.quantity,
      price: item.lineTotal / item.quantity
    };
  });

  const productsSummary = orderItems.map(oi => `${oi.productName} x ${oi.quantity}`).join(', ');

  // Standard BuildPoints ratio is 1% of Grand Total, doubled for Contractors
  let pointsRatio = 0.01;
  if (usePostgres && pgPool && buyerId) {
    const userRoleRes = await pgPool.query("SELECT role FROM users WHERE id = $1", [buyerId]);
    if (userRoleRes.rows.length > 0 && userRoleRes.rows[0].role === 'Contractor') {
      pointsRatio = 0.02;
    }
  } else if (buyerId) {
    const db = await readJsonDb();
    const user = db.users?.find((u: any) => u.id === buyerId);
    if (user && user.role === 'Contractor') {
      pointsRatio = 0.02;
    }
  }
  const pointsEarned = Math.floor(quote.grandTotal * pointsRatio);

  const orderPayload: Order = {
    id: `ARC-${Math.floor(10000 + Math.random() * 90000)}`,
    userId: buyerId || 'anonymous_buyer',
    products: productsSummary,
    status: 'Confirmed', // Quotation conversion auto-confirms
    amount: quote.grandTotal,
    items: orderItems,
    shippingAddress: fullShipping,
    billingAddress: fullBilling,
    gstNumber: gstNumber || undefined,
    paymentMethod: quote.paymentTerms || 'B2B Credit',
    pointsEarned
  };

  // Run order insertion workflow
  const createdOrder = await addOrder(orderPayload);

  // Mark RFQ status as ORDER_CREATED / Completed
  if (usePostgres && pgPool) {
    await pgPool.query("UPDATE rfqs SET status = 'Completed' WHERE id = $1", [quote.rfqId]);
  } else {
    const db = await readJsonDb();
    const rfqIdx = db.rfqs?.findIndex((r: any) => r.id === quote.rfqId);
    if (rfqIdx !== -1 && rfqIdx !== undefined) {
      db.rfqs[rfqIdx].status = 'Completed';
      await writeJsonDb(db);
    }
  }

  return createdOrder;
}
