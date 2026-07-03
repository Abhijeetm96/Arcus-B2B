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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          foreground: "var(--secondary-foreground)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          secondary: "var(--surface-secondary)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        muted: "var(--muted)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        focus: "var(--focus)",
        disabled: "var(--disabled)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
        },
        hover: "var(--hover)",
        selected: "var(--selected)",
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
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
        // Compatibility Aliases
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
        // ARCUS Typography System Semantic scale (Hybrid Enterprise Scale)
        "display-xl": ["60px", { "lineHeight": "110%", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "display": ["48px", { "lineHeight": "110%", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "h1": ["36px", { "lineHeight": "120%", "fontWeight": "700" }],
        "h2": ["30px", { "lineHeight": "120%", "fontWeight": "600" }],
        "h3": ["24px", { "lineHeight": "120%", "fontWeight": "600" }],
        "h4": ["20px", { "lineHeight": "120%", "fontWeight": "600" }],
        "section-title": ["18px", { "lineHeight": "120%", "fontWeight": "600" }],
        "card-title": ["16px", { "lineHeight": "120%", "fontWeight": "600" }],
        "metric-value": ["30px", { "lineHeight": "120%", "fontWeight": "700" }],
        "metric-label": ["12px", { "lineHeight": "140%", "fontWeight": "500" }],
        "body-lg": ["18px", { "lineHeight": "150%", "fontWeight": "400" }],
        "body": ["16px", { "lineHeight": "150%", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "150%", "fontWeight": "400" }],
        "label": ["14px", { "lineHeight": "150%", "fontWeight": "500" }],
        "button": ["14px", { "lineHeight": "100%", "letterSpacing": "0.02em", "fontWeight": "600" }],
        "caption": ["12px", { "lineHeight": "140%", "letterSpacing": "0.01em", "fontWeight": "400" }],
        "overline": ["11px", { "lineHeight": "140%", "letterSpacing": "0.05em", "fontWeight": "600" }],

        // Legacy Compatibility Keys (Standardized to Hybrid Scale values)
        "body-md": ["16px", { "lineHeight": "150%", "fontWeight": "400" }],
        "headline-h2": ["30px", { "lineHeight": "120%", "fontWeight": "600" }],
        "headline-h1-mobile": ["28px", { "lineHeight": "120%", "fontWeight": "700" }],
        "headline-h1": ["60px", { "lineHeight": "110%", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-caps": ["11px", { "lineHeight": "140%", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-h3": ["24px", { "lineHeight": "120%", "fontWeight": "600" }]
      }
    }
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
