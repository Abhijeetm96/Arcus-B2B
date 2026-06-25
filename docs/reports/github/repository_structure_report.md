# 🏛️ ARCUS Repository Structure Report

This report verifies that the monorepo complies with standard clean repository layout guidelines.

---

## 1. Directory Tree Overview

The ARCUS monorepo is structured as follows:

```text
ARCUS/
├── docs/                      # Centralized Documentation Hub
│   ├── README.md              # Landing homepage
│   ├── START_HERE.md          # Onboarding guide
│   ├── PROJECT_BRAIN.md       # Master engineering handbook
│   ├── architecture/          # ADRs, ERD, and DB dictionaries
│   ├── business/              # RFQ, Quote, and BuildPoints workflows
│   ├── development/           # AI guidelines, prompts, testing, and security
│   ├── diagrams/              # Mermaid system topology visual assets
│   └── reports/               # Archived audits and validations
│
├── server/                    # Express backend Rest API server
│   ├── src/
│   │   ├── database/          # Migrations, schemas, and checks
│   │   ├── modules/           # Domain logic (rfq, orders, search, users)
│   │   └── index.ts           # Main entry point
│   ├── package.json
│   └── tsconfig.json
│
├── src/                       # Vite React frontend Single Page Application
│   ├── components/            # UI hubs (MaterialsHub, ServicesHub, etc.)
│   ├── context/               # Auth and Cart state contexts
│   ├── core/                  # Portal resolvers and router configurations
│   ├── modules/               # Role-specific dashboard layouts
│   └── App.tsx                # Client-side router
│
├── shared/                    # Isomorphic validation rules
├── public/                    # Static image and image variant assets
├── scripts/                   # Workspace stats and database seeding scripts
│
├── README.md                  # Project overview and installation guide
├── package.json               # Root frontend package
├── tailwind.config.js         # Theme HSL parameters
└── tsconfig.json              # Client TypeScript compiler settings
```

---

## 2. Structural Hygiene Check
* **Documentation Location**: Verified. All active Markdown documentation resides under `/docs`.
* **Sub-module Isolation**: Verified. Frontend client code (`/src`) and server API code (`/server`) are separate.
* **Shared Layer Integration**: Verified. The validation rules are isolated in `/shared` and linked to both layers.
