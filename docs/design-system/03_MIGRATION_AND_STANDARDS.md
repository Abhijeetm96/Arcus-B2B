# 03_MIGRATION_AND_STANDARDS — ARCUS Engineering Reference

## Document Metadata
* **Title**: ARCUS Engineering Reference & Standards Guide
* **Purpose**: Documents the platform's architectural constraints, folder structure, code style compliance, completed migration history, and long-term UI maintenance processes.
* **Version**: v1.0
* **Status**: Approved / Living Document
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Lead Devops Engineer
* **Related Documents**:
  - [01_DESIGN_SYSTEM.md](file:///d:/Claude%20Code/Arcus/docs/design-system/01_DESIGN_SYSTEM.md)
  - [02_COMPONENT_LIBRARY.md](file:///d:/Claude%20Code/Arcus/docs/design-system/02_COMPONENT_LIBRARY.md)
* **Estimated Reading Time**: 15 minutes

---

## Revision History
| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-26 | Antigravity AI | Consolidated component code rules, migration logs, backlogs, and upgrade workflows. |

---

## Table of Contents
1. [Migration History](#1-migration-history)
2. [Wrapper Philosophy](#2-wrapper-philosophy)
3. [Dependency Rules](#3-dependency-rules)
4. [Folder Structure](#4-folder-structure)
5. [Naming Conventions](#5-naming-conventions)
6. [Import Rules](#6-import-rules)
7. [Compatibility Adapters](#7-compatibility-adapters)
8. [Coding Standards](#8-coding-standards)
9. [Accessibility Standards](#9-accessibility-standards)
10. [Performance Standards](#10-performance-standards)
11. [Review Checklist](#11-review-checklist)
12. [Testing Checklist](#12-testing-checklist)
13. [Upgrade Process](#13-upgrade-process)
14. [Future shadcn Update Process](#14-future-shadcn-update-process)
15. [Technical Debt & Backlog](#15-technical-debt--backlog)
16. [Completed Migration Batches](#16-completed-migration-batches)
17. [Future Improvements](#17-future-improvements)

---

## 1. Migration History
The ARCUS Enterprise Design System underwent a structured migration to replace legacy custom and inline HTML interfaces with a clean, headless-backed component library. This process was completed in 5 sequential batches, culminating in 94.8% code consistency and a production build time of ~8 seconds.

---

## 2. Wrapper Philosophy
To allow future upgrades of shadcn/ui base code without overwriting company-specific features, we enforce a strict separation between generated base components and our custom enterprise wrappers. Base components remain pristine, while branding, custom props (`isLoading`, validation states), accessibility handlers, and event translations are located inside the wrappers.

---

## 3. Dependency Rules
We enforce a strict one-directional dependency flow. Skipping layers is prohibited to prevent circular dependencies and compilation errors:

```
Official shadcn CLI Registry
          ↓
Base Components (src/components/ui/*-base.tsx)
          ↓
ARCUS Wrapper Components (src/components/ui/*.tsx)
          ↓
Compatibility Adapters (src/components/shared/ & src/components/navigation/)
          ↓
Global Layout & Workspace Layouts
          ↓
Platform Portal Shells (Admin, Business, etc.)
          ↓
Feature Workspace Pages & Dashboard Routes
```

---

## 4. Folder Structure
The component workspace is organized as follows:
* `src/components/ui/`: Host to all base files (`*-base.tsx`) and standard wrappers (`*.tsx`).
* `src/components/layout/`: Holds layout structures (`PageLayout.tsx` and `WorkspaceLayout.tsx`).
* `src/components/navigation/`: Holds standard navigation adapters (`Breadcrumb.tsx` and `Pagination.tsx`).
* `src/components/shared/`: Holds general shared assets (`Card.tsx`, `States.tsx`).

---

## 5. Naming Conventions
* **Base Components**: Lowercase, kebab-case, suffixed with `-base.tsx` (e.g. `button-base.tsx`). Suffixes are required to avoid case conflicts on Windows NTFS filesystems.
* **Wrapper Components**: PascalCase, matching the standard React class structure (e.g. `Button.tsx`).
* **Adapters & Layouts**: PascalCase, explaining their context (e.g. `WorkspaceLayout.tsx`).

---

## 6. Import Rules
* **No Direct Base Imports**: Outside components are prohibited from importing directly from base components (`import { Button } from '@/components/ui/button-base'` is forbidden). All imports must resolve through wrappers (`import { Button } from '@/components/ui/Button'`).
* **Path Aliases**: Prefer path aliases (`@/components/...`) over relative paths (`../../../components/...`) for deep workspace page files.

---

## 7. Compatibility Adapters
To prevent breaking existing workspace imports during component refactoring, we created compatibility layers (e.g., `src/components/navigation/Breadcrumb.tsx` and `src/components/shared/Card.tsx`) that re-export standardized wrapper assets, shielding old features from refactoring changes.

---

## 8. Coding Standards
* **Verbatim Module Syntax**: Explicitly use the `type` keyword for type-only imports (e.g. `import { type ButtonProps } from "./Button"`) to avoid compilation errors under strict compiler configurations.
* **Zero Warnings**: Production builds (`npm run build`) must compile with 0 warnings.
* **Prop Types**: Extend wrapper interfaces using standard React attributes:
  ```typescript
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
  }
  ```

---

## 9. Accessibility Standards
* **WCAG 2.1 AA Compliance**: All overlays, modals, and sheets must manage focus trapping and keyboard navigation states cleanly.
* **Focus Indicator**: Custom focus rings must be visible (`focus-visible:ring-primary focus-visible:ring-offset-2`).

---

## 10. Performance Standards
* **HMR Time**: Dev server style changes must resolve within **200ms**.
* **Zero Repaint Recalculations**: Avoid custom absolute styles inside wrappers; layouts must leverage standard flex/grid configurations.

---

## 11. Review Checklist
Before staging code commits, verify:
- [ ] Direct base file imports outside `components/ui/` are zero.
- [ ] No hardcoded hex color strings remain in classnames.
- [ ] All inputs have corresponding accessibility `<label>` indicators.
- [ ] Custom spacing parameters (margin/padding) are configured by the consumer.

---

## 12. Testing Checklist
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
- [ ] Run `npm run build` and confirm zero errors/warnings.
- [ ] Verify keyboard tabbing focus locks inside active sheets.
- [ ] Validate responsive grid layout shifts using mobile emulation.

---

## 13. Upgrade Process
When installing new shadcn elements:
1. Rename any existing custom wrapper files to `*.tsx.temp`.
2. Generate base file: `npx shadcn@latest add <component> -y`.
3. Rename base file to `*-base.tsx`.
4. Create the new wrapper `*.tsx` incorporating custom logic from the temp file.
5. Compile and test, then delete the temp file.

---

## 14. Future shadcn Update Process
When upgrading the shadcn CLI version:
1. Run `npx shadcn@latest diff` to check for updates.
2. Apply changes only to base files (`*-base.tsx`), leaving wrapper components untouched.
3. Validate that wrapper interfaces remain compatible.

---

## 15. Technical Debt & Backlog
* **Dark Mode propagation**: Propagate the `.dark` selector class to all portal screens (Target: v1.2).
* **Extended Screen Reader testing**: Run VoiceOver/NVDA validation scans on complex forms (Target: v1.1.1).
* **Drag-and-Drop extensions**: Extend file upload states with active queue previews (Target: v1.2).

---

## 16. Completed Migration Batches
* **Batch 1 (Core Foundations)**: Button, Badge, and `cn` utils.
* **Batch 2 (Basic Form Controls)**: Input, Textarea, Checkbox, Select, Switch, RadioGroup.
* **Batch 3 (Interactive Overlays)**: Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu.
* **Batch 4 (Display & Data Structures)**: Card, Avatar, Skeleton, Table, Form.
* **Batch 5 (Layout & Workspace Portals)**: Breadcrumb, Pagination, PageLayout, WorkspaceLayout, Portal Layouts/Dashboards.

---

## 17. Future Improvements
Enable tenant branding switches by mapping Tailwind configuration colors to custom CSS variables, allowing dynamic golden yellow highlights to adapt to business partner colors.
