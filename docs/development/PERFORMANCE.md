# Chapter 22: Performance Baseline & Optimizations

---
◀️ **[Previous](SECURITY.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](TECHNICAL_DEBT.md)** ▶️
---


### Bundle Size Optimization
* **Lazy Loading**: Admin and user dashboard sections are lazy-loaded via React `lazy` and `Suspense` inside `src/App.tsx`, reducing initial bundle size.

### Database Indexing
The PostgreSQL schema includes indexes on high-frequency columns:
```sql
CREATE INDEX idx_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_tiers_variant ON product_price_tiers(variant_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_points_ledger_wallet ON buildpoints_ledger(wallet_user_id);
CREATE UNIQUE INDEX idx_business_gst_unique ON business_profiles(UPPER(gst_number));
```

### Cache & Local Fallbacks
The fallback JSON database uses in-memory JSON read/write routines, serving as a cache layer for local development.

---

---

---
◀️ **[Previous](SECURITY.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](TECHNICAL_DEBT.md)** ▶️
