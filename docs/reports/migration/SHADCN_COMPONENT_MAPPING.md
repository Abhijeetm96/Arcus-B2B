# 🗺️ shadcn/ui Component Mapping Matrix

This document maps all newly installed official shadcn components, their ARCUS custom wrappers, and their respective backward-compatibility files across the project workspace.

---

## 1. Mapping Matrix Table

| Official shadcn Component (`src/components/ui/`) | PascalCase Wrapper File (`src/components/ui/`) | Compatibility Adapter / Shared Component (`src/components/shared/` or `src/components/navigation/`) |
| :--- | :--- | :--- |
| `button-base.tsx` | `Button.tsx` | *N/A (wrapper resolves directly)* |
| `badge-base.tsx` | `Badge.tsx` / `StatusBadge.tsx` | *N/A (wrapper resolves directly)* |
| `input-base.tsx` / `textarea-base.tsx` | `Input.tsx` | *N/A (wrapper resolves directly)* |
| `checkbox-base.tsx` | `Checkbox.tsx` | *N/A (wrapper resolves directly)* |
| `radio-group-base.tsx` | `Radio.tsx` | *N/A (wrapper resolves directly)* |
| `switch-base.tsx` | `Switch.tsx` | *N/A (wrapper resolves directly)* |
| `select-base.tsx` | `Select.tsx` | *N/A (wrapper resolves directly)* |
| `avatar-base.tsx` | `Avatar.tsx` | *N/A (wrapper resolves directly)* |
| `card-base.tsx` | `Card.tsx` | `src/components/shared/Card.tsx` |
| `skeleton-base.tsx` | `Skeleton.tsx` | `src/components/shared/States.tsx` (re-exports Skeleton) |
| `table-base.tsx` | `Table.tsx` | *N/A (wrapper exposes standard Table & DataTable)* |
| `form-base.tsx` | `Form.tsx` | *N/A (wrapper resolves directly)* |
| `dialog-base.tsx` | `Dialog.tsx` | *N/A (wrapper resolves directly)* |
| `sheet-base.tsx` | `Sheet.tsx` / `Drawer.tsx` | *N/A (wrapper resolves directly)* |
| `popover-base.tsx` | `Popover.tsx` | *N/A (wrapper resolves directly)* |
| `tooltip-base.tsx` | `Tooltip.tsx` | *N/A (wrapper resolves directly)* |
| `dropdown-menu-base.tsx` | `DropdownMenu.tsx` | *N/A (wrapper resolves directly)* |
| `breadcrumb-base.tsx` | `Breadcrumb.tsx` | `src/components/navigation/Breadcrumb.tsx` |
| `pagination-base.tsx` | `Pagination.tsx` | `src/components/navigation/Pagination.tsx` |

---

## 2. Key Design Patterns

1. **Clean Base Primitives**: Base components remain completely unmodified and reflect the official shadcn CLI outputs exactly.
2. **Wrapper Delegation**: ARCUS custom attributes, sizing overrides, validation error styles, required indicators, and GST/status badge logic are integrated purely inside wrappers.
3. **Implicit Base Imports**: Any file outside of the `ui/` directory imports exclusively from the wrapper components, preventing direct access to base components.
