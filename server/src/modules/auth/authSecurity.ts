import { z } from 'zod';
import { EMAIL_REGEX, INDIAN_PHONE_REGEX, GST_REGEX, URL_REGEX } from '../../../../shared/validation';

// Security log entry interface for audit tracking
export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  ip: string;
  reason: string;
  details?: string;
  payloadSummary?: Record<string, any>;
}

// In-memory attack attempt log buffer (persisted to console & readable via security query)
const attackLogs: SecurityLogEntry[] = [];

export function logSecurityViolation(
  endpoint: string,
  ip: string,
  reason: string,
  details?: string,
  rawPayload?: Record<string, any>
): SecurityLogEntry {
  const entry: SecurityLogEntry = {
    id: `SEC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    endpoint,
    ip,
    reason,
    details,
    payloadSummary: rawPayload ? sanitizePayloadForLogging(rawPayload) : undefined,
  };

  attackLogs.unshift(entry);
  if (attackLogs.length > 500) {
    attackLogs.pop();
  }

  console.warn(`[SECURITY AUDIT LOG] 🚨 ${entry.timestamp} | Endpoint: ${endpoint} | IP: ${ip} | Reason: ${reason} | Details: ${details || 'N/A'}`);
  return entry;
}

export function getSecurityLogs(): SecurityLogEntry[] {
  return [...attackLogs];
}

/** Sanitize request payload for security logs (stripping passwords/sensitive tokens) */
function sanitizePayloadForLogging(payload: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (['password', 'confirmPassword', 'token', 'secret'].includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = value.length > 50 ? value.substring(0, 50) + '...' : value;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Detection for HTML/Script tags and malicious injection vectors
const HTML_SCRIPT_REGEX = /<\s*\/?\s*(script|iframe|object|embed|applet|link|meta|style|form|input|button|svg|img|a)[^>]*>/i;
const SCRIPT_INJECTION_REGEX = /(javascript:|data:text\/html|vbscript:|onload\s*=|onerror\s*=|onclick\s*=)/i;

/** Returns true if string contains raw HTML/Script tags or dangerous script triggers */
export function containsScriptOrHtmlTags(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  return HTML_SCRIPT_REGEX.test(val) || SCRIPT_INJECTION_REGEX.test(val) || /<[^>]+>/.test(val);
}

// Zod custom refinement for free-text fields
const safeStringSchema = (fieldLabel: string, minLen = 1, maxLen = 100) =>
  z.string()
    .trim()
    .min(minLen, `${fieldLabel} is too short`)
    .max(maxLen, `${fieldLabel} is too long`)
    .refine((val) => !containsScriptOrHtmlTags(val), {
      message: `${fieldLabel} contains forbidden HTML or script tags`,
    });

const optionalSafeStringSchema = (fieldLabel: string, maxLen = 150) =>
  z.string()
    .trim()
    .max(maxLen, `${fieldLabel} is too long`)
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || !containsScriptOrHtmlTags(val), {
      message: `${fieldLabel} contains forbidden HTML or script tags`,
    });

// ─── ZOD SCHEMAS ─────────────────────────────────────────────

/** Login Request Schema */
export const LoginSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .min(3, 'Email is required')
    .max(254, 'Email too long')
    .refine((val) => EMAIL_REGEX.test(val), { message: 'Invalid email format' })
    .refine((val) => !containsScriptOrHtmlTags(val), { message: 'Malicious content in email' }),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long')
    .refine((val) => !containsScriptOrHtmlTags(val), { message: 'Malicious content in password' }),
});

/** Registration Request Schema */
export const RegisterSchema = z.object({
  name: safeStringSchema('Full Name', 2, 100),
  email: z.string()
    .trim()
    .toLowerCase()
    .min(3, 'Email is required')
    .max(254, 'Email is too long')
    .refine((val) => EMAIL_REGEX.test(val), { message: 'Invalid email format' })
    .refine((val) => !containsScriptOrHtmlTags(val), { message: 'Malicious content in email' }),
  phone: z.string()
    .trim()
    .transform((val) => {
      let digits = val.replace(/[\s\-\(\)\.]/g, '');
      if (digits.startsWith('+91')) digits = digits.slice(3);
      else if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
      if (digits.startsWith('0') && digits.length > 10) digits = digits.slice(1);
      return digits;
    })
    .refine((val) => INDIAN_PHONE_REGEX.test(val), { message: 'Invalid Indian phone format' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine((val) => /[a-z]/.test(val), { message: 'Password missing lowercase' })
    .refine((val) => /[A-Z]/.test(val), { message: 'Password missing uppercase' })
    .refine((val) => /\d/.test(val), { message: 'Password missing digit' })
    .refine((val) => !containsScriptOrHtmlTags(val), { message: 'Malicious content in password' }),
  role: z.enum(['Buyer', 'Contractor', 'Supplier', 'Individual', 'Business', 'Professional', 'Admin', 'USER', 'ADMIN']),
  companyName: optionalSafeStringSchema('Company Name', 150),
  gstNumber: z.string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || GST_REGEX.test(val), { message: 'Invalid GSTIN format' }),
  serviceCategory: optionalSafeStringSchema('Service Category', 100),
  experience: optionalSafeStringSchema('Experience', 20),
  city: optionalSafeStringSchema('City', 100),
  state: optionalSafeStringSchema('State', 100),
  website: z.string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || URL_REGEX.test(val), { message: 'Invalid Website URL' })
    .refine((val) => !val || !containsScriptOrHtmlTags(val), { message: 'Malicious content in website URL' }),
  portfolioUrl: z.string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || URL_REGEX.test(val), { message: 'Invalid Portfolio URL' })
    .refine((val) => !val || !containsScriptOrHtmlTags(val), { message: 'Malicious content in portfolio URL' }),
  customerType: z.enum(['INDIVIDUAL', 'BUSINESS', 'PROFESSIONAL', 'BUYER', 'CONTRACTOR', 'SUPPLIER']).optional(),
});
