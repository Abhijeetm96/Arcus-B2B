# 📐 Layout Guidelines

Page layouts must be structured identically to provide a unified platform experience.

---

## 1. PageLayout Wrapper (`src/components/layout/PageLayout.tsx`)
The grid orchestration component splits screens as follows:
* **Sidebar Columns**: Width `16rem` (64 / 256px), bordered right, visible on tablet-desktop.
* **Content Container**: Padded with `1.5rem` (24px) padding, scaling to `2rem` (32px) on desktop.
* **Grids**: Use `grid-cols-4` for KPI metrics widgets, `grid-cols-1 lg:grid-cols-3` for sidebar workspaces.

---

## 2. Spacing Constraints
* **Section Gap**: Always `1.5rem` (`space-y-6`) between breadcrumb, headers, KPIs, and workspaces.
* **Row Gap**: Always `1rem` (`space-y-4`) inside list containers.
* **Form Field Gap**: Always `0.75rem` (`space-y-3`) between input rows.
