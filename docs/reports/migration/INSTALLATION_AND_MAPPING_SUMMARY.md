# 🛡️ shadcn/ui Installation & Component Mapping Summary

## Document Metadata
* **Title**: shadcn/ui Installation & Component Mapping Summary
* **Purpose**: Compiles shadcn setup parameters, base-to-wrapper mapping tables, and the audit changelog history.
* **Version**: v2.0
* **Status**: Archived Report
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Frontend Devops Lead
* **Estimated Reading Time**: 5 minutes

---

## 1. CLI Settings Configuration (`components.json`)
The official shadcn CLI is integrated into the workspace with the following active configuration:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

* **TypeScript Paths**: Configured in `tsconfig.app.json` where `"@/*": ["./src/*"]` maps to `src/`.
* **Vite Config Alias**: Resolves `"@"` to `path.resolve(__dirname, "./src")` in `vite.config.ts`.
* **Tailwind CSS variables**: Definitions in `src/index.css` map to Tailwind utility class properties.

---

## 2. Directory Layout Architecture
Components are organized according to our pristine base-and-wrapper separation standard:
* `src/components/ui/`: Holds pristine CLI base components (`*-base.tsx`) and standard wrappers (`*.tsx`).
* `src/components/navigation/`: Holds standard compatibility adapters (e.g. `Breadcrumb.tsx` and `Pagination.tsx`).
* `src/components/shared/`: Holds generic shared assets (`Card.tsx`, `States.tsx`).

---

## 3. Component Mapping Matrix

| Official shadcn Component | PascalCase Wrapper File | Compatibility Adapter / Shared Component |
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

## 4. Changelog Log
* **[Unreleased]**: Added initial project context documentation in `PROJECT_CONTEXT.md`.
* **v1.0.0 (2026-06-25)**: Initialized components directories, installed Lucide and React Hook Form, configured Tailwind CSS variables, and implemented standard wrappers.
