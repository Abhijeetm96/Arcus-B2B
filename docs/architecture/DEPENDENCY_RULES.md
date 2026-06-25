# ARCUS Dependency Architecture Rules

This document outlines the formal import boundaries and architectural layering rules for the ARCUS UI platform. Every developer must adhere strictly to these rules to maintain component isolation, brand integrity, and testability.

---

## 1. Architectural Layers

The UI platform is structured into a strict top-down dependency hierarchy:

```
                  ┌───────────────────────┐
                  │         Pages         │
                  └───────────┬───────────┘
                              │
                  ┌───────────▼───────────┐
                  │        Modules        │
                  └───────────┬───────────┘
                              │
                  ┌───────────▼───────────┐
                  │   Shared Components   │
                  └───────────┬───────────┘
                              │
                  ┌───────────▼───────────┐
                  │    UI Layout System   │
                  └───────────┬───────────┘
                              │
                  ┌───────────▼───────────┐
                  │      UI Wrappers      │
                  └───────────┬───────────┘
                              │
                  ┌───────────▼───────────┐
                  │    Base Components    │
                  └───────────────────────┘
```

### Layer Definitions
1. **Pages**: Root route handlers and page setups (e.g. public landing, auth desks).
2. **Modules**: Portal-specific workspaces and dashboards (e.g. Admin, Business, Professional, Individual).
3. **Shared Components**: Reusable dashboard widgets, forms, and timeline feeds (e.g. `Timeline.tsx`, `SearchInput.tsx`).
4. **UI Layout System**: Spacing shells managing viewports (e.g. `PageLayout.tsx`, `WorkspaceLayout.tsx`).
5. **UI Wrappers**: Customized PascalCase design system components containing ARCUS gold theme tokens (e.g. `Button.tsx`, `Table.tsx`, `Dialog.tsx`).
6. **Base Components**: Pristine lowercase shadcn CLI components (e.g. `button-base.tsx`, `table-base.tsx`, `dialog-base.tsx`).

---

## 2. Import Isolation Rules

To prevent code pollution and circular dependency locks, we enforce the following boundaries:

### Rule 1: No Base Component Imports Outside Wrappers
* **Incorrect**: `import { Button } from 'components/ui/button-base'` inside a page or module.
* **Correct**: Consumers must exclusively import wrappers (e.g., `import { Button } from 'components/ui/Button'`).
* Base files (`*-base.tsx`) must remain identical to official CLI outputs. Only the wrapper inside `components/ui/` may import them.

### Rule 2: Strict Downward-Only Flows
* A layer may **only** import from layers positioned below it.
* **Shared Components** may import from **UI Layouts** or **UI Wrappers**.
* **UI Wrappers** may **never** import from Shared Components, Modules, or Pages.
* **Layouts** may import from **UI Wrappers** but never from Modules or Pages.

### Rule 3: No Circular Cross-Portal Imports
* Modules (e.g. `modules/business`) must never import from other modules (e.g. `modules/individual`) directly. Use **Shared Components** or re-exports in the `shared/` adapter directory for cross-portal elements.

---

## 3. Enforcement & Verification
All import rules are validated:
1. **Static Analysis**: `npx tsc --noEmit` checks for type compatibility.
2. **Design Audits**: Automated regex scans search for direct `*-base` imports outside `src/components/ui/`.
