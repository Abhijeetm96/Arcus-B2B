# Database Entity Relationship Diagram (ERD)

---
◀️ **[Previous](sequence.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../README.md)** ▶️
---



This document presents the visual database schema mapping for the ARCUS platform.

```mermaid
erDiagram
    users ||--o| individual_profiles : "profile of"
    users ||--o| business_profiles : "profile of"
    users ||--o| professional_profiles : "profile of"
    users ||--o| admin_profiles : "profile of"
    users ||--o{ user_addresses : "registers"
    users ||--o{ orders : "places"
    users ||--o{ rfqs : "initiates"
    users ||--o{ rfq_quotes : "bids on"
    users ||--o| buildpoints_wallets : "owns"
    
    buildpoints_wallets ||--o{ buildpoints_ledger : "audits"
    
    brands ||--o{ products : "manufactures"
    categories ||--o{ categories : "parent of"
    categories ||--o{ products : "categorizes"
    
    products ||--o{ product_variants : "defines"
    products ||--o{ product_images : "contains"
    products ||--o{ product_accessories : "suggests"
    
    product_variants ||--o| inventory : "monitors"
    product_variants ||--o{ product_price_tiers : "offers"
    product_variants ||--o{ order_items : "sold in"
    
    orders ||--o{ order_items : "contains"
    orders }|--|| user_addresses : "ships to"
    
    rfqs ||--o{ rfq_items : "contains"
    rfqs ||--o{ rfq_quotes : "receives"
```

For details on individual table structures and check constraints, see [DATABASE.md](DATABASE.md).

---
◀️ **[Previous](sequence.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../README.md)** ▶️
