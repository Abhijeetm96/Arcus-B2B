/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary-fixed": "#1c1b1b",
        "on-primary": "#ffffff",
        "error-container": "#ffdad6",
        "on-primary-fixed": "#261a00",
        "on-error": "#ffffff",
        "inverse-primary": "#fabd00",
        "secondary-fixed-dim": "#c8c6c5",
        "on-tertiary-fixed": "#1b1b1c",
        "on-tertiary-container": "#565555",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e2e2e2",
        "primary-fixed-dim": "#fabd00",
        "on-secondary-container": "#656464",
        "inverse-on-surface": "#f1f1f1",
        "surface-container-high": "#e8e8e8",
        "on-primary-container": "#6d5100",
        "secondary": "#5f5e5e",
        "on-surface": "#1a1c1c",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "surface-tint": "#785900",
        "on-surface-variant": "#4f4632",
        "primary-fixed": "#ffdf9e",
        "tertiary-fixed": "#e5e2e1",
        "background": "#f9f9f9",
        "on-error-container": "#93000a",
        "on-background": "#1a1c1c",
        "outline": "#827660",
        "inverse-surface": "#2f3131",
        "secondary-fixed": "#e5e2e1",
        "error": "#ba1a1a",
        "on-primary-fixed-variant": "#5b4300",
        "on-tertiary-fixed-variant": "#474746",
        "surface-container-low": "#f3f3f3",
        "secondary-container": "#e5e2e1",
        "tertiary-container": "#cdcaca",
        "primary-container": "#ffc107",
        "on-secondary-fixed-variant": "#474646",
        "primary": "#785900",
        "surface-dim": "#dadada",
        "surface-container-highest": "#e2e2e2",
        "surface-bright": "#f9f9f9",
        "outline-variant": "#d4c5ab",
        "tertiary-fixed-dim": "#c8c6c5",
        "surface-container": "#eeeeee",
        "tertiary": "#5f5e5e",
        "surface": "#f9f9f9"
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1.0rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "8px",
        "5xl": "96px",
        "lg": "16px",
        "md": "12px",
        "xxl": "32px",
        "xl": "24px",
        "4xl": "64px",
        "3xl": "48px",
        "xs": "4px"
      },
      fontFamily: {
        "body-sm": ["Inter", "sans-serif"],
        "headline-h2": ["Poppins", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-h1-mobile": ["Poppins", "sans-serif"],
        "headline-h1": ["Poppins", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "headline-h3": ["Poppins", "sans-serif"]
      },
      fontSize: {
        "body-sm": ["14px", { "lineHeight": "140%", "fontWeight": "500" }],
        "headline-h2": ["48px", { "lineHeight": "120%", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "150%", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "160%", "fontWeight": "400" }],
        "headline-h1-mobile": ["40px", { "lineHeight": "110%", "fontWeight": "800" }],
        "headline-h1": ["64px", { "lineHeight": "110%", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "label-caps": ["12px", { "lineHeight": "100%", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-h3": ["32px", { "lineHeight": "120%", "fontWeight": "700" }]
      }
    }
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
