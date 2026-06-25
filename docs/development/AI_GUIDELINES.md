# Chapter 6: AI Modification Rules

---
◀️ **[Previous](../business/PROCUREMENT.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](PROMPT_LIBRARY.md)** ▶️
---



## 6.1. Permanent Architectural and Codebase Integrity Constraints
> [!IMPORTANT]
> **Strict Operational Constraints for AI Coding Assistants Modifying this Repository:**

1. **Never Break API Contracts**: Retain path URIs, HTTP methods, and exact status codes.
2. **Never Rename DTO Properties**: Maintain key casing (e.g. camelCase) and type mappings for request/response payloads to avoid breaking frontend serialization.
3. **Never Bypass Inventory Transactions**: Stock changes must pass through transaction locks and raise alerts inside [InventoryService](../../server/src/modules/inventory/InventoryService.ts).
4. **Never Modify Wallet Balances Directly**: Balance calculations must reconcile against Ledger sums. Direct database writes to the balance column are forbidden.
5. **Never Bypass BuildPoints Ledger**: Point credits or debits must write to the Ledger concurrently.
6. **Never Remove Validation**: Maintain isomorphic schema filters and input checks inside [validation.ts](../../shared/validation.ts).
7. **Never Bypass Audit Logging**: Platform changes (order placing, adjustments, settings overrides) must log to the Audit Service.
8. **Never Duplicate Business Logic**: Re-use backend services and isomorphic helper methods.
9. **Never Place Backend Logic inside React Components**: Keep client components focused on state rendering. Computations (GST, tiers, wallet balances) must execute in backend Services.
10. **Always Maintain PostgreSQL/JSON Parity**: Fallback JSON database adapters must return data structures matching PostgreSQL query outcomes.
11. **Preserve Relational Normalization**: Maintain 3NF separation. Do not denormalize tables or duplicate address strings.
12. **Preserve RFQ Version History**: Retain quote revision arrays and quotation version numbers in the database.
13. **Preserve Quotation Audit Trail**: Log quote status modifications to track negotiations.


---

---
◀️ **[Previous](../business/PROCUREMENT.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](PROMPT_LIBRARY.md)** ▶️
