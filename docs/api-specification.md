# 📡 ARCUS REST API Specification

The Express backend exposes the following API routes for authentication, business checks, materials, services, and orders.

## 🔑 Authentication

### Register Account
- **Endpoint**: `POST /api/auth/register`
- **Payload**:
  ```json
  {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+91 99999 88888",
    "password": "Password123",
    "role": "Individual",
    "city": "CityName",
    "state": "StateName"
  }
  ```
- **Responses**:
  - `201 Created`: Verification code dispatched.
  - `400 Bad Request`: Email/Phone already registered.

### Verify OTP Code
- **Endpoint**: `POST /api/auth/verify-email-otp`
- **Payload**:
  ```json
  {
    "email": "email@example.com",
    "otp": "123456"
  }
  ```
- **Responses**:
  - `200 OK`: JWT token and user profile returned.
  - `400 Bad Request`: Invalid or expired OTP.

---

## 🏢 Business Checks

### Verify GST Number
- **Endpoint**: `GET /api/auth/verify-gst/:gstin`
- **Responses**:
  - `200 OK`: Trade name, state, and address of the verified entity.
  - `400 Bad Request`: Invalid GSTIN format.
  - `404 Not Found`: GSTIN not registered.

---

## 📦 Materials Hub

### Get Products
- **Endpoint**: `GET /api/products`
- **Params**: `category` (optional), `search` (optional)
- **Responses**:
  - `200 OK`: List of matching materials.

### Get Product Details
- **Endpoint**: `GET /api/products/:id`
- **Responses**:
  - `200 OK`: Detail object of a specific product.
  - `404 Not Found`: Product not found.
