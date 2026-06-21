# 🎨 ARCUS Design System

ARCUS utilizes a modern, visually striking design system based on dynamic HSL tokens, premium micro-animations, and modular typography.

## 🌈 Color Palette

Managed globally in `src/index.css` using HSL CSS variables:
- **Base Background**: White `#FFFFFF` / Dark `#0A0A0A`
- **Primary Brand Accent**: Warm Amber Gold (`--primary-brand-accent`: `hsl(45, 100%, 50%)`)
- **Secondary Accent**: Charcoal (`--secondary-accent`: `hsl(210, 10%, 23%)`)
- **Neutral Soft**: Light grey border details (`hsl(210, 15%, 95%)`)

---

## 📐 Typographic Scaling

Utilizes the **Inter** and **Outfit** font families, loaded via Google Fonts:
- **Display Headings**: Large sizes (36px - 56px) with heavy weights (extrabold) and tight tracking.
- **Section Headings**: Styled with `font-headline-h2` and letter spacing filters.
- **Micro Labels**: Styled with uppercase caps `font-label-caps` and wide tracking.

---

## ✨ Micro-Animations & Effects

- **Hover Shifts**: Interactive elements scale and transition using smooth ease curves.
- **Pulsing Accents**: Real-time status lights and mapping nodes pulse gently using keyframes.
- **Glassmorphism panels**: Soft background blurs and border glows used on pricing matrices and modal dashboards.
