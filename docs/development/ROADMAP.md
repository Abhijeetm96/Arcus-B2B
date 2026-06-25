# Chapter 23: Roadmap & Technical Debt Registry

---
◀️ **[Previous](TECHNICAL_DEBT.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../README.md)** ▶️
---



## 23.1. Completed Milestones
* **Phase 1: Foundation (v1.0.0)**: Established React client, Express API server, and core materials catalog.
* **Phase 2: Database Normalization (v2.0.0)**: Decoupled profiles, normalized address maps, and structured double-entry BuildPoints ledgers.
* **Phase 3: Security Hardening (v2.5.0)**: Added rate-limiting, isomorphic sanitizers, and back-office command center screens.



---

# Chapter 28: Changelog & Milestones
### Version 1.0.0 — Flat File Database MVP
* Created React frontend client and Express API server.
* Implemented basic materials catalog and visiting schedule.
* Used flat-file database structures (`users`, `products`, `orders`).

### Version 2.0.0 — V1 Normalized Redesign
* Redesigned database to a fully normalized schema, separating profiles (`individual_profiles`, `business_profiles`, `professional_profiles`, `admin_profiles`), addresses (`user_addresses`), orders (`orders`, `order_items`), and price tiers (`product_price_tiers`).
* Implemented double-entry auditing ledger for BuildPoints wallets.
* Added input sanitization filters for XSS and SQLi in `shared/validation.ts`.
* Created administrative Command Center with 17 screens and role-based permissions.
* Implemented search analytics telemetry logging.

---

---

---
◀️ **[Previous](TECHNICAL_DEBT.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../README.md)** ▶️
