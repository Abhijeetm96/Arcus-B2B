# 📚 ARCUS Component Catalog

The following core components have been implemented and reside under `src/components/`:

---

### 1. Button (`src/components/ui/Button.tsx`)
* **Purpose**: Triggers click actions.
* **Variants**:
  * `primary`: Gold background, black text.
  * `secondary`: Dark gray background, white text.
  * `outline`: Transparent, border outline.
  * `danger`: Crimson warning highlight.
* **States**: Normal, Hover, Loading, Disabled.

---

### 2. Input & Textarea (`src/components/ui/Input.tsx`)
* **Purpose**: Capture text parameters.
* **Props**: `label`, `error`, `required`.
* **State**: Displays red outline and detailed label when an error is passed.

---

### 3. Badge (`src/components/ui/Badge.tsx`)
* **Purpose**: Displays small labels, status indicators, and counters.
* **Variants**: `default`, `secondary`, `success` (Completed), `warning` (Negotiation), `danger` (Cancelled), `info` (Assigned).

---

### 4. Card & MetricCard (`src/components/shared/Card.tsx`)
* **Purpose**: Displays dashboard KPI summaries.
* **Props**: `title`, `value`, `trend` (isPositive flag), `icon`.
