# 🏗️ ARCUS

<p align="center">
  <img src="docs/assets/logo.png" alt="ARCUS Logo" width="220" />
</p>

<p align="center">
  <strong>Build Faster. Procure Smarter. Deliver Better.</strong>
</p>

<p align="center">
  ARCUS is a full-stack, enterprise-grade construction commerce platform that enables builders and individual property developers to procure building materials, hire verified professionals, submit Request for Quotes (RFQs), and manage project schedules from a single, unified ecosystem.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status Active" />
  <img src="https://img.shields.io/badge/Environment-Development-blue?style=flat-square" alt="Environment Development" />
  <img src="https://img.shields.io/badge/Version-1.0.0-orange?style=flat-square" alt="Version 1.0.0" />
</p>

---

## 🗺️ Quick Navigation

<p align="center">
  <a href="#-platform-overview">
    <img src="https://img.shields.io/badge/Overview-blue?style=for-the-badge&logo=info" alt="Overview" />
  </a>
  <a href="#-module-status-dashboard">
    <img src="https://img.shields.io/badge/Status-green?style=for-the-badge&logo=status" alt="Status" />
  </a>
  <a href="#-system-architecture">
    <img src="https://img.shields.io/badge/Architecture-purple?style=for-the-badge&logo=architecture" alt="Architecture" />
  </a>
  <a href="#-deployment--installation">
    <img src="https://img.shields.io/badge/Installation-orange?style=for-the-badge&logo=install" alt="Installation" />
  </a>
  <a href="#-roadmap">
    <img src="https://img.shields.io/badge/Roadmap-red?style=for-the-badge&logo=roadmap" alt="Roadmap" />
  </a>
  <a href="#-documentation-hub">
    <img src="https://img.shields.io/badge/Documentation-yellow?style=for-the-badge&logo=docs" alt="Documentation" />
  </a>
  <a href="#-security">
    <img src="https://img.shields.io/badge/Security-brightgreen?style=for-the-badge&logo=security" alt="Security" />
  </a>
</p>

---

## 🔍 Platform Overview

The ARCUS platform is designed to digitize the construction ecosystem:
- **Materials Marketplace**: Buy materials (cement, steel, CPVC fittings) with dynamic cart modifiers, dimensional metrics, and role-based pricing.
- **Services Directory**: Select and hire verified professionals (Plumbers, Electricians, Carpenters, Painters, Architects) with starting rates and reviews.
- **RFQ System**: Create detailed project lists to receive and review dynamic supplier quotes.
- **Loyalty Program**: Earn and redeem BuildPoints for checkout coupons (`WELCOME5` for B2C, `ARCUS10` for B2B).

---

## 📊 Module Status Dashboard

Below is the living product roadmap and implementation status tracker for all ARCUS subsystems. 

| Module | Frontend | Backend | Database | Implemented Features | Missing Features | Future Enhancements | Priority |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **Authentication & OTP** | 🟡 In Progress | 🟡 In Progress | 🟢 Ready | • Login & Registration views<br/>• 6-digit OTP verification panel<br/>• Unmount timer ref cleanup<br/>• Session token storage | • Social logins (Google/LinkedIn)<br/>• Real SMTP email delivery<br/>• Active DB password reset | • Passkey biometric logins<br/>• Authenticator App 2FA | **Critical** |
| **Materials Marketplace** | 🟡 In Progress | 🟡 In Progress | 🟢 Ready | • Hierarchical category browser<br/>• Product keyword search<br/>• PDP details and specifications<br/>• Brand directories | • Multi-criteria side-filters<br/>• Related products recommendations<br/>• Product kits & bundles<br/>• Real vendor inventory sync | • Real-time price tracking graphs<br/>• Barcode scanner product matcher | **High** |
| **Services Marketplace** | 🟢 Ready | 🟡 In Progress | 🟢 Ready | • Contractor trade categories<br/>• Profile listings and locations<br/>• Quote booking request forms<br/>• Ratings and reviews display | • Live customer-vendor chat<br/>• Contractor calendar scheduling<br/>• Portfolio media uploaders | • Milestone escrow payments<br/>• Nearby contractor geo-matching | **High** |
| **RFQ Engine** | 🟡 In Progress | 🟡 In Progress | 🟢 Ready | • RFQ creation & posting form<br/>• Bid simulator for dashboard<br/>• RFQ active tracking logs | • Supplier portal bidding forms<br/>• Side-by-side quote comparisons<br/>• SMS/Email bid notifications | • Multi-round reverse auctions | **High** |
| **BuildPoints & Loyalty** | 🟢 Ready | 🔴 Not Started | 🔴 Not Started | • Dashboard loyalty point balance<br/>• Retail/B2B coupons validation | • Post-order point increment triggers<br/>• Monthly multipliers<br/>• Tier status upgrades (Gold/Platinum) | • Partner store point redemptions | **Medium** |
| **Procurement Dashboard** | 🟢 Ready | 🟡 In Progress | 🟢 Ready | • Order histories details view<br/>• Address split auto-fill parser<br/>• Billing address check toggling<br/>• Verified GSTIN rendering | • Monthly spend charts & graphs<br/>• PDF invoice/receipt downloads<br/>• Saved/favorite products listing | • Corporate multi-level approval flow | **High** |
| **Admin Panel** | 🟡 In Progress | 🟡 In Progress | 🟢 Ready | • Master user list grid view<br/>• Global transaction log audits<br/>• Database cleanup APIs for dev | • Product catalog CRUD manager<br/>• Category tree management view<br/>• Vendor applications auditor | • CSV/Excel transaction exports | **Medium** |
| **Analytics Console** | 🔴 Not Started | 🔴 Not Started | 🔴 Not Started | • Navigation placeholder tabs | • Spend dashboards & analytics grids<br/>• Cement/Steel forecasting logic<br/>• Automated cost estimators | • AI-driven procurement advice | **Low** |
| **Checkout & Address** | 🟢 Ready | 🟢 Ready | 🟢 Ready | • Address profile management<br/>• Suburb-retaining address parser<br/>• Billing address forms toggles | • Address maps geolocation check<br/>• Address validation checks | • Google Maps pin drop selector | **High** |
| **Security & Validation** | 🟢 Ready | 🟢 Ready | 🟢 Ready | • Centralized phone/email/GSTIN checks<br/>• XSS HTML script scrubbers<br/>• SQL injection keyword scrubbers<br/>• Auth & profile rate limiters | • DB parameterized query binds<br/>• Permanent IP blacklist bans | • Security audit alert log tracker | **Critical** |
| **Resources & Calculators** | 🟢 Ready | 🟢 Ready | 🟢 Ready | • Concrete volume cement estimator<br/>• Steel bar reinforcement calculator<br/>• Quality audit checklists | • Structural load calculators<br/>• Estimate logs export options | • Save calculations to projects board | **Medium** |

---

## 🧬 Component Mind Map

```mermaid
graph TD
    A[ARCUS Platform] --> B[Materials Hub]
    A --> C[Services Hub]
    A --> D[Users & Profiles]
    A --> E[Orders & Checkout]
    A --> F[RFQ Engine]
    A --> G[BuildPoints Loyalty]
    A --> H[Authentication]
    A --> I[Admin Controls]

    B --> B1[Product Search]
    B --> B2[Category Tree]
    B --> B3[Dimension Variants]

    C --> C1[Contractor Lists]
    C --> C2[Ratings Logs]
    C --> C3[Booking Forms]

    D --> D1[Individual B2C]
    D --> D2[Business B2B]
    D --> D3[Professional Contractor]

    E --> E1[Address Split Parser]
    E --> E2[Billing Address Toggle]
    E --> E3[Coupons Engine]

    F --> F1[RFQ Submissions]
    F --> F2[Bids Simulator]

    G --> G1[Purchase Accruals]
    G --> G2[WELCOME5 / ARCUS10]

    H --> H1[6-digit OTP Validator]
    H --> H2[Timer Cleanup Ref]

    I --> I1[Tax Registration Audit]
    I --> I2[Vendor Status Controls]
```

---

## 🎨 System Architecture

```mermaid
graph TD
    subgraph Frontend [Vite React Client]
        App[App.tsx Router] --> Contexts[Auth & Cart Contexts]
        Contexts --> Views[Hubs, Dashboards, Checkout]
    end
    subgraph Middleware [Shared Validation Library]
        Val[validation.ts]
    end
    subgraph Backend [Express API Server]
        API[index.ts Endpoints] --> Limiters[Rate Limiters]
        Limiters --> Auth[Auth check]
        Auth --> DB[db.ts Helper Functions]
        DB --> JSON[(db.json file)]
    end
    Frontend -->|HTTP Requests| Backend
    Val -.->|Client Validator| Frontend
    Val -.->|Server Sanitizer| Backend
```

---

## 🔄 User Journey Flowcharts

### 1. Product Purchase Journey
```mermaid
graph LR
    A[Home Page] --> B[Categories List]
    B --> C[Materials Hub PLP]
    C --> D[Product Detail PDP]
    D --> E[Cart Drawer]
    E --> F[Checkout Billing]
    F --> G[Order Success]
```

### 2. Professional Booking Journey
```mermaid
graph LR
    A[Home Page] --> B[Services Landing]
    B --> C[Maintenance Trades PLP]
    C --> D[Professional Profile]
    D --> E[Send Quote Request]
```

### 3. RFQ Submission Journey
```mermaid
graph TD
    A[Builder/Customer] -->|Post RFQ Specifications| B[RFQ Pipeline]
    B -->|Notify Admin| C[Admin Console Review]
    C -->|Simulate Bids| D[Supplier Quote Dispatch]
    D -->|Approve Quote| E[Persist Active Order]
```

---

## 📂 Project Structure

```
├── docs/                      # Technical design documents and assets
│   ├── assets/                # Logos and hero media files
│   └── screenshots/           # Screenshot gallery of main views
├── public/                    # Global public folder assets and imagery
├── server/                    # Express Node.js application
│   ├── data/                  # Local database directory (db.json)
│   └── src/                   # Server API routes and controllers
├── shared/                    # Commmon shared validation layer
└── src/                       # React TypeScript Single Page Application
    ├── components/            # Interface views, components, and widgets
    ├── context/               # Global state contexts (Auth, Cart)
    └── index.css              # Custom HSL design tokens and styles
```

---

## 🏁 Roadmap

```mermaid
timeline
    title ARCUS Development Roadmap
    Phase 1 : Centralized Authentication : Core Materials Hub : Category Listings : Product Detail Pages
    Phase 2 : Digital RFQs & Bidding : Verified Professionals : Customer Reviews : BuildPoints Accruals
    Phase 3 : Business Procurement : Saved Addresses Split : Order Analytics : Mobile Companion App
```

---

## 🖼️ Screenshot Gallery

| Homepage | Materials Hub | Product Detail |
| :---: | :---: | :---: |
| ![Homepage](docs/screenshots/homepage.png) | ![Materials Hub](docs/screenshots/materials_hub.png) | ![Product Detail](docs/screenshots/pdp.png) |

---

## 📖 Documentation Hub

Access specific modules and platform rules:

| Document | Location | Purpose |
| :--- | :--- | :--- |
| **System Architecture** | [`docs/architecture.md`](file:///d:/Claude%20Code/Arcus/docs/architecture.md) | Deeper dive into the frontend routing and middleware flow. |
| **Security Standards** | [`docs/security.md`](file:///d:/Claude%20Code/Arcus/docs/security.md) | Explains input sanitization rules, rate-limit logs, and JWT signatures. |
| **Database Schema** | [`docs/database-schema.md`](file:///d:/Claude%20Code/Arcus/docs/database-schema.md) | Details type definitions for Users, OTPs, RFQs, and Orders. |
| **API Specification** | [`docs/api-specification.md`](file:///d:/Claude%20Code/Arcus/docs/api-specification.md) | Full endpoint listings, status codes, and payloads. |
| **Deployment Specifications** | [`docs/deployment.md`](file:///d:/Claude%20Code/Arcus/docs/deployment.md) | Environment setup guides and startup commands. |
| **Design System** | [`docs/design-system.md`](file:///d:/Claude%20Code/Arcus/docs/design-system.md) | Outlines colors systems, typography, and transition styles. |
| **Validation Rules** | [`docs/validation-rules.md`](file:///d:/Claude%20Code/Arcus/docs/validation-rules.md) | Explains phone normalization and GSTIN structure constraints. |
| **Authentication Flow** | [`docs/authentication.md`](file:///d:/Claude%20Code/Arcus/docs/authentication.md) | Sequence diagram and detail logs for the OTP verification model. |
| **Loyalty Program** | [`docs/loyalty-program.md`](file:///d:/Claude%20Code/Arcus/docs/loyalty-program.md) | Rules and accrual ratios of the BuildPoints system. |
| **Project Roadmap** | [`docs/roadmap.md`](file:///d:/Claude%20Code/Arcus/docs/roadmap.md) | Displays developmental milestones and timelines. |

---

## 🛡️ Security

Security and validation details are kept in separate document files:
- Validation specs: [`docs/validation-rules.md`](file:///d:/Claude%20Code/Arcus/docs/validation-rules.md)
- Authentication rules: [`docs/authentication.md`](file:///d:/Claude%20Code/Arcus/docs/authentication.md)
- Rate limiting and XSS: [`docs/security.md`](file:///d:/Claude%20Code/Arcus/docs/security.md)

---

## ⚙️ Deployment & Installation

<details>
<summary><b>🛠️ Environment Variables</b></summary>

Create a `.env` file under the `server/` directory:
```ini
PORT=5000
NODE_ENV=development
```
</details>

<details>
<summary><b>🚀 Running Locally</b></summary>

#### 1. Start the API Backend Server
```bash
cd server
npm install
npm run dev
```
The backend server runs on `http://localhost:5000`.

#### 2. Start the Frontend Client
```bash
# From root directory
npm install
npm run dev
```
The client runs on `http://localhost:5173`.
</details>

<details>
<summary><b>🩺 Troubleshooting & Dev Notes</b></summary>

- **OTP Bypass**: In development, you can use the bypass verification code `123456`.
- **Nodemon Reset loop**: Database updates on `db.json` do not restart the server due to ignoring patterns in `server/nodemon.json`.
</details>

<details>
<summary><b>🧪 Testing Specifications</b></summary>

- All E2E test suites reside under the `tests/` directory.
- Run the tests using `npx playwright test`.
- To run specific tests, use `npx playwright test tests/checkout.spec.ts`.
</details>
