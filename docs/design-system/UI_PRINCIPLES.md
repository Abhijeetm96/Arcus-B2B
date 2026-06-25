# 📜 ARCUS UI Principles

This document represents the constitution of the ARCUS user interface. Every component and screen refactoring must adhere to these guidelines.

---

## 1. Core Principles

1. **One Page, One Purpose**: Avoid cluttered screens. Limit each workspace page to one primary task.
2. **Three-Click Workflows**: The user must be able to reach any high-impact operation (e.g. checkout, posting RFQ, reviewing quotation) in three clicks or less.
3. **Prefer Drawers Over Modals**: Modals block context. For secondary details, status modifications, or log reviews, prefer side sheets/drawers.
4. **Data Tables Standard**: Every tabular workspace must implement sorting, search queries, filter bars, pagination, and multi-selection check grids.
5. **Timeline and History**: Every business transaction object (RFQs, Quotes, Orders) must support a chronological vertical timeline logging status changes.
6. **No Arbitrary Styles**: Never use raw inline styles or custom hex colors. Always reference semantic tokens.
