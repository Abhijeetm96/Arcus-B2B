# Agentation Usage in ARCUS Project

## How to Add Agentation Globally

Agentation has been added globally to `src/App.tsx`:

### 1. Import Added
```tsx
import { Agentation } from 'agentation'
```

### 2. Component Added
```tsx
<Agentation />
```
Placed at the end of the App component, after `</Footer>` but before the closing fragment tag (`</>`).

## How to Use Agentation

1. Start development server: `npm run dev`
2. A toolbar appears in the bottom-right corner
3. Click toolbar to activate annotation mode
4. Click any element to:
   - See automatic CSS selector
   - Add notes/comments
   - View positioned annotations
5. Use toolbar controls for:
   - Selection modes (element/text/multi/area)
   - Animation pause
   - Copy structured output (markdown)
   - Dark/light mode toggle

## How to Remove Agentation

To completely remove Agentation from the project:

### 1. Remove the Import
Delete this line from `src/App.tsx`:
```tsx
import { Agentation } from 'agentation'
```

### 2. Remove the Component
Delete this line from `src/App.tsx`:
```tsx
<Agentation />
```

### 3. Optional: Remove Package
```bash
npm uninstall agentation
```
or
```bash
npm uninstall agentation -D
```

## Verification
After removal:
- The agentation toolbar will no longer appear
- No runtime overhead from the package
- Clean removal with no leftover configurations

## Current Status
✅ Agentation is currently installed globally in `src/App.tsx`
📦 Installed as dev dependency: `agentation@3.0.2`
📖 Documentation: See `node_modules/agentation/README.md` for full details