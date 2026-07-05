# ARCUS Enterprise Error Messaging & Copywriting Guidelines (v1.0)

This document establishes the official standards for writing and placing user-facing feedback, validation warnings, errors, and system status messages across the ARCUS platform.

---

## 1. Tone of Voice & Copywriting Standards

Every piece of feedback in ARCUS must be:
- **Helpful**: Tell the user what they can do next to recover or proceed.
- **Human**: Use warm, polite, and direct phrasing. Avoid dry, robotic, or blame-oriented terminology.
- **Professional**: Represent ARCUS as an enterprise-grade platform. Never use slang, excessive exclamation marks, or informal remarks.
- **Technical-Free**: Never expose database names, table fields, SQL queries, UUIDs, stack traces, HTTP codes, or code exception names to end users.

### Do's and Don'ts

| Incorrect (Robotic / Accusatory) | Correct (Actionable / Helpful) |
| :--- | :--- |
| `❌ Invalid Input` | `✅ Please enter a valid email address, for example name@example.com.` |
| `❌ Failed to save quotation: null_violation` | `✅ We couldn't save your quotation draft. Please review the highlighted fields and try again.` |
| `❌ Network Error` | `✅ We couldn't connect to the server. Please check your internet connection and try again.` |
| `❌ Failed to fetch` | `✅ The server is temporarily unavailable. We're trying to reconnect automatically.` |
| `❌ Error 500: Database connection crashed` | `✅ Something went wrong on our side. Please try again shortly.` |

---

## 2. API Layer Centralized Error Mapping

All API endpoints must normalize status codes into friendly messages:

| HTTP Status | User Message | Rationale |
| :--- | :--- | :--- |
| **401** | `Invalid email or password.` | Direct, clear credentials verification alert. |
| **403** | `You don't have permission to perform this action.` | Polite authority limit block. |
| **404** | `We couldn't find what you're looking for.` | Simple, friendly resource mismatch feedback. |
| **409** | `This record already exists.` | Clear duplicate checking feedback. |
| **422** | `Please correct the highlighted fields.` | Form validation wrapper. |
| **429** | `Too many requests. Please wait a moment and try again.` | Rate-limiting safety warning. |
| **500** | `Something went wrong on our side. Please try again shortly.` | Masks server stack crashes. |
| **503** | `The service is temporarily unavailable.` | Indicates maintenance or temporary outage. |
| **Offline** | `No internet connection detected.` | Clear connectivity check. |

---

## 3. Message Placement Strategy

- **Field Validation Errors**: Must render **directly below** the specific input field. Never display single-field validation inside global toasts.
- **Page Load Failures**: Render a **centered inline banner/panel** on the page containing a **Retry** action button. Never leave the user with an empty screen or a floating toast.
- **System Outages**: Trigger the persistent **Header Banner** indicating server/database reconnect attempts.
- **On-Demand Operations**: Use transient **Toasts** for successful actions (e.g. "Quotation created successfully.").
- **Destructive Decisions**: Always confirm deletion, logout, or resets via a **ConfirmDialog**.

---

## 4. Form Validation Standards

All input forms must satisfy the following validation UX rules:
1. **Highlight**: Apply a high-contrast border color (e.g. red-500) to the invalid input element.
2. **Helper Text**: Render the specific message in red text directly below the highlighted element.
3. **Auto-Scroll**: On submit failure, automatically scroll the window/modal to the first invalid field.
4. **Auto-Focus**: Focus the first invalid field immediately so the user can begin typing.

### Code Pattern Example (React)
```tsx
const handleSubmit = (e) => {
  e.preventDefault();
  const firstErrorField = document.querySelector('.input-error');
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (firstErrorField as HTMLElement).focus();
  }
};
```

---

## 5. Reusable Empty States

Do not render empty text blocks (e.g. "No Data"). Follow this template:
1. **Context Icon**: Visual symbol representing the empty category.
2. **Descriptive Title**: State what category is empty.
3. **Helpful Subtitle**: Explain why it is empty or what filters to edit.
4. **Primary Recovery Action**: Provide a button (e.g. "Clear Filters", "+ Add Item").

### Example Wording
- **RFQ Workspace Empty State**:
  - *Title*: `No RFQs match your current filters`
  - *Subtitle*: `Try changing your status criteria or search terms, or create a new procurement request.`
  - *Button*: `Reset Filters`
