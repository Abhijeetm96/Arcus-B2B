# System Architecture Diagrams

---
◀️ **[Previous](../development/ROADMAP.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](workflows.md)** ▶️
---



This page houses the system diagrams for the ARCUS platform.

## 1. Centralized Application Topology

```mermaid
graph TD
    subgraph Client ["Client-Side React SPA"]
        App["App.tsx Router"] --> PortalResolver["PortalResolver.tsx"]
        PortalResolver --> Portals["Portals (Admin / Business / Individual / Professional)"]
        App --> Contexts["Contexts (AuthContext · CartContext)"]
        App --> Views["Hubs (MaterialsHub · ServicesHub · SearchPage · ProductDetail · Checkout)"]
        CSS["index.css (HSL Design Tokens)"] -.- App
    end

    subgraph Validation ["Shared Layer"]
        Val["validation.ts (Isomorphic Validators & XSS/SQLi Guards)"]
    end

    subgraph Server ["Server-Side Node.js Express REST API"]
        Index["index.ts (App Router & Rate Limiters)"] --> Auth["Auth Middleware & Scope Guards"]
        Auth --> Services["Domain Service Layer"]
        subgraph Services
            CatalogSvc["Catalog Service"]
            InventorySvc["Inventory Service"]
            OrderSvc["Order Service"]
            RfqSvc["RFQ & Quotation Service"]
            SearchSvc["Search & Analytics Service"]
            UserSvc["User & Profile Service"]
            AuditSvc["Audit Logging Service"]
        end
        Services --> DBFacade["db.ts (Database Re-export Facade)"]
    end

    subgraph Database ["Data Persistence Layer"]
        DBFacade --> PGDB[("PostgreSQL DB (Production)")]
        DBFacade --> JSONDB[("db.json (Local Development Fallback)")]
    end

    Client -->|"HTTP API Requests (Bearer JWT)"| Index
    Val -.- Client
    Val -.- Server
```

For more architectural details, see [ARCHITECTURE.md](../architecture/ARCHITECTURE.md).

---
◀️ **[Previous](../development/ROADMAP.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](workflows.md)** ▶️
