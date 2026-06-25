# 🛠️ Remaining UI Issues Report

Known technical debts and components pending migration:

---

## 1. Portal Migration Debt
* The primary dashboard layouts inside `src/modules/admin/`, `src/modules/business/`, and `src/modules/professional/` are scheduled for refactoring in Phase 5 to use the centralized `PageLayout` component.
* Static visual components in some legacy files (e.g. `Checkout.tsx`, `ServicesHub.tsx`) still use inline margins which will be refactored to standard spacing.
