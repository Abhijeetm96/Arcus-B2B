# 📊 ARCUS UI Audit Report

This report presents the scanned findings on styling inconsistencies and raw class references.

---

## 1. Scan Findings
* **Scanned Files**: 65 frontend component files.
* **Inline Style Attributes**: **29 instances** of inline `style={{...}}` found (mainly for icon settings, progress bars, and custom color chips).
* **Hardcoded Hexadecimal Colors**: **1,799 instances** of custom color strings (e.g. `border-[#E9ECEF]`, `bg-[#F8F9FA]`, `text-[#6C757D]`).
* **Custom Border Radii**: **125 instances** of arbitrary corner values (e.g. `rounded-[24px]`, `rounded-[12px]`, `rounded-[32px]`).

---

## 2. Inconsistencies Identified
1. **Raw Gray Hex Colors**: Codebase has multiple raw grays (`#E9ECEF`, `#F8F9FA`, `#6C757D`) instead of standard tailwind grays.
2. **Buttons Styles**: Custom button tags are styled in-place with raw margins instead of using a button class.
