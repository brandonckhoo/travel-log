import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-subtle": "var(--color-surface-subtle)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        ink: "var(--color-text)",
        "ink-2": "var(--color-text-secondary)",
        "ink-3": "var(--color-text-muted)",
        "accent-blush": "var(--color-accent-blush)",
        "accent-lavender": "var(--color-accent-lavender)",
        "accent-sage": "var(--color-accent-sage)",
        "accent-sky": "var(--color-accent-sky)",
        "accent-peach": "var(--color-accent-peach)",
        "accent-rose": "var(--color-accent-rose)",
        primary: "var(--color-primary)",
      },
      borderRadius: {
        pill: "9999px",
        "2xl": "20px",
        "3xl": "28px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        card: "0 2px 8px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
