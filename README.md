# 🏗️ ARCUS: B2B & B2C Construction Commerce Platform

ARCUS is a modern, enterprise-grade construction commerce and procurement platform designed to streamline building materials procurement, professional service bookings, and RFQ management. 

Featuring dual-mode operation for everyday consumers (**Retail B2C**) and corporate builders (**Business B2B**), ARCUS provides a robust, validation-secured marketplace connecting project managers, suppliers, and skilled professionals.

---

## 🚀 Key Features & Modules

### 1. Materials Hub & Catalog
- **Hierarchical Routing**: Structured categories (Cement, Steel, CPVC Pipes, MCBs, Adhesives) supporting deep-linked routing (`#/materials/category/subcategory/leaf`).
- **Product Detail Pages (PDP)**: Visual catalogs with interactive galleries, quantity modifiers, CPVC dimensional guides, technical specifications, and dynamic cart operations.
- **Vast Brands Registry**: Dedicated portals for prominent industry partners (e.g. UltraTech, Ambuja, Jaquar, Finolex, Havells).

### 2. Services Hub
- **Professional Directory**: Interactive directory for verified professionals (Plumbers, Electricians, Carpenters, Painters, Architects).
- **Matchmaking & Bookings**: Filter pros by rating, experience, budget, or cover cities. Booking forms dispatch automated requests with real-time response targets.

### 3. Integrated RFQs & Bids
- **Digital RFQ Forms**: Create structured procurement requests with quantities, delivery locations, and technical attachments.
- **Bidding Simulator**: Automatic quote generation from system suppliers for active RFQ status logs.

### 4. Dashboards (Role-Based Control)
- **Retail Individual**: Order history, personal profiles, and saved address books.
- **Business (B2B)**: Access corporate tax billing, Input tax invoices (GST), bulk tiered pricing, and digital RFQ logs.
- **Professional**: Manage service listings, check incoming leads, and compile portfolios.
- **Admin Console**: Monitor platform transactions, manage users, and audit registrations.

### 5. Advanced Resource Center
- **Quantity Calculators**: Smart cement volume and steel reinforcement calculators built directly into the UI.
- **Technical Guides**: Reference guides and quality check lists.

---

## 🔒 Centralized Validation & Sanitization Engine

ARCUS implements a shared validation library located in [`shared/validation.ts`](file:///d:/Claude%20Code/Arcus/shared/validation.ts) to enforce absolute data integrity across the client (Vite/React) and server (Express/Node.js).

### Data Normalization Rules
1. **Indian Mobile Phones**:
   - Strips common formatting (spaces, hyphens, parentheses, country code prefixes like `+91`, `91`, or leading `0`).
   - Normalizes to a clean 10-digit number.
   - Validates that the number starts with Indian mobile digits (6, 7, 8, or 9).
2. **Indian PIN Codes (Zip)**:
   - Restricts entries to exactly 6-digit numeric values, with the first digit between 1-9.
3. **GSTIN (Goods and Services Tax ID)**:
   - Validates the 15-character structure (2-digit state code + 10-character PAN + 1-digit entity code + 1-character check digit + 'Z' + 1 check digit).
   - Integrates with a mock verification API that returns Trade/Legal names, address state, and registration status.

### Security Sanitizers
- **XSS Prevention**: Strips malicious HTML `<script>` tags and tag characters from input text fields.
- **SQL Injection Prevention**: Neutralizes common query patterns (`SELECT`, `INSERT`, `DROP`, `UNION`, `1=1` conditions) by scrubbing keywords.

---

## 🏗️ Project Architecture

```
├── .github/                 # GitHub workflows & actions
├── audit/                   # Security auditing reports and logs (Git Ignored)
├── design/                  # UI templates, wireframes, and design specs
├── public/                  # Static assets, branding logos, and product graphics
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── index.ts         # Main Express API and routes
│   │   └── db.ts            # Local JSON DB utilities (fallback mode)
│   ├── data/
│   │   └── db.json          # Development state database
│   └── nodemon.json         # Nodemon file-watcher config
├── shared/                  # Common libraries
│   └── validation.ts        # Shared validation & sanitization library
├── src/                     # React + TypeScript + Vite frontend
│   ├── components/          # Modular React components (Hubs, checkout, etc.)
│   ├── context/             # AuthContext and CartContext state managers
│   ├── App.tsx              # basic segment router and page switcher
│   └── index.css            # Vanilla CSS design tokens & custom HSL colors
├── tests/                   # Playwright E2E test suites
└── playwright.config.ts     # Playwright configuration file
```

---

## ⚙️ Development Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

1. **Install Frontend Dependencies**:
   ```bash
   # In the root directory
   npm install
   ```

2. **Install Backend Dependencies**:
   ```bash
   # Go to server directory
   cd server
   npm install
   ```

### Running the Services

1. **Start the Express API Server**:
   ```bash
   cd server
   npm run dev
   ```
   - The backend runs on `http://localhost:5000`.
   - **Dev Mode OTP Simulator**: Standard OTP dispatches are written directly to the terminal stdout for testing. Bypass OTP code is hardcoded to `123456`.
   - **Nodemon Reset Loop Fix**: Ignored `server/data/db.json` updates in `server/nodemon.json` to prevent backend server restarts mid-registration.

2. **Start the Frontend Application**:
   ```bash
   # From root directory
   npm run dev
   ```
   - The client runs on `http://localhost:5173`.
   - Dynamic HMR is fully active.

---

## 🧪 Running E2E Test Suite

ARCUS contains a robust integration and E2E test suite running under Playwright. It tests signup, GST verification, rate limits, coupon usage, and checkout behaviors.

To execute the test cases:

```bash
# 1. Run all 11 E2E tests
npx playwright test

# 2. Run specifically the Checkout specs
npx playwright test tests/checkout.spec.ts

# 3. Open Interactive UI Test Runner
npx playwright test --ui
```

### Test Coverage Details
- **Auth Flow**: Tests individual (B2C) registration, business (B2B) registration with live GST checks, invalid credential handles, and OTP verification bypasses.
- **Checkout Flow**: Verifies shipping/billing address auto-fills, parsing street addresses, conditional billing form toggle, B2B vs B2C coupon applications (`ARCUS10` vs `WELCOME5`), and success loading.
- **Dashboard Settings**: Verifies address book addition/deletion, profile updates, and email changes.
- **Materials Hub**: Verifies searching, filter categories, and adding to carts.

---

## 🎨 Visual Aesthetics & Layout System

The platform features a premium UI system constructed using vanilla CSS, modern typography, and a tailored color palette:
- **Design Tokens**: Configured in `src/index.css` using dynamic HSL color mappings.
- **Micro-Animations**: Custom scroll behaviors, hover transforms, loading state indicators, and glassmorphism panels.
- **Aesthetic Pillars**: Dark modes, pulsing networks, floating layout caps, and high-fidelity product cards.
