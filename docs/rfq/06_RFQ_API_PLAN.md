# 06_RFQ_API_PLAN — RFQ Suite API Design Specification

## Document Metadata
* **Title**: ARCUS RFQ API Specification
* **Purpose**: RESTful API design blueprints, request/response payloads, validation rules, and error envelopes for Module 1.
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Lead Backend Architect / API Designer
* **Related Documents**:
  - [03_RFQ_DATA_MODEL.md](file:///d:/Claude%20Code/Arcus/docs/rfq/03_RFQ_DATA_MODEL.md)
  - [05_RFQ_PERMISSIONS.md](file:///d:/Claude%20Code/Arcus/docs/rfq/05_RFQ_PERMISSIONS.md)
* **Estimated Reading Time**: 12 minutes

---

## 1. Global API Standards

* **Versioning**: Prefix all routes with `/api/v1` (e.g. `/api/v1/rfqs`).
* **Format**: All payloads and response bodies utilize standard JSON formats.
* **Authentication**: Requires JWT bearer headers (`Authorization: Bearer <token>`).
* **Pagination**: List endpoints support query parameters `page` (default `1`), `limit` (default `10`), and return standard pagination metadata.

---

## 2. API Endpoints Catalog

### A. POST `/api/v1/rfqs`
Creates a new Request For Quote.
* **RBAC Role**: Business / Professional.
* **Request Payload**:
  ```json
  {
    "title": "Astral site CPVC piping requirement",
    "type": "Detailed",
    "description": "Requisition for Block A apartments",
    "delivery_address": "Astral Site, Sector 62, Noida, UP",
    "delivery_timeline": "2026-07-15",
    "items": [
      {
        "product_id": "8a719c2f-e8b8-4d51-8d26-ff0614cc10b1",
        "quantity": 150,
        "unit_of_measure": "Piece",
        "target_price": 420.00
      },
      {
        "custom_product_name": "Special CPVC Joint Adapter 1.5 inch",
        "quantity": 50,
        "unit_of_measure": "Piece",
        "target_price": 85.00
      }
    ]
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e6a27d2c-882d-411a-8bb7-f273b4009bb3",
      "rfq_number": "RFQ-2026-0001",
      "status": "Submitted",
      "created_at": "2026-06-26T02:44:00Z"
    }
  }
  ```

### B. GET `/api/v1/rfqs`
Retrieves a paginated list of RFQs.
* **RBAC Role**: Business (own list) / Sales & Operations (all lists).
* **Query Parameters**:
  - `page`: Page index (default: `1`)
  - `limit`: Rows limit (default: `10`)
  - `status`: Filter by state (e.g. `Submitted`, `UnderReview`)
  - `search`: Full-text search string
  - `sort_by`: Field sort parameter (default: `created_at`)
  - `sort_order`: `asc` or `desc` (default: `desc`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e6a27d2c-882d-411a-8bb7-f273b4009bb3",
        "rfq_number": "RFQ-2026-0001",
        "title": "Astral site CPVC piping requirement",
        "status": "Submitted",
        "created_at": "2026-06-26T02:44:00Z"
      }
    ],
    "meta": {
      "total_count": 42,
      "page_count": 5,
      "current_page": 1,
      "limit": 10
    }
  }
  ```

### C. POST `/api/v1/rfqs/:id/assign`
Assigns an RFQ to a back-office operations user.
* **RBAC Role**: Procurement, Operations, Admin, Super Admin.
* **Request Payload**:
  ```json
  {
    "operator_id": "b5a93e1a-8833-4f22-ad0b-f38b44917a22"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "RFQ assigned successfully."
  }
  ```

### D. POST `/api/v1/rfqs/:id/quotations`
Drafts a quotation offer. Creates V1 if none exist, or increments `version` if revising.
* **RBAC Role**: Sales, Procurement, Operations, Admin.
* **Request Payload**:
  ```json
  {
    "shipping_fees": 1200.00,
    "items": [
      {
        "rfq_item_id": "4b7b3b3a-88ff-4a41-b8d2-f38b449b291a",
        "product_variant_id": "a9e2cf31-d82b-4221-82b1-ee4819d9b4b3",
        "offered_price": 415.00,
        "tax_rate": 18.00,
        "lead_time_days": 3,
        "notes": "Contract discount applied"
      }
    ]
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "q9f2cf3c-aa2b-4d44-8dd3-ff429188fba2",
      "quote_number": "QT-1024",
      "version": 1,
      "status": "Sent",
      "total_amount": 63450.00
    }
  }
  ```

### E. POST `/api/v1/quotations/:id/accept`
Approves a quotation version and automatically converts it to a confirmed order.
* **RBAC Role**: Business / Professional (owner only).
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "order_id": "o8f2cf3b-cc2b-433e-b8d2-ff4291b8a3e1",
      "order_number": "ARC-2026-0493",
      "status": "Confirmed",
      "credited_build_points": 127
    }
  }
  ```

---

## 3. Error Responses Envelope

Errors return standard HTTP status codes along with a descriptive details object:

### Example: validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation constraints failed.",
    "details": [
      {
        "field": "items.0.quantity",
        "message": "Quantity must be at least 1."
      }
    ]
  }
}
```

### Example: Authorization Error (403 Forbidden)
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You are not authorized to perform this operation."
  }
}
```
