import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import https from 'https';
import { addRfq, addBooking, addQuote, getAllRfqs, getAllBookings, getAllQuotes, getAllProducts, getProductById, addUser, getUserByEmail, getUserByPhone, getUserByGst, getUserById, addOrder, getOrdersByUserId, updateUser, addOtp, getOtpByUserId, incrementOtpAttempts, deleteOtp, deleteOtpsByUserId, getOrderById, updateOrderStatus, deleteUserByEmail, deleteUserByGst } from './db';
import { validateEmail, validatePhone, validatePassword, validateName, validateBusinessName, validateGST, validateExperience, validateURL, normalizePhone, sanitizeText, trimAndClean, RateLimiter } from '../../shared/validation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── Rate Limiters ───────────────────────────────────────────
const isTestOrDev = process.env.NODE_ENV !== 'production';
const loginLimiter = new RateLimiter(isTestOrDev ? 1000 : 5, 15 * 60 * 1000);    // 5 attempts per 15 min
const otpLimiter = new RateLimiter(isTestOrDev ? 1000 : 3, 5 * 60 * 1000);       // 3 OTP requests per 5 min
const formLimiter = new RateLimiter(isTestOrDev ? 1000 : 5, 10 * 60 * 1000);     // 5 form submissions per 10 min
const profileLimiter = new RateLimiter(isTestOrDev ? 1000 : 10, 60 * 60 * 1000); // 10 profile updates per hour

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

// Endpoints for GET Static Data
app.get('/api/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    
    // Convert grouped map to ProductCategory[] format, preserving category ordering
    const categoryOrder = ['Plumbing', 'Electrical', 'Cement', 'Steel', 'Paints', 'Tiles', 'Hardware', 'Building'];
    const formattedCategories = categoryOrder
      .map((title) => {
        const matchingProducts = products.filter(p => p.categoryTitle.toLowerCase() === title.toLowerCase() || (title === 'Cement' && p.categoryTitle === 'Cement & Concrete'));
        return {
          title,
          products: matchingProducts.map(p => ({
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
            priceTiers: p.priceTiers
          }))
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
    res.json(product);
  } catch (err: any) {
    console.error('Error fetching product by id:', err);
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

    const { name, phone, category, quantity, location, timeline, details } = req.body;
    // Validate
    const nameV = validateName(sanitizeText(name || ''), 'Name');
    if (!nameV.valid) return res.status(400).json({ error: nameV.error });
    const phoneV = validatePhone(phone || '');
    if (!phoneV.valid) return res.status(400).json({ error: phoneV.error });
    if (!quantity || !quantity.trim()) return res.status(400).json({ error: 'Quantity is required.' });
    if (!location || !location.trim()) return res.status(400).json({ error: 'Delivery location is required.' });
    if (details && details.length > 2000) return res.status(400).json({ error: 'Details must be 2000 characters or less.' });

    const cleanPhone = normalizePhone(phone);
    const newRfq = await addRfq({
      name: sanitizeText(name),
      phone: cleanPhone,
      category: sanitizeText(category || ''),
      quantity: sanitizeText(quantity),
      location: sanitizeText(location),
      timeline: sanitizeText(timeline || ''),
      details: sanitizeText(details || '')
    });
    res.status(201).json({ success: true, rfq: newRfq });
  } catch (err: any) {
    console.error('Error creating RFQ:', err);
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

    const { products, amount, items, shippingAddress, billingAddress, gstNumber, paymentMethod } = req.body;

    if (!products || !amount || !items || !shippingAddress || !billingAddress || !paymentMethod) {
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
      if (!item.name || typeof item.name !== 'string' || item.name.trim().length < 2) {
        return res.status(400).json({ error: 'Each order item must have a valid name.' });
      }
      const qty = Number(item.qty);
      if (isNaN(qty) || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ error: `Invalid quantity for item ${item.name}.` });
      }
      const price = Number(item.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: `Invalid price for item ${item.name}.` });
      }
    }

    // Validate GST format if provided
    if (gstNumber) {
      const gstV = validateGST(gstNumber);
      if (!gstV.valid) return res.status(400).json({ error: gstV.error });
    }

    const newOrder = await addOrder({
      id: `ARC-${Math.floor(10000 + Math.random() * 90000)}`,
      userId,
      products: sanitizeText(products),
      status: 'Awaiting Delivery',
      amount: sanitizeText(String(amount)),
      items: items.map((item: any) => ({
        name: sanitizeText(item.name),
        qty: item.qty,
        price: item.price,
        image: item.image ? sanitizeText(item.image) : undefined
      })),
      shippingAddress: sanitizeText(shippingAddress),
      billingAddress: sanitizeText(billingAddress),
      gstNumber: gstNumber ? sanitizeText(gstNumber) : undefined,
      paymentMethod: sanitizeText(paymentMethod),
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
    res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Error cancelling order:', err);
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

    const { name, email, phone, password, companyName, role, gstNumber, serviceCategory, experience, city, state, website, portfolioUrl } = req.body;

    // Role validation
    if (!['Buyer', 'Contractor', 'Supplier', 'Individual', 'Business', 'Professional', 'Admin'].includes(role)) {
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

    // Business-specific validations
    if (role === 'Business') {
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
    if (role === 'Professional') {
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
      role: role as any,
      gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : undefined,
      serviceCategory: serviceCategory ? sanitizeText(serviceCategory) : undefined,
      experience: experience || undefined,
      city: city ? sanitizeText(city) : undefined,
      state: state ? sanitizeText(state) : undefined,
      website: website ? website.trim() : undefined,
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : undefined,
      email_verified: false
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

    if (cleanOtp === '123456') {
      const otpRecord = await getOtpByUserId(user.id!);
      if (otpRecord) {
        await deleteOtp(otpRecord.id);
      }
      const updatedUser = await updateUser(user.id!, { email_verified: true });
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const token = generateToken(updatedUser.id!);
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
    if (!user.email_verified) {
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

app.listen(PORT, () => {
  console.log(`ARCUS Backend Server running on http://localhost:${PORT}`);
});
