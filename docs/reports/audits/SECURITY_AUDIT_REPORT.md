# Security Audit Report - ARCUS Application

**Date:** 2026-06-18  
**Auditor:** Claude Code Security Reviewer  
**Status:** No changes made - assessment only  

## Executive Summary

This report details security vulnerabilities identified in the ARCUS application, a React/TypeScript web application with Node.js/Express backend. The application was found to contain several security issues ranging from Critical to Low severity. **No remediation has been performed** - this document solely reports findings.

## Findings by Severity

### CRITICAL SEVERITY (1 issue)

#### CVE-2026-ARCUS-001: Hardcoded JWT Secret Fallback
- **File:** `src/server/index.ts:213`
- **Vulnerable Code:** `const SECRET_KEY = process.env.JWT_SECRET || 'arcus_auth_default_secret_key_long_and_secure';`
- **Description:** The application uses a hardcoded fallback secret for JWT token generation if the `JWT_SECRET` environment variable is not set. This creates a predictable secret that attackers can guess or discover.
- **Impact:** Attackers can forge authentication tokens and impersonate any user in the system, leading to complete account takeover.
- **Fix:** Remove the hardcoded fallback and require `JWT_SECRET` to be set. The application should fail to start if this critical secret is not provided in production.

### HIGH SEVERITY (3 issues)

#### CVE-2026-ARCUS-002: Hardcoded OTP Bypass in Forgot Password Flow
- **File:** `src/components/AuthPage.tsx:294`
- **Vulnerable Code:** `if (forgotOtp !== '123456' && forgotOtp.length !== 6) {`
- **Description:** The forgot password flow contains a hardcoded OTP bypass ("123456") that allows anyone to reset any user's password by simply knowing their email/phone number and using this fixed code.
- **Impact:** Complete compromise of the password reset mechanism, allowing attackers to take over any user account.
- **Fix:** Remove the hardcoded OTP check and implement proper OTP generation using cryptographically secure random numbers sent via email/SMS, with validation against stored, expiring codes.

#### CVE-2026-ARCUS-003: Missing Input Validation on Registration Endpoints
- **File:** `src/server/index.ts:250-257`
- **Vulnerable Code:** Registration endpoint only validates field presence but lacks comprehensive validation for:
  - Email format
  - Phone number format
  - Password strength requirements
  - GST number format (beyond basic regex)
- **Description:** Lack of comprehensive input validation allows attackers to submit malformed data.
- **Impact:** Potential for injection attacks, account takeover through parameter pollution, and weak security controls overall.
- **Fix:** Implement strict validation for all fields with RFC-compliant email validation, E.164 phone validation, password complexity requirements, and strict GSTIN checksum validation.

#### CVE-2026-ARCUS-004: Information Exposure through Error Messages
- **File:** `src/server/index.ts` (multiple locations)
- **Vulnerable Examples:**
  - Line 261: `"A user with this email already exists."` (user enumeration)
  - Line 321: `"Invalid email or password."` (acceptable but noted)
- **Description:** Specific error messages allow attackers to enumerate valid email addresses in the system.
- **Impact:** Email enumeration enables targeted attacks like credential stuffing or phishing campaigns.
- **Fix:** Use generic error messages for registration: `"Registration failed. Please try again."` instead of revealing whether an email exists.

### MEDIUM SEVERITY (2 issues)

#### CVE-2026-ARCUS-005: Missing Rate Limiting on Authentication Endpoints
- **File:** `src/server/index.ts` (authentication endpoints)
- **Vulnerable Code:** No rate limiting implemented on `/api/auth/login` and `/api/auth/register` endpoints.
- **Description:** Absence of rate limiting allows unlimited authentication attempts.
- **Impact:** Brute force attacks on passwords and account flooding through automated scripts are possible.
- **Fix:** Implement rate limiting (e.g., 5 attempts per IP per 15 minutes) using middleware like `express-rate-limit` or Redis-based solution.

#### CVE-2026-ARCUS-006: Potential SSRF in GST Verification Endpoint
- **File:** `src/server/index.ts:418-486` (`/api/auth/verify-gst/:gstin`)
- **Vulnerable Code:** Constructs URL from user input: `https://www.mastersindia.co/gst-search/?name=dummy&gstin=${gstClean}`
- **Description:** While the current implementation targets a specific domain, insufficient validation of GSTIN input could potentially allow Server-Side Request Forgery.
- **Impact:** If validation is bypassed, attackers could make the server request internal services or external systems.
- **Fix:** Implement stricter GSTIN validation including checksum verification, use an allowlist of permitted domains, or better yet, use a trusted GST validation API with proper authentication instead of scraping.

### LOW SEVERITY (2 issues)

#### CVE-2026-ARCUS-007: Development API URLs Not Using HTTPS
- **File:** `src/context/AuthContext.tsx` (multiple lines: 54, 79, 93, 100, 159, 164, 222)
- **Vulnerable Code:** Uses `http://localhost:5000` for API calls
- **Description:** While acceptable for local development, hardcoded HTTP URLs could potentially be deployed to production.
- **Impact:** If deployed to production without modification, credentials and tokens would be transmitted in plaintext.
- **Fix:** Use relative URLs (e.g., `/api/auth/me`) or configure an API base URL from environment variables that defaults to HTTPS in production.

#### CVE-2026-ARCUS-008: Cart Data Stored in localStorage
- **File:** `src/components/Navbar.tsx:111-114`
- **Vulnerable Code:** Cart count stored/retrieved from `localStorage`
- **Description:** While cart count itself is not highly sensitive, storing data in localStorage makes it accessible to JavaScript.
- **Impact:** Increases the impact surface if an XSS vulnerability is discovered elsewhere in the application.
- **Fix:** For truly sensitive data, use HttpOnly, Secure cookies. For cart data like this, evaluate based on actual sensitivity but consider the risk acceptable for non-PII data.

## Summary of Findings

| Severity | Count | Issues |
|----------|-------|--------|
| Critical | 1 | Hardcoded JWT secret fallback |
| High | 3 | Hardcoded OTP bypass, Missing input validation, Information exposure |
| Medium | 2 | Missing rate limiting, Potential SSRF |
| Low | 2 | Non-HTTPS dev URLs, localStorage usage |
| **Total** | **8** | **All vulnerabilities** |

## Detailed Recommendations

### Immediate Actions (Critical/High)
1. **Remove hardcoded JWT secret fallback** and enforce environment variable configuration
2. **Eliminate hardcoded OTP bypass** and implement proper OTP generation/validation
3. **Add comprehensive input validation** on all registration/authentication endpoints
4. **Genericize error messages** to prevent user enumeration

### Short-Term Actions (Medium)
5. **Implement rate limiting** on authentication endpoints
6. **Strengthen GST verification endpoint** with proper validation and consider using a trusted API

### Long-Term Actions (Low)
7. **Use relative or environment-configured API URLs** to prevent accidental HTTP usage in production
8. **Evaluate storage mechanisms** for client-side data based on sensitivity ratings

## Security Best Practices for Future Development

1. **Input Validation:** Validate all user inputs on both client and server sides
2. **Authentication:** Use established libraries (e.g., Passport.js, Firebase Auth) rather than custom implementations
3. **Session Management:** Implement proper session handling with secure, HttpOnly cookies
4. **Secrets Management:** Never hardcode secrets; use environment variables or secret management services
5. **Error Handling:** Implement generic error messages that don't leak system information
6. **Rate Limiting:** Protect all authentication and sensitive endpoints with rate limiting
7. **Security Headers:** Implement HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
8. **Dependency Scanning:** Regularly scan dependencies for known vulnerabilities
9. **Security Testing:** Include security tests in the CI/CD pipeline
10. **Least Privilege:** Apply principle of least privilege to database queries and API endpoints

## Conclusion

The ARCUS application contains several significant security vulnerabilities that require immediate attention, particularly the hardcoded JWT secret fallback and OTP bypass which allow complete account compromise. While the application appears functional, it lacks essential security controls necessary for production deployment.

**Important:** This report documents findings only. No modifications have been made to the codebase as part of this audit. Remediation should be performed by the development team following secure coding practices.

---
*Report generated by Claude Code Security Reviewer on 2026-06-18*