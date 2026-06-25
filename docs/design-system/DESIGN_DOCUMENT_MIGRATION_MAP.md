# 🗺️ Design Document Migration Map

This document maps all original, fragmented design documentation files to their consolidated location in the new enterprise documentation architecture.

---

## 1. Migration Mapping Matrix

| Original File | Master Target Document | Target Chapter / Section | Status |
| :--- | :--- | :--- | :--- |
| `ARCUS_DESIGN_SYSTEM.md` | `01_DESIGN_SYSTEM.md` | Chapters 1 (Summary), 2 (Philosophy), 3 (Brand), 17 (Dashboards), 18 (Workspaces), 19 (Mobile) | Archived & Obsolete |
| `DESIGN_TOKENS.md` | `01_DESIGN_SYSTEM.md` | Chapters 4 (Colors), 7 (Spacing), 8 (Borders), 9 (Shadows), 10 (Elevation), 12 & 13 (Tokens) | Archived & Obsolete |
| `TYPOGRAPHY_GUIDE.md` | `01_DESIGN_SYSTEM.md` | Chapter 5 (Typography) | Archived & Obsolete |
| `LAYOUT_GUIDELINES.md` | `01_DESIGN_SYSTEM.md` & `02_COMPONENT_LIBRARY.md` | Chapter 7 & 18 (Doc 1), PageLayout Specification (Doc 2) | Archived & Obsolete |
| `UI_PRINCIPLES.md` | `01_DESIGN_SYSTEM.md` | Chapter 16 (UI Principles) | Archived & Obsolete |
| `COMPONENT_CATALOG.md` | `02_COMPONENT_LIBRARY.md` | Section 2 (Component Specifications Index) | Archived & Obsolete |
| `WRAPPER_GUIDELINES.md` | `02_COMPONENT_LIBRARY.md` & `03_MIGRATION_AND_STANDARDS.md` | Section 2 (Doc 2 - Props & Wrappers), Chapters 2, 5, 13 (Doc 3 - Philosophy, Conventions, Workflows) | Archived & Obsolete |
| `MIGRATION_PLAN.md` | `03_MIGRATION_AND_STANDARDS.md` | Chapters 1 (Migration History), 16 (Milestones) | Archived & Obsolete |
| `DESIGN_SYSTEM_BACKLOG.md` | `03_MIGRATION_AND_STANDARDS.md` | Chapter 15 (Technical Debt & Backlog) | Archived & Obsolete |
| `DesignSystemChangelog.md` | `03_MIGRATION_AND_STANDARDS.md` | Chapter 1 (Revision Log) | Archived & Obsolete |
| `DEPENDENCY_RULES.md` (from `docs/architecture/`) | `03_MIGRATION_AND_STANDARDS.md` | Chapter 3 (Dependency Rules) | Archived & Obsolete |
| `UI_METRICS.md` | `01_DESIGN_SYSTEM.md` & `03_MIGRATION_AND_STANDARDS.md` | Chapter 12 (Doc 1 - Tokens), Chapter 16 (Doc 3 - Component scorecards) | Archived & Obsolete |
| `DESIGN_SYSTEM_VERIFICATION_SUMMARY.md` | `03_MIGRATION_AND_STANDARDS.md` | Chapter 16 (Validation summaries) | Archived & Obsolete |

---

## 2. Retention Status

* **Historical Reports**: All files in `docs/reports/` and `docs/design-system/reports/` remain untouched.
* **ADRs & Architecture**: Technical database diagrams and structural ADRs inside `docs/architecture/` (excluding the merged `DEPENDENCY_RULES.md`) remain untouched.
* **Brain & Onboarding**: `PROJECT_BRAIN.md` and `START_HERE.md` remain untouched.
