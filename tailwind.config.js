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
