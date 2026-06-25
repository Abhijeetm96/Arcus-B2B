# 🗂️ ARCUS Documentation Master Index

Welcome to the ARCUS project documentation index. This document serves as the navigation hub for developers to understand the project structure, design guidelines, coding standards, and deployment logs.

---

## 1. Core Documentation Entry Points

Before working on any feature or refactoring existing modules, please review:
1. [START_HERE.md](file:///d:/Claude%20Code/Arcus/START_HERE.md) — Developer onboarding, local environment setup, and portal launch guidelines.
2. **This Master Index** — Your map to locating technical architecture and design rules.
3. [PROJECT_BRAIN.md](file:///d:/Claude%20Code/Arcus/docs/PROJECT_BRAIN.md) — The comprehensive engineering logs and complete repository roadmap.

---

## 2. Directory Architecture Map

The documentation folder structure is organized by concerns:

### 📁 `docs/architecture/`
Contains system designs, database schemas, and architectural decision records (ADRs).
* [ARCHITECTURE.md](file:///d:/Claude%20Code/Arcus/docs/architecture/ARCHITECTURE.md) — High-level backend and database orchestration.
* [UI_ARCHITECTURE.md](file:///d:/Claude%20Code/Arcus/docs/architecture/UI_ARCHITECTURE.md) — React rendering flow and frontend boundaries.
* [DEPENDENCY_RULES.md](file:///d:/Claude%20Code/Arcus/docs/architecture/DEPENDENCY_RULES.md) — Layered dependency limits for component imports.
* [DATABASE.md](file:///d:/Claude%20Code/Arcus/docs/architecture/DATABASE.md) & [ERD.md](file:///d:/Claude%20Code/Arcus/docs/architecture/ERD.md) — PostgreSQL table mappings and entity relationships.

### 📁 `docs/design-system/`
Holds the living documents for all presentation layers.
* [01_DESIGN_SYSTEM.md](file:///d:/Claude%20Code/Arcus/docs/design-system/01_DESIGN_SYSTEM.md) — **The Design Bible**. Tells developers and designers *how ARCUS should look* (tokens, colors, typography, layout rules).
* [02_COMPONENT_LIBRARY.md](file:///d:/Claude%20Code/Arcus/docs/design-system/02_COMPONENT_LIBRARY.md) — **The Component Catalog**. Explains *how developers should build UI* (prop matrices, wrappers usage, examples, accessibility).
* [03_MIGRATION_AND_STANDARDS.md](file:///d:/Claude%20Code/Arcus/docs/design-system/03_MIGRATION_AND_STANDARDS.md) — **The Engineering Reference**. Defines *how ARCUS should evolve* (folder structure, naming conventions, coding standards, upgrade processes).

### 📁 `docs/reports/`
Historical audit records and migration validation metrics. These are snapshots in time and remain separate from living documentation.
* `audits/` — Automated security and documentation scans.
* `github/` — Verification details for version control branches.
* `health/` — Issue logs and context health checklists.
* `migration/` — Verification reports for completed batches (e.g. `SHADCN_INSTALLATION_REPORT.md`).
* `validation/` — Integrity validation checks for business logic databases.

### 📁 `docs/development/`
Developer productivity resources and release workflows.
* [AI_GUIDELINES.md](file:///d:/Claude%20Code/Arcus/docs/development/AI_GUIDELINES.md) — Prompts guidelines for AI coding assistants.
* [TECHNICAL_DEBT.md](file:///d:/Claude%20Code/Arcus/docs/development/TECHNICAL_DEBT.md) — Known code smells and refactoring tickets backlog.
* [TESTING.md](file:///d:/Claude%20Code/Arcus/docs/development/TESTING.md) — Unit and integration tests pipelines.

---

## 3. Reference Flow Links

```
Onboarding (START_HERE.md)
           ↓
Understand System Structure (docs/design-system/DOCUMENTATION_INDEX.md)
           ↓
Explore Visual Styling (01_DESIGN_SYSTEM.md)
           ↓
Build UI Elements (02_COMPONENT_LIBRARY.md)
           ↓
Verify Coding Standards (03_MIGRATION_AND_STANDARDS.md)
```
