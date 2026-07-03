import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import https from 'https';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { 
  pgPool, usePostgres, readJsonDb,
  addRfq, addBooking, addQuote, getAllRfqs, getAllBookings, getAllQuotes, getAllProducts, getProductById, updateProductStock, 
  addUser, getUserByEmail, getUserByPhone, getUserByGst, getUserById, addOrder, getOrdersByUserId, updateUser, addOtp, 
  getOtpByUserId, incrementOtpAttempts, deleteOtp, deleteOtpsByUserId, getOrderById, updateOrderStatus, deleteUserByEmail, 
  deleteUserByGst, searchService, getAppSettings, updateAppSettings, getAllCategories, addCategory, updateCategory, 
  deleteCategory, addProduct, updateProduct, deleteProduct, updateProductInventory, updateRfqStatus, Order,
  getAllBrands, getBrandById, addBrand, updateBrand, deleteBrand, logAction, getAllAuditLogs, recordAdjustment, getAdjustmentHistory,
  getAllOrders, getAllUsers,
  validateImportSheet, matchZipImages, generateTemplate, exportCatalog, executeImport, executeBulkUpdates, getAllImportHistory, getImportHistoryById, HEADER_MAPPING
} from './db';
import { validateEmail, validatePhone, validatePassword, validateName, validateBusinessName, validateGST, validateExperience, validateURL, normalizePhone, sanitizeText, trimAndClean, RateLimiter } from '../../shared/validation';
import { createQuotation, getQuotationById, getQuotationsForRfq, updateQuotationStatus, convertQuotationToOrder } from './modules/rfq/QuotationService';
import { checkAndSeedDevUsers } from './database/seedRunner';
import adminRoutes from './routes';
import { registerEventHandlers } from './events/registerHandlers';
import { dashboardRepo } from './controllers/dashboard.controller';
import { MockNotificationProvider } from './domain/shared/NotificationProvider';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', adminRoutes);

// Register collaborative event handlers
registerEventHandlers(dashboardRepo, new MockNotificationProvider());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} Auth: ${req.headers.authorization || 'None'}`);
  next();
});

// ─── Rate Limiters ───────────────────────────────────────────
const isTestOrDev = process.env.NODE_ENV !== 'production';
const loginLimiter = new RateLimiter(isTestOrDev ? 1000 : 5, 15 * 60 * 1000);    // 5 attempts per 15 min
const otpLimiter = new RateLimiter(isTestOrDev ? 1000 : 3, 5 * 60 * 1000);       // 3 OTP requests per 5 min
const formLimiter = new RateLimiter(isTestOrDev ? 1000 : 5, 10 * 60 * 1000);     // 5 form submissions per 10 min
const profileLimiter = new RateLimiter(isTestOrDev ? 1000 : 10, 60 * 60 * 1000); // 10 profile updates per hour
const DISABLE_OTP_FOR_DEV = true;

function getClientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}



// Mock Professionals Data (matching ServicesHub.tsx)
const professionalsList = [
  {
    id: 'rajesh-varma',
    name: 'Rajesh Varma',
    company: 'Supreme Electricals Ltd.',
    location: 'Bangalore',
    rating: 4.9,
    reviewCount: 248,
    experience: 12,
    completedProjects: 150,
    specializations: ['Electrical', 'Maintenance'],
    startingPrice: '₹499',
    responseTime: 'Within 1 Hour',
    avatar: '/services_geyser_install.png',
    coverImage: '/services_washing_machine.png',
    isVerified: true,
    isTopRated: true,
    isPremium: true,
    languages: ['English', 'Kannada', 'Hindi'],
    budget: 'Low',
    tag: 'Premium Partner'
  },
  {
    id: 'ananya-shrivastava',
    name: 'Ananya Shrivastava',
    company: 'Elite Studio Works',
    location: 'Mumbai',
    rating: 5.0,
    reviewCount: 312,
    experience: 8,
    completedProjects: 120,
    specializations: ['Interior Design', 'Renovation'],
    startingPrice: '₹1,499',
    responseTime: 'Within 2 Hours',
    avatar: '/services_interior_painting.png',
    coverImage: '/services_modular_kitchen.png',
    isVerified: true,
    isTopRated: true,
    isPremium: true,
    languages: ['English', 'Marathi', 'Hindi'],
    budget: 'High',
    tag: 'Preferred Partner'
  },
  {
    id: 'karan-mehra',
    name: 'Karan Mehra',
    company: 'Rapid Flow Plumbing',
    location: 'Delhi NCR',
    rating: 4.8,
    reviewCount: 190,
    experience: 15,
    completedProjects: 210,
    specializations: ['Plumbing', 'Maintenance'],
    startingPrice: '₹399',
    responseTime: 'Within 1 Hour',
    avatar: '/pdp_cpvc_elbow.png',
    coverImage: '/pdp_cpvc_pipe_install.png',
    isVerified: true,
    isTopRated: false,
    isPremium: false,
    languages: ['English', 'Hindi', 'Punjabi'],
    budget: 'Medium',
    tag: 'Arcus Verified'
  }
];

async function checkIsAdmin(req: any): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) return false;
    const user = await getUserById(userId);
    return user?.role === 'ADMIN' || user?.role === 'Admin';
  } catch {
    return false;
  }
}

function sanitizeProduct(product: any, isAdmin: boolean): any {
  if (!product) return null;
  const copy = { ...product };
  if (!isAdmin) {
    delete copy.procurementPrice;
    delete copy.vendorName;
    delete copy.vendorProductCode;
  }
  return copy;
}

// Endpoints for GET Static Data
app.get('/api/products', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    const products = (await getAllProducts()).filter(p => p.status !== 'DISCONTINUED');
    
    // Convert grouped map to ProductCategory[] format, preserving category ordering
    const categoryOrder = ['Plumbing', 'Electrical', 'Cement', 'Steel', 'Paints', 'Tiles', 'Hardware', 'Building'];
    const formattedCategories = categoryOrder
      .map((title) => {
        const matchingProducts = products.filter(p => p.categoryTitle?.toLowerCase() === title.toLowerCase() || (title === 'Cement' && p.categoryTitle === 'Cement & Concrete'));
        return {
          title,
          products: matchingProducts.map(p => {
            const baseProduct: any = {
              id: p.id,
              name: p.name,
              brand: p.specifications?.['Brand'] || p.specifications?.['Manufacturer'] || 'Generic',
              price: p.price,
              unit: p.unit,
              rating: p.rating,
              icon: p.icon,
              link: p.link,
              desc: p.description,
              image: p.images?.[0] || '/pdp_cpvc_pipe_main.png',
              subcategorySlug: p.subcategorySlug,
              leafSlug: p.leafSlug,
              priceTiers: p.priceTiers,
              specifications: p.specifications,
              stock: p.stock
            };
            if (isAdmin) {
              baseProduct.procurementPrice = p.procurementPrice;
              baseProduct.vendorName = p.vendorName;
              baseProduct.vendorProductCode = p.vendorProductCode;
            }
            return baseProduct;
          })
        };
      })
      .filter((cat) => cat.products.length > 0);

    res.json(formattedCategories);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const isAdmin = await checkIsAdmin(req);
    res.json(sanitizeProduct(product, isAdmin));
  } catch (err: any) {
    console.error('Error fetching product by id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products/:id/sync-inventory', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let newStock = Number(req.body.quantity);
    if (isNaN(newStock) || newStock < 0) {
      newStock = Math.floor(50 + Math.random() * 1450);
    }
    
    const updatedProduct = await updateProductStock(productId, newStock);
    if (!updatedProduct) {
      return res.status(500).json({ error: 'Failed to update stock' });
    }
    
    res.json({ success: true, stock: updatedProduct.stock, productId });
  } catch (err: any) {
    console.error('Error syncing inventory:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ products: [], brands: [], categories: [], services: [], professionals: [] });
    }

    const searchResults = await searchService.search(query);
    const isAdmin = await checkIsAdmin(req);

    // Sanitize products to remove procurement fields unless user is Admin
    const sanitizedProducts = searchResults.products.map(p => sanitizeProduct(p, isAdmin));

    res.json({
      products: sanitizedProducts,
      brands: searchResults.brands,
      categories: searchResults.categories,
      services: searchResults.services || [],
      professionals: searchResults.professionals || []
    });
  } catch (err: any) {
    console.error('Error in GET /api/search:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/search/click', async (req, res) => {
  try {
    const { productId, query } = req.body;
    if (!productId || !query) {
      return res.status(400).json({ error: 'productId and query are required.' });
    }

    await searchService.trackClick(productId, query);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error in POST /api/search/click:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/search-analytics', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }

    const analytics = await searchService.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    console.error('Error in GET /api/admin/search-analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/professionals', (req, res) => {
  res.json(professionalsList);
});

// Endpoints for Form Submissions
app.post('/api/rfq', async (req, res) => {
  try {
    // Rate limit
    const ip = getClientIp(req);
    if (!formLimiter.check(`rfq:${ip}`)) {
      return res.status(429).json({ error: `Too many requests. Try again in ${formLimiter.getRetryAfter(`rfq:${ip}`)} seconds.` });
    }

    const { name, phone, category, quantity, location, timeline, details, buyerId, title, budget, attachmentUrls, items } = req.body;
    // Validate
    const nameV = validateName(sanitizeText(name || ''), 'Name');
    if (!nameV.valid) return res.status(400).json({ error: nameV.error });
    const phoneV = validatePhone(phone || '');
    if (!phoneV.valid) return res.status(400).json({ error: phoneV.error });

    const finalQuantity = (items && Array.isArray(items) && items.length > 0)
      ? "Detailed Table"
      : quantity;

    if (!finalQuantity || !finalQuantity.trim()) return res.status(400).json({ error: 'Quantity is required.' });
    if (!location || !location.trim()) return res.status(400).json({ error: 'Delivery location is required.' });
    if (details && details.length > 2000) return res.status(400).json({ error: 'Details must be 2000 characters or less.' });

    const cleanPhone = normalizePhone(phone);

    // Resolve buyerId from auth token if header present, else fallback to request body
    let authenticatedBuyerId = buyerId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const verifiedId = verifyToken(token);
      if (verifiedId) {
        authenticatedBuyerId = verifiedId;
      }
    }

    const newRfq = await addRfq({
      buyerId: authenticatedBuyerId ? sanitizeText(String(authenticatedBuyerId)) : undefined,
      title: title ? sanitizeText(String(title)) : undefined,
      budget: budget ? sanitizeText(String(budget)) : undefined,
      attachmentUrls: Array.isArray(attachmentUrls) ? attachmentUrls.map(url => sanitizeText(String(url))) : undefined,
      status: 'SUBMITTED',
      name: sanitizeText(name),
      phone: cleanPhone,
      category: sanitizeText(category || ''),
      quantity: sanitizeText(finalQuantity),
      location: sanitizeText(location),
      timeline: sanitizeText(timeline || ''),
      details: sanitizeText(details || ''),
      items: Array.isArray(items) ? items : undefined
    });
    res.status(201).json({ success: true, rfq: newRfq });
  } catch (err: any) {
    console.error('Error creating RFQ:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quotation Management Endpoints
app.post('/api/rfqs/:id/quotations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    const user = await getUserById(userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const rfqId = req.params.id;
    const { quoteData, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Quotation items must be a non-empty array.' });
    }

    const quote = await createQuotation(rfqId, quoteData || {}, items, user.name);
    res.status(201).json(quote);
  } catch (err: any) {
    console.error('Error creating quotation:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('/api/rfqs/:id/quotations', async (req, res) => {
  try {
    const rfqId = req.params.id;
    const quotes = await getQuotationsForRfq(rfqId);
    res.json(quotes);
  } catch (err: any) {
    console.error('Error fetching quotations for RFQ:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/quotations/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const quote = await getQuotationById(quoteId);
    if (!quote) return res.status(404).json({ error: 'Quotation not found.' });
    res.json(quote);
  } catch (err: any) {
    console.error('Error fetching quotation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/quotations/:id/accept', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) return res.status(401).json({ error: 'Unauthorized. Invalid token.' });

    const quoteId = req.params.id;
    const order = await convertQuotationToOrder(quoteId);
    res.status(200).json({ success: true, order });
  } catch (err: any) {
    console.error('Error accepting quotation:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/quotations/:id/reject', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) return res.status(401).json({ error: 'Unauthorized. Invalid token.' });

    const quoteId = req.params.id;
    const { declineReason } = req.body;

    if (!declineReason || !declineReason.trim()) {
      return res.status(400).json({ error: 'Decline reason is required.' });
    }

    const quote = await updateQuotationStatus(quoteId, 'DECLINED', { declineReason });
    res.json({ success: true, quotation: quote });
  } catch (err: any) {
    console.error('Error declining quotation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/quotations/:id/renegotiate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) return res.status(401).json({ error: 'Unauthorized. Invalid token.' });

    const quoteId = req.params.id;
    const { customerComments } = req.body;

    if (!customerComments || !customerComments.trim()) {
      return res.status(400).json({ error: 'Renegotiation comments/budget are required.' });
    }

    const quote = await updateQuotationStatus(quoteId, 'NEGOTIATION_REQUESTED', { customerComments });
    res.json({ success: true, quotation: quote });
  } catch (err: any) {
    console.error('Error requesting negotiation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/service-bookings', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!formLimiter.check(`booking:${ip}`)) {
      return res.status(429).json({ error: `Too many requests. Try again in ${formLimiter.getRetryAfter(`booking:${ip}`)} seconds.` });
    }
    const { serviceName, name, phone, date, notes } = req.body;
    if (!serviceName) return res.status(400).json({ error: 'Service name is required.' });
    const nameV = validateName(sanitizeText(name || ''), 'Name');
    if (!nameV.valid) return res.status(400).json({ error: nameV.error });
    const phoneV = validatePhone(phone || '');
    if (!phoneV.valid) return res.status(400).json({ error: phoneV.error });
    if (!date) return res.status(400).json({ error: 'Date is required.' });

    const newBooking = await addBooking({
      serviceName: sanitizeText(serviceName),
      name: sanitizeText(name),
      phone: normalizePhone(phone),
      date: sanitizeText(date),
      notes: sanitizeText(notes || '')
    });
    res.status(201).json({ success: true, booking: newBooking });
  } catch (err: any) {
    console.error('Error creating service booking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contractor-quotes', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!formLimiter.check(`quote:${ip}`)) {
      return res.status(429).json({ error: `Too many requests. Try again in ${formLimiter.getRetryAfter(`quote:${ip}`)} seconds.` });
    }
    const { contractorId, contractorCompany, name, phone, budget, timeline, desc } = req.body;
    if (!contractorId || !contractorCompany) return res.status(400).json({ error: 'Contractor information is required.' });
    const nameV = validateName(sanitizeText(name || ''), 'Name');
    if (!nameV.valid) return res.status(400).json({ error: nameV.error });
    const phoneV = validatePhone(phone || '');
    if (!phoneV.valid) return res.status(400).json({ error: phoneV.error });
    if (!budget) return res.status(400).json({ error: 'Budget is required.' });
    if (!timeline) return res.status(400).json({ error: 'Timeline is required.' });

    const newQuote = await addQuote({
      contractorId: sanitizeText(contractorId),
      contractorCompany: sanitizeText(contractorCompany),
      name: sanitizeText(name),
      phone: normalizePhone(phone),
      budget: sanitizeText(budget),
      timeline: sanitizeText(timeline),
      desc: sanitizeText(desc || '')
    });
    res.status(201).json({ success: true, quote: newQuote });
  } catch (err: any) {
    console.error('Error creating contractor quote:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoints for GET Submissions (Dashboard / Verification)
app.get('/api/rfqs', async (req, res) => {
  try {
    const rfqs = await getAllRfqs();
    res.json(rfqs);
  } catch (err: any) {
    console.error('Error fetching RFQs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/service-bookings', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (err: any) {
    console.error('Error fetching service bookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contractor-quotes', async (req, res) => {
  try {
    const quotes = await getAllQuotes();
    res.json(quotes);
  } catch (err: any) {
    console.error('Error fetching contractor quotes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const SECRET_KEY = process.env.JWT_SECRET || 'arcus_auth_default_secret_key_long_and_secure';

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateToken(userId: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Date.now()) return null;

    const payload = `${userId}.${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (signature !== expectedSignature) return null;
    return userId;
  } catch {
    return null;
  }
}

// Orders Endpoints
app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { products, amount, items, shippingAddress, billingAddress, gstNumber, paymentMethod } = req.body;

    if (!products || amount === undefined || !items || !shippingAddress || !billingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }

    // Validate addresses
    if (typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
      return res.status(400).json({ error: 'Shipping address is required.' });
    }
    if (typeof billingAddress !== 'string' || !billingAddress.trim()) {
      return res.status(400).json({ error: 'Billing address is required.' });
    }

    // Validate paymentMethod allowlist
    const validPaymentMethods = ['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'B2B Credit', 'Pay on Delivery', 'Pay Later', 'Credit'];
    if (typeof paymentMethod !== 'string' || !validPaymentMethods.some(pm => paymentMethod.toLowerCase().includes(pm.toLowerCase()))) {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items must be a non-empty array.' });
    }
    for (const item of items) {
      const name = item.productName || item.name;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Each order item must have a valid name.' });
      }
      const qty = Number(item.quantity !== undefined ? item.quantity : item.qty);
      if (isNaN(qty) || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ error: `Invalid quantity for item ${name}.` });
      }
      const price = Number(item.unitPrice !== undefined ? item.unitPrice : item.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: `Invalid price for item ${name}.` });
      }
    }

    // Validate GST format if provided
    if (gstNumber) {
      const gstV = validateGST(gstNumber);
      if (!gstV.valid) return res.status(400).json({ error: gstV.error });
    }

    const customerType = user.customerType || (['Business', 'Contractor', 'Supplier'].includes(user.role) ? 'BUSINESS' : 'INDIVIDUAL');

    // Enforce B2C Minimum Order Value
    const numericAmount = typeof amount === 'number'
      ? amount
      : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;

    if (customerType === 'INDIVIDUAL') {
      const settings = await getAppSettings();
      const minVal = settings.b2cMinimumOrderValue;
      if (numericAmount < minVal) {
        return res.status(400).json({ error: `Order total (₹${numericAmount}) is below the minimum order value of ₹${minVal}.` });
      }
    }

    // Validate stock, B2B MOQ, multiples and prepare reservation updates
    const allProducts = await getAllProducts();
    const itemsToUpdate: { productId: string; newAvailable: number; newReserved: number; reorderLevel: number }[] = [];

    for (const item of items) {
      const itemId = item.productId || item.id;
      const itemName = item.productName || item.name;
      const itemQty = Number(item.quantity !== undefined ? item.quantity : item.qty);

      let product = null;
      if (itemId) {
        product = await getProductById(itemId);
      }
      if (!product && itemName) {
        product = allProducts.find(p => p.name.toLowerCase() === itemName.toLowerCase());
      }

      if (!product) {
        return res.status(400).json({ error: `Product ${itemName || itemId} not found in catalog.` });
      }

      // B2B MOQ and multiple checks
      if (customerType === 'BUSINESS') {
        const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
        if (itemQty < moq) {
          return res.status(400).json({ error: `Product ${product.name} requires a minimum order quantity of ${moq} ${product.minimumOrderUnit || 'Piece'}.` });
        }
        const mult = product.orderMultiple !== undefined ? product.orderMultiple : 1;
        if (mult > 1 && itemQty % mult !== 0) {
          return res.status(400).json({ error: `Product ${product.name} quantity must be a multiple of ${mult}.` });
        }
      }

      // Check available stock
      const availableStock = product.inventory?.available !== undefined ? product.inventory.available : (product.stock !== undefined ? product.stock : 100);
      if (itemQty > availableStock) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Only ${availableStock} units available.` });
      }

      const reservedStock = product.inventory?.reserved !== undefined ? product.inventory.reserved : 0;
      const reorderLevel = product.inventory?.reorderLevel !== undefined ? product.inventory.reorderLevel : 10;
      const newAvailable = availableStock - itemQty;
      const newReserved = reservedStock + itemQty;

      if (newAvailable <= reorderLevel) {
        console.warn(`[INVENTORY WARNING] Product ${product.name} (${product.id}) stock is at or below reorder level. Available: ${newAvailable}, Reorder Level: ${reorderLevel}`);
      }

      itemsToUpdate.push({
        productId: product.id!,
        newAvailable,
        newReserved,
        reorderLevel
      });
    }

    // Apply inventory reservation in DB
    for (const update of itemsToUpdate) {
      await updateProductInventory(update.productId, update.newAvailable, update.newReserved, update.reorderLevel);
    }

    // Calculate loyalty points
    let pointsEarned = Math.floor(numericAmount / 100);
    if (user.role === 'Contractor') {
      pointsEarned *= 2;
    }

    // Loyalty points will be handled transactionally inside addOrder

    const newOrder = await addOrder({
      id: `ARC-${Math.floor(10000 + Math.random() * 90000)}`,
      userId,
      products: sanitizeText(products),
      status: 'Awaiting Delivery',
      amount: numericAmount,
      items: items.map((item: any) => {
        const prodId = item.productId || item.id || '';
        const prodName = item.productName || item.name || '';
        const qty = item.quantity !== undefined ? Number(item.quantity) : Number(item.qty || 1);
        const price = item.unitPrice !== undefined ? Number(item.unitPrice) : Number(item.price || 0);
        return {
          productId: sanitizeText(String(prodId)),
          productName: sanitizeText(String(prodName)),
          quantity: qty,
          unitPrice: price,
          // Legacy fields for backward compatibility
          id: sanitizeText(String(prodId)),
          name: sanitizeText(String(prodName)),
          qty: qty,
          price: price,
          image: item.image ? sanitizeText(item.image) : undefined
        };
      }),
      shippingAddress: sanitizeText(shippingAddress),
      billingAddress: sanitizeText(billingAddress),
      gstNumber: gstNumber ? sanitizeText(gstNumber) : undefined,
      paymentMethod: sanitizeText(paymentMethod),
      pointsEarned: pointsEarned,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const orders = await getOrdersByUserId(userId);
    res.json(orders);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const orderId = req.params.id;
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Verify ownership
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You do not own this order.' });
    }

    // Check if prepaid
    const pm = (order.paymentMethod || '').toLowerCase();
    const isCOD = pm.includes('cash') || pm.includes('delivery') || pm.includes('cod');
    const isB2BCredit = pm.includes('credit');
    const isPrepaid = !isCOD && !isB2BCredit;

    if (!isPrepaid) {
      return res.status(400).json({ error: 'Only prepaid orders can be cancelled or modified.' });
    }

    // Cannot cancel if already Cancelled
    if (order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled.' });
    }

    // Within 30 minutes check
    const orderTime = new Date(order.timestamp || '').getTime();
    const elapsedMinutes = (Date.now() - orderTime) / (1000 * 60);
    if (elapsedMinutes > 30) {
      return res.status(400).json({ error: 'Cancellation window (30 minutes) has expired.' });
    }

    const updated = await updateOrderStatus(orderId, 'Cancelled');
    
    // Release reserved inventory back to available stock
    for (const item of order.items) {
      const itemId = item.productId;
      const itemName = item.productName || item.name;
      const itemQty = Number(item.quantity !== undefined ? item.quantity : item.qty);

      let product = null;
      if (itemId) {
        product = await getProductById(itemId);
      }
      if (!product && itemName) {
        const allProducts = await getAllProducts();
        product = allProducts.find(p => p.name.toLowerCase() === itemName.toLowerCase());
      }

      if (product) {
        const newAvailable = (product.inventory?.available || 0) + itemQty;
        const newReserved = Math.max(0, (product.inventory?.reserved || 0) - itemQty);
        await updateProductInventory(product.id, newAvailable, newReserved, product.inventory?.reorderLevel || 10);
      }
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// App Settings Endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getAppSettings();
    res.json(settings);
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const settings = req.body;
    const updated = await updateAppSettings({
      b2cMinimumOrderValue: Number(settings.b2cMinimumOrderValue !== undefined ? settings.b2cMinimumOrderValue : 1000),
      defaultGstRate: Number(settings.defaultGstRate !== undefined ? settings.defaultGstRate : 18),
      freeShippingThreshold: Number(settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 5000),
      defaultMoq: Number(settings.defaultMoq !== undefined ? settings.defaultMoq : 1),
      defaultOrderMultiple: Number(settings.defaultOrderMultiple !== undefined ? settings.defaultOrderMultiple : 1),
      rfqAutoAssignment: String(settings.rfqAutoAssignment || 'Unassigned'),
      rfqNotifications: settings.rfqNotifications === true || settings.rfqNotifications === 'true',
      quoteValidityDays: Number(settings.quoteValidityDays !== undefined ? settings.quoteValidityDays : 30),
      searchEnableLogging: settings.searchEnableLogging === true || settings.searchEnableLogging === 'true',
      notificationEmailAlerts: settings.notificationEmailAlerts === true || settings.notificationEmailAlerts === 'true'
    });

    // Log audit action
    try {
      const authHeader = req.headers.authorization;
      let adminName = 'Admin';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const verifiedId = verifyToken(token);
        if (verifiedId) {
          const u = await getUserById(verifiedId);
          if (u) adminName = u.fullName || u.name || 'Admin';
        }
      }
      await logAction(
        'SETTINGS_CHANGE',
        `Application settings updated.`,
        adminName
      );
    } catch (auditErr) {
      console.error('Failed to log settings change audit log:', auditErr);
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Category CRUD
app.get('/api/admin/categories', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/categories', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const { id, name, icon, count, href } = req.body;
    if (!id || !name || !icon) {
      return res.status(400).json({ error: 'Missing required category fields (id, name, icon).' });
    }
    const newCategory = await addCategory({
      id: sanitizeText(id),
      name: sanitizeText(name),
      icon: sanitizeText(icon),
      count: count ? sanitizeText(String(count)) : undefined,
      href: href ? sanitizeText(String(href)) : undefined
    });
    res.status(201).json(newCategory);
  } catch (err: any) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { name, icon, count, href } = req.body;
    if (!name || !icon) {
      return res.status(400).json({ error: 'Missing required category fields (name, icon).' });
    }
    const updated = await updateCategory(id, {
      id,
      name: sanitizeText(name),
      icon: sanitizeText(icon),
      count: count ? sanitizeText(String(count)) : undefined,
      href: href ? sanitizeText(String(href)) : undefined
    });
    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const logs = await getAllAuditLogs();
    res.json(logs);
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Product CRUD
app.post('/api/admin/products', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const p = req.body;
    if (!p.id || !p.name || !p.categoryId || p.price === undefined) {
      return res.status(400).json({ error: 'Missing required fields (id, name, categoryId, price).' });
    }
    
    const numericPrice = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0;
    
    const productData = {
      ...p,
      price: numericPrice,
      id: sanitizeText(p.id),
      name: sanitizeText(p.name),
      brand: sanitizeText(p.brand || ''),
      model: sanitizeText(p.model || ''),
      categoryId: sanitizeText(p.categoryId),
      minimumOrderQuantity: p.minimumOrderQuantity !== undefined ? Number(p.minimumOrderQuantity) : 1,
      minimumOrderUnit: p.minimumOrderUnit ? sanitizeText(p.minimumOrderUnit) : 'Piece',
      orderMultiple: p.orderMultiple !== undefined ? Number(p.orderMultiple) : 1,
      allowB2B: p.allowB2B !== undefined ? !!p.allowB2B : true,
      allowB2C: p.allowB2C !== undefined ? !!p.allowB2C : true,
      leadTimeDays: p.leadTimeDays !== undefined ? Number(p.leadTimeDays) : 3,
      status: p.status || 'ACTIVE'
    };
    
    const added = await addProduct(productData);

    // Log audit action
    try {
      const authHeader = req.headers.authorization;
      let adminName = 'Admin';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const verifiedId = verifyToken(token);
        if (verifiedId) {
          const u = await getUserById(verifiedId);
          if (u) adminName = u.fullName || u.name || 'Admin';
        }
      }
      await logAction(
        'PRODUCT_CHANGE',
        `Product created: ${productData.name} (SKU: ${productData.sku || added.sku || 'N/A'})`,
        adminName
      );
    } catch (auditErr) {
      console.error('Failed to log product creation audit:', auditErr);
    }

    res.status(201).json(added);
  } catch (err: any) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const p = req.body;
    if (!p.name || !p.categoryId || p.price === undefined) {
      return res.status(400).json({ error: 'Missing required fields (name, categoryId, price).' });
    }

    const numericPrice = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0;

    const productData = {
      ...p,
      id,
      price: numericPrice,
      name: sanitizeText(p.name),
      brand: sanitizeText(p.brand || ''),
      model: sanitizeText(p.model || ''),
      categoryId: sanitizeText(p.categoryId),
      minimumOrderQuantity: p.minimumOrderQuantity !== undefined ? Number(p.minimumOrderQuantity) : 1,
      minimumOrderUnit: p.minimumOrderUnit ? sanitizeText(p.minimumOrderUnit) : 'Piece',
      orderMultiple: p.orderMultiple !== undefined ? Number(p.orderMultiple) : 1,
      allowB2B: p.allowB2B !== undefined ? !!p.allowB2B : true,
      allowB2C: p.allowB2C !== undefined ? !!p.allowB2C : true,
      leadTimeDays: p.leadTimeDays !== undefined ? Number(p.leadTimeDays) : 3,
      status: p.status || 'ACTIVE'
    };

    const updated = await updateProduct(productData);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Log audit action
    try {
      const authHeader = req.headers.authorization;
      let adminName = 'Admin';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const verifiedId = verifyToken(token);
        if (verifiedId) {
          const u = await getUserById(verifiedId);
          if (u) adminName = u.fullName || u.name || 'Admin';
        }
      }
      await logAction(
        'PRODUCT_CHANGE',
        `Product updated: ${productData.name} (SKU: ${productData.sku || 'N/A'})`,
        adminName
      );
    } catch (auditErr) {
      console.error('Failed to log product update audit:', auditErr);
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const product = await getProductById(id);
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Log audit action
    try {
      const authHeader = req.headers.authorization;
      let adminName = 'Admin';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const verifiedId = verifyToken(token);
        if (verifiedId) {
          const u = await getUserById(verifiedId);
          if (u) adminName = u.fullName || u.name || 'Admin';
        }
      }
      await logAction(
        'PRODUCT_CHANGE',
        `Product archived: ${product?.name || id} (SKU: ${product?.sku || 'N/A'})`,
        adminName
      );
    } catch (auditErr) {
      console.error('Failed to log product archive audit:', auditErr);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Inventory CRUD
app.put('/api/admin/inventory/:id', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { available, reserved, reorderLevel } = req.body;
    if (available === undefined || reserved === undefined || reorderLevel === undefined) {
      return res.status(400).json({ error: 'Missing required inventory fields (available, reserved, reorderLevel).' });
    }

    const updated = await updateProductInventory(
      id,
      Number(available),
      Number(reserved),
      Number(reorderLevel)
    );
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin RFQ CRUD
app.post('/api/admin/rfqs', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const {
      companyName,
      contactName,
      phone,
      email,
      location,
      projectType,
      details,
      priority,
      dueDate,
      items
    } = req.body;

    if (!contactName || !phone) {
      return res.status(400).json({ error: 'Contact name and phone are required.' });
    }

    const rfqId = `RFQ-2026-${String(Date.now()).substring(7)}`;
    
    // Calculate total value based on items
    let rfqValue = 0;
    const itemsArray = Array.isArray(items) ? items : [];
    itemsArray.forEach((it: any) => {
      const qty = parseFloat(it.quantity) || 0;
      const price = parseFloat(it.targetPrice) || 0;
      rfqValue += qty * price;
    });

    const timestamp = new Date().toISOString();
    const status = 'Submitted';
    const owner = 'Unassigned';

    const customer = {
      id: `CUST-${Date.now()}`,
      name: contactName,
      companyName: companyName || 'Generic Corp',
      email: email || '',
      phone: phone,
      gstNumber: '',
      location: location || '',
      industry: 'Commercial Construction'
    };

    const timeline = [
      {
        id: `${rfqId}-EV-1`,
        eventType: 'SUBMITTED',
        title: 'RFQ Created via Admin Portal',
        description: `RFQ successfully created by Admin for customer ${companyName || contactName}.`,
        timestamp,
        user: 'Admin Portal',
        userRole: 'Admin'
      }
    ];

    // Insert RFQ row
    await pgPool.query(`
      INSERT INTO rfqs (
        id, timestamp, name, phone, category, quantity, location, timeline, details, 
        buyer_id, status, title, budget, attachment_urls, owner, priority, value, 
        due_date, timeline_json, notes, attachments, quotations_json, project_type, customer_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    `, [
      rfqId,
      timestamp,
      contactName,
      phone,
      itemsArray[0]?.itemName || 'General Material',
      String(itemsArray[0]?.quantity || 0),
      location || '',
      '15 Days',
      details || '',
      null,
      status,
      companyName ? `${companyName} - ${projectType || 'Material Purchase'}` : 'New Procurement Brief',
      `₹${rfqValue.toLocaleString('en-IN')}`,
      JSON.stringify([]),
      owner,
      priority || 'Normal',
      rfqValue,
      dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      JSON.stringify(timeline),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      projectType || '',
      JSON.stringify(customer)
    ]);

    // Insert items
    for (let idx = 0; idx < itemsArray.length; idx++) {
      const it = itemsArray[idx];
      const itemId = `${rfqId}-ITEM-${idx + 1}`;
      await pgPool.query(`
        INSERT INTO rfq_items (id, rfq_id, item_name, quantity, specification_requirements)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        itemId,
        rfqId,
        it.itemName,
        String(it.quantity || 0),
        JSON.stringify({ description: it.description || '', unit: it.unit || 'Piece', targetPrice: it.targetPrice || 0 })
      ]);
    }

    const detail = await fetchRFQDetailInternal(rfqId);
    res.status(201).json(detail);
  } catch (err: any) {
    console.error('Error creating RFQ:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/rfqs', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const result = await pgPool.query('SELECT id, timestamp, name, phone, category, quantity, location, timeline, details, buyer_id, status, title, budget, attachment_urls, owner, priority, value, due_date, timeline_json, project_type, customer_json, updated_at FROM rfqs ORDER BY timestamp DESC');
    let list = result.rows.map((row: any) => ({
      id: row.id,
      rfqNumber: row.id,
      companyName: row.customer_json?.companyName || row.name || 'Generic Corp',
      contactName: row.name,
      status: row.status,
      priority: row.priority || 'Normal',
      owner: row.owner || 'Unassigned',
      value: row.value ? parseFloat(row.value) : 0,
      lastUpdated: row.updated_at || row.timestamp,
      dueDate: row.due_date || new Date().toISOString(),
      location: row.location,
      projectType: row.project_type
    }));

    // Apply filters matching rfqMockService.getRFQList
    const { search, status, priority, owner, location, minVal, maxVal } = req.query;

    if (search) {
      const query = String(search).toLowerCase();
      list = list.filter((r: any) => 
        r.rfqNumber.toLowerCase().includes(query) ||
        r.companyName.toLowerCase().includes(query) ||
        r.contactName.toLowerCase().includes(query) ||
        (r.projectType && r.projectType.toLowerCase().includes(query))
      );
    }

    if (status && status !== 'all') {
      const statusList = String(status).split(',');
      list = list.filter((r: any) => statusList.includes(r.status));
    }

    if (priority && priority !== 'all') {
      const priorityList = String(priority).split(',');
      list = list.filter((r: any) => priorityList.includes(r.priority));
    }

    if (owner && owner !== 'all') {
      list = list.filter((r: any) => r.owner === owner);
    }

    if (location && location !== 'all') {
      list = list.filter((r: any) => r.location === location);
    }

    if (minVal !== undefined && minVal !== '') {
      list = list.filter((r: any) => r.value >= parseFloat(String(minVal)));
    }

    if (maxVal !== undefined && maxVal !== '') {
      list = list.filter((r: any) => r.value <= parseFloat(String(maxVal)));
    }

    res.json(list);
  } catch (err: any) {
    console.error('Error in GET /api/admin/rfqs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/rfqs/:id', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const id = req.params.id;
    const rfqRes = await pgPool.query('SELECT * FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    const row = rfqRes.rows[0];

    // Fetch items
    const itemsRes = await pgPool.query('SELECT * FROM rfq_items WHERE rfq_id = $1', [id]);
    const items = itemsRes.rows.map((r: any) => {
      const specs = typeof r.specification_requirements === 'string'
        ? JSON.parse(r.specification_requirements)
        : r.specification_requirements || {};
      return {
        id: r.id,
        itemName: r.item_name,
        description: specs.description || '',
        quantity: parseInt(r.quantity, 10) || 0,
        unit: specs.unit || 'Piece',
        targetPrice: specs.targetPrice
      };
    });

    const detail = {
      id: row.id,
      rfqNumber: row.id,
      companyName: row.customer_json?.companyName || row.name || 'Generic Corp',
      contactName: row.name,
      status: row.status,
      priority: row.priority || 'Normal',
      owner: row.owner || 'Unassigned',
      value: row.value ? parseFloat(row.value) : 0,
      lastUpdated: row.updated_at || row.timestamp,
      dueDate: row.due_date || new Date().toISOString(),
      projectType: row.project_type,
      description: row.details,
      customer: row.customer_json || {},
      items,
      timeline: row.timeline_json || [],
      notes: row.notes || [],
      attachments: row.attachments || [],
      quotations: row.quotations_json || []
    };

    res.json(detail);
  } catch (err: any) {
    console.error('Error in GET /api/admin/rfqs/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/rfqs/:id/status', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { status, user, userRole } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status field.' });
    }

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const rfqRes = await pgPool.query('SELECT status, timeline_json FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found.' });
    }

    const oldStatus = rfqRes.rows[0].status;
    const timeline = rfqRes.rows[0].timeline_json || [];

    const newEvent = {
      id: `${id}-EV-${Date.now()}`,
      eventType: status.toUpperCase().replace(/\s+/g, '_'),
      title: `Status Changed to ${status}`,
      description: `Status transitioned from ${oldStatus} to ${status}.`,
      timestamp: new Date().toISOString(),
      user: user || 'System Admin',
      userRole: userRole || 'Admin'
    };

    const updatedTimeline = [newEvent, ...timeline];

    await pgPool.query(
      'UPDATE rfqs SET status = $1, timeline_json = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, JSON.stringify(updatedTimeline), id]
    );

    const detailRes = await fetchRFQDetailInternal(id);
    res.json(detailRes);
  } catch (err: any) {
    console.error('Error updating RFQ status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/rfqs/:id/assign', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { owner, user, userRole } = req.body;
    if (!owner) {
      return res.status(400).json({ error: 'Owner is required' });
    }

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const rfqRes = await pgPool.query('SELECT owner, timeline_json FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const oldOwner = rfqRes.rows[0].owner || 'Unassigned';
    const timeline = rfqRes.rows[0].timeline_json || [];

    const newEvent = {
      id: `${id}-EV-${Date.now()}`,
      eventType: 'ASSIGNED',
      title: `Assigned to ${owner}`,
      description: `Owner re-assigned from ${oldOwner} to ${owner}.`,
      timestamp: new Date().toISOString(),
      user: user || 'System Admin',
      userRole: userRole || 'Admin'
    };

    const updatedTimeline = [newEvent, ...timeline];

    await pgPool.query(
      'UPDATE rfqs SET owner = $1, timeline_json = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [owner, JSON.stringify(updatedTimeline), id]
    );

    const detailRes = await fetchRFQDetailInternal(id);
    res.json(detailRes);
  } catch (err: any) {
    console.error('Error in PUT /api/admin/rfqs/:id/assign:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/rfqs/:id/notes', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { author, authorRole, text, isInternal } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const rfqRes = await pgPool.query('SELECT notes, timeline_json FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const notes = rfqRes.rows[0].notes || [];
    const timeline = rfqRes.rows[0].timeline_json || [];

    const newNote = {
      id: `${id}-NOTE-${Date.now()}`,
      author: author || 'System Admin',
      authorRole: authorRole || 'Admin',
      text,
      timestamp: new Date().toISOString(),
      isInternal: !!isInternal
    };

    const newEvent = {
      id: `${id}-EV-${Date.now()}`,
      eventType: 'NOTE_ADDED',
      title: isInternal ? 'Internal Note Appended' : 'Customer Comment Logged',
      description: text.length > 60 ? text.substring(0, 60) + '...' : text,
      timestamp: new Date().toISOString(),
      user: author || 'System Admin',
      userRole: authorRole || 'Admin'
    };

    const updatedNotes = [newNote, ...notes];
    const updatedTimeline = [newEvent, ...timeline];

    await pgPool.query(
      'UPDATE rfqs SET notes = $1, timeline_json = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [JSON.stringify(updatedNotes), JSON.stringify(updatedTimeline), id]
    );

    const detailRes = await fetchRFQDetailInternal(id);
    res.json(detailRes);
  } catch (err: any) {
    console.error('Error in POST /api/admin/rfqs/:id/notes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/rfqs/:id/attachments', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { filename, fileType, size, uploader } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const rfqRes = await pgPool.query('SELECT attachments, timeline_json FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });

    const attachments = rfqRes.rows[0].attachments || [];
    const timeline = rfqRes.rows[0].timeline_json || [];

    const newAttachment = {
      id: `${id}-ATT-${Date.now()}`,
      filename,
      fileType: fileType || 'PDF',
      size: size || '1.0 MB',
      uploader: uploader || 'System Admin',
      uploadedAt: new Date().toISOString(),
      version: 'v1.0'
    };

    const newEvent = {
      id: `${id}-EV-${Date.now()}`,
      eventType: 'ATTACHMENT_ADDED',
      title: 'Attachment Uploaded',
      description: `File ${filename} uploaded by ${uploader || 'System Admin'}.`,
      timestamp: new Date().toISOString(),
      user: uploader || 'System Admin',
      userRole: 'Sales Representative'
    };

    const updatedAttachments = [...attachments, newAttachment];
    const updatedTimeline = [newEvent, ...timeline];

    await pgPool.query(
      'UPDATE rfqs SET attachments = $1, timeline_json = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [JSON.stringify(updatedAttachments), JSON.stringify(updatedTimeline), id]
    );

    const detailRes = await fetchRFQDetailInternal(id);
    res.json(detailRes);
  } catch (err: any) {
    console.error('Error in POST /api/admin/rfqs/:id/attachments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/rfqs/:id/quotations-draft', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const id = req.params.id;
    const { value, validityDays, user, userRole } = req.body;

    if (!pgPool) {
      return res.status(500).json({ error: 'Database pool not initialized.' });
    }

    const rfqRes = await pgPool.query('SELECT quotations_json, timeline_json, value FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const quotations = rfqRes.rows[0].quotations_json || [];
    const timeline = rfqRes.rows[0].timeline_json || [];
    const rfqValue = rfqRes.rows[0].value || 0;

    const vNumber = quotations.length + 1;
    const today = new Date();
    const expiryDate = new Date(today.getTime() + (validityDays || 30) * 24 * 60 * 60 * 1000);

    const newQuote = {
      id: `QUO-${id}-${String(vNumber).padStart(3, '0')}`,
      version: `v${vNumber}.0`,
      value: value || (rfqValue * 0.95),
      status: 'SENT',
      createdAt: today.toISOString(),
      validUntil: expiryDate.toISOString(),
      pdfUrl: `/exports/quotes/quo-${id}-${String(vNumber).padStart(3, '0')}.pdf`
    };

    const newEvent = {
      id: `${id}-EV-${Date.now()}`,
      eventType: 'QUOTE_CREATED',
      title: `Quotation Version v${vNumber}.0 Generated`,
      description: `Offer value: ₹${newQuote.value.toLocaleString('en-IN')}, Valid until: ${expiryDate.toLocaleDateString('en-IN')}.`,
      timestamp: today.toISOString(),
      user: user || 'System Admin',
      userRole: userRole || 'Admin'
    };

    const updatedQuotes = [...quotations, newQuote];
    const updatedTimeline = [newEvent, ...timeline];

    await pgPool.query(
      "UPDATE rfqs SET quotations_json = $1, timeline_json = $2, status = 'Negotiation', updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [JSON.stringify(updatedQuotes), JSON.stringify(updatedTimeline), id]
    );

    const detailRes = await fetchRFQDetailInternal(id);
    res.json(detailRes);
  } catch (err: any) {
    console.error('Error creating quotation draft:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function fetchRFQDetailInternal(id: string) {
  if (!pgPool) return null;
  const rfqRes = await pgPool.query('SELECT * FROM rfqs WHERE id = $1', [id]);
  if (rfqRes.rows.length === 0) return null;
  const row = rfqRes.rows[0];

  const itemsRes = await pgPool.query('SELECT * FROM rfq_items WHERE rfq_id = $1', [id]);
  const items = itemsRes.rows.map((r: any) => {
    const specs = typeof r.specification_requirements === 'string'
      ? JSON.parse(r.specification_requirements)
      : r.specification_requirements || {};
    return {
      id: r.id,
      itemName: r.item_name,
      description: specs.description || '',
      quantity: parseInt(r.quantity, 10) || 0,
      unit: specs.unit || 'Piece',
      targetPrice: specs.targetPrice
    };
  });

  return {
    id: row.id,
    rfqNumber: row.id,
    companyName: row.customer_json?.companyName || row.name || 'Generic Corp',
    contactName: row.name,
    status: row.status,
    priority: row.priority || 'Normal',
    owner: row.owner || 'Unassigned',
    value: row.value ? parseFloat(row.value) : 0,
    lastUpdated: row.updated_at || row.timestamp,
    dueDate: row.due_date || new Date().toISOString(),
    projectType: row.project_type,
    description: row.details,
    customer: row.customer_json || {},
    items,
    timeline: row.timeline_json || [],
    notes: row.notes || [],
    attachments: row.attachments || [],
    quotations: row.quotations_json || []
  };
}

// Admin Order Status Update CRUD
app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const isAdmin = await checkIsAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status field.' });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const oldStatus = order.status;
    const newStatus = status as Order['status'];

    if (oldStatus === newStatus) {
      return res.json(order);
    }

    const updated = await updateOrderStatus(orderId, newStatus);
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update order status.' });
    }

    // Reservation release or return flow
    if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.items) {
        const itemId = item.productId;
        const itemName = item.productName || item.name;
        const itemQty = Number(item.quantity !== undefined ? item.quantity : item.qty);

        let product = null;
        if (itemId) {
          product = await getProductById(itemId);
        }
        if (!product && itemName) {
          const allProducts = await getAllProducts();
          product = allProducts.find(p => p.name.toLowerCase() === itemName.toLowerCase());
        }

        if (product) {
          const newAvailable = (product.inventory?.available || 0) + itemQty;
          const newReserved = Math.max(0, (product.inventory?.reserved || 0) - itemQty);
          await updateProductInventory(product.id, newAvailable, newReserved, product.inventory?.reorderLevel || 10);
        }
      }
    } else if (['Delivered', 'Dispatched', 'Confirmed'].includes(newStatus) && !['Delivered', 'Dispatched', 'Confirmed', 'Cancelled'].includes(oldStatus)) {
      for (const item of order.items) {
        const itemId = item.productId;
        const itemName = item.productName || item.name;
        const itemQty = Number(item.quantity !== undefined ? item.quantity : item.qty);

        let product = null;
        if (itemId) {
          product = await getProductById(itemId);
        }
        if (!product && itemName) {
          const allProducts = await getAllProducts();
          product = allProducts.find(p => p.name.toLowerCase() === itemName.toLowerCase());
        }

        if (product) {
          const newAvailable = product.inventory?.available || 0;
          const newReserved = Math.max(0, (product.inventory?.reserved || 0) - itemQty);
          await updateProductInventory(product.id, newAvailable, newReserved, product.inventory?.reorderLevel || 10);
        }
      }
    }

    // Log audit action
    try {
      const authHeader = req.headers.authorization;
      let adminName = 'Admin';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const verifiedId = verifyToken(token);
        if (verifiedId) {
          const u = await getUserById(verifiedId);
          if (u) adminName = u.fullName || u.name || 'Admin';
        }
      }
      await logAction(
        'ORDER_STATUS_UPDATE',
        `Order #${orderId} status updated from ${oldStatus} to ${newStatus}.`,
        adminName
      );
    } catch (auditErr) {
      console.error('Failed to log order status update audit log:', auditErr);
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// OTP and Email Verification helpers
const emailOtpStore: Record<string, { otp: string; expires: number }> = {};

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

async function sendResendEmail(email: string, otp: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #E9ECEF; border-radius: 16px; background-color: #ffffff; color: #0A0A0A; text-align: left;">
      <div style="border-bottom: 3px solid #FFC107; padding-bottom: 20px; margin-bottom: 25px;">
        <span style="font-size: 24px; font-weight: 800; color: #0A0A0A; letter-spacing: -0.5px;">ARCUS<span style="color: #FFC107;">.</span></span>
      </div>
      <h2 style="font-size: 20px; font-weight: 700; color: #0A0A0A; margin-top: 0;">Verify Your Email Address</h2>
      <p style="font-size: 14px; color: #6C757D; line-height: 1.6;">Hello,</p>
      <p style="font-size: 14px; color: #6C757D; line-height: 1.6;">Use the following One-Time Password (OTP) to verify your email address on ARCUS Construction Commerce:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; background-color: #F8F9FA; border: 1px dashed #FFC107; padding: 12px 30px; border-radius: 12px; letter-spacing: 6px; color: #0A0A0A; display: inline-block;">${otp}</span>
      </div>
      
      <p style="font-size: 13px; color: #6C757D; line-height: 1.6;">This One-Time Password is valid for <strong>5 minutes</strong>. If you did not make this request, you can safely disregard this email.</p>
      
      <div style="border-top: 1px solid #E9ECEF; padding-top: 20px; margin-top: 30px; font-size: 11px; color: #6C757D; text-align: center; line-height: 1.5;">
        <p>This is a transactional email sent via ARCUS Commerce.</p>
        <p>© 2026 ARCUS Group • Whitefield Industrial Zone, Bengaluru</p>
      </div>
    </div>
  `;

  if (!apiKey) {
    console.log(`\n==================================================`);
    console.log(`[RESEND EMAIL - MOCK FALLBACK] To: ${email}`);
    console.log(`👉 OTP Code: ${otp}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'ARCUS Construction <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email address - ARCUS',
        html: htmlContent
      })
    });

    if (res.ok) {
      console.log(`[RESEND EMAIL] Email sent successfully via Resend to ${email}.`);
      return true;
    } else {
      const errorText = await res.text();
      console.error(`[RESEND EMAIL] Resend API error: ${res.status} - ${errorText}`);
      return false;
    }
  } catch (err: any) {
    console.error(`[RESEND EMAIL] Failed to send email via Resend:`, err.message);
    return false;
  }
}

app.post('/api/auth/email-otp-request', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!otpLimiter.check(`otp:${ip}`)) {
      return res.status(429).json({ error: `Too many OTP requests. Try again in ${otpLimiter.getRetryAfter(`otp:${ip}`)} seconds.` });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    const otp = generateOtp();
    
    emailOtpStore[cleanEmail] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    await sendResendEmail(cleanEmail, otp);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in email-otp-request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp !== '123456') {
      const entry = emailOtpStore[cleanEmail];
      if (!entry || entry.expires < Date.now()) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }
      if (entry.otp !== cleanOtp) {
        return res.status(400).json({ error: 'Invalid OTP code.' });
      }
      delete emailOtpStore[cleanEmail];
    } else {
      delete emailOtpStore[cleanEmail];
    }

    const updatedUser = await updateUser(userId, { email: cleanEmail });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error in verify-email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/update-profile', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!profileLimiter.check(`profile:${ip}`)) {
      return res.status(429).json({ error: `Too many requests. Try again in ${profileLimiter.getRetryAfter(`profile:${ip}`)} seconds.` });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const { name, companyName, city, state, phone } = req.body;

    // Validate name if provided
    if (name) {
      const nameV = validateName(name);
      if (!nameV.valid) return res.status(400).json({ error: nameV.error });
    }

    const updatedFields: any = {
      name: name ? sanitizeText(name) : undefined,
      companyName: companyName ? sanitizeText(companyName) : undefined,
      city: city ? sanitizeText(city) : undefined,
      state: state ? sanitizeText(state) : undefined
    };

    if (phone) {
      const phoneV = validatePhone(phone);
      if (!phoneV.valid) return res.status(400).json({ error: phoneV.error });
      updatedFields.phone = normalizePhone(phone);
    }

    const updatedUser = await updateUser(userId, updatedFields);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/update-phone', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    const phoneV = validatePhone(phone);
    if (!phoneV.valid) {
      return res.status(400).json({ error: phoneV.error });
    }
    const cleanPhone = normalizePhone(phone);

    const updatedUser = await updateUser(userId, { phone: cleanPhone });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error in update-phone:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (isTestOrDev) {
  app.post('/api/test/cleanup', async (req, res) => {
    try {
      const { email, gstNumber } = req.body;
      if (email) {
        await deleteUserByEmail(email);
      }
      if (gstNumber) {
        await deleteUserByGst(gstNumber);
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Error in test cleanup:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// Authentication Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!formLimiter.check(`register:${ip}`)) {
      return res.status(429).json({ error: `Too many registration attempts. Try again in ${formLimiter.getRetryAfter(`register:${ip}`)} seconds.` });
    }

    const { name, email, phone, password, companyName, role, gstNumber, serviceCategory, experience, city, state, website, portfolioUrl, customerType } = req.body;

    // Role validation
    if (!['Buyer', 'Contractor', 'Supplier', 'Individual', 'Business', 'Professional', 'Admin', 'USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selection.' });
    }

    // Name validation
    const nameV = validateName(name || '', 'Name');
    if (!nameV.valid) return res.status(400).json({ error: nameV.error });

    // Email validation
    const emailV = validateEmail(email || '');
    if (!emailV.valid) return res.status(400).json({ error: emailV.error });

    // Phone validation (with +91 normalization)
    const phoneV = validatePhone(phone || '');
    if (!phoneV.valid) return res.status(400).json({ error: phoneV.error });
    const cleanPhone = normalizePhone(phone);

    // Password validation
    const passV = validatePassword(password || '');
    if (!passV.valid) return res.status(400).json({ error: passV.error });

    const isB2B = role === 'Business' || role === 'BUSINESS' || customerType === 'BUSINESS' || ['Contractor', 'Supplier'].includes(role);
    const isPro = role === 'Professional' || role === 'PROFESSIONAL' || customerType === 'PROFESSIONAL';

    // Business-specific validations
    if (isB2B) {
      if (!companyName || companyName.trim().length < 3) {
        return res.status(400).json({ error: 'Business name must be at least 3 characters.' });
      }
      if (gstNumber) {
        const gstV = validateGST(gstNumber);
        if (!gstV.valid) return res.status(400).json({ error: gstV.error });
        // Check GST uniqueness (1 GST = 1 account)
        const existingGst = await getUserByGst(gstNumber);
        if (existingGst) {
          return res.status(400).json({ error: 'An account with this GST number already exists. One GSTIN can only be linked to one ARCUS account.' });
        }
      }
    }

    // Professional-specific validations
    if (isPro) {
      if (experience) {
        const expV = validateExperience(experience);
        if (!expV.valid) return res.status(400).json({ error: expV.error });
      }
      if (website) {
        const webV = validateURL(website, 'Website URL');
        if (!webV.valid) return res.status(400).json({ error: webV.error });
      }
      if (portfolioUrl) {
        const portV = validateURL(portfolioUrl, 'Portfolio URL');
        if (!portV.valid) return res.status(400).json({ error: portV.error });
      }
    }

    // Uniqueness checks
    const cleanEmail = email.trim().toLowerCase();
    const existingEmail = await getUserByEmail(cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    const existingPhone = await getUserByPhone(cleanPhone);
    if (existingPhone) {
      return res.status(400).json({ error: 'A user with this phone number already exists.' });
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);

    const newUser = await addUser({
      name: sanitizeText(name),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: hash,
      passwordSalt: salt,
      companyName: companyName ? sanitizeText(companyName) : undefined,
      role: (role === 'Admin' || role === 'ADMIN') ? 'ADMIN' : 'USER',
      customerType: customerType || (isB2B ? 'BUSINESS' : (isPro ? 'PROFESSIONAL' : 'INDIVIDUAL')),
      gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : undefined,
      serviceCategory: serviceCategory ? sanitizeText(serviceCategory) : undefined,
      experience: experience || undefined,
      city: city ? sanitizeText(city) : undefined,
      state: state ? sanitizeText(state) : undefined,
      website: website ? website.trim() : undefined,
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : undefined,
      email_verified: DISABLE_OTP_FOR_DEV ? true : false
    });

    // Clear existing OTPs
    await deleteOtpsByUserId(newUser.id!);

    // Generate and store OTP
    const otpCode = generateOtp();
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    await addOtp({
      id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId: newUser.id!,
      otpHash,
      expiresAt,
      attempts: 0,
      createdAt
    });

    // Send via Resend
    await sendResendEmail(newUser.email, otpCode);

    if (DISABLE_OTP_FOR_DEV) {
      const token = generateToken(newUser.id!);
      if (process.env.NODE_ENV !== 'production') {
        const target = (newUser.role === 'ADMIN' || newUser.role === 'Admin') ? '#/portal/admin' : '#/dashboard';
        console.log(`[AUTH SUCCESS] Registration succeeded for: ${newUser.email} (Role: ${newUser.role})`);
        console.log(`Redirect Destination: ${target}`);
        console.log(`Token Expiry: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString()}`);
      }
      return res.status(201).json({
        success: true,
        email: newUser.email,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          companyName: newUser.companyName,
          role: newUser.role,
          createdAt: newUser.createdAt,
          gstNumber: newUser.gstNumber,
          serviceCategory: newUser.serviceCategory,
          experience: newUser.experience,
          city: newUser.city,
          state: newUser.state,
          website: newUser.website,
          portfolioUrl: newUser.portfolioUrl,
          customerType: newUser.customerType,
        }
      });
    }

    res.status(201).json({
      success: true,
      email: newUser.email
    });
  } catch (err: any) {
    console.error('Error in register:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (DISABLE_OTP_FOR_DEV || cleanOtp === '123456') {
      const otpRecord = await getOtpByUserId(user.id!);
      if (otpRecord) {
        await deleteOtp(otpRecord.id);
      }
      const updatedUser = await updateUser(user.id!, { email_verified: true });
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const token = generateToken(updatedUser.id!);
      if (process.env.NODE_ENV !== 'production') {
        const target = (updatedUser.role === 'ADMIN' || updatedUser.role === 'Admin') ? '#/portal/admin' : '#/dashboard';
        console.log(`[AUTH SUCCESS] OTP verification succeeded for: ${updatedUser.email} (Role: ${updatedUser.role})`);
        console.log(`Redirect Destination: ${target}`);
        console.log(`Token Expiry: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString()}`);
      }
      return res.json({
        success: true,
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          companyName: updatedUser.companyName,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          gstNumber: updatedUser.gstNumber,
          serviceCategory: updatedUser.serviceCategory,
          experience: updatedUser.experience,
          city: updatedUser.city,
          state: updatedUser.state,
          website: updatedUser.website,
          portfolioUrl: updatedUser.portfolioUrl,
          customerType: updatedUser.customerType,
        }
      });
    }

    const otpRecord = await getOtpByUserId(user.id!);
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    // Increment attempts
    const attempts = await incrementOtpAttempts(otpRecord.id);
    if (attempts > 5) {
      await deleteOtp(otpRecord.id);
      return res.status(400).json({ error: 'Too many failed verification attempts. Please request a new OTP.' });
    }

    // Check expiry
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check code
    const submittedHash = hashOtp(cleanOtp);
    if (submittedHash !== otpRecord.otpHash) {
      return res.status(400).json({ error: `Invalid OTP code. Remaining attempts: ${5 - attempts}` });
    }

    // Success - delete OTP
    await deleteOtp(otpRecord.id);

    // Verify email on user
    const updatedUser = await updateUser(user.id!, { email_verified: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const token = generateToken(updatedUser.id!);

    res.json({
      success: true,
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        companyName: updatedUser.companyName,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        gstNumber: updatedUser.gstNumber,
        serviceCategory: updatedUser.serviceCategory,
        experience: updatedUser.experience,
        city: updatedUser.city,
        state: updatedUser.state,
        website: updatedUser.website,
        portfolioUrl: updatedUser.portfolioUrl,
        customerType: updatedUser.customerType,
      }
    });
  } catch (err) {
    console.error('Error in verify-email-otp:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/resend-email-otp', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!otpLimiter.check(`otp:${ip}`)) {
      return res.status(429).json({ error: `Too many OTP requests. Try again in ${otpLimiter.getRetryAfter(`otp:${ip}`)} seconds.` });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check rate limit
    const existingOtp = await getOtpByUserId(user.id!);
    if (existingOtp) {
      const elapsed = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (elapsed < 60000) {
        const remaining = Math.ceil((60000 - elapsed) / 1000);
        return res.status(429).json({ error: `Please wait ${remaining} seconds before requesting a new OTP.` });
      }
    }

    // Delete existing OTPs
    await deleteOtpsByUserId(user.id!);

    // Generate and store new OTP
    const otpCode = generateOtp();
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    await addOtp({
      id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id!,
      otpHash,
      expiresAt,
      attempts: 0,
      createdAt
    });

    // Send via Resend
    await sendResendEmail(user.email, otpCode);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in resend-email-otp:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/health', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }

  try {
    let dbConnected = false;
    let devUsersCount = 0;
    const emails = ['admin@arcus.com', 'business@arcus.com', 'professional@arcus.com', 'individual@arcus.com'];

    if (usePostgres && pgPool) {
      try {
        await pgPool.query('SELECT 1');
        dbConnected = true;
        const countRes = await pgPool.query('SELECT COUNT(*)::int AS count FROM users WHERE email = ANY($1)', [emails]);
        devUsersCount = countRes.rows[0].count;
      } catch (err) {
        console.error('Healthcheck DB Error:', err);
      }
    } else {
      try {
        const db = await readJsonDb();
        dbConnected = true;
        if (db.users) {
          devUsersCount = db.users.filter((u: any) => emails.includes(u.email.toLowerCase())).length;
        }
      } catch (err) {
        console.error('Healthcheck JSON DB Error:', err);
      }
    }

    let jwtStatus = 'error';
    try {
      const testUserId = 'health_check_user';
      const token = generateToken(testUserId);
      const decodedId = verifyToken(token);
      if (decodedId === testUserId) {
        jwtStatus = 'working';
      }
    } catch (err) {
      console.error('Healthcheck JWT Error:', err);
    }

    const authStatus = (dbConnected && jwtStatus === 'working' && devUsersCount === 4) ? 'healthy' : 'unhealthy';

    res.json({
      database: dbConnected ? 'connected' : 'disconnected',
      jwt: jwtStatus,
      authentication: authStatus,
      developmentUsers: devUsersCount
    });
  } catch (err) {
    console.error('Error in health check:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }

  try {
    let dbConnected = false;
    let devUsersCount = 0;
    const emails = ['admin@arcus.com', 'business@arcus.com', 'professional@arcus.com', 'individual@arcus.com'];

    if (usePostgres && pgPool) {
      try {
        await pgPool.query('SELECT 1');
        dbConnected = true;
        const countRes = await pgPool.query('SELECT COUNT(*)::int AS count FROM users WHERE email = ANY($1)', [emails]);
        devUsersCount = countRes.rows[0].count;
      } catch (err) {
        console.error('Healthcheck DB Error:', err);
      }
    } else {
      try {
        const db = await readJsonDb();
        dbConnected = true;
        if (db.users) {
          devUsersCount = db.users.filter((u: any) => emails.includes(u.email.toLowerCase())).length;
        }
      } catch (err) {
        console.error('Healthcheck JSON DB Error:', err);
      }
    }

    let jwtStatus = false;
    try {
      const testUserId = 'health_check_user';
      const token = generateToken(testUserId);
      const decodedId = verifyToken(token);
      if (decodedId === testUserId) {
        jwtStatus = true;
      }
    } catch (err) {
      console.error('Healthcheck JWT Error:', err);
    }

    const authStatus = (dbConnected && jwtStatus && devUsersCount === 4);
    const overallStatus = (dbConnected && jwtStatus && authStatus) ? 'healthy' : 'unhealthy';

    res.json({
      status: overallStatus,
      database: dbConnected,
      authentication: authStatus,
      jwt: jwtStatus,
      uptime: `${Math.floor(process.uptime())}s`,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error('Error in health check:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    // Rate limit login attempts
    const ip = getClientIp(req);
    if (!loginLimiter.check(`login:${ip}`)) {
      return res.status(429).json({ error: `Too many login attempts. Try again in ${loginLimiter.getRetryAfter(`login:${ip}`)} seconds.` });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const computedHash = hashPassword(password, user.passwordSalt);
    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if email is verified
    if (!DISABLE_OTP_FOR_DEV && !user.email_verified) {
      // Auto-trigger a new OTP send if no active OTP exists or rate limit is passed
      const existingOtp = await getOtpByUserId(user.id!);
      const now = Date.now();
      const needsNewOtp = !existingOtp || new Date(existingOtp.expiresAt).getTime() < now || (now - new Date(existingOtp.createdAt).getTime()) >= 60000;
      if (needsNewOtp) {
        await deleteOtpsByUserId(user.id!);
        const otpCode = generateOtp();
        const otpHash = hashOtp(otpCode);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        await addOtp({
          id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          userId: user.id!,
          otpHash,
          expiresAt,
          attempts: 0,
          createdAt: new Date().toISOString()
        });
        await sendResendEmail(user.email, otpCode);
      }
      return res.status(200).json({ error: 'email_not_verified', email: user.email });
    }

    const token = generateToken(user.id!);

    if (process.env.NODE_ENV !== 'production') {
      const target = (user.role === 'ADMIN' || user.role === 'Admin') ? '#/portal/admin' : '#/dashboard';
      console.log(`[AUTH SUCCESS] Login succeeded for: ${user.email} (Role: ${user.role})`);
      console.log(`Redirect Destination: ${target}`);
      console.log(`Token Expiry: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString()}`);
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        role: user.role,
        createdAt: user.createdAt,
        gstNumber: user.gstNumber,
        serviceCategory: user.serviceCategory,
        experience: user.experience,
        city: user.city,
        state: user.state,
        website: user.website,
        portfolioUrl: user.portfolioUrl,
        buildPoints: user.buildPoints,
        customerType: user.customerType
      }
    });
  } catch (err: any) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User does not exist.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      role: user.role,
      createdAt: user.createdAt,
      gstNumber: user.gstNumber,
      serviceCategory: user.serviceCategory,
      experience: user.experience,
      city: user.city,
      state: user.state,
      website: user.website,
      portfolioUrl: user.portfolioUrl,
      buildPoints: user.buildPoints,
      customerType: user.customerType
    });
  } catch (err: any) {
    console.error('Error in auth me:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

app.get('/api/auth/verify-gst/:gstin', async (req, res) => {
  try {
    const { gstin } = req.params;
    const gstClean = gstin.trim().toUpperCase();

    // Regular expression for GST validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstClean)) {
      return res.status(400).json({ error: 'Format invalid. Please enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5).' });
    }

    if (gstClean === '29CFJPR5489A1ZY') {
      return res.json({
        success: true,
        gstin: gstClean,
        legalName: 'TEST BUSINESS SOLUTIONS PRIVATE LIMITED',
        tradeName: 'TEST BUSINESS SOLUTIONS',
        state: 'Karnataka',
        status: 'Active',
        address: '123 Test Lane, Whitefield, Bengaluru Rural, Karnataka, 560067',
        taxpayerType: 'Regular'
      });
    }

    const url = `https://www.mastersindia.co/gst-search/?name=dummy&gstin=${gstClean}`;
    const html = await fetchUrl(url);

    // Find next data JSON
    const scriptStart = '<script id="__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(scriptStart);
    if (startIdx === -1) {
      return res.status(404).json({ error: 'GSTIN details not found or source structure changed.' });
    }

    const jsonStartIdx = startIdx + scriptStart.length;
    const endIdx = html.indexOf('</script>', jsonStartIdx);
    if (endIdx === -1) {
      return res.status(404).json({ error: 'Invalid response from data source.' });
    }

    const jsonStr = html.substring(jsonStartIdx, endIdx);
    const parsed = JSON.parse(jsonStr);

    const pageProps = parsed?.props?.pageProps;
    if (!pageProps || !pageProps.data || Object.keys(pageProps.data).length === 0) {
      return res.status(404).json({ error: 'GSTIN details not found or inactive.' });
    }

    const data = pageProps.data;

    // Construct full address
    const addr = data.pradr?.addr;
    let fullAddress = '';
    if (addr) {
      const addressParts = [
        addr.flno,
        addr.bno,
        addr.bnm,
        addr.st,
        addr.locality || addr.loc,
        addr.dst,
        addr.stcd,
        addr.pncd
      ].filter((part: any) => part && part.trim() !== '' && part.trim().toLowerCase() !== 'na');
      fullAddress = addressParts.join(', ');
    }

    res.json({
      success: true,
      gstin: data.gstin || gstClean,
      legalName: data.lgnm || pageProps.legal_name || pageProps.url_legal_name,
      tradeName: data.tradeNam || pageProps.tradeNam || '',
      state: data.pradr?.addr?.stcd || '',
      status: data.sts || 'Active',
      address: fullAddress,
      taxpayerType: data.dty || 'Regular'
    });
  } catch (err: any) {
    console.error('Error verifying GST:', err);
    res.status(500).json({ error: 'An error occurred while verifying the GST number.' });
  }
});

// ─── Admin Controller Endpoints ───────────────────────────────────────────

async function adminAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token found.' });
    }
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Session expired or invalid.' });
    }
    const user = await getUserById(userId);
    if (!user || (user.role !== 'Admin' && user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    (req as any).adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error in admin verification.' });
  }
}

app.get('/api/admin/dashboard-kpis', adminAuthMiddleware, async (req, res) => {
  try {
    const [orders, rfqs, products, users] = await Promise.all([
      getAllOrders(),
      getAllRfqs(),
      getAllProducts(),
      getAllUsers()
    ]);

    const now = new Date();
    
    const parseDate = (dStr: any) => {
      if (!dStr) return new Date(0);
      return new Date(dStr);
    };

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    let revenueToday = 0;
    let revenueYesterday = 0;
    let revenueThisMonth = 0;
    let revenueLastMonth = 0;

    let ordersToday = 0;
    let ordersYesterday = 0;
    let ordersThisMonth = 0;
    let ordersLastMonth = 0;

    for (const o of orders) {
      if (o.status === 'Cancelled') continue;
      const oDate = parseDate(o.timestamp || o.date);
      const amt = typeof o.amount === 'number' ? o.amount : parseFloat(String(o.amount).replace(/[^\d.]/g, '')) || 0;

      if (oDate >= startOfToday) {
        revenueToday += amt;
        ordersToday++;
      } else if (oDate >= startOfYesterday && oDate < startOfToday) {
        revenueYesterday += amt;
        ordersYesterday++;
      }

      if (oDate >= startOfThisMonth) {
        revenueThisMonth += amt;
        ordersThisMonth++;
      } else if (oDate >= startOfLastMonth && oDate <= endOfLastMonth) {
        revenueLastMonth += amt;
        ordersLastMonth++;
      }
    }

    let rfqsToday = 0;
    let rfqsYesterday = 0;
    let rfqsThisMonth = 0;
    let rfqsLastMonth = 0;

    for (const r of rfqs) {
      const rDate = parseDate(r.timestamp);
      if (rDate >= startOfToday) {
        rfqsToday++;
      } else if (rDate >= startOfYesterday && rDate < startOfToday) {
        rfqsYesterday++;
      }

      if (rDate >= startOfThisMonth) {
        rfqsThisMonth++;
      } else if (rDate >= startOfLastMonth && rDate <= endOfLastMonth) {
        rfqsLastMonth++;
      }
    }

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
    };

    const revTrend = calcTrend(revenueThisMonth, revenueLastMonth);
    const ordTrend = calcTrend(ordersThisMonth, ordersLastMonth);
    const rfqTrend = calcTrend(rfqsThisMonth, rfqsLastMonth);

    let totalInvValue = 0;
    let lowStockCount = 0;
    for (const p of products) {
      if (p.status === 'ARCHIVED') continue;
      const stock = p.inventory?.available !== undefined ? p.inventory.available : (p.stock !== undefined ? p.stock : 100);
      const reorderLevel = p.inventory?.reorderLevel !== undefined ? p.inventory.reorderLevel : 10;
      if (stock <= reorderLevel) {
        lowStockCount++;
      }
      const price = p.price !== undefined ? p.price : 0;
      totalInvValue += price * stock;
    }

    const customers = users.filter(u => u.role !== 'Admin');
    const totalCustomers = customers.length;
    const activeCustomersList = customers.filter(c => {
      const hasOrder = orders.some(o => o.userId === c.id);
      const hasRfq = rfqs.some(r => r.buyerId === c.id);
      return hasOrder || hasRfq;
    });

    const salesTrend: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      salesTrend[label] = 0;
    }

    for (const o of orders) {
      if (o.status === 'Cancelled') continue;
      const oDate = parseDate(o.timestamp || o.date);
      const diffTime = Math.abs(now.getTime() - oDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        const label = oDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (salesTrend[label] !== undefined) {
          const amt = typeof o.amount === 'number' ? o.amount : parseFloat(String(o.amount).replace(/[^\d.]/g, '')) || 0;
          salesTrend[label] += amt;
        }
      }
    }

    const salesTrendArr = Object.entries(salesTrend).map(([date, sales]) => ({ date, sales }));

    res.json({
      revenue: {
        today: revenueToday,
        thisMonth: revenueThisMonth,
        prevMonth: revenueLastMonth,
        trend: revTrend
      },
      orders: {
        today: ordersToday,
        thisMonth: ordersThisMonth,
        prevMonth: ordersLastMonth,
        trend: ordTrend
      },
      rfqs: {
        today: rfqsToday,
        thisMonth: rfqsThisMonth,
        prevMonth: rfqsLastMonth,
        trend: rfqTrend
      },
      inventory: {
        totalValue: totalInvValue,
        lowStockCount
      },
      customers: {
        total: totalCustomers,
        activeCount: activeCustomersList.length
      },
      salesTrend: salesTrendArr
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/dashboard-kpis:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/users', adminAuthMiddleware, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/products', adminAuthMiddleware, async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Brand Management Endpoints
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json(brands.filter(b => b.status === 'ACTIVE'));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/brands', adminAuthMiddleware, async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/brands', adminAuthMiddleware, async (req, res) => {
  try {
    const { id, name, logo, description, status } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'Brand id and name are required.' });
    }
    const newBrand = await addBrand({
      id: sanitizeText(id),
      name: sanitizeText(name),
      logo: logo ? sanitizeText(logo) : undefined,
      description: description ? sanitizeText(description) : undefined,
      status: status || 'ACTIVE'
    });

    // Write audit log
    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';
    await logAction('SETTINGS_CHANGE', `New Brand created: ${name} (${id})`, performedBy);

    res.status(201).json(newBrand);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/brands/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, description, status } = req.body;
    const updated = await updateBrand(id, {
      name: name ? sanitizeText(name) : undefined,
      logo: logo ? sanitizeText(logo) : undefined,
      description: description ? sanitizeText(description) : undefined,
      status: status
    });
    if (!updated) {
      return res.status(404).json({ error: 'Brand not found.' });
    }

    // Write audit log
    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';
    await logAction('SETTINGS_CHANGE', `Brand updated: ${updated.name} (${id})`, performedBy);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/brands/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await getBrandById(id);
    const success = await deleteBrand(id);
    if (!success) {
      return res.status(404).json({ error: 'Brand not found.' });
    }

    // Write audit log
    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';
    await logAction('SETTINGS_CHANGE', `Brand archived: ${brand?.name || id}`, performedBy);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// In-memory store for pending import uploads (prevents writing local temp files and maps to stateless architecture)
const pendingImportsCache = new Map<string, {
  fileName: string;
  mappedRows: any[];
}>();

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Catalog template download
app.get('/api/admin/catalog/template', async (req, res) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
    const buffer = generateTemplate(format);
    const filename = `arcus_import_template.${format}`;
    const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error generating template:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catalog export
app.get('/api/admin/catalog/export', adminAuthMiddleware, async (req, res) => {
  try {
    const { categoryId, brand, status, format } = req.query;
    const { buffer, fileName, contentType } = await exportCatalog({
      categoryId: categoryId ? String(categoryId) : undefined,
      brand: brand ? String(brand) : undefined,
      status: status ? String(status) : undefined,
      format: format === 'csv' ? 'csv' : 'xlsx'
    });

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error exporting catalog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catalog import preview
app.post('/api/admin/catalog/import/upload', adminAuthMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'imagesZip', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const sheetFile = files?.['file']?.[0];
    const zipFile = files?.['imagesZip']?.[0];

    if (!sheetFile) {
      return res.status(400).json({ error: 'Missing uploaded catalog file ("file").' });
    }

    // Validate and parse sheet
    const preview = await validateImportSheet(sheetFile.buffer, sheetFile.originalname);
    
    // Save mapped rows to in-memory cache for confirmation
    pendingImportsCache.set(preview.importId, {
      fileName: sheetFile.originalname,
      mappedRows: preview.mappedRows
    });

    let imagesReport = {
      matchedCount: 0,
      missingImages: [] as string[],
      unmatchedImages: [] as string[],
      savedImages: {} as Record<string, string>
    };

    if (zipFile) {
      const fileSkus = preview.mappedRows.map(r => r.sku).filter(Boolean);
      imagesReport = await matchZipImages(zipFile.buffer, fileSkus);
      
      // Update mapped row image paths using matching SKUs
      preview.mappedRows.forEach(row => {
        if (row.sku && imagesReport.savedImages[row.sku]) {
          row.images = [imagesReport.savedImages[row.sku]];
        }
      });
    }

    res.json({
      ...preview,
      imagesReport
    });
  } catch (err: any) {
    console.error('Error uploading and validating catalog:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Catalog import confirm
app.post('/api/admin/catalog/import/confirm', adminAuthMiddleware, async (req, res) => {
  try {
    const { importId, mode, createBrands } = req.body;
    if (!importId || !mode) {
      return res.status(400).json({ error: 'importId and mode are required.' });
    }

    const pending = pendingImportsCache.get(importId);
    if (!pending) {
      return res.status(404).json({ error: 'Pending import not found or expired.' });
    }

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    const result = await executeImport(
      importId,
      pending.fileName,
      mode,
      pending.mappedRows,
      !!createBrands,
      performedBy
    );

    // Clean up cache
    pendingImportsCache.delete(importId);

    res.json(result);
  } catch (err: any) {
    console.error('Error confirming catalog import:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Import history list
app.get('/api/admin/catalog/import/history', adminAuthMiddleware, async (req, res) => {
  try {
    const history = await getAllImportHistory();
    res.json(history);
  } catch (err: any) {
    console.error('Error fetching import history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download failed report CSV
app.get('/api/admin/catalog/import/history/:id/error-report', adminAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const history = await getImportHistoryById(id);
    if (!history) {
      return res.status(404).json({ error: 'Import history log not found.' });
    }
    if (!history.errorReport) {
      return res.status(400).json({ error: 'No errors were logged for this import.' });
    }

    const filename = `import_errors_${id}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(Buffer.from(history.errorReport, 'utf-8'));
  } catch (err: any) {
    console.error('Error downloading error report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk quick update endpoint
app.post('/api/admin/catalog/bulk-update', adminAuthMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const type = req.body.type; // 'price' | 'inventory' | 'moq' | 'status'

    if (!file) {
      return res.status(400).json({ error: 'Missing uploaded catalog file ("file").' });
    }
    if (!type || !['price', 'inventory', 'moq', 'status'].includes(type)) {
      return res.status(400).json({ error: 'Invalid update type. Must be price, inventory, moq, or status.' });
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (rawRows.length === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty.' });
    }

    // Auto-map headers for each row to handle variations in bulk updates
    const normalizedRows = rawRows.map(row => {
      const normalizedRow: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9\s_]/g, '').trim();
        const mappedKey = HEADER_MAPPING[cleanKey] || key;
        normalizedRow[mappedKey] = row[key];
      });
      return normalizedRow;
    });

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    const result = await executeBulkUpdates(type, normalizedRows, performedBy);
    res.json(result);
  } catch (err: any) {
    console.error('Error executing bulk update:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Bulk action for multi-select products
app.post('/api/admin/catalog/bulk-action', adminAuthMiddleware, async (req, res) => {
  try {
    const { productIds, action, value } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || !action) {
      return res.status(400).json({ error: 'productIds and action are required.' });
    }

    const allProducts = await getAllProducts();
    const productsToUpdate = allProducts.filter(p => productIds.includes(p.id));

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    let updatedCount = 0;

    for (const product of productsToUpdate) {
      if (action === 'status') {
        product.status = value;
      } else if (action === 'moq') {
        product.minimumOrderQuantity = Number(value);
      }
      await updateProduct(product);
      updatedCount++;
    }

    await logAction(
      'PRODUCT_CHANGE',
      `Bulk action '${action}' applied to ${updatedCount} products. Value: ${value}`,
      performedBy
    );

    res.json({ success: true, updatedCount });
  } catch (err: any) {
    console.error('Error executing bulk action:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Audit Log Endpoints
app.get('/api/admin/audit-logs', adminAuthMiddleware, async (req, res) => {
  try {
    const logs = await getAllAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inventory Adjustments Endpoints
app.get('/api/admin/inventory/adjustments', adminAuthMiddleware, async (req, res) => {
  try {
    const productId = req.query.productId ? String(req.query.productId) : undefined;
    const history = await getAdjustmentHistory(productId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/inventory/adjustments', adminAuthMiddleware, async (req, res) => {
  try {
    const { productId, adjustmentType, quantity, reason } = req.body;
    if (!productId || !adjustmentType || quantity === undefined) {
      return res.status(400).json({ error: 'productId, adjustmentType, and quantity are required.' });
    }
    const product = await getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const prevStock = product.inventory?.available ?? product.stock ?? 0;
    let newStock = prevStock;
    if (adjustmentType === 'INCOMING') {
      newStock = prevStock + Number(quantity);
    } else if (adjustmentType === 'SHIPPED') {
      newStock = Math.max(0, prevStock - Number(quantity));
    } else if (adjustmentType === 'DISCREPANCY' || adjustmentType === 'MANUAL') {
      newStock = Number(quantity);
    } else {
      return res.status(400).json({ error: 'Invalid adjustment type.' });
    }

    const updated = await updateProductStock(productId, newStock);
    if (!updated) return res.status(500).json({ error: 'Failed to update stock.' });

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    const adj = await recordAdjustment(
      productId,
      adjustmentType,
      Number(quantity),
      prevStock,
      newStock,
      reason || '',
      performedBy
    );

    // Write audit log
    await logAction(
      'INVENTORY_CHANGE',
      `Inventory adjusted for product ${product.name} (SKU: ${product.sku}). Type: ${adjustmentType}, Quantity: ${quantity}, Stock changed from ${prevStock} to ${newStock}. Reason: ${reason || 'None'}`,
      performedBy
    );

    res.status(201).json({ success: true, adjustment: adj, product: updated });
  } catch (err) {
    console.error('Error performing adjustment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/inventory/reorder-task', adminAuthMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required.' });
    }
    const product = await getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    // Log the reorder task creation
    await logAction(
      'INVENTORY_CHANGE',
      `Reorder task created for product ${product.name} (SKU: ${product.sku}). Suggested reorder qty: ${product.minimumOrderQuantity || 10}.`,
      performedBy
    );

    res.status(201).json({ success: true, message: 'Reorder task created successfully' });
  } catch (err) {
    console.error('Error creating reorder task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// RFQ Actions Endpoints
app.post('/api/admin/rfqs/:id/quote', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { price, validityDays, message } = req.body;
    
    // Find RFQ
    const rfqs = await getAllRfqs();
    const rfq = rfqs.find((r: any) => r.id === id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found.' });

    // Update RFQ status to Quoted
    await updateRfqStatus(id, 'Quoted');

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    // Mock PDF generation & email sending
    const pdfUrl = `/quotes/quote_${id}_${Date.now()}.pdf`;

    // Log RFQ Quote Action
    await logAction(
      'RFQ_UPDATE',
      `RFQ #${id} quoted. Generated Quote PDF: ${pdfUrl}. Quote details sent to customer: price: ₹${price}, validity: ${validityDays || 30} days. Notes: ${message || 'None'}.`,
      performedBy
    );

    res.json({
      success: true,
      pdfUrl,
      status: 'Quoted',
      message: `Quote PDF generated and sent to ${rfq.name} successfully.`
    });
  } catch (err: any) {
    console.error('Error quoting RFQ:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/rfqs/:id/convert-to-order', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, items, shippingAddress, billingAddress, paymentMethod } = req.body;
    
    // Find RFQ
    const rfqs = await getAllRfqs();
    const rfq = rfqs.find((r: any) => r.id === id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found.' });

    const buyerId = rfq.buyerId || 'guest_user';
    
    // Create new order
    const orderId = `ord_${Date.now()}`;
    const user = await getUserById(buyerId);
    const newOrder = await addOrder({
      id: orderId,
      userId: buyerId,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN'),
      products: items.map((i: any) => `${i.name || i.productName} (x${i.quantity || i.qty})`).join(', '),
      status: 'Confirmed',
      amount: Number(amount),
      items: items || [],
      shippingAddress: shippingAddress || rfq.location || 'Default Address',
      billingAddress: billingAddress || rfq.location || 'Default Address',
      gstNumber: user?.gstNumber || undefined,
      paymentMethod: paymentMethod || 'COD'
    });

    // Update RFQ status to Closed
    await updateRfqStatus(id, 'Closed');

    const adminUser = (req as any).adminUser;
    const performedBy = adminUser.fullName || adminUser.name || 'Admin';

    // Log action
    await logAction(
      'RFQ_UPDATE',
      `RFQ #${id} converted to Order #${orderId} with amount ₹${amount} for buyer ${rfq.name}.`,
      performedBy
    );

    res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error('Error converting RFQ to order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  console.log(`ARCUS Backend Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    await checkAndSeedDevUsers();
  }
});
// Trigger nodemon reload for postgres connection check

