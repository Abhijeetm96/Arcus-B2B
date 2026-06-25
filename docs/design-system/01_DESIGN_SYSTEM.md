# 01_DESIGN_SYSTEM — ARCUS Design System Bible

## Document Metadata
* **Title**: ARCUS Enterprise Design System 
* **Purpose**: Defines the official visual design language, styling tokens, brand principles, and responsive layout rules for the ARCUS procurement platform.
* **Version**: v1.0
* **Status**: Approved / Living Document
* **Last Updated**: 2026-06-26
* **Maintainer**: Lead Brand Designer / Principal UI Engineer
* **Related Documents**:
  - [02_COMPONENT_LIBRARY.md](file:///d:/Claude%20Code/Arcus/docs/design-system/02_COMPONENT_LIBRARY.md)
  - [03_MIGRATION_AND_STANDARDS.md](file:///d:/Claude%20Code/Arcus/docs/design-system/03_MIGRATION_AND_STANDARDS.md)
* **Estimated Reading Time**: 15 minutes

---

## Revision History
| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-26 | Antigravity AI | Initial consolidation and unification of brand tokens, layout structures, and accessibility guides. |

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Design Philosophy](#2-design-philosophy)
3. [Brand Identity](#3-brand-identity)
4. [Color Palette](#4-color-palette)
5. [Typography](#5-typography)
6. [Icons](#6-icons)
7. [Spacing System](#7-spacing-system)
8. [Border Radius](#8-border-radius)
9. [Shadows](#9-shadows)
10. [Elevation](#10-elevation)
11. [Motion & Animations](#11-motion--animations)
12. [Design Tokens](#12-design-tokens)
13. [Theme Variables](#13-theme-variables)
14. [Responsive Design](#14-responsive-design)
15. [Accessibility](#15-accessibility)
16. [UI Principles](#16-ui-principles)
17. [Dashboard Design Rules](#17-dashboard-design-rules)
18. [Workspace Design Rules](#18-workspace-design-rules)
19. [Mobile Design Rules](#19-mobile-design-rules)
20. [Future Design Roadmap](#20-future-design-roadmap)

---

## 1. Executive Summary
The ARCUS Design System provides a unified visual language and strict interface guidelines to ensure all user portals—Admin, Business, Professional, and Individual—deliver a consistent, professional, and enterprise-grade SaaS experience. By defining design tokens and structural layout standards, we eliminate arbitrary styling variations and establish a single source of truth for the platform.

---

## 2. Design Philosophy
Our visual design centers on **solidity, clarity, and trust**. Construction procurement transactions represent high-value investments; the user interface must reflect this importance by prioritizing high-contrast data readability, predictable layouts, and responsive feedbacks.

---

## 3. Brand Identity
The ARCUS identity stands on three major pillars:
* **Industrial Confidence**: Strong grays and heavy grid outlines inspired by premium machinery brands (Caterpillar, JCB).
* **Premium Precision**: Vibrant golden-yellow highlights representing accuracy, quality, and high value.
* **Operational Speed**: Clean layouts with minimal borders and subtle shadows to emphasize fast loading and fast execution.

---

## 4. Color Palette
The color hierarchy is divided into semantic mappings:
* **Primary Brand Accent**: Gold (`#fabd00` / `var(--primary)`). Highlight color for actions, focuses, selections, and primary states.
* **Secondary Action**: Slate Grey (`var(--secondary)`). Supporting color for secondary triggers.
* **Surfaces**: Canvas White (`#ffffff` / `var(--surface)`) in light mode and Dark Slate (`#121212` / `var(--background)`) in dark mode.
* **Semantic Feedback States**:
  - **Success**: Emerald Green (`#10b981` / `var(--success)`) for completed, verified, or approved states.
  - **Warning**: Amber Orange (`#f59e0b` / `var(--warning)`) for active bidding, pending actions, and warning labels.
  - **Danger**: Crimson Red (`#ef4444` / `var(--danger)`) for rejected, cancelled, or error states.

---

## 5. Typography
To preserve structural legibility:
* **Headers**: `Poppins` (Weights: 700 bold, 800 black). Bold headings reflect an industrial profile.
* **Body & Data**: `Inter` (Weights: 400 regular, 500 medium, 600 semi-bold). Optimized for readable tables and grid lists.
* **Size Scale**:
  - **H1 Display**: `64px` (`line-height: 110%`) - Public landing hero titles.
  - **H2 Page Title**: `24px` (`line-height: 120%`) - Screen header titles.
  - **H3 Section Title**: `18px` (`line-height: 120%`) - Card container titles.
  - **Body Text**: `14px` (`line-height: 150%`) - Data grids, detail descriptions.
  - **Caption / Label**: `12px` (`line-height: 100%`) - Form input helper text and tag metadata.

---

## 6. Icons
* **Library**: `lucide-react` is the official and exclusive icon library.
* **Sizing Rules**:
  - Standard inside buttons/labels: `h-4 w-4` (16px).
  - Page/Card header icons: `h-5 w-5` (20px).
  - Big Empty States placeholders: `h-12 w-12` (48px).

---

## 7. Spacing System
Grid margins, paddings, and column offsets are calculated relative to our 4px spacing scale:
* **`4px`** (`space-xs`): Sub-element margins, input header-label offset.
* **`8px`** (`space-sm`): Gaps between inline buttons, tags spacing inside lists.
* **`12px`** (`space-md`): Small padding inside text areas, badge margins.
* **`16px`** (`space-lg`): Default layout padding inside cards, flex lists.
* **`24px`** (`space-xl`): Standard outer page padding (`p-6`), workspace grid margins (`gap-6`).
* **`32px`** (`space-xxl`): Desktop workspace gutters (`p-8`), major container margin gaps.

---

## 8. Border Radius
* **Standard Corners**: Cards, inputs, buttons, and dialog blocks are constrained to a clean, standardized **`rounded`** corner radius (`0.25rem` / `4px`).
* **Circular**: Avatars and badges use `rounded-full`.
* **Prohibited**: Avoid using large rounded values (`rounded-lg`, `rounded-xl`, `rounded-2xl`) which conflict with the industrial aesthetic.

---

## 9. Shadows
* **Elevation Style**: Shadows must be minimal to ensure a fast, flat dashboard layout.
* **Standard Token**: Use `shadow-sm` or `shadow` only. Heavy shadows (`shadow-lg`, `shadow-xl`) are forbidden in presentation layout blocks.

---

## 10. Elevation
Visual levels are strictly managed by borders and background offsets:
* **Base Canvas**: Global grey background (`var(--background)`).
* **Card/Table Layer**: White/Dark surface container (`var(--surface)` / `border border-border`).
* **Popovers & Overlays**: Floating popovers (`var(--popover)`) with subtle shadows.

---

## 11. Motion & Animations
* **Transitions**: Interactive hover and focus elements should transition smoothly using standard durations.
* **Tokens**: `transition-all duration-200 ease-in-out` on buttons, link anchors, and side sheet toggles.
* **Spinners**: Loading state triggers must utilize standard Lucide `<Loader2>` spinning indicators.

---

## 12. Design Tokens
All UI variables must resolve to semantic design tokens inside Tailwind CSS:
* **Color Accent**: `bg-primary`, `text-primary-foreground`.
* **Standard Backgrounds**: `bg-surface`, `bg-background`.
* **Fonts**: `font-heading` (`Poppins`), `font-body` (`Inter`).
* **Borders**: `border-border`.

---

## 13. Theme Variables
Theme variables are configured as CSS custom variables within `src/index.css` and mapped to Tailwind's configuration (`tailwind.config.js`):
```css
:root {
  --primary: 45 100% 49%; /* #fabd00 */
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

---

## 14. Responsive Design
* **Breakpoint Grid**: Columns and spacing scale dynamically:
  - **KPI Metrics**: 4 columns on desktop (`lg:grid-cols-4`), 2 columns on tablet (`sm:grid-cols-2`), 1 column on mobile (`grid-cols-1`).
  - **Tables**: Large tables must wrap within responsive horizontal containers (`overflow-x-auto`) to prevent screen clipping.
  - **Sidebars**: Desktop sidebar columns (`w-64`) transition to absolute slide-out sheets on screens smaller than 768px.

---

## 15. Accessibility
We enforce strict compliance with **WCAG 2.1 AA** standards:
* **Focus Outlines**: Active input fields, buttons, and anchors must expose keyboard outlines (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
* **Keyboard Navigation**: Radix-powered components (dialogs, side drawers, dropdowns) must trap keyboard focus and allow closing with the `Escape` key.
* **Aria Tags**: Use semantic tags and properties (e.g., `aria-describedby` for field errors, `aria-required` for fields).

---

## 16. UI Principles
1. **One Page, One Purpose**: Focus each page on one primary task or workflow.
2. **Three-Click Workflows**: Crucial transactions (e.g., submitting an RFQ, accepting a quote) must be achievable within 3 clicks.
3. **Prefer Drawers Over Modals**: Use side drawers/sheets instead of dialog modals to preserve context.
4. **Data Tables Standard**: Tabular screens must support searching, filtering, and paging.

---

## 17. Dashboard Design Rules
All dashboards must trace a standard vertical layout flow:
`PageLayout` $\rightarrow$ `Breadcrumbs` $\rightarrow$ `PageHeader` $\rightarrow$ `KPI metric grid` $\rightarrow$ `Content Workspace (Table/Form)` $\rightarrow$ `Pagination`.

---

## 18. Workspace Design Rules
Split-pane workspaces (e.g., `WorkspaceLayout.tsx`) must place filters, search boxes, and metadata lists on the left pane/toolbar, with primary detail content occupying the main central workspace.

---

## 19. Mobile Design Rules
Ensure mobile screens collapse gracefully:
* Large display headers collapse to standard titles.
* Side navigation menus are hidden behind hamburger toggles that slide open drawer overlays.
* Padding drops to `p-4` to maximize canvas real estate.

---

## 20. Future Design Roadmap
* **v1.2 Dark Mode**: Extend theme class selectors (`.dark`) and custom dark variables across all dashboard portals.
* **Tenant Themes**: Implement dynamic color tokens using custom CSS properties to allow logo and branding adaptation for partner builders.
