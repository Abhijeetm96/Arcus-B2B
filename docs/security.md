# 🔒 ARCUS Platform Security Specification

ARCUS places a high priority on data integrity and security, implementing multi-layered controls to defend against common vulnerabilities.

## 🛡️ Input Sanitization & Anti-Injection

All client-submitted text parameters pass through a centralized sanitization engine before validation or database insertion:
1. **Cross-Site Scripting (XSS)**: All HTML `<script>` tags, tag markers, and dynamic inline handlers (e.g. `onload`, `onerror`) are automatically scrubbed out.
2. **SQL Injection (SQLi)**: Key database terms (`SELECT`, `INSERT`, `DROP`, `UNION`, `OR 1=1`) and comments (`--`, `/*`, `*/`) are identified and stripped.

---

## 🚦 Custom Rate Limiting

To prevent brute-force attacks and Denial of Service (DoS), the backend maintains active, state-retaining `RateLimiter` classes:
- **Login Rate Limiter**: Maximum 5 attempts per 15-minute window.
- **OTP Request Limiter**: Maximum 3 dispatches per 5-minute window.
- **Profile Update Limiter**: Maximum 10 profile modifications per hour.
- **General Form Limiter**: Maximum 5 registration submissions per 10-minute window.

---

## 🔑 Session Security & JWT

- **Token-Based Sessions**: Sessions are managed using JSON Web Tokens (JWT). Upon successful credentials or OTP match, the server returns a signed JWT.
- **Payload Scopes**: JWT payloads include only necessary information (`id`, `name`, `role`).
- **Signature Audits**: Middleware validates the JWT signature on every secure route (e.g. `/api/auth/me`, `/api/orders`).
