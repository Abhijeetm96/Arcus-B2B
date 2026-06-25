# 01_RFQ_WORKSPACE — RFQ Workspace Architecture Specification

## Document Metadata
* **Title**: ARCUS RFQ Workspace Specification
* **Purpose**: Defines the user experience, workspace layout, and functional scope of the B2B RFQ Workspace (Module 1).
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Product Owner
* **Related Documents**:
  - [02_RFQ_WORKFLOWS.md](file:///d:/Claude%20Code/Arcus/docs/rfq/02_RFQ_WORKFLOWS.md)
  - [03_RFQ_DATA_MODEL.md](file:///d:/Claude%20Code/Arcus/docs/rfq/03_RFQ_DATA_MODEL.md)
  - [04_RFQ_UI_SPECIFICATION.md](file:///d:/Claude%20Code/Arcus/docs/rfq/04_RFQ_UI_SPECIFICATION.md)
* **Estimated Reading Time**: 15 minutes

---

## 1. Executive Summary & Core Objectives
The RFQ Workspace is the operational cockpit for B2B procurement on the ARCUS Construction Commerce platform. Builders and procurement operations teams utilize the workspace to manage, audit, and negotiate high-volume material requisitions.

### Objectives
* **Unified Pipeline**: Establish a single portal dashboard to track inquiries, detailed itemized lists, and bids.
* **Frictionless Negotiation**: Replace scattered emails/spreadsheets with structured version-controlled quotation negotiations.
* **Actionable Conversion**: Provide automatic one-click conversion from approved quotes to confirmed orders.
* **Role Separation**: Ensure B2B users access full requisition controls, while B2C retail users follow direct catalog checkout paths.

---

## 2. Workspace Philosophy & User Journeys

The RFQ Workspace acts as a B2B-only feature. B2C users navigate the store catalog directly.

### User Journeys

#### Journey A: Simple RFQ Requisition
```
Business Buyer submits name, category, and requirements summary
                          ↓
Admin Operations reviews in dashboard and calls buyer
                          ↓
Admin drafts initial quotation (QT-V1) in the workspace
                          ↓
Buyer accepts or requests adjustments from the portal
                          ↓
Approval auto-converts to a Confirmed Order (ARC-XXXXX)
```

#### Journey B: Detailed Itemized RFQ Requisition
```
Business Buyer uploads drawings and inputs itemized table (product IDs, quantities, target prices)
                          ↓
Admin assigns RFQ to procurement operator
                          ↓
Admin reviews specs, queries suppliers, and uploads quotation (QT-V1)
                          ↓
Buyer clicks "Renegotiate", inputting counter-offers
                          ↓
Admin uploads revised quotation version (QT-V2+)
                          ↓
Buyer approves; order converted with B2B Credit payment
```

---

## 3. Interface Layout & Navigation

The workspace leverages the ARCUS design layout tokens (`PageLayout` and `WorkspaceLayout`) using standard black-and-gold styling variables.

### Main Dashboard Shell
* **Header Slot**: Incorporates page titles, breadcrumbs context (`Portal > RFQs > RFQ-1024`), and quick actions (e.g. "Post New RFQ", "Export CSV").
* **KPI Summary Grid**: Renders standard cards:
  - **Active RFQs**: Count of pending reviews.
  - **Negotiation Center**: Count of quotes awaiting customer responses.
  - **Conversion Rate**: Percentage of RFQs successfully converted to confirmed orders.
  - **Monthly Volume**: Total valuation sum.

### Split-Pane Workspace Desks (`WorkspaceLayout`)
* **Left Sidebar Desk**: Filter pane containing list search text box, date ranges, priority selectors (High, Medium, Low), and status filters.
* **Central List Panel**: Renders the TanStack `DataTable` displaying RFQ IDs, customer names, date posted, priority badges, and active statuses.
* **Right Detail Drawer**: Slide-out Radix sheet triggered upon row click. Exposes:
  - **Itemized Requisition Grid**: Tabular lists displaying item details, units, target prices, and quotes.
  - **Activity Timeline Feed**: Vertical activities timeline logs (status changes, comments, updates).
  - **Attachments Panel**: Clickable lists of drawings, GST documents, and specifications.
  - **Actions Toolbar**: Sticky panel holding "Approve Quote", "Renegotiate", or "Assign Operator" triggers.

---

## 4. Responsive Viewport Rules
* **Desktop ($> 1024\text{px}$)**: Full side-by-side split layout visible. Detail drawer opens as a side sheet overlay on top of workspace lists.
* **Tablet ($768\text{px} - 1024\text{px}$)**: Spacing grids collapse to 2-column blocks. The list table wraps inside overflow bounds, and row clicks open a full-viewport Radix sheet overlay.
* **Mobile ($< 768\text{px}$)**: Spacing padding drops to `p-4` with single-column stack cards. Navigation links collapse behind a hamburger menu trigger.
