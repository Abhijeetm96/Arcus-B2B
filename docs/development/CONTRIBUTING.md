# Chapter 18: Coding Standards

---
◀️ **[Previous](PROMPT_LIBRARY.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](TESTING.md)** ▶️
---


* **Naming Conventions**:
  * Frontend: PascalCase for components (`MaterialsHub.tsx`), camelCase for hooks (`usePermissions.ts`).
  * Backend: PascalCase for models (`User.ts`), camelCase for services (`QuotationService.ts`).
  * Database: snake_case for table names and columns (`user_id`, `gst_number`).
* **Safe SQL Queries**: Direct SQL queries must use parameterized placeholders (`$1`, `$2`) to prevent SQL injection.
* **Decoupled Business Logic**: Database operations are isolated within service layers, separated from Express route handlers.

---

---

---

## 🤝 Standard Development Guidelines
1. **Branching Model**: Use short-lived feature branches named after issue numbers or features (e.g. `feat/rfq-negotiation`, `bugfix/otp-expiration`).
2. **Pull Requests**: Explain the purpose, changes made, testing performed, and any database impact.
3. **Commit Messages**: Follow conventional commits:
   - `feat: add OTP rate limiter`
   - `fix: resolve GST calculation mismatch`
   - `docs: update API endpoint reference`
4. **Code Quality**: Run `npm run lint` and `npm run build` before submitting code. Avoid bypassing the service layer.


---
◀️ **[Previous](PROMPT_LIBRARY.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](TESTING.md)** ▶️
