# 🏗️ ARCUS: B2B & B2C Construction Commerce Platform

ARCUS is an enterprise-grade, full-stack construction commerce marketplace and procurement portal designed to streamline building materials procurement, professional construction service bookings, and Request for Quote (RFQ) processes. Engineered with a React 19 + TypeScript + Vite frontend and a Node.js + Express backend, ARCUS bridges the gap between retail property developers, commercial builders, material suppliers, and independent contractors through specialized, validation-secured user experiences.

---

## 🗺️ Platform Domain Analysis & Core Vision

The construction and building material industry has historically struggled with fragmentation, lack of price transparency, and manual procurement workflows. Builders, contractors, and individual property developers waste significant time coordinating orders across multiple local vendors, verifying GST compliance, managing logistics, and requesting custom quotes for bulk goods. 

ARCUS addresses these challenges by consolidating the entire lifecycle of construction into a single, unified digital marketplace. The platform divides its operational domain into three main pillars:
1. **Supply Chain & Procurement**: Facilitating both direct retail sales (B2C) and bulk commercial transactions (B2B) for essential building materials.
2. **Work Contract Management**: Connecting property owners and builders with verified construction professionals (Plumbers, Electricians, Carpenters, Painters, Architects) through rating-based directories and booking workflows.
3. **RFQs & Bids Engine**: Providing a digitized Request for Quote pipeline where builders can post large project specifications and suppliers can dynamically bid on bulk supply orders.

---

## 🏛️ Comprehensive Architecture

ARCUS is organized as a unified, full-stack monorepo featuring a decoupled React frontend application and an Express backend API.

### File and Directory Inventory
- **`shared/`**: Houses the centralized validation engine (`validation.ts`) shared between client-side form controls and server-side request sanitizers to ensure a single source of validation truth.
- **`server/`**: The Express application running on Node.js.
  - `src/index.ts`: Defines the HTTP API endpoints, registers rate-limiting and authorization middleware, and routes business logic.
  - `src/db.ts`: Orchestrates the local data repository utilizing a structured JSON database, modeling entity mutations and seed lists.
  - `data/db.json`: Local database file storing active records.
  - `nodemon.json`: Nodemon file-watcher configuration to ignore specific data updates and prevent restart loops.
- **`src/`**: The React SPA compiled with Vite.
  - `src/App.tsx`: Central routing engine that parses URL segments from hash changes to mount corresponding views.
  - `src/index.css`: Custom design tokens, typographic scales, responsive CSS grids, and HSL-based color definitions.
  - `src/context/`: Context Providers managing global states like sessions (`AuthContext.tsx`) and cart contents (`CartContext.tsx`).
  - `src/components/`: Modular presentation and interactive layout components.

---

## 🎛️ Routing and State Management Architecture

### Frontend Navigation Engine (`App.tsx`)
The React application avoids external routing dependencies by using a custom hash-based router in `src/App.tsx`. 
- **Hash Detection**: A `useEffect` hook listens to `hashchange` events on the `window` object and updates the `currentHash` state.
- **Segment Parsing**: The path string is stripped of leading hashes and split into segment arrays using `/`.
  ```typescript
  const cleanHash = currentHash.replace(/^#\/?/, '').split('?')[0];
  const segments = cleanHash.split('/');
  ```
- **State Propagation**: The array segments (e.g., `segments[0]`, `segments[1]`) are mapped directly to props passed to sub-hubs. For example, `#//materials/cement/opc/53-grade` resolves into:
  - `segments[0]` = `'materials'`
  - `segments[1]` = `'cement'`
  - `segments[2]` = `'opc'`
  - `segments[3]` = `'53-grade'`
  This structure allows deep-nested routing for material categories and maintenance trades.

### Application State Contexts (`src/context/`)

#### 1. Authentication State (`AuthContext.tsx`)
Manages the user login state, registration requests, verification steps, and profile cache:
- **`user` State**: Null or the authenticated `User` object.
- **`login(email, password)`**: Post credentials to the `/api/auth/login` endpoint. If successful, stores the JSON Web Token in `localStorage` under `arcus_token` and calls `refreshUser()`.
- **`register(userData)`**: Sends details to `/api/auth/register`. If verification is required, returns user data to initiate the OTP flow.
- **`logout()`**: Clears the token from storage, sets `user` to null, and redirects the browser to the home page (`#/`).
- **`refreshUser()`**: Retrieves user details from `/api/auth/me` using the stored bearer token to update profile parameters.

#### 2. Cart State (`CartContext.tsx`)
Manages shopping cart operations:
- **`cartItems` State**: Array of active products containing item information, chosen quantities, and unit price schedules.
- **`addToCart(product, quantity)`**: Appends a product to the cart. If the product already exists, it updates the quantity while verifying stock limits.
- **`removeFromCart(productId)`**: Discards an item from the active cart.
- **`updateQuantity(productId, quantity)`**: Updates the quantity of a product in the cart.
- **`clearCart()`**: Flushes the cart state (typically called on checkout completion).

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

## 🔒 Centralized Validation & Sanitization Engine

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
- **GSTIN (Goods and Services Tax ID)**:
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
  ```typescript
  export function normalizePhone(input: string): string {
    if (!input || typeof input !== 'string') return '';
    let digits = input.replace(/[\s\-\(\)\.]/g, '');
    if (digits.startsWith('+91')) digits = digits.slice(3);
    else if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
    if (digits.startsWith('0') && digits.length > 10) digits = digits.slice(1);
    return digits;
  }
  ```
- **GSTIN Normalization**:
  Strips white spaces and converts characters to uppercase.
- **Email Normalization**:
  Trims spacing and converts the address to lowercase.

### Security Scrubbing (Sanitization)
To prevent Cross-Site Scripting (XSS) and SQL Injection (SQLi), inputs are passed through `sanitizeText(input)`:
1. **XSS Protection**: Uses regex to strip all HTML `<script>` tags, closing tags, and inline tag event handlers.
2. **SQL Injection Protection**: Targets dangerous keywords (e.g. `SELECT`, `INSERT`, `DROP`, `UNION`, `ALTER`, `TRUNCATE`) that are followed by spaces, and removes comment markers (`--`, `/*`, `*/`) and conditional equations (like `OR 1=1`).

---

## 📡 Complete REST API Documentation

The Express server exposes the following endpoints, registered in `server/src/index.ts`:

### 🔐 Authentication Endpoints

#### `POST /api/auth/register`
Creates a new user account (unverified by default).
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+91 98765 43210",
    "password": "Password123",
    "role": "Individual",
    "city": "Bengaluru",
    "state": "Karnataka",
    "companyName": "Optional",
    "gstNumber": "Optional"
  }
  ```
- **Process**:
  1. Validates inputs against standard constraints.
  2. Normalizes phone (`9876543210`) and email (`jane@example.com`).
  3. Checks for existing users with the same email, phone, or GST number.
  4. Hashes the password and adds the user record to the database with `isVerified: false`.
  5. Generates a 6-digit OTP code, saves it to the database, and prints it to the console.
- **Responses**:
  - `201 Created`: `{ "message": "Verification code dispatched.", "email": "jane@example.com" }`
  - `400 Bad Request`: `{ "error": "Email is already registered." }`

#### `POST /api/auth/verify-email-otp`
Verifies the user's email address using the 6-digit code.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "otp": "123456"
  }
  ```
- **Process**:
  1. Locates the unverified user and their active OTP record.
  2. Increments failed attempts counter if the code is invalid. If attempts exceed 3, it deletes the OTP and returns an error.
  3. If the code matches and is not expired, it sets `isVerified: true` on the user record.
  4. Deletes the used OTP record.
  5. Generates a JSON Web Token (JWT) signed with the server secret.
- **Responses**:
  - `200 OK`: `{ "token": "jwt_token_here", "user": { "id": "uuid", "name": "Jane Doe", "role": "Individual" } }`
  - `400 Bad Request`: `{ "error": "Invalid or expired verification code." }`

#### `POST /api/auth/resend-email-otp`
Generates and sends a new verification code.
- **Request Body**: `{ "email": "jane@example.com" }`
- **Responses**:
  - `200 OK`: `{ "message": "A new verification code has been dispatched." }`
  - `400 Bad Request`: `{ "error": "Account is already verified or not found." }`

#### `POST /api/auth/login`
Authenticates user credentials.
- **Request Body**: `{ "email": "jane@example.com", "password": "Password123" }`
- **Responses**:
  - `200 OK`: `{ "token": "jwt_token_here", "user": { "id": "uuid", ... } }`
  - `400 Bad Request`: `{ "error": "email_not_verified", "email": "jane@example.com" }` (if email is not verified yet)
  - `401 Unauthorized`: `{ "error": "Invalid credentials." }`

#### `GET /api/auth/me`
Retrieves the authenticated user's profile.
- **Headers**: `Authorization: Bearer <token>`
- **Responses**:
  - `200 OK`: `{ "id": "uuid", "name": "Jane Doe", ... }`
  - `401 Unauthorized`: `{ "error": "Unauthorized" }`

---

### 🏢 Business Verification Endpoints

#### `GET /api/auth/verify-gst/:gstin`
Validates a GST number and returns verified registration details.
- **URL Parameter**: `gstin` (normalized to uppercase)
- **Process**:
  1. Validates the GSTIN structure.
  2. Runs a request against a mock registry or returns a mock response with details:
     - State code mapping (e.g. `29` -> `Karnataka`).
     - Business name (Legal and trade name).
     - Full registered address.
     - Taxpayer type and status (`Active`).
- **Responses**:
  - `200 OK`:
    ```json
    {
      "gstNumber": "29CFJPR5489A1ZY",
      "legalName": "Arcus Infra Projects Ltd",
      "tradeName": "Arcus Construction",
      "status": "Active",
      "state": "Karnataka",
      "address": "402, Shantiniketan, Whitefield, Bengaluru, 560048"
    }
    ```
  - `400 Bad Request`: `{ "error": "Invalid GSTIN format." }`
  - `404 Not Found`: `{ "error": "GSTIN not found in registry." }`

---

### 📦 Materials Catalog Endpoints

#### `GET /api/products`
Retrieves all items in the product catalog.
- **Query Parameters**: `category` (optional), `brand` (optional), `search` (optional)
- **Responses**: `200 OK`: `[ { "id": "ambuja-cement", "name": "Ambuja Cement", ... } ]`

#### `GET /api/products/:id`
Retrieves details for a specific product.
- **URL Parameter**: `id` (product slug)
- **Responses**:
  - `200 OK`: `{ "id": "ambuja-cement", "price": 450, ... }`
  - `404 Not Found`: `{ "error": "Product not found." }`

---

### 💳 Order Processing Endpoints

#### `POST /api/orders`
Creates a new order from the checkout details.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "items": [ { "productId": "ambuja-cement", "qty": 10 } ],
    "shippingAddress": "123 Test Street, Bengaluru, Karnataka - 560001",
    "billingAddress": "123 Test Street, Bengaluru, Karnataka - 560001",
    "paymentMethod": "UPI",
    "gstNumber": "29CFJPR5489A1ZY"
  }
  ```
- **Responses**:
  - `201 Created`: `{ "message": "Order created successfully.", "orderId": "order_uuid" }`
  - `400 Bad Request`: `{ "error": "Validation errors." }`

---

## 📂 Detailed Front-End Component Layout & Logic

This section outlines the internal state, props interfaces, and event handlers for the key React components.

### 1. `Navbar.tsx`
- **Responsibility**: Displays main navigation controls, cart indicator drawer, and responsive trigger actions.
- **State Properties**:
  - `isMobileMenuOpen` (boolean): Controls mobile overlay drawer.
  - `isCartOpen` (boolean): Toggles the slide-out cart sidebar.
  - `searchQuery` (string): Handles dynamic search queries.
- **Sub-layouts**:
  - **Slide-out Cart Panel**: Maps over `cartItems` from `useCart()`, displaying quantities, pricing totals, and a checkout button.

### 2. `Hero.tsx`
- **Responsibility**: Brand presentation header.
- **Features**:
  - Renders rotating banners highlighting materials catalog and verified contractors.
  - Includes trust metrics (e.g. active products, cover cities, delivery count) with pulsing micro-animations.

### 3. `MaterialsHub.tsx`
- **Responsibility**: Serves as the dynamic product search browser.
- **Inputs**: `categorySlug`, `subcategorySlug`, `leafSlug` parsed from URL path segments.
- **State Properties**:
  - `selectedFilters` (object): Tracks chosen parameters (e.g., Brand, Grade).
  - `searchVal` (string): Tracks user query before debouncing.
  - `priceRange` (array): Minimum and maximum price filters.
- **Key Methods**:
  - Resolves path segments dynamically: If `categorySlug` is present, filters inventory to show matching products. If `leafSlug` is provided, displays options for CPVC dimensions.

### 4. `ProductDetail.tsx`
- **Responsibility**: Renders product information.
- **State Properties**:
  - `selectedSpec` (string): Chosen variant specification (e.g., 3-meter CPVC pipe vs 6-meter).
  - `qty` (number): Chosen quantity (validated using `validateQuantity`).
  - `activeTab` (string): Toggle between 'Overview', 'Specifications', and 'Reviews'.
  - `reviewText` (string): Submission field for customer reviews.
- **Process**:
  - Fetches product data using product ID from `/api/products/:id`.
  - Calculates tier price breaks for B2B users.

### 5. `ServicesHub.tsx`
- **Responsibility**: Contractor search interface.
- **State Properties**:
  - `category` (string): Filter trade category (Plumbing, Electrical, Carpentry).
  - `experienceFilter` (number): Minimum experience threshold.
  - `budgetFilter` (string): Budget bracket ('Low' | 'Medium' | 'High').
  - `showBookingModal` (boolean): Toggles the booking trigger form.
  - `bookingForm` (object): Form inputs for booking dates, descriptions, and contacts.
- **Process**:
  - Queries local providers directory matching categories. Renders top-rated partner badges, rating scores, starting prices, and booking forms.

### 6. `Checkout.tsx`
- **Responsibility**: Coordinates address validation, billing toggles, discount calculations, and order creation.
- **State Properties**:
  - `shippingAddress1`, `shippingCity`, `shippingState`, `shippingZipCode` (strings): Shipping details.
  - `billingSameAsShipping` (boolean): Controls billing forms visibility.
  - `billingAddress1`, `billingCity`, `billingState`, `billingZipCode` (strings): Billing details.
  - `couponCode` (string): Applied code.
  - `couponError` / `couponSuccess` (strings): Status text.
- **Key Methods**:
  - **Address Splitting**: When selecting a saved address (e.g., `"Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048"`), splits the string by comma and hyphen, and maps the components to inputs while preserving suburb names.
  - **Coupon Application**: Evaluates input code against user roles. B2B accounts are allowed to apply `ARCUS10` (10% discount), and B2C accounts can apply `WELCOME5` (5% discount).

### 7. `Dashboards.tsx`
- **Responsibility**: Central container for user dashboards.
- **Inner Sub-Tabs**:
  - **Overview**: Displays profile summaries, recent order details, and active RFQ cards.
  - **Orders**: Lists past orders. Clicking an order displays item breakdowns, shipping and billing addresses, and payment methods.
  - **RFQs**: Enables posting and monitoring RFQ lists. Shows received supplier quotes and provides a bidding simulator.
  - **Settings**: Manage profile properties. Contains forms to add, edit, or delete shipping address books, or update emails and phones using OTP dispatches.

### 8. `RfqForm.tsx`
- **Responsibility**: Renders the RFQ creation layout.
- **Form Fields**:
  - `name` (string): Contact name.
  - `phone` (string): Contact mobile.
  - `quantity` (number): Quantity required.
  - `location` (string): Delivery destination address.
  - `details` (string): Technical specifications.
- **Process**:
  - Validates fields using `validateRfqForm`.
  - Dispatches creation requests to `/api/orders` or `/api/rfqs` on submit.

### 9. `BulkOrders.tsx`
- **Responsibility**: Handles bulk commercial orders.
- **Features**:
  - Displays tiered price discount tables for bulk quantity thresholds.
  - Generates RFQ logs for bulk order requests.

### 10. `Projects.tsx`
- **Responsibility**: Project coordination dashboard.
- **Features**:
  - Tracks construction schedules, phases (e.g., Excavation, Foundation, Brickwork), and timelines.
  - Displays material requirement checklists for each project phase.

### 11. `Resources.tsx`
- **Responsibility**: Interactive building calculators.
- **Features**:
  - **Cement Calculator**: Evaluates required cement bags, sand volume, and gravel volume based on area (sq. ft.) and slab thickness (inches) using the volumetric concrete ratio formula.
  - **Steel Weight Calculator**: Calculates reinforcement bar weights (kg) using the diameter (mm) and length (meters) formula:
    $$\text{Weight} = \frac{D^2}{162} \times L$$

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
   - **Nodemon Reset Loop Fix**: Ignored `server/data/db.json` updates in `server/nodemon.json` to prevent backend server restarts mid-registration.

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
