// ============================================================
// ARCUS Centralized Validation & Sanitization Library
// Shared by frontend (Vite/React) and backend (Express/Node)
// ============================================================

// ─── Regex Patterns ──────────────────────────────────────────

/** Valid email: standard RFC-lite check */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian mobile: 10 digits starting with 6-9 */
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

/** GST format: 2-digit state + 5-char PAN + 4 digits + 1 alpha + 1 alphanumeric + Z + 1 alphanumeric */
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Indian PIN code: 6 digits, first digit 1-9 */
export const PIN_CODE_REGEX = /^[1-9]\d{5}$/;

/** URL format (optional protocol) */
export const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/i;

/** Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** Dangerous patterns for input sanitization */
const SCRIPT_TAG_REGEX = /<\s*\/?\s*script\s*[^>]*>/gi;
const HTML_TAG_REGEX = /<[^>]*>/g;
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|TRUNCATE)\b\s)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/gi,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
];

// ─── Sanitization Functions ──────────────────────────────────

/** Strip HTML tags, script tags, and common SQL injection patterns */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let clean = input;
  // Remove script tags first (most dangerous)
  clean = clean.replace(SCRIPT_TAG_REGEX, '');
  // Remove all HTML tags
  clean = clean.replace(HTML_TAG_REGEX, '');
  // Neutralize SQL injection keywords (replace with empty)
  for (const pattern of SQL_INJECTION_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  return clean.trim();
}

/** Trim whitespace and normalize internal spaces */
export function trimAndClean(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
}

/** Normalize phone: strip +91, spaces, dashes, country code prefix → 10 digits */
export function normalizePhone(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let digits = input.replace(/[\s\-\(\)\.]/g, '');
  // Strip +91 or 91 prefix
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
  // Strip leading 0
  if (digits.startsWith('0') && digits.length > 10) digits = digits.slice(1);
  return digits;
}

// ─── Validation Result Type ──────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Field Validators ────────────────────────────────────────

export function validateEmail(email: string): ValidationResult {
  const clean = email?.trim().toLowerCase() || '';
  if (!clean) return { valid: false, error: 'Email is required.' };
  if (!EMAIL_REGEX.test(clean)) return { valid: false, error: 'Please enter a valid email address.' };
  if (clean.length > 254) return { valid: false, error: 'Email address is too long.' };
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const normalized = normalizePhone(phone);
  if (!normalized) return { valid: false, error: 'Phone number is required.' };
  if (!INDIAN_PHONE_REGEX.test(normalized)) {
    return { valid: false, error: 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).' };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'Password is required.' };
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters.' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain at least one lowercase letter.' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  if (!/\d/.test(password)) return { valid: false, error: 'Password must contain at least one number.' };
  return { valid: true };
}

export function validatePasswordMatch(password: string, confirm: string): ValidationResult {
  if (password !== confirm) return { valid: false, error: 'Passwords do not match.' };
  return { valid: true };
}

export function validateName(name: string, label = 'Name'): ValidationResult {
  const clean = trimAndClean(name);
  if (!clean) return { valid: false, error: `${label} is required.` };
  if (clean.length < 2) return { valid: false, error: `${label} must be at least 2 characters.` };
  if (clean.length > 100) return { valid: false, error: `${label} must be 100 characters or less.` };
  return { valid: true };
}

export function validateBusinessName(name: string): ValidationResult {
  const clean = trimAndClean(name);
  if (!clean) return { valid: false, error: 'Business name is required.' };
  if (clean.length < 3) return { valid: false, error: 'Business name must be at least 3 characters.' };
  if (clean.length > 150) return { valid: false, error: 'Business name must be 150 characters or less.' };
  return { valid: true };
}

export function validateGST(gstin: string): ValidationResult {
  const clean = gstin?.trim().toUpperCase() || '';
  if (!clean) return { valid: false, error: 'GST number is required.' };
  if (clean.length !== 15) return { valid: false, error: 'GSTIN must be exactly 15 characters.' };
  if (!GST_REGEX.test(clean)) {
    return { valid: false, error: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5' };
  }
  return { valid: true };
}

export function validatePINCode(pin: string): ValidationResult {
  const clean = pin?.trim() || '';
  if (!clean) return { valid: false, error: 'PIN code is required.' };
  if (!PIN_CODE_REGEX.test(clean)) {
    return { valid: false, error: 'Enter a valid 6-digit Indian PIN code.' };
  }
  return { valid: true };
}

export function validateURL(url: string, label = 'URL'): ValidationResult {
  const clean = url?.trim() || '';
  if (!clean) return { valid: true }; // URLs are optional unless caller checks required
  if (!URL_REGEX.test(clean)) return { valid: false, error: `Please enter a valid ${label}.` };
  if (clean.length > 500) return { valid: false, error: `${label} is too long.` };
  return { valid: true };
}

export function validateExperience(exp: string): ValidationResult {
  const clean = exp?.trim() || '';
  if (!clean) return { valid: false, error: 'Experience is required.' };
  const num = Number(clean);
  if (isNaN(num) || !Number.isFinite(num)) return { valid: false, error: 'Experience must be a number.' };
  if (num < 0 || num > 50) return { valid: false, error: 'Experience must be between 0 and 50 years.' };
  return { valid: true };
}

export function validateQuantity(qty: number | string): ValidationResult {
  const num = typeof qty === 'string' ? parseInt(qty, 10) : qty;
  if (isNaN(num) || !Number.isFinite(num)) return { valid: false, error: 'Quantity must be a valid number.' };
  if (num < 1) return { valid: false, error: 'Quantity must be at least 1.' };
  if (!Number.isInteger(num)) return { valid: false, error: 'Quantity must be a whole number.' };
  return { valid: true };
}

export function validateRequired(value: string, label = 'This field'): ValidationResult {
  if (!value || !value.trim()) return { valid: false, error: `${label} is required.` };
  return { valid: true };
}

export function validateMaxLength(value: string, max: number, label = 'This field'): ValidationResult {
  if (value && value.length > max) return { valid: false, error: `${label} must be ${max} characters or less.` };
  return { valid: true };
}

export function validateMinLength(value: string, min: number, label = 'This field'): ValidationResult {
  if (!value || value.trim().length < min) return { valid: false, error: `${label} must be at least ${min} characters.` };
  return { valid: true };
}

// ─── Composite Form Validators ───────────────────────────────

export interface FormErrors {
  [field: string]: string;
}

/** Validate Individual registration form */
export function validateIndividualRegistration(data: {
  name: string; email: string; phone: string;
  password: string; confirmPassword: string;
  city: string; state: string; agree: boolean;
}): FormErrors {
  const errors: FormErrors = {};
  const nameV = validateName(data.name, 'Full name');
  if (!nameV.valid) errors.name = nameV.error!;
  const emailV = validateEmail(data.email);
  if (!emailV.valid) errors.email = emailV.error!;
  const phoneV = validatePhone(data.phone);
  if (!phoneV.valid) errors.phone = phoneV.error!;
  const passV = validatePassword(data.password);
  if (!passV.valid) errors.password = passV.error!;
  const matchV = validatePasswordMatch(data.password, data.confirmPassword);
  if (!matchV.valid) errors.confirmPassword = matchV.error!;
  const cityV = validateRequired(data.city, 'City');
  if (!cityV.valid) errors.city = cityV.error!;
  const stateV = validateRequired(data.state, 'State');
  if (!stateV.valid) errors.state = stateV.error!;
  if (!data.agree) errors.agree = 'You must agree to the Terms & Conditions.';
  return errors;
}

/** Validate Business registration form */
export function validateBusinessRegistration(data: {
  gstVerified: boolean; contactName: string; email: string;
  phone: string; password: string; confirmPassword: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!data.gstVerified) errors.gst = 'Please verify your GST number before proceeding.';
  const nameV = validateName(data.contactName, 'Contact name');
  if (!nameV.valid) errors.contactName = nameV.error!;
  const emailV = validateEmail(data.email);
  if (!emailV.valid) errors.email = emailV.error!;
  const phoneV = validatePhone(data.phone);
  if (!phoneV.valid) errors.phone = phoneV.error!;
  const passV = validatePassword(data.password);
  if (!passV.valid) errors.password = passV.error!;
  const matchV = validatePasswordMatch(data.password, data.confirmPassword);
  if (!matchV.valid) errors.confirmPassword = matchV.error!;
  return errors;
}

/** Validate Professional registration form */
export function validateProfessionalRegistration(data: {
  name: string; businessName: string; email: string;
  phone: string; password: string; confirmPassword: string;
  experience: string; city: string; state: string;
  website?: string; portfolioUrl?: string;
}): FormErrors {
  const errors: FormErrors = {};
  const nameV = validateName(data.name, 'Full name');
  if (!nameV.valid) errors.name = nameV.error!;
  const busV = validateBusinessName(data.businessName);
  if (!busV.valid) errors.businessName = busV.error!;
  const emailV = validateEmail(data.email);
  if (!emailV.valid) errors.email = emailV.error!;
  const phoneV = validatePhone(data.phone);
  if (!phoneV.valid) errors.phone = phoneV.error!;
  const passV = validatePassword(data.password);
  if (!passV.valid) errors.password = passV.error!;
  const matchV = validatePasswordMatch(data.password, data.confirmPassword);
  if (!matchV.valid) errors.confirmPassword = matchV.error!;
  const expV = validateExperience(data.experience);
  if (!expV.valid) errors.experience = expV.error!;
  const cityV = validateRequired(data.city, 'City');
  if (!cityV.valid) errors.city = cityV.error!;
  const stateV = validateRequired(data.state, 'State');
  if (!stateV.valid) errors.state = stateV.error!;
  if (data.website) {
    const webV = validateURL(data.website, 'Website URL');
    if (!webV.valid) errors.website = webV.error!;
  }
  if (data.portfolioUrl) {
    const portV = validateURL(data.portfolioUrl, 'Portfolio URL');
    if (!portV.valid) errors.portfolioUrl = portV.error!;
  }
  return errors;
}

/** Validate checkout form */
export function validateCheckoutForm(data: {
  name: string; phone: string;
  addressLine1: string; city: string; state: string; zipCode: string;
  billingSameAsShipping: boolean;
  billingAddressLine1?: string; billingCity?: string;
  billingState?: string; billingZipCode?: string;
}): FormErrors {
  const errors: FormErrors = {};
  const nameV = validateName(data.name, 'Name');
  if (!nameV.valid) errors.name = nameV.error!;
  const phoneV = validatePhone(data.phone);
  if (!phoneV.valid) errors.phone = phoneV.error!;
  if (!data.addressLine1?.trim()) errors.addressLine1 = 'Shipping address is required.';
  const cityV = validateRequired(data.city, 'City');
  if (!cityV.valid) errors.city = cityV.error!;
  const stateV = validateRequired(data.state, 'State');
  if (!stateV.valid) errors.state = stateV.error!;
  const zipV = validatePINCode(data.zipCode);
  if (!zipV.valid) errors.zipCode = zipV.error!;
  if (!data.billingSameAsShipping) {
    if (!data.billingAddressLine1?.trim()) errors.billingAddressLine1 = 'Billing address is required.';
    const bCityV = validateRequired(data.billingCity || '', 'Billing city');
    if (!bCityV.valid) errors.billingCity = bCityV.error!;
    const bStateV = validateRequired(data.billingState || '', 'Billing state');
    if (!bStateV.valid) errors.billingState = bStateV.error!;
    const bZipV = validatePINCode(data.billingZipCode || '');
    if (!bZipV.valid) errors.billingZipCode = bZipV.error!;
  }
  return errors;
}

/** Validate RFQ form */
export function validateRfqForm(data: {
  name: string; phone: string; quantity: string;
  location: string; details?: string;
}): FormErrors {
  const errors: FormErrors = {};
  const nameV = validateName(data.name, 'Contact name');
  if (!nameV.valid) errors.name = nameV.error!;
  const phoneV = validatePhone(data.phone);
  if (!phoneV.valid) errors.phone = phoneV.error!;
  if (!data.quantity?.trim()) errors.quantity = 'Quantity is required.';
  if (!data.location?.trim()) errors.location = 'Delivery location is required.';
  if (data.details && data.details.length > 2000) errors.details = 'Details must be 2000 characters or less.';
  return errors;
}

// ─── Rate Limiter (for backend use) ──────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /** Returns true if the request is allowed, false if rate limited */
  check(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.maxRequests) {
      return false;
    }
    entry.count++;
    return true;
  }

  /** Get remaining seconds until reset */
  getRetryAfter(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) this.store.delete(key);
    }
  }
}
