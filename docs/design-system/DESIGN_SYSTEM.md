# DESIGN_SYSTEM — ARCUS Design System Guide

## Document Metadata
* **Title**: ARCUS Design System Guide
* **Purpose**: Single authoritative source of truth for the ARCUS visual identity, design tokens, responsive layout rules, wrapper philosophy, and code standards.
* **Version**: v2.0
* **Status**: Approved / Living Document
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal UI Architect / Lead Brand Designer
* **Related Documents**:
  - [COMPONENT_REFERENCE.md](file:///d:/Claude%20Code/Arcus/docs/design-system/COMPONENT_REFERENCE.md)
* **Estimated Reading Time**: 20 minutes

---

## Revision History
| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-25 | Antigravity AI | First generation of foundational design guides. |
| v2.0 | 2026-06-26 | Antigravity AI | Final consolidation of visual guides, engineering standards, and roadmap items into a single master document. |

---

## Table of Contents
1. [Executive Summary & Design Philosophy](#1-executive-summary--design-philosophy)
2. [Brand Identity & Visual Language](#2-brand-identity--visual-language)
3. [Spacing System & Spacing Scale](#3-spacing-system--spacing-scale)
4. [Typography & Icons](#4-typography--icons)
5. [Color Palette & CSS Variables](#5-color-palette--css-variables)
6. [Border Radius, Shadows & Elevation](#6-border-radius-shadows--elevation)
7. [Motion & Animations](#7-motion--animations)
8. [Responsive Design & Breakpoints](#8-responsive-design--breakpoints)
9. [Accessibility (WCAG 2.1 AA)](#9-accessibility-wcag-2macro-aa)
10. [Layout & Navigation Guidelines](#10-layout--navigation-guidelines)
11. [Dashboard & Workspace Standards](#11-dashboard--workspace-standards)
12. [Form & Table Standards](#12-form--table-standards)
13. [Wrapper Philosophy & Division of Responsibilities](#13-wrapper-philosophy--division-of-responsibilities)
14. [Coding & Import Standards](#14-coding---import-standards)
15. [Upgrade & Update Workflows](#15-upgrade--update-workflows)
16. [Technical Debt, Backlog & Future Roadmap](#16-technical-debt-backlog--future-roadmap)

---

## 1. Executive Summary & Design Philosophy
The ARCUS Design System provides a unified visual language and strict interface guidelines to ensure all user portals—Admin, Business, Professional, and Individual—deliver a consistent, professional, and enterprise-grade SaaS experience.

Our visual design centers on **solidity, clarity, and trust**. Construction procurement transactions represent high-value investments; the user interface must reflect this importance by prioritizing high-contrast data readability, predictable layouts, and responsive feedbacks.

---

## 2. Brand Identity & Visual Language
The ARCUS identity stands on three major pillars:
* **Industrial Confidence**: Strong grays and heavy grid outlines inspired by premium machinery brands (Caterpillar, JCB).
* **Premium Precision**: Vibrant golden-yellow highlights representing accuracy, quality, and high value.
* **Operational Speed**: Clean layouts with minimal borders and subtle shadows to emphasize fast loading and fast execution.

---

## 3. Spacing System & Spacing Scale
Grid margins, paddings, and column offsets are calculated relative to our 4px spacing scale:
* **`4px`** (`space-xs`): Sub-element margins, input header-label offset.
* **`8px`** (`space-sm`): Gaps between inline buttons, tags spacing inside lists.
* **`12px`** (`space-md`): Small padding inside text areas, badge margins.
* **`16px`** (`space-lg`): Default layout padding inside cards, flex lists.
* **`24px`** (`space-xl`): Standard outer page padding (`p-6`), workspace grid margins (`gap-6`).
* **`32px`** (`space-xxl`): Desktop workspace gutters (`p-8`), major container margin gaps.

* **Spacing Constraints**:
  - **Section Gap**: Always `1.5rem` (`space-y-6`) between breadcrumb, headers, KPIs, and workspaces.
  - **Row Gap**: Always `1rem` (`space-y-4`) inside list containers.
  - **Form Field Gap**: Always `0.75rem` (`space-y-3`) between input rows.

---

## 4. Typography & Icons
To preserve structural legibility and establish a premium enterprise-grade visual rhythm, ARCUS enforces a standardized typography system.

### A. Font Families & Weights
* **Display & Headings**: `Poppins` (Weights: `700` Bold for Display/H1, `600` Semibold for H2/H3/H4). Bold headings reflect a strong industrial profile.
* **Body & UI Elements**: `Inter` (Weights: `400` Regular for body/captions, `500` Medium for labels/metadata, `600` Semibold for buttons/card titles).

### B. Typography Role Classifications

#### Category A — Fluid Typography (Using CSS clamp())
These tokens interpolate smoothly between mobile and desktop limits to ensure highly polished responsiveness:
* **Display XL**: `clamp(2.75rem, 2rem + 2vw, 3.75rem)` (Mobile: 44px, Desktop: 60px)
* **Display**: `clamp(2.375rem, 1.9rem + 1.6vw, 3rem)` (Mobile: 38px, Desktop: 48px)
* **H1**: `clamp(1.875rem, 1.6rem + 1vw, 2.25rem)` (Mobile: 30px, Desktop: 36px)
* **H2**: `clamp(1.625rem, 1.45rem + 0.7vw, 1.875rem)` (Mobile: 26px, Desktop: 30px)
* **H3**: `clamp(1.375rem, 1.3rem + 0.4vw, 1.5rem)` (Mobile: 22px, Desktop: 24px)

#### Category B — Fixed Typography (Never use clamp())
These tokens are locked to static sizes across all viewports to preserve dense enterprise portal information layouts:
* **H4**: Fixed at `20px`
* **Section**: Fixed at `18px`
* **Card Title**: Fixed at `16px`
* **Metric Value**: Fixed at `30px`
* **Metric Label**: Fixed at `12px`
* **Body Large**: Fixed at `18px`
* **Body**: Fixed at `16px`
* **Body Small**: Fixed at `14px`
* **Label**: Fixed at `14px`
* **Button**: Fixed at `14px`
* **Caption**: Fixed at `12px`
* **Overline**: Fixed at `11px`

This hybrid approach guarantees that core tabular, form, navigation, and workspace elements are completely stable while top-level view headings benefit from smooth scaling.

---

### C. Semantic Mappings

#### 1. Tables & Data Grids
- **Table Header**: `text-overline uppercase font-sans text-text-secondary`
- **Table Cell (Text)**: `text-body-sm font-sans text-text-primary`
- **Numeric Cell / Currency**: `text-body-sm font-sans font-medium font-mono text-text-primary`
- **Status Badge**: `text-overline font-sans font-bold uppercase`
- **Date / Timestamp**: `text-caption font-sans text-muted`
- **Actions Menu/Trigger**: `text-body-sm font-sans font-medium text-text-secondary`

#### 2. Forms & Inputs
- **Input Label**: `text-label font-sans text-text-primary`
- **Input Value / Typed Text**: `text-body font-sans text-text-primary`
- **Placeholder**: `text-body font-sans text-muted/60`
- **Helper / Description Text**: `text-caption font-sans text-muted`
- **Validation / Error Text**: `text-caption font-sans font-semibold text-danger`
- **Form Section Header**: `text-section font-sans text-text-primary`

#### 3. Layout Navigation
- **Sidebar Menu Item**: `text-body-sm font-sans font-medium text-sidebar-foreground`
- **Top Navbar Item**: `text-body-sm font-sans font-medium text-text-primary`
- **Breadcrumb**: `text-caption font-sans text-muted`
- **Tab Header (Active/Inactive)**: `text-body-sm font-sans font-semibold`
- **Pagination Controls**: `text-caption font-sans text-text-secondary`
- **Dropdown Menu Item**: `text-body-sm font-sans text-text-primary`

#### 4. Dashboard Metrics & KPI Cards
- **Metric Number (KPI)**: `text-metric-value font-sans font-bold`
- **Metric Label**: `text-metric-label font-sans font-medium text-text-secondary`
- **Trend Indicator**: `text-body-sm font-sans font-semibold text-success/danger`
- **Secondary Helper/Period**: `text-caption font-sans text-muted`

#### 5. RFQ Workspace
- **Workspace Title**: `text-h2 font-display text-text-primary`
- **Filter Bar Title**: `text-overline font-sans text-text-secondary`
- **Drawer / Details Panel Title**: `text-h3 font-display text-text-primary`
- **Approval Timeline Step**: `text-caption font-sans font-medium text-text-secondary`
- **Internal Note / Comment**: `text-body-sm font-sans text-text-secondary`
- **Attachment Row / Spec file**: `text-body-sm font-sans font-semibold text-primary-hover`

---

### D. Typography Design Tokens (CSS Custom Properties)
Exposed inside `src/index.css`:
- `--font-display-xl`
- `--font-display`
- `--font-h1`
- `--font-h2`
- `--font-h3`
- `--font-h4`
- `--font-section`
- `--font-card`
- `--font-metric`
- `--font-body-lg`
- `--font-body`
- `--font-body-sm`
- `--font-label`
- `--font-button`
- `--font-caption`
- `--font-overline`

---

### E. Constraints & Exceptions
* **No-Touch Modules**: Logo typography, marketing headings, hero landing copy, and brand visuals are preserved as-is. Standardizations apply exclusively to Dashboards, Business, Admin, workspaces, forms, tables, and internal pages.
* **Engineering Rule**: No component may define its own typography using arbitrary Tailwind `text-*` utilities or inline `font-size` values. All typography must consume the semantic typography tokens defined by the ARCUS Design System. Any exception must be documented and justified.

---

### F. Icons
* **Library**: `lucide-react` is the official and exclusive icon library.
* **Buttons / Labels**: `h-4 w-4` (16px).
* **Page/Card Headers**: `h-5 w-5` (20px).
* **Placeholders / Empty States**: `h-12 w-12` (48px).

---

## 5. Color Palette & CSS Variables
Theme variables are configured as CSS custom variables within `src/index.css` and mapped to Tailwind's configuration (`tailwind.config.js`):

```css
:root {
  --primary: 45 100% 49%; /* #fabd00 (Gold) */
  --background: 240 4.8% 95.9%;
  --surface: 0 0% 100%;
  --border: 240 5.9% 90%;
  --text-primary: 240 5.9% 10%;
  --text-secondary: 240 3.8% 46.1%;
  --success: 142.1 76.2% 36.3%;
  --warning: 38 92% 50%;
  --danger: 346.8 77.2% 49.8%;
}
```

No hardcoded hex values remain inside migrated dashboard folders. All colors must resolve to semantic tailwind variable classes (e.g. `bg-primary`, `bg-surface`, `border-border`).

---

## 6. Border Radius, Shadows & Elevation
* **Border Radius**: Cards, inputs, buttons, and dialog blocks are constrained to a clean, standardized **`rounded`** corner radius (`0.25rem` / `4px`). Avatars and badges use `rounded-full`. Prohibited: Avoid using large rounded values (`rounded-lg`, `rounded-xl`, `rounded-2xl`) which conflict with the industrial aesthetic.
* **Shadows**: Shadows must be minimal to ensure a fast, flat dashboard layout. Use `shadow-sm` or `shadow` only. Heavy shadows (`shadow-lg`, `shadow-xl`) are forbidden.
* **Elevation**: Visual levels are managed by borders and background offsets:
  - **Base Canvas**: Global grey background (`var(--background)`).
  - **Card/Table Layer**: White/Dark surface container (`var(--surface)` / `border border-border`).
  - **Popovers & Overlays**: Floating popovers (`var(--popover)`) with subtle shadows.

---

## 7. Motion & Animations
* **Transitions**: Interactive hover and focus elements transition smoothly using `transition-all duration-200 ease-in-out` on buttons, link anchors, and side sheet toggles.
* **Spinners**: Loading state triggers must utilize standard Lucide `<Loader2>` spinning indicators.

---

## 8. Responsive Design & Breakpoints
* **Columns Wrapping**:
  - **KPI Metrics**: 4 columns on desktop (`lg:grid-cols-4`), 2 columns on tablet (`sm:grid-cols-2`), 1 column on mobile (`grid-cols-1`).
  - **Tables**: Large tables must wrap within responsive horizontal containers (`overflow-x-auto`) to prevent screen clipping.
  - **Sidebars**: Desktop sidebar columns (`w-64`) transition to absolute slide-out sheets on screens smaller than 768px.

---

## 9. Accessibility (WCAG 2.1 AA)
We enforce strict compliance with **WCAG 2.1 AA** standards:
* **Focus Outlines**: Active input fields, buttons, and anchors must expose keyboard outlines (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
* **Keyboard Navigation**: Radix-powered components (dialogs, side drawers, dropdowns) must trap keyboard focus and allow closing with the `Escape` key.
* **Aria Tags**: Use semantic tags and properties (e.g., `aria-describedby` for field errors, `aria-required` for fields).

---

## 10. Layout & Navigation Guidelines
* **PageLayout Wrapper (`src/components/layout/PageLayout.tsx`)**:
  - **Sidebar Columns**: Width `16rem` (64 / 256px), bordered right, visible on tablet-desktop.
  - **Content Container**: Padded with `1.5rem` (24px) padding, scaling to `2rem` (32px) on desktop.
* **Double Navigation Headers**: Hide public homepage Navbars and Footers on any internal portal dashboard routes (e.g. `/admin`, `/business`, etc.) inside `src/App.tsx`.

---

## 11. Dashboard & Workspace Standards
* **Dashboard vertical flow**: `PageLayout` $\rightarrow$ `Breadcrumbs` $\rightarrow$ `PageHeader` $\rightarrow$ `KPI metric grid` $\rightarrow$ `Content Workspace (Table/Form)` $\rightarrow$ `Pagination`.
* **Workspace Design Rules**: Split-pane workspaces (e.g., `WorkspaceLayout.tsx`) must place filters, search boxes, and metadata lists on the left pane/toolbar, with primary detail content occupying the main central workspace.

---

## 12. Form & Table Standards
* **Form Spacing**: Fields separated by `space-y-4` or `space-y-6`.
* **Button Spacing**: Inside headers and action groups: `space-x-2` or `space-x-3`.
* **Typography Spacing**: Titles and subtitles separated by `space-y-1.5`.

---

## 13. Wrapper Philosophy & Division of Responsibilities
To ensure that the ARCUS Design System remains standard, maintainable, and upgradeable, we implement a **Strict Separation of Concerns** between generated base components and custom enterprise wrappers:

```
Consumer (Application Pages / Modules) 
        ↓
Wrapper Component (e.g., Button.tsx) [Custom brand styles, isLoading/error, compatibility layers]
        ↓
Base Component (e.g., button-base.tsx) [Pristine CLI output, structure styling]
        ↓
Radix UI / Headless Primitives
```

---

## 14. Coding & Import Standards
* **No Direct Base Imports**: Outside components are prohibited from importing directly from base components (e.g. `import { Button } from '@/components/ui/button-base'`). All imports must resolve through wrappers (`import { Button } from '@/components/ui/Button'`).
* **Path Aliases**: Prefer path aliases (`@/components/...`) over relative paths (`../../../components/...`) for deep workspace page files.
* **Verbatim Module Syntax**: Explicitly use the `type` keyword for type-only imports (e.g. `import { type ButtonProps } from "./Button"`).

---

## 15. Upgrade & Update Workflows
When installing new shadcn elements:
1. Rename any existing custom wrapper files to `*.tsx.temp`.
2. Generate base file: `npx shadcn@latest add <component> -y`.
3. Rename base file to `*-base.tsx`.
4. Create the new wrapper `*.tsx` incorporating custom logic from the temp file.
5. Compile and test, then delete the temp file.

---

## 16. Technical Debt, Backlog & Future Roadmap
* **Dark Mode propagation**: Propagate the `.dark` selector class to all portal screens (Target: v1.2).
* **Extended Screen Reader testing**: Run VoiceOver/NVDA validation scans on complex forms (Target: v1.1.1).
* **Drag-and-Drop extensions**: Extend file upload states with active queue previews (Target: v1.2).
* **Tenant Themes**: Implement dynamic color tokens using custom CSS properties to allow logo and branding adaptation for partner builders.
