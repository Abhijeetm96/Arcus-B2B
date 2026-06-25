# 02_COMPONENT_LIBRARY — ARCUS Component Developer Handbook

## Document Metadata
* **Title**: ARCUS Component Developer Handbook & UI Catalog
* **Purpose**: Serves as the developer handbook for component integration, defining props, architecture flows, accessibility requirements, and wrapper standards.
* **Version**: v1.0
* **Status**: Approved / Living Document
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Frontend Team Lead
* **Related Documents**:
  - [01_DESIGN_SYSTEM.md](file:///d:/Claude%20Code/Arcus/docs/design-system/01_DESIGN_SYSTEM.md)
  - [03_MIGRATION_AND_STANDARDS.md](file:///d:/Claude%20Code/Arcus/docs/design-system/03_MIGRATION_AND_STANDARDS.md)
* **Estimated Reading Time**: 25 minutes

---

## Revision History
| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-26 | Antigravity AI | Consolidated component guidelines, props matrices, architecture maps, and usage standards. |

---

## Table of Contents
1. [General Architecture Architecture Pattern](#general-architecture-pattern)
2. [Component Specifications Index](#component-specifications-index)
   - [Buttons & Badges (Button, Badge, StatusBadge)](#1-buttons--badges)
   - [Basic Form Controls (Input, Textarea, Checkbox, Switch, Radio, Select)](#2-basic-form-controls)
   - [Overlays & Menus (Dialog, Sheet, Drawer, Tooltip, Popover, DropdownMenu)](#3-overlays--menus)
   - [Display & Data Structures (Card, Skeleton, Table, Form, Avatar)](#4-display--data-structures)
   - [Layout & Navigation (Breadcrumb, Pagination, WorkspaceLayout, PageLayout, Navbar, Sidebar)](#5-layout--navigation)
3. [Component Library Best Practices & Anti-patterns](#6-best-practices--anti-patterns)

---

## General Architecture Pattern

All UI components adhere to a strict base-and-wrapper division:
```
Official shadcn Component (CLI Base Output) 
        ↓
ARCUS Custom Wrapper (Adds styles, loading state, error boundaries, custom attributes)
        ↓
Consumer (Portal Workspaces & Application Pages)
```

---

## Component Specifications Index

### 1. Buttons & Badges

#### Button
* **Architecture**: `button-base.tsx` $\rightarrow$ `Button.tsx` $\rightarrow$ Consumer
* **Purpose**: Performs operations or triggers interactions.
* **Props**: `variant` (`primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`, `icon`), `isLoading` (boolean).
* **Accessibility**: Keyboard trigger via `Enter` / `Space`, outlines configured via `focus-visible:ring-2`.
* **Example**:
  ```tsx
  <Button variant="primary" isLoading={loading} onClick={handlePost}>
    Post RFQ
  </Button>
  ```
* **Best Practices**: Use `isLoading` to block secondary double clicks during api calls.
* **Anti-patterns**: Do not use raw tailwind hex background classes inside button classnames.

#### Badge & StatusBadge
* **Architecture**: `badge-base.tsx` $\rightarrow$ `Badge.tsx` / `StatusBadge.tsx` $\rightarrow$ Consumer
* **Purpose**: Displays indicator labels and transaction statuses (Approved, Pending, Rejected).
* **Props**: `variant` (`default`, `secondary`, `success`, `warning`, `danger`, `info`), `status` (string for `StatusBadge`).
* **Example**:
  ```tsx
  <StatusBadge status="Approved" />
  ```

---

### 2. Basic Form Controls

#### Input & Textarea
* **Architecture**: `input-base.tsx` / `textarea-base.tsx` $\rightarrow$ `Input.tsx` $\rightarrow$ Consumer
* **Purpose**: Captures text strings or long descriptions.
* **Props**: `label` (string), `error` (string), `required` (boolean).
* **Accessibility**: Configured `aria-invalid` and `aria-describedby` bound to errors.
* **Example**:
  ```tsx
  <Input label="Material Name" error={errors.name?.message} required />
  ```

#### Checkbox, Switch, & Radio
* **Architecture**: `checkbox-base.tsx` / `switch-base.tsx` / `radio-group-base.tsx` $\rightarrow$ `Checkbox.tsx` / `Switch.tsx` / `Radio.tsx` $\rightarrow$ Consumer
* **Purpose**: Toggle binary values or select option single-choice lists.
* **Props**: `label` (string), `checked` (boolean), `onCheckedChange` (function).
* **Accessibility**: Keyboard state changes toggled by `Space` or `ArrowKeys`.
* **Example**:
  ```tsx
  <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} label="Accept terms" />
  ```

#### Select
* **Architecture**: `select-base.tsx` $\rightarrow$ `Select.tsx` $\rightarrow$ Consumer
* **Purpose**: Selects values from an option dropdown menu.
* **Props**: `options` (array of `{label, value}`), `value` (string | number), `onChange` (standard change handler).
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

---

### 3. Overlays & Menus

#### Dialog, Sheet, & Drawer
* **Architecture**: `dialog-base.tsx` / `sheet-base.tsx` $\rightarrow$ `Dialog.tsx` / `Sheet.tsx` / `Drawer.tsx` $\rightarrow$ Consumer
* **Purpose**: Opens dialogs or slide-out sheets.
* **Accessibility**: Implements Radix focus-trap locks and Escape dismissal triggers.
* **Example**:
  ```tsx
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
    </DialogContent>
  </Dialog>
  ```

#### Tooltip & Popover
* **Architecture**: `tooltip-base.tsx` / `popover-base.tsx` $\rightarrow$ `Tooltip.tsx` / `Popover.tsx` $\rightarrow$ Consumer
* **Purpose**: Provides inline detailed metadata or popup menus.
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
* **Architecture**: `dropdown-menu-base.tsx` $\rightarrow$ `DropdownMenu.tsx` $\rightarrow$ Consumer
* **Purpose**: Floating context actions.
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

### 4. Display & Data Structures

#### Card
* **Architecture**: `card-base.tsx` $\rightarrow$ `Card.tsx` $\rightarrow$ `src/components/shared/Card.tsx` $\rightarrow$ Consumer
* **Purpose**: Displays grouped content or summaries. `MetricCard` displays KPI counters with values, trend percentages, and icons.
* **Example**:
  ```tsx
  <MetricCard title="Revenues" value="₹12,45,000" trend="+8.4%" icon={<Award />} />
  ```

#### Skeleton & States
* **Architecture**: `skeleton-base.tsx` $\rightarrow$ `Skeleton.tsx` $\rightarrow$ `src/components/shared/States.tsx` $\rightarrow$ Consumer
* **Purpose**: Standardizes loading visual layouts. `EmptyState` represents search mismatch results.
* **Example**:
  ```tsx
  <EmptyState title="No bids yet" description="Waiting for vendor simulation." />
  ```

#### Table
* **Architecture**: `table-base.tsx` $\rightarrow$ `Table.tsx` $\rightarrow$ Consumer
* **Purpose**: Generates rows data grids. Standardizes sorting, search fields, and pagination via `DataTable` wrapper integrated with `@tanstack/react-table`.
* **Props**: `columns`, `data`.
* **Example**:
  ```tsx
  <DataTable columns={columns} data={data} />
  ```

#### Form
* **Architecture**: `form-base.tsx` $\rightarrow$ `Form.tsx` $\rightarrow$ Consumer
* **Purpose**: Collects user fields validating through `react-hook-form` and `zod` schemas.
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

### 5. Layout & Navigation

#### Breadcrumb & Pagination
* **Architecture**: `breadcrumb-base.tsx` / `pagination-base.tsx` $\rightarrow$ `Breadcrumb.tsx` / `Pagination.tsx` $\rightarrow$ Adapters $\rightarrow$ Consumer
* **Purpose**: Contextual route tracing and page splitting.
* **Example**:
  ```tsx
  <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "RFQs" }]} />
  ```

#### PageLayout & WorkspaceLayout
* **Architecture**: `src/components/layout/PageLayout.tsx` & `WorkspaceLayout.tsx`
* **Purpose**: Grid structures orchestrating screens. `WorkspaceLayout` splits views with sidebar desks and toolbar blocks that collapse responsively on mobile.

---

## 6. Best Practices & Anti-patterns

### Best Practices
* Always wrap native inputs in custom wrappers to expose the standard brand styling.
* Pass unique `id` props to inputs to establish accessible `<label htmlFor={id}>` connections.
* Ensure all dialog trigger buttons map to appropriate semantic tags.

### Anti-patterns
* Do not skip the wrapper layer and import from `*-base.tsx` directly.
* Avoid custom margins inside wrapper files; spacing constraints should be configured by consumers.
* Do not hardcode state strings; use `StatusBadge` mapping arrays to evaluate labels.
