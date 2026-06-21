# 💾 ARCUS Database Schema Specification

ARCUS utilizes a structured JSON database in development and test environments, modeling entities that map to relational databases like PostgreSQL.

## 🗃️ Entity Models

### 1. `User` Schema
Tracks user registration, authorization credentials, and profile cache details.
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'Individual' | 'Business' | 'Professional' | 'Admin';
  isVerified: boolean;
  companyName?: string;
  gstNumber?: string;
  serviceCategory?: string;
  experience?: string | number;
  city?: string;
  state?: string;
  savedAddresses?: string[];
  loyaltyPoints?: number;
}
```

### 2. `Otp` Schema
Manages active verification codes and verification attempts.
```typescript
interface Otp {
  id: string;
  userId: string;
  code: string;
  attempts: number;
  createdAt: number;
  expiresAt: number;
}
```

### 3. `Product` Schema
Models material catalog listings.
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  leaf: string;
  price: number;
  b2bPrice?: number;
  image: string;
  brand: string;
  specifications: Record<string, string | number>;
}
```

### 4. `RFQ` Schema
Models Request for Quote specifications.
```typescript
interface RFQ {
  id: string;
  userId: string;
  name: string;
  phone: string;
  category: string;
  quantity: number;
  location: string;
  timeline: string;
  details?: string;
  timestamp: string;
}
```
