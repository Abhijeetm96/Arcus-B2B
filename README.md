# 🏗️ ARCUS: B2B & B2C Construction Commerce Platform

ARCUS is an enterprise-grade, full-stack construction commerce marketplace and procurement portal designed to streamline materials procurement, professional construction service bookings, and Request for Quote (RFQ) processes. Engineered with a React + TypeScript frontend and a Node.js + Express backend, ARCUS bridges the gap between retail property developers, commercial builders, material suppliers, and independent contractors through specialized, validation-secured user experiences.

---

## 🗺️ Platform Domain Analysis & Core Vision

The construction and building material industry has historically struggled with fragmentation, lack of price transparency, and manual procurement workflows. Builders, contractors, and individual property developers waste significant time coordinating orders across multiple local vendors, verifying GST compliance, managing logistics, and requesting custom quotes for bulk goods. 

ARCUS addresses these challenges by consolidating the entire lifecycle of construction into a single, unified digital marketplace. The platform divides its operational domain into three main pillars:
1. **Supply Chain & Procurement**: Facilitating both direct retail sales (B2C) and bulk commercial transactions (B2B) for essential building materials.
2. **Work Contract Management**: Connecting property owners and builders with verified construction professionals (Plumbers, Electricians, Carpenters, Architects) through rating-based directories and booking workflows.
3. **RFQs & Bids Engine**: Providing a digitized Request for Quote pipeline where builders can post large project specifications and suppliers can dynamically bid on bulk supply orders.

---

## 🏛️ Comprehensive Architecture

ARCUS is organized as a unified, full-stack monorepo featuring a decoupled React frontend application and an Express backend API.

### Directory Structure & File Inventory
- **`shared/`**: Houses the centralized validation engine (`validation.ts`) shared between client-side form controls and server-side request sanitizers to ensure a single source of validation truth.
- **`server/`**: The Express application running on Node.js.
  - `src/index.ts`: Defines the HTTP API endpoints, registers rate-limiting and authorization middleware, and routes business logic.
  - `src/db.ts`: Orchestrates the local data repository utilizing a structured JSON database, modeling entity mutations and seed lists.
  - `data/db.json`: Local database file storing active records.
- **`src/`**: The React SPA compiled with Vite.
  - `src/App.tsx`: Acts as the central router, parsing URL segments from hash changes (`#/route/param`) to mount corresponding views.
  - `src/index.css`: Houses custom design tokens, typographic scales, responsive CSS grids, and HSL-based color definitions.
  - `src/context/`: Contains React Context Providers managing global application states like active user sessions (`AuthContext.tsx`) and cart contents (`CartContext.tsx`).
  - `src/components/`: Modular presentation and interactive layout components.

---

## 📦 Modular Component Inventory

### 💻 Navigation & Main Interface
- **`Navbar.tsx`**: Provides the main header navigation, including responsive mobile drawer menus, dynamic cart counters, account dashboard shortcuts, and triggers for login/registration forms.
- **`Hero.tsx`**: Renders the landing screen visual showcase featuring glassmorphic call-to-action cards, value propositions, and quick category access points.
- **`Categories.tsx`**: Displays the core category landing cards for quick navigation into specific materials and professional directories.
- **`Footer.tsx`**: Contains platform links, corporate compliance statements, and subscription fields.
- **`Trust.tsx`**: Renders trust indicators including SSL security, verified ratings, and commercial partnerships.

### 🧱 Materials Procurement
- **`MaterialsHub.tsx`**: The main materials catalog. Handles hierarchical category routing (Category -> Subcategory -> Leaf Item), active search filtering, and brand indexing.
- **`ProductDetail.tsx`**: Renders detailed pages (PDP) for catalog products. Features image carousels, custom dimension matrices (e.g. CPVC pipe length/thickness schedules), user reviews, and instant cart additions.
- **`BrandsHub.tsx`**: Displays brand-specific product inventories, helping users browse products from recognized suppliers like UltraTech, Ambuja, Jaquar, and Finolex.
- **`BulkOrders.tsx`**: Dedicated page for commercial bulk orders. Features quantity price-break estimators and custom quote requests with automatic dispatch tracking.

### 👷 Services & Contracting
- **`ServicesHub.tsx`**: The main directory of verified construction service providers. Users can filter contractors (Plumbers, Electricians, Carpenters, Architects) by experience, base price, rating, and covered regions, or initiate active bookings.
- **`Services.tsx`**: A quick-landing component highlighting popular local maintenance services and booking schedules.

### 📝 RFQ Management
- **`RfqForm.tsx`**: Allows users to compile detailed RFQs. Captures material lists, required quantity brackets, desired delivery dates, and specific project addresses.

### 💳 Checkout & Order Processing
- **`Checkout.tsx`**: Coordinates the checkout pipeline. Autofills addresses from saved user profiles, parses street details to split them into localized address components, validates inputs, applies role-based promotional coupons (`ARCUS10` vs `WELCOME5`), and processes order submissions.

### 👤 Dashboards
- **`IndividualDashboard`**: Allows B2C buyers to view their order status, compile saved address entries, track maintenance service bookings, and check their loyalty points.
- **`BusinessDashboard`**: Provides B2B buyers with access to active RFQ bids, tax invoices showing GST breakdowns, corporate order histories, and saved project locations.
- **`ProfessionalDashboard`**: Allows independent service contractors to configure their business name, update categories, write bios, upload portfolios, view incoming booking requests, and manage reviews.
- **`AdminDashboard`**: Provides platform administrators with views to review active users, audit tax details, manage vendor statuses, and inspect global order logs.

---

## 💾 Data Modeling & Schema Design

The local repository is structured around entity records stored in a JSON database schema, managed dynamically in `server/src/db.ts`:

### 1. User Record Schema (`User`)
Represents registered accounts on the platform. Depending on the `role`, fields are selectively required or populated:
- `id` (string): Unique identifier.
- `name` (string): Full name of the individual or contact person.
- `email` (string): Unique email address used for login and notifications.
- `phone` (string): Normalized 10-digit mobile number.
- `password` (string): Salted password hash for security.
- `role` (enum): `'Individual' | 'Business' | 'Professional' | 'Admin'`.
- `companyName` (string, optional): Required for Business and Professional accounts.
- `gstNumber` (string, optional): 15-character verified GSTIN for Business accounts.
- `serviceCategory` (string, optional): Specific service trade for Professionals (e.g. Plumbing).
- `experience` (string/number, optional): Years of practice for Professionals.
- `city` / `state` (string, optional): Location details.
- `savedAddresses` (array, optional): List of saved shipping addresses for B2C/B2B accounts.
- `isVerified` (boolean): Flag indicating if the account email has been verified via OTP.

### 2. OTP Record Schema (`Otp`)
Manages the temporary codes generated during login or registration verification:
- `id` (string): Unique identifier.
- `userId` (string): Links to the target user account.
- `code` (string): 6-digit verification code.
- `attempts` (number): Tracks failed verification entries to enforce rate limit protection.
- `createdAt` (number): Unix timestamp representing generation time.
- `expiresAt` (number): Expiration threshold (defaults to 5 minutes after creation).

### 3. Product Catalog Schema (`Product`)
Defines the inventory items listed in the Materials Hub:
- `id` (string): Unique catalog slug (e.g. `ambuja-cement-opc-53`).
- `name` (string): Full product label.
- `category` / `subcategory` / `leaf` (string): Navigation tags.
- `price` (number): Base price per unit (INR).
- `b2bPrice` (number, optional): Discounted tier price for business customers.
- `image` (string): Path to product graphic.
- `specifications` (object): Key-value pairs of technical parameters (compressive strength, dimensions, material grade).
- `brand` (string): Product manufacturer brand.

### 4. RFQ Schema (`RFQ`)
Represents bulk procurement requests posted by builders:
- `id` (string): Unique identifier.
- `userId` (string): ID of the creator.
- `name` (string): Contact name.
- `phone` (string): Contact mobile.
- `category` (string): Material category (e.g., Cement).
- `quantity` (number): Quantity requested.
- `location` (string): Delivery destination address.
- `timeline` (string): Expected delivery duration.
- `details` (string): Specific requirements or notes.
- `timestamp` (string): Unix timestamp of submission.

---

## 🛡️ Centralized Validation & Sanitization Engine

The validation engine resides in [`shared/validation.ts`](file:///d:/Claude%20Code/Arcus/shared/validation.ts) and is designed to validate inputs before they enter the application logic or persist in the database.

### Regex Patterns & Rules
- **Email Validation**: 
  ```typescript
  export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  ```
  Enforces standard RFC-compliant format, restricting length to 254 characters to avoid buffer exhaustion.
- **Indian Phone Numbers**:
  ```typescript
  export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
  ```
  Indian mobile numbers must be exactly 10 digits and start with numbers between 6 and 9.
- **GSTIN (Goods and Services Tax IN)**:
  ```typescript
  export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  ```
  Matches the official format: 2 digits for state code, 5 capital letters for PAN profile, 4 digits, 1 uppercase character, 1 alphanumeric character, the fixed letter 'Z', and 1 alphanumeric character.
- **Indian PIN Codes (Zip)**:
  ```typescript
  export const PIN_CODE_REGEX = /^[1-9]\d{5}$/;
  ```
  Must be exactly 6 digits, where the leading digit cannot be 0.
- **Password Strength Rules**:
  Enforces a length of at least 8 characters, requiring at least one lowercase letter, one uppercase letter, and one numeric character.

### Normalization Logic
Normalization prepares inputs into a standard form to ensure uniform database queries:
- **Phone Normalization**:
  The `normalizePhone(input)` function removes all non-numeric characters (hyphens, spaces, parenthesis, periods). It then strips the Indian country code `+91` or `91` (if the input length exceeds 10 digits) and deletes leading zeroes.
- **GSTIN Normalization**:
  Strips white spaces and converts characters to uppercase.
- **Email Normalization**:
  Trims spacing and converts the address to lowercase.

### Security Scrubbing (Sanitization)
To prevent Cross-Site Scripting (XSS) and SQL Injection (SQLi), inputs are passed through `sanitizeText(input)`:
1. **XSS Protection**: Uses regex to strip all HTML `<script>` tags, closing tags, and inline tag event handlers.
2. **SQL Injection Protection**: Targets dangerous keywords (e.g. `SELECT`, `INSERT`, `DROP`, `UNION`, `ALTER`, `TRUNCATE`) that are followed by spaces, and removes comment markers (`--`, `/*`, `*/`) and conditional equations (like `OR 1=1`).

---

## 📈 Interactive Workflows & User Journeys

### 1. The B2C Retail Journey
```
[Registration Form] ➔ [Normalize Phone/Email] ➔ [Create User (unverified)] ➔ [Send OTP]
                                                                          │
[Individual Dashboard] 💳 🔀 [Verify OTP (6-digits)] ➔ [Session Token] 🎛️ ┘
```
1. **Registration**: The user fills in their name, normalized phone number, email, password, and location in the registration panel.
2. **Email Verification**: Upon submission, the API registers the user in an unverified state, generates a 6-digit OTP code, and logs it to the server console. The frontend redirects the user to the OTP verification screen.
3. **Login & Session**: Entering the correct OTP logs the user in, stores their authentication token, and redirects them to their profile page.
4. **Checkout**: The user adds products to their cart from the Materials Hub. During checkout, they fill in shipping address fields and apply the retail coupon code `WELCOME5` to get a 5% discount.

### 2. The B2B Commercial Builder Journey
```
[Input GSTIN] ➔ [Click Verify] ➔ [API Status Hook] ➔ [Auto-populate Details]
                                                             │
[Verify OTP] ➔ [Dashboard Activated] ➔ [Bulk Materials Hub] ➔┘
```
1. **GST Verification**: During registration, the builder enters their 15-character GSTIN. Clicking "Verify GST" sends an API request to retrieve the legal trading name, verified office address, and registration status.
2. **Auto-population**: The verified details are autofills into the form fields. The builder then fills in their personal contact details and password.
3. **Activation**: Entering the OTP verifies the account, and the builder is redirected to the Business Dashboard.
4. **B2B Procurement**: The builder can browse B2B pricing tiers, submit RFQs, and request bulk shipping quotes.

### 3. The Service Contractor Journey
1. **Profile Setup**: Independent professionals register by providing their category (Plumbing, Electrical, Interior Design), years of experience, business name, and optional website/portfolio links.
2. **Lead Routing**: Once registered, their profiles appear in the Services Hub search results.
3. **Leads Management**: The professional can log into their dashboard to view incoming job bookings, check rating logs left by customers, and update their portfolio descriptions.

### 4. Advanced Checkout Mechanics
- **Address Parsing & Splitting**: When selecting a saved address from their profile, a parser splits the single string into fields:
  - `addressLine1` (street and building details, retaining suburb names like "Whitefield" or "HSR Layout")
  - `city`
  - `state`
  - `zipCode`
- **Billing Address Toggle**: A checkbox determines if the shipping address matches the billing address. Unchecking it displays a separate billing address form that features saved address selection and splitting rules.
- **Coupons Engine**: Validates code compliance against user roles. `ARCUS10` provides a 10% discount on B2B orders with a valid GSTIN, while `WELCOME5` is applied to individual retail accounts.

---

## ⚙️ Deployment & Running Locally

### Backend Server Setup (Node.js/Express)
1. **Navigate to the server directory**:
   ```bash
   cd server
   ```
2. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```ini
   PORT=5000
   NODE_ENV=development
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   - The server will start on `http://localhost:5000`.
   - In development, verification emails are mocked, and OTP codes are output directly to the server terminal.

### Frontend Application Setup (Vite/React)
1. **Navigate to the root directory**:
   ```bash
   cd ..
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
   - The React client will start on `http://localhost:5173`.
   - Custom configurations in `vite.config.ts` proxy API calls to the Express server.

---

## 🛠️ Automated Background Synchronization

To keep your local workspace synchronized with Git, a background automation script has been integrated:
- **`scripts/git-autocommit.cjs`**: A Node script that checks for local modifications, stages changed files, creates a time-stamped commit, and pushes the changes to your active branch.
- **`scripts/setup-scheduler.ps1`**: A PowerShell script that registers a task in Windows Task Scheduler to run the autocommit script silently in the background every 30 minutes.

To register this task:
1. Open PowerShell with **Administrator privileges**.
2. Run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\setup-scheduler.ps1
   ```
