# ARCUS Construction Commerce Platform

ARCUS is a modern B2B & B2C construction commerce platform designed to streamline materials procurement, hire verified service professionals, and manage request for quotes (RFQs). It is built with a React + TypeScript frontend, powered by an Express backend, and implements robust centralized data verification, sanitization, and security rules.

---

## 🏗️ Technical Stack

- **Frontend**: React 19, Vite, TypeScript, TailwindCSS, Vanilla CSS, and modern typographic scaling.
- **Backend**: Node.js, Express, Nodemon, and `ts-node` running locally.
- **Data Persistence**: Local JSON Database Fallback mode (for development and test execution) with support for PostgreSQL.
- **Testing**: Playwright End-to-End test suite.

---

## 🔒 Centralized Validation & Sanitization

ARCUS uses a shared validation library located in [`shared/validation.ts`](file:///d:/Claude%20Code/Arcus/shared/validation.ts) that guarantees data integrity across both the frontend client and the backend server.

Key features include:
1. **Indian Phone Normalization & Validation**:
   - Strips country code prefixes (`+91` or `91`) and leading zeroes.
   - Cleans formatting spaces, hyphens, and parentheses.
   - Validates that the resulting 10-digit number starts with 6, 7, 8, or 9 (per Indian mobile standards).
2. **GSTIN Formats & Verification**:
   - Strictly validates the 15-character Indian Goods and Services Tax Identification Number (GSTIN) structure using standard alphanumeric regex format.
   - Contacts local verification API for live status retrieval (Trade name, state address status, registration active indicator).
3. **Advanced Sanitization & Injection Prevention**:
   - Neutralizes malicious HTML `<script>` tags, custom HTML elements, and active content injection.
   - Implements SQL injection detectors that scrub keywords like `SELECT`, `INSERT`, `UNION`, `DROP`, and conditional comparisons (`1=1`).
4. **Rate Limiting**:
   - Includes custom, state-retaining `RateLimiter` classes to throttle login attempts, OTP dispatches, and registration requests.

---

## ⚙️ Core Workflows

### 1. Account Types & Registration
- **Retail (B2C)**: Access standard catalog, individual checkout, and localized public services.
- **Business (B2B)**: Input corporate GSTIN, perform live verification, unlock tiered bulk pricing, and access the Procurement Dashboard.
- **Professional**: List services (Plumbing, Electrical, Carpentry, etc.), display experience, and upload portfolio details.

### 2. OTP Verification Flow
- Employs a secure 2-step OTP registration:
  - Dispatches verification codes using Resend mock fallback mode.
  - Automatically times out on expiration, ensuring session tokens are only assigned upon complete validation.
  - Includes robust timer cleanup preventing unmount redirect leaks.

### 3. Procurement & Checkout
- Intelligent address auto-fills with suburb-preserving address splitting.
- Conditional billing address section toggles.
- Coupon engine applying role-based discounts (e.g. `ARCUS10` B2B tier, `WELCOME5` Retail tier).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) installed.

### Setup and Running Locally

1. **Install Dependencies**:
   ```bash
   # Root / Frontend
   npm install

   # Backend Server
   cd server
   npm install
   ```

2. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

3. **Start the Frontend Application**:
   ```bash
   # From root directory
   npm run dev
   ```
   *The client runs on `http://localhost:5173`.*

---

## 🧪 Running E2E Tests

The application features a comprehensive suite of Playwright E2E tests validating the registration, login, dashboard management, materials procurement, and checkout flows.

To run the tests:

```bash
# Executing the full test suite
npx playwright test
```

To run specifically the checkout workflow tests:
```bash
npx playwright test tests/checkout.spec.ts
```
