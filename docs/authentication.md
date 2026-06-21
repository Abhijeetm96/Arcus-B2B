# 🔑 ARCUS Authentication Specification

ARCUS uses a secure 2-step registration and login verification model.

## 🔄 Auth Flow Mechanics

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB
    User->>Frontend: Fill out Registration Form
    Frontend->>Backend: POST /api/auth/register
    Backend->>DB: Save unverified user
    Backend->>Backend: Generate 6-digit OTP code
    Backend-->>Frontend: Display verification panel (Mock OTP printed)
    User->>Frontend: Enter OTP Code
    Frontend->>Backend: POST /api/auth/verify-email-otp
    Backend->>DB: Set isVerified: true
    Backend-->>Frontend: Return JWT Session Token
    Frontend-->>User: Load dashboard & save token
```

---

## 🧹 Redirect Race Condition Cleanup

To prevent redirects from interrupting subsequent pages (e.g. checkout), a `useRef` timer reference is integrated inside [`src/components/AuthPage.tsx`](file:///d:/Claude%20Code/Arcus/src/components/AuthPage.tsx):
- **Ref hook**: `const redirectTimerRef = useRef(...)`
- **Effect hook**: Clears the active timeout when `AuthPage` unmounts.
- **Redirection**: Clears previous timers before scheduling a new role-based redirection.
