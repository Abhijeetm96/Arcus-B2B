# 08_RFQ_IMPLEMENTATION_ROADMAP — Module 1 Implementation Plan

## Document Metadata
* **Title**: ARCUS RFQ Workspace Implementation Roadmap
* **Purpose**: Defines a 10-sprint plan to build, test, and deploy Module 1 (RFQ Workspace).
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Frontend Devops Lead
* **Related Documents**:
  - [01_RFQ_WORKSPACE.md](file:///d:/Claude%20Code/Arcus/docs/rfq/01_RFQ_WORKSPACE.md)
  - [04_RFQ_UI_SPECIFICATION.md](file:///d:/Claude%20Code/Arcus/docs/rfq/04_RFQ_UI_SPECIFICATION.md)
* **Estimated Reading Time**: 15 minutes

---

## 1. 10-Sprint Implementation Roadmap

### Sprint 1: Workspace Shell
* **Objective**: Scaffold the primary portal layouts, router endpoints, and empty workspace views.
* **Deliverables**:
  - Setup routing paths `/portal/rfqs` inside `src/App.tsx`.
  - Wire the default B2B layout framework wrapper (`src/components/layout/PageLayout.tsx`).
* **Dependencies**: None (uses completed Batch 5 foundations).
* **Acceptance Criteria**:
  - Accessing `/portal/rfqs` renders a clean, empty page layout containing the standard portal sidebar.
  - Page header displays navigation links without rendering the public homepage Navbar/Footer.

### Sprint 2: RFQ Dashboard & Summary Cards
* **Objective**: Build the dashboard overview containing KPI summary cards and trend blocks.
* **Deliverables**:
  - Implement top summary panel inside the workspace page.
  - Render four standard `<MetricCard>` components showing: Active RFQs, Pending, Quoted, and total Monthly Volume.
* **Dependencies**: Sprint 1 complete.
* **Acceptance Criteria**:
  - Metrics load and display correctly.
  - Summary grid follows the 4-column responsive folding rule on mobile.

### Sprint 3: RFQ List & Table Integration
* **Objective**: Implement the main data list using the TanStack Table wrapper.
* **Deliverables**:
  - Configure columns model for RFQs list (ID, customer name, date posted, priority badge, operator, status).
  - Integrate `<DataTable>` wrapper supporting sorting and pagination.
* **Dependencies**: Sprint 2 complete.
* **Acceptance Criteria**:
  - Datagrid renders columns matching specs.
  - Columns sort upon header click.
  - Pagination controls show correct totals and switch pages.

### Sprint 4: RFQ Details Side Sheet
* **Objective**: Build the right-side detail drawer triggered upon list row clicks.
* **Deliverables**:
  - Bind list row click events to trigger the Radix-based `<Sheet>` component.
  - Display parent metadata, customer details, and selected RFQ status.
* **Dependencies**: Sprint 3 complete.
* **Acceptance Criteria**:
  - Clicking a row slides in the details drawer, trapping keyboard focus.
  - Details panel collapses on screen sizes $< 768\text{px}$ to a full-screen bottom drawer overlay.

### Sprint 5: Activity Timeline Feed
* **Objective**: Implement the vertical timeline log logging history actions.
* **Deliverables**:
  - Render vertical activities timeline grids using standard SVG bullet points.
  - Add text comments inputs and "Post Message" forms.
* **Dependencies**: Sprint 4 complete.
* **Acceptance Criteria**:
  - Status changes and operator assignments log as log entries.
  - Private comments are hidden in customer sessions but visible to operator accounts.

### Sprint 6: Attachment uploads Panel
* **Objective**: Build file uploading controls and list links.
* **Deliverables**:
  - Integrate `<UploadComponent>` to handle PDF/PNG files.
  - Render a files list with delete buttons and download anchors.
* **Dependencies**: Sprint 5 complete.
* **Acceptance Criteria**:
  - Files drop/select triggers mock file uploading.
  - Uploaded drawings display in details lists with download links.

### Sprint 7: Search & Filter Toolbar
* **Objective**: Build the left filter sidebar panel.
* **Deliverables**:
  - Implement list search text inputs, date ranges, and status dropdown fields.
  - Bind filter states to trigger data reloads on the list grid.
* **Dependencies**: Sprint 6 complete.
* **Acceptance Criteria**:
  - Typing in search box filters table rows.
  - Selecting status (e.g. `Quoted`) filters list immediately.

### Sprint 8: Assignment Operations Controls
* **Objective**: Implement operator assignment dropdowns and buttons.
* **Deliverables**:
  - Add operator selector `<Select>` dropdowns inside details.
  - Bind operator selection to update the log timeline.
* **Dependencies**: Sprint 7 complete.
* **Acceptance Criteria**:
  - Back-office users can select an operator from the dropdown list.
  - Selection saves status changes and updates the timeline log.

### Sprint 9: Audit Logs & Versions
* **Objective**: Log change histories and draft revised quotation lists.
* **Deliverables**:
  - Implement versioning list widgets showing historical quotes (`V1`, `V2`).
  - Render pricing fields for itemized lists.
* **Dependencies**: Sprint 8 complete.
* **Acceptance Criteria**:
  - Timeline details display revision histories.
  - Historical quote records are locked from modifications.

### Sprint 10: Testing & Polish
* **Objective**: Execute WCAG accessibility audits, mobile readiness checks, and production compilations.
* **Deliverables**:
  - Verify keyboard tab sequences, focus locks, and Escape keys.
  - Execute overall production builds (`npm run build`).
* **Dependencies**: Sprint 9 complete.
* **Acceptance Criteria**:
  - Build compiles with **0 warnings and 0 errors**.
  - All pages follow B2B-only permissions rules.
