# Chapter 14: Loyalty System & BuildPoints Ledger

---
◀️ **[Previous](QUOTATION_WORKFLOW.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](PROCUREMENT.md)** ▶️
---


ARCUS rewards users through the **BuildPoints** loyalty program, which maintains points balances and tier statuses.

```text
                               ┌────────────────────────┐
                               │   BuildPoints System   │
                               └───────────┬────────────┘
                     ┌─────────────────────┴─────────────────────┐
            ┌────────┴────────┐                                 ┌┴──────────────┐
            │  Accrual Rules  │                                 │ Loyalty Tiers │
            └────────┬────────┘                                 └───────┬───────┘
  ┌──────────────────┼──────────────────┐                     ┌─────────┼─────────┐
B2C Purchases   B2B Purchases      Contractors             Bronze     Silver     Gold
 (1% Return)    (0.5% Return)      (2% Return)             (Base)     (1.1x)    (1.2x)
```

### Point Accrual Rules
* **B2C Retail Purchases**: Individual customers earn **1 BuildPoint for every ₹100 spent** on building materials (1% return).
* **B2B Bulk Purchases**: Business customers earn **1 BuildPoint for every ₹200 spent** (0.5% return).
* **Contractor Bookings**: Verified contractor partners earn **2 BuildPoints for every ₹100 spent** when procuring materials for client projects (2% return).
* **Accrual Trigger**: Points are calculated on the checkout grand total and credited when the order is marked `Confirmed`.

### Double-Entry Auditing
To prevent balance tampering, every wallet update requires a matching entry in the `buildpoints_ledger` table.
$$\text{Wallet Balance} = \sum (\text{Ledger points deltas})$$
* **Transaction Types**: `'EARNED'`, `'REDEEMED'`, `'ADJUSTED'`, or `'EXPIRED'`.
* **Auditing Scripts**: `verifyBuildPoints.ts` checks that all wallets match the sum of their ledger entries. Discrepancies block database cleanups.

### Loyalty Tiers
Tiers are determined by lifetime points accumulated:
1. **Bronze**: Baseline tier (0 - 4,999 lifetime points).
2. **Silver**: 1.1x points multiplier on purchases (5,000 - 19,999 lifetime points).
3. **Gold**: 1.2x points multiplier, free priority shipping (20,000 - 49,999 lifetime points).
4. **Platinum**: 1.5x points multiplier, dedicated account manager (50,000+ lifetime points).

---

---

---
◀️ **[Previous](QUOTATION_WORKFLOW.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](PROCUREMENT.md)** ▶️
