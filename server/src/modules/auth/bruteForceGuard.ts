import { sendSecurityAlertEmail } from '../../utils/mailer';
import { logSecurityViolation } from './authSecurity';

export interface AccountLockState {
  isLocked: boolean;
  failures: number;
  remainingLockoutMs: number;
  progressiveDelayMs: number;
}

interface IpAttemptRecord {
  count: number;
  resetAt: number;
}

interface AccountRecord {
  failures: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

// ─── THRESHOLDS CONFIGURATION ───────────────────────────────
// Layer 1: Per-IP Rate Limiting
const IP_WINDOW_MS = 60 * 1000;       // 1 minute sliding window
const IP_MAX_ATTEMPTS = 10;            // 10 attempts per minute per IP

// Layer 2: Per-Account Protection
const FREE_FAILURES = 3;               // 3 free failures before progressive delays start
const LOCKOUT_THRESHOLD = 5;           // 5 consecutive failures triggers lockout
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout duration

// Fast In-Memory Key-Value Stores with automatic TTL cleanup
const ipStore = new Map<string, IpAttemptRecord>();
const accountStore = new Map<string, AccountRecord>();

// Periodic TTL cleanup every 5 minutes to release memory
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    if (now >= record.resetAt) {
      ipStore.delete(ip);
    }
  }
  for (const [email, record] of accountStore.entries()) {
    const isLockExpired = record.lockedUntil ? now >= record.lockedUntil : false;
    const isInactive = now - record.lastAttemptAt > 60 * 60 * 1000;
    if (isInactive && (!record.lockedUntil || isLockExpired)) {
      accountStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

// ─── LAYER 1: PER-IP THROTTLING ──────────────────────────────

/** Checks if the client IP has exceeded the Layer 1 login request threshold */
export function checkIpThrottled(ip: string): boolean {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record || now >= record.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return false;
  }

  record.count++;
  if (record.count > IP_MAX_ATTEMPTS) {
    logSecurityViolation(
      '/api/auth/login',
      ip,
      'PER_IP_RATE_LIMIT_EXCEEDED',
      `IP attempted ${record.count} logins within 60s (Limit: ${IP_MAX_ATTEMPTS})`
    );
    return true; // Throttled
  }

  return false;
}

// ─── LAYER 2: PER-ACCOUNT PROTECTION ───────────────────────

/** Returns current lockout and progressive delay status for a given email address */
export function getAccountLockState(email: string): AccountLockState {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  const record = accountStore.get(normalized);

  if (!record) {
    return { isLocked: false, failures: 0, remainingLockoutMs: 0, progressiveDelayMs: 0 };
  }

  // Check if temporary lockout has expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.lockedUntil = null;
    record.failures = 0;
    accountStore.set(normalized, record);
    return { isLocked: false, failures: 0, remainingLockoutMs: 0, progressiveDelayMs: 0 };
  }

  const isLocked = Boolean(record.lockedUntil && now < record.lockedUntil);
  const remainingLockoutMs = isLocked ? record.lockedUntil! - now : 0;

  // Calculate progressive delay based on failure count
  let progressiveDelayMs = 0;
  if (isLocked) {
    progressiveDelayMs = 1000; // Delay responses for locked accounts to slow down scripts
  } else if (record.failures === 4) {
    progressiveDelayMs = 500;  // 4th failure: 500ms delay
  } else if (record.failures >= 5) {
    progressiveDelayMs = 1500; // 5th failure: 1500ms delay
  }

  return {
    isLocked,
    failures: record.failures,
    remainingLockoutMs,
    progressiveDelayMs,
  };
}

/** Records a failed login attempt for an account. Handles progressive delays & lockout emails. */
export async function recordAccountFailure(email: string, ip: string): Promise<number> {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  let record = accountStore.get(normalized);

  if (!record) {
    record = { failures: 1, lockedUntil: null, lastAttemptAt: now };
  } else {
    record.failures += 1;
    record.lastAttemptAt = now;
  }

  // Calculate delay based on new failure count
  let delay = 0;
  if (record.failures === 4) {
    delay = 500;
  } else if (record.failures >= LOCKOUT_THRESHOLD) {
    delay = 1500;
    // Lock the account if threshold is hit
    if (!record.lockedUntil) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;

      logSecurityViolation(
        '/api/auth/login',
        ip,
        'ACCOUNT_LOCKED_OUT',
        `Account ${normalized} locked for 15 minutes after ${record.failures} failed login attempts.`
      );

      // Dispatch lockout security email to the user
      dispatchLockoutEmail(normalized, ip);
    }
  }

  accountStore.set(normalized, record);
  return delay;
}

/** Resets failure count and clears lockout status upon successful login */
export function recordAccountSuccess(email: string): void {
  const normalized = email.trim().toLowerCase();
  accountStore.delete(normalized);
}

/** Asynchronously dispatches security alert email when account is locked out */
async function dispatchLockoutEmail(email: string, ip: string): Promise<void> {
  const subject = '🔒 Security Alert: Your ARCUS Account Has Been Temporarily Locked';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #f59e0b; margin: 0; font-size: 20px;">ARCUS SECURITY ALERT</h2>
      </div>
      <div style="padding: 24px; color: #334155;">
        <p style="font-size: 15px; font-weight: bold;">Hello,</p>
        <p style="font-size: 14px; line-height: 1.6;">
          Your ARCUS account (<strong>${email}</strong>) has been temporarily locked for <strong>15 minutes</strong> due to <strong>5 consecutive failed login attempts</strong>.
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #475569;">
          <div><strong>IP Address:</strong> ${ip}</div>
          <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          <div><strong>Lockout Duration:</strong> 15 Minutes</div>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          If you initiated these login attempts and mistyped your password, you can try again after 15 minutes. If you did not attempt to log in, we recommend securing your account by resetting your password immediately.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="http://localhost:5173/#/portal/login" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 13px; display: inline-block;">Go to ARCUS Login</a>
        </div>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">
        © 2026 ARCUS Platform Security Engine. All rights reserved.
      </div>
    </div>
  `;

  await sendSecurityAlertEmail(email, subject, html);
}
