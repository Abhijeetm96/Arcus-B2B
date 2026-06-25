# Chapter 11: Authentication, Authorization & Permissions

---
◀️ **[Previous](RELEASE_CHECKLIST.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](PERFORMANCE.md)** ▶️
---


ARCUS uses a 2-step verification flow: registrations trigger a 6-digit OTP code to verify emails before activating accounts.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Vite SPA Client
    participant Backend as Express API Server
    participant DB as Postgres Database

    User->>Frontend: Fill out signup form (checks email & phone format)
    Note over User,Frontend: Business: inputs GSTIN (verified on frontend first)
    Frontend->>Backend: POST /api/auth/register (payload data)
    Backend->>Backend: Runs sanitization & checks for existing email/phone
    Backend->>DB: Save user (is_verified = false, is_active = false)
    Backend->>Backend: Generate cryptographically random 6-digit OTP code
    Backend->>DB: Save OTP record (expires in 5 minutes)
    Backend-->>User: Console logs/sends OTP mock (bypass code: 123456 in dev)
    
    User->>Frontend: Enter OTP code in verification screen
    Frontend->>Backend: POST /api/auth/verify-email-otp (email, otp)
    Backend->>DB: Fetch OTP & check expiration
    alt Code matches and not expired
        Backend->>DB: Set users.is_active = true, users.email_verified = true
        Backend->>DB: Delete OTP record
        Backend->>Backend: Generate JWT token signed with JWT_SECRET
        Backend-->>Frontend: Return JWT Session Token & User Profile
        Frontend->>Frontend: Save JWT in localStorage & set AuthContext user state
        Frontend->>Frontend: PortalResolver routes user to portal dashboard
        Frontend-->>User: Load dashboard home page
    else Invalid or expired code
        Backend-->>Frontend: Return 400 Bad Request (Invalid OTP)
        Frontend-->>User: Show OTP error message
    end
```

### Authorization & Permissions Scope Matrix

Authorized endpoints are protected by `verifyToken` middleware, while admin routes are protected by role-based scope checks (`adminAuthMiddleware`).

| Operational Action | Super Admin | Operations Manager | Inventory Manager | Sales Manager | Customer Support |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manage Admins & Roles** | 🟢 Yes | 🔴 No | 🔴 No | 🔴 No | 🔴 No |
| **Edit Global App Config** | 🟢 Yes | 🟢 Yes | 🔴 No | 🔴 No | 🔴 No |
| **Manage Customer Accounts** | 🟢 Yes | 🟢 Yes | 🔴 No | 🟢 Yes | 🔴 No |
| **Manage Product Catalog** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🔴 No | 🔴 No |
| **Edit Inventory Levels** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🔴 No | 🔴 No |
| **View Inventory Levels** | 🟢 Yes | 🟢 Yes | 🟢 Yes | 🔴 No | 🟢 Yes |
| **Approve RFQs & Draft Quotes**| 🟢 Yes | 🟢 Yes | 🔴 No | 🟢 Yes | 🟢 Yes |
| **View Revenue Reports** | 🟢 Yes | 🟢 Yes | 🔴 No | 🟢 Yes | 🔴 No |
| **View Audit Logs & Adjustments**| 🟢 Yes | 🔴 No | 🔴 No | 🔴 No | 🔴 No |

* **User Roles**:
  * `Individual`: B2C buyers. Accesses the Individual Dashboard. Uses retail pricing.
  * `Business`: B2B buyers. Accesses the Business Dashboard. Eligible for Net-30 credit terms, project tracking, tax billing, and bulk pricing.
  * `Professional`: Subcontractors and contractors. Accesses the Professional Dashboard to review visit bookings.

---


## 11.3. Complete Access Permission Matrix

| Feature Module / Actions | Guest | Individual User | Business User (B2B) | Verified Professional | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Authentication & Profile Setup** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Browse Product Catalog** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Product Detail PDP View** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Materials Checkout & Pay** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Create B2B RFQ** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **View RFQ Specifications** | ❌ | ❌ | ✅ (Own) | ❌ | ✅ (All) |
| **Submit Quotation / Pricing** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Approve/Reject Quotation** | ❌ | ❌ | ✅ (Own) | ❌ | ✅ (All) |
| **Quotation Negotiation** | ❌ | ❌ | ✅ (Own) | ❌ | ✅ (All) |
| **Create Project Logs** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Book Services / Professionals** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Manage Professional Listings** | ❌ | ❌ | ❌ | ✅ (Own) | ✅ (All) |
| **Admin Command Center** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **KPI Analytics Dashboard** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View System Audit Logs** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Admin Settings Management** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Role & Scope Management** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Catalog Template Export** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Catalog Template Import** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Search Telemetry Analytics** | ❌ | ❌ | ❌ | ❌ | ✅ |


---

---

## 🛡️ CENTRALIZED SANITIZATION & LIMITING (from docs/security.md)
* **XSS Scrubber**: Centralized input sanitization automatically removes script tags, style sheets, and HTML event handlers.
* **SQLi Filter**: Filters block common sql commands (e.g. `UNION`, `SELECT`, `DROP`).
* **Rate Limiters**: Defend login (5/15 mins), registration (5/10 mins), profile updates (10/hr), and OTP dispatch (3/5 mins).


---
◀️ **[Previous](RELEASE_CHECKLIST.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](PERFORMANCE.md)** ▶️
