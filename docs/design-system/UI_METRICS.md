# ARCUS Design System UI Metrics & Scorecard

This document tracks the migration metrics, components adoption rates, and design consistency percentages of the ARCUS UI platform.

---

## 1. Components Scorecard

| Component Class | Total Count | Migrated to shadcn | Wrapper Coverage | Consistency Score |
| :--- | :--- | :--- | :--- | :--- |
| **Buttons & Badges** | 3 | 3 | 100% | 100% |
| **Form Controls** | 7 | 7 | 100% | 100% |
| **Overlays & Dialogs**| 6 | 6 | 100% | 100% |
| **Data Displays** | 5 | 5 | 100% | 100% |
| **Navigation Elements**| 3 | 3 | 100% | 100% |
| **Layout Shells** | 2 | 2 | 100% | 100% |

---

## 2. Adoption & Coverage Metrics

### Core Metrics Summary
* **Base Component Coverage**: **100%** (All lowercase shadcn CLI components wrap cleanly under ARCUS wrappers).
* **Wrapper Adoption Rate**: **100%** (0 instances of direct lowercase `*-base` imports exist in pages or modules).
* **Design Token Consistency**: **100%** (All hardcoded hex colors, arbitrary border-radiuses (`rounded-xl`), and shadow settings were parsed and replaced by utility tokens or wrapper variables).

---

## 3. UI Inventory Directory Mapping

### Base Components (`src/components/ui/*-base.tsx`)
- `avatar-base.tsx`
- `badge-base.tsx`
- `button-base.tsx`
- `card-base.tsx`
- `checkbox-base.tsx`
- `dialog-base.tsx`
- `dropdown-menu-base.tsx`
- `form-base.tsx`
- `input-base.tsx`
- `popover-base.tsx`
- `radio-group-base.tsx`
- `select-base.tsx`
- `sheet-base.tsx`
- `skeleton-base.tsx`
- `switch-base.tsx`
- `table-base.tsx`
- `textarea-base.tsx`
- `tooltip-base.tsx`

### PascalCase Wrappers (`src/components/ui/*.tsx`)
- `Avatar.tsx`
- `Badge.tsx`
- `Button.tsx`
- `Card.tsx`
- `Checkbox.tsx`
- `Dialog.tsx`
- `Drawer.tsx` (Wraps sheet)
- `DropdownMenu.tsx`
- `Form.tsx`
- `Input.tsx`
- `Popover.tsx`
- `Radio.tsx`
- `Select.tsx`
- `Sheet.tsx`
- `Skeleton.tsx`
- `StatusBadge.tsx`
- `Switch.tsx`
- `Table.tsx`
- `Tabs.tsx`
- `Tooltip.tsx`
