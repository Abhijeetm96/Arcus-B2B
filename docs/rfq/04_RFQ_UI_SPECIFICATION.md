# 04_RFQ_UI_SPECIFICATION — RFQ Workspace UI Specification

## Document Metadata
* **Title**: ARCUS RFQ Workspace UI Specification
* **Purpose**: Technical visual blueprints mapping out dashboard grid layouts, split panes, timeline activity feeds, and mobile drawer folding behaviors.
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Lead Frontend Developer / UX Designer
* **Related Documents**:
  - [01_RFQ_WORKSPACE.md](file:///d:/Claude%20Code/Arcus/docs/rfq/01_RFQ_WORKSPACE.md)
  - [02_RFQ_WORKFLOWS.md](file:///d:/Claude%20Code/Arcus/docs/rfq/02_RFQ_WORKFLOWS.md)
* **Estimated Reading Time**: 15 minutes

---

## 1. Desktop Dashboard Layout Wireframe ($> 1024\text{px}$)

Leverages the `PageLayout` component. The public header and footer are conditionally hidden.

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  Navbar (ARCUS Procurement Shell)                                     Cart [0] User  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  Sidebar     │  Breadcrumb: Portal > RFQs > Active Workspace                         │
│  [Admin]     │ ───────────────────────────────────────────────────────────────────── │
│  - Home      │  PageHeader: RFQ Procurement Workspace               [Post New RFQ]   │
│  - RFQs (A)  │ ───────────────────────────────────────────────────────────────────── │
│  - Catalog   │  Metrics: [Active: 12]  [Pending: 5]  [Quoted: 24]  [Volume: ₹1.2M]   │
│  - Orders    │ ───────────────────────────────────────────────────────────────────── │
│              │  WorkspaceLayout (Split-Pane Desk)                                    │
│              │ ┌──────────────────────────────────┐┌───────────────────────────────┐ │
│              │ │ Toolbar Desk: Search [          ]││ Detail Drawer (Selected Row)  │ │
│              │ │ Filter: Status [All     ] [🔍]   ││ ───────────────────────────── │ │
│              │ ├──────────────────────────────────┤│ ID: RFQ-2026-0001             │ │
│              │ │ DataTable:                       ││ Status: [UnderReview]          │ │
│              │ │ [ ] ID   │ Client │ Status│Date  ││ ───────────────────────────── │ │
│              │ │ [ ] #001 │ Astral │ Review│26-06 ││ Tab Trigger: Items | Timeline │ │
│              │ │ [x] #002 │ JSW    │ Quoted│25-06 ││ ───────────────────────────── │ │
│              │ │ [ ] #003 │ Anchor │ Draft │24-06 ││ Item Table:                   │ │
│              │ │                                  ││ SKU │ Product │ Qty │ Price   │ │
│              │ │                                  ││ #12 │ Rebar   │ 100 │ ₹56,000 │ │
│              │ │                                  ││ ───────────────────────────── │ │
│              │ │                                  ││ Actions:                      │ │
│              │ │                                  ││ [Approve Quote] [Renegotiate] │ │
│              │ └──────────────────────────────────┘└───────────────────────────────┘ │
│              │  Pagination: Showing 1-3 of 42 entries               ◀  1  2  3  ▶    │
└──────────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Layout Mapping Details

### A. The Split-Pane View (`WorkspaceLayout.tsx`)
* **Left Filter desk (width `25%`)**: Renders filters inside a sticky column. Uses `<Select>` component wrappers.
* **Central List Panel (width `75%`)**: Renders `<Table>` and `<DataTable>` wrappers. Rows include hover animations. Clicking any row opens the details pane.
* **Right Detail Drawer**: Handled using the Radix-based `<Sheet>` component. The drawer slides in from the right edge with a backdrop, trapping keyboard focus.

### B. Tabs Segment Desk
Inside the detail drawer, a `<Tabs>` block divides details:
1. **Items Tab**: Renders the itemized list, showing customer target prices alongside offered variant prices.
2. **Timeline Tab**: Renders a vertical `Timeline` activity log:
   - **Log Entry**: User initials avatar badge, title bold header, short description text, and a timestamp.
   - **Form Comments Field**: Form control `<Input>` and `<Button>` at the bottom of the timeline to allow posting instant notes.

### C. Sticky Actions Toolbar
Renders at the bottom of the details drawer.
* Contains a horizontal flex row with standard gap tokens (`space-x-3`).
* Buttons map to standard variants:
  - **Accept/Approve**: `<Button variant="primary">Approve Quote</Button>`
  - **Renegotiate**: `<Button variant="outline">Request Revisions</Button>`
  - **Cancel**: `<Button variant="danger">Cancel RFQ</Button>`

---

## 3. Mobile Viewport Layout Folding ($< 768\text{px}$)

```text
┌────────────────────────────────────────────────────────┐
│  [=] ARCUS Portal Header                 User Initials │
├────────────────────────────────────────────────────────┤
│  Breadcrumb: Portal > RFQs                             │
│  PageHeader: RFQ Workspace                             │
│ ────────────────────────────────────────────────────── │
│  Metrics Stack:                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Active RFQs: 12                                  │  │
│  └──────────────────────────────────────────────────┘  │
│ ────────────────────────────────────────────────────── │
│  Mobile Cards List:                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ #RFQ-2026-0001                                   │  │
│  │ Client: Astral CPVC                              │  │
│  │ Status: [UnderReview]                            │  │
│  │ Date: 2026-06-26                                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  * Row clicks trigger full screen slide-up overlays    │
│    displaying tabs, details, and sticky actions *      │
└────────────────────────────────────────────────────────┘
```

* **Menu Collapsing**: The sidebar collapses completely. A top-left hamburger icon triggers a slide-out Radix sheet containing navigation menu links.
* **KPI Metrics**: Transition from a horizontal 4-column row into a single-column vertical stack.
* **Details overlay**: Row clicks trigger a full-screen drawer popup from the bottom using the Radix `Sheet` side pane wrapper, providing optimized scrolling heights.
