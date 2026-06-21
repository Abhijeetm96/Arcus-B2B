# 🔒 ARCUS Validation & Sanitization Specifications

All inputs must comply with validation and sanitization policies in [`shared/validation.ts`](file:///d:/Claude%20Code/Arcus/shared/validation.ts).

## 🛡️ Field Validation Rules

| Field | Rule Specification | Action on Match |
|---|---|---|
| **Email** | RFC-compliant structure, max 254 characters | Validation success |
| **Phone** | Exactly 10 digits starting with [6-9] | Normalization & Success |
| **GSTIN** | 15-character official Indian Tax Identifier format | Live profile lookup |
| **PIN Code** | 6-digit Indian postal code, first digit [1-9] | Validation success |
| **Password** | Min 8 chars, 1 uppercase, 1 lowercase, 1 number | Security check success |

---

## 🧼 Normalization Logic

- **Phone Normalization**:
  Strips country codes (`+91`, `91`) and leading zeroes.
- **GSTIN Normalization**:
  Removes spaces and converts letters to uppercase.
- **Email Normalization**:
  Trims spacing and converts to lowercase.
