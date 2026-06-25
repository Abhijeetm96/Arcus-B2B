# COMPONENT_REFERENCE — ARCUS Reusable Component Reference

## Document Metadata
* **Title**: ARCUS Reusable Component Reference
* **Purpose**: Developer handbook detailing props, custom wrappers, visual variants, accessibility standards, and code integrations for all ARCUS Design System components.
* **Version**: v2.0
* **Status**: Approved / Living Document
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Frontend Team Lead
* **Related Documents**:
  - [DESIGN_SYSTEM.md](file:///d:/Claude%20Code/Arcus/docs/design-system/DESIGN_SYSTEM.md)
* **Estimated Reading Time**: 25 minutes

---

## Revision History
| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-25 | Antigravity AI | First generation of component developer handbook. |
| v2.0 | 2026-06-26 | Antigravity AI | Final consolidation of component library specs and wrapper guidelines into a single reference document. |

---

## Table of Contents
1. [General Wrapper Architecture](#general-wrapper-architecture)
2. [Action & Indicator Components (Button, Badge, StatusBadge)](#1-action--indicator-components)
3. [Form Control Components (Input, Textarea, Checkbox, Switch, Radio, Select, Form)](#2-form-control-components)
4. [Overlay & Modal Components (Dialog, Sheet, Drawer, Tooltip, Popover, DropdownMenu)](#3-overlay--modal-components)
5. [Data & Layout Structures (Card, Table, Skeleton, Avatar, Breadcrumb, Pagination, PageLayout, WorkspaceLayout)](#4-data--layout-structures)
6. [Best Practices, Anti-patterns & Performance Rules](#5-best-practices-anti-patterns--performance-rules)

---

## General Wrapper Architecture

Every reusable component follows a strict three-layer layout to isolate generated code from enterprise overrides:

```
Official shadcn Component (Base CLI Component e.g., button-base.tsx)
        ↓
ARCUS Wrapper Component (Exposes custom styles and props e.g., Button.tsx)
        ↓
Consumers (Application Pages / Workspaces)
```

Direct imports from base components are prohibited outside of the wrapper component.

---

## Component Specifications Index

### 1. Action & Indicator Components

#### Button
* **Purpose**: Triggers click events.
* **Architecture**: `button-base.tsx` $\rightarrow$ `Button.tsx` $\rightarrow$ Consumer.
* **Props**: Extends standard HTML button props. Adds `isLoading?: boolean`.
* **Variants**:
  - `variant`: `primary` (default, gold/black), `secondary` (gray/white), `outline` (transparent with borders), `ghost` (text-only link), `danger` (red highlight).
  - `size`: `sm`, `md` (default), `lg`, `icon`.
* **Accessibility**: Keyboard trigger via `Enter` / `Space`, focus ring outlines visible on keyboard focus.
* **Example**:
  ```tsx
  <Button variant="primary" size="md" isLoading={loading} onClick={handlePost}>
    Post RFQ
  </Button>
  ```

#### Badge & StatusBadge
* **Purpose**: Displays counts, short details, or transaction statuses (Approved, Pending, Rejected).
* **Architecture**: `badge-base.tsx` $\rightarrow$ `Badge.tsx` / `StatusBadge.tsx` $\rightarrow$ Consumer.
* **Props**: `variant` (`default`, `secondary`, `success`, `warning`, `danger`, `info`), `status` (for `StatusBadge`).
* **Example**:
  ```tsx
  <StatusBadge status="Approved" />
  ```

---

### 2. Form Control Components

#### Input & Textarea
* **Purpose**: Capture text parameters or long descriptions.
* **Architecture**: `input-base.tsx` / `textarea-base.tsx` $\rightarrow$ `Input.tsx` $\rightarrow$ Consumer.
* **Props**: `label?: string`, `error?: string`, `required?: boolean`.
* **Accessibility**: Exposes `aria-invalid` and `aria-describedby` bound to errors.
* **Example**:
  ```tsx
  <Input label="Material Name" error={errors.name?.message} required />
  ```

#### Checkbox, Switch, & Radio
* **Purpose**: Toggle binary values or select option lists.
* **Architecture**: `checkbox-base.tsx` / `switch-base.tsx` / `radio-group-base.tsx` $\rightarrow$ `Checkbox.tsx` / `Switch.tsx` / `Radio.tsx` $\rightarrow$ Consumer.
* **Props**: `label?: string`, `checked?: boolean`, `onCheckedChange?: (v: boolean) => void`.
* **Example**:
  ```tsx
  <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} label="Accept terms" />
  ```

#### Select
* **Purpose**: Exposes option menus.
* **Architecture**: `select-base.tsx` $\rightarrow$ `Select.tsx` $\rightarrow$ Consumer.
* **Props**: `options: { label: string; value: string | number }[]`, `value?: string | number`, `onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void`.
* **Example**:
  ```tsx
  <Select 
    value={value} 
    onChange={(e) => setValue(e.target.value)} 
    options={[
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" }
    ]} 
  />
  ```

#### Form
* **Purpose**: Collects input fields validating through `react-hook-form` and `zod` schemas.
* **Architecture**: `form-base.tsx` $\rightarrow$ `Form.tsx` $\rightarrow$ Consumer.
* **Example**:
  ```tsx
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <FormControl>
              <Select {...field} options={[{ label: "High", value: "high" }]} />
            </FormControl>
          </FormItem>
        )}
      />
    </form>
  </Form>
  ```

---

### 3. Overlay & Modal Components

#### Dialog, Sheet, & Drawer
* **Purpose**: Opens dialog overlays or side drawers.
* **Architecture**: `dialog-base.tsx` / `sheet-base.tsx` $\rightarrow$ `Dialog.tsx` / `Sheet.tsx` / `Drawer.tsx` $\rightarrow$ Consumer.
* **Accessibility**: Traps focus inside the active viewport, Escape closes active container.
* **Example**:
  ```tsx
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader><DialogTitle>Dialog Title</DialogTitle></DialogHeader>
    </DialogContent>
  </Dialog>
  ```

#### Tooltip & Popover
* **Purpose**: Provides detailed popups or info text.
* **Architecture**: `tooltip-base.tsx` / `popover-base.tsx` $\rightarrow$ `Tooltip.tsx` / `Popover.tsx` $\rightarrow$ Consumer.
* **Example**:
  ```tsx
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent>Detailed Help</TooltipContent>
    </Tooltip>
  </TooltipProvider>
  ```

#### DropdownMenu
* **Purpose**: Triggers dropdown selections.
* **Architecture**: `dropdown-menu-base.tsx` $\rightarrow$ `DropdownMenu.tsx` $\rightarrow$ Consumer.
* **Example**:
  ```tsx
  <DropdownMenu>
    <DropdownMenuTrigger><Button>Menu</Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={edit}>Edit</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  ```

---

### 4. Data & Layout Structures

#### Card
* **Purpose**: Grouped layout surfaces. `MetricCard` displays dashboard KPI summaries.
* **Architecture**: `card-base.tsx` $\rightarrow$ `Card.tsx` $\rightarrow$ `src/components/shared/Card.tsx` (Adapter) $\rightarrow$ Consumer.
* **Example**:
  ```tsx
  <MetricCard title="Revenues" value="₹12,45,000" trend="+8.4%" icon={<Award />} />
  ```

#### Table
* **Purpose**: Lists structured tabular data. `DataTable` wrapper integrates `@tanstack/react-table` with sorting, filtering, and paging.
* **Architecture**: `table-base.tsx` $\rightarrow$ `Table.tsx` $\rightarrow$ Consumer.
* **Example**:
  ```tsx
  <DataTable columns={columns} data={data} />
  ```

#### Skeleton
* **Purpose**: Standard loading outlines.
* **Architecture**: `skeleton-base.tsx` $\rightarrow$ `Skeleton.tsx` $\rightarrow$ `src/components/shared/States.tsx` (Adapter) $\rightarrow$ Consumer.

#### Avatar
* **Purpose**: Round profile visual indicator.
* **Architecture**: `avatar-base.tsx` $\rightarrow$ `Avatar.tsx` $\rightarrow$ Consumer.
* **Props**: `src?: string`, `fallback?: string`, `size?: "sm" | "md" | "lg" | "xl"`.

#### Breadcrumb & Pagination
* **Purpose**: Route path tracing and page switches.
* **Architecture**: `breadcrumb-base.tsx` / `pagination-base.tsx` $\rightarrow$ `Breadcrumb.tsx` / `Pagination.tsx` $\rightarrow$ Navigation Adapters $\rightarrow$ Consumer.
* **Example**:
  ```tsx
  <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "RFQs" }]} />
  ```

#### PageLayout & WorkspaceLayout
* **Purpose**: Orchestrate page structures. `WorkspaceLayout` manages split desks and search/filters toolbars.

---

## 5. Best Practices, Anti-patterns & Performance Rules

### Best Practices
* Always wrap native controls in standard custom wrappers to enforce brand visual consistency.
* Configure `aria-describedby` on input fields to map custom description labels.
* Use `isLoading` to disable buttons during async actions.

### Anti-patterns
* Do not import directly from `*-base.tsx` base components.
* Avoid custom inline margins or border radiuses inside wrappers; let layouts determine spacing.
* Do not mix different font sizes inside the same row.

### Performance Rules
* Minimize repaints by avoiding dynamic inline style overrides; map all styling to utility classnames.
* Keep wrappers lightweight to preserve fast Hot Module Replacement (HMR) times ($<200\text{ms}$).
