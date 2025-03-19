import animate from "tailwindcss-animate";
import { setupInspiraUI } from "@inspira-ui/plugins";

export default {
  darkMode: "selector",
  safelist: [
    'dark',
    // Badge background colors for soft variant
    'bg-yellow-50',
    'bg-green-50',
    'bg-blue-50',
    'bg-red-50',
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-red-500',
    // Dark mode variations
    'dark:bg-yellow-400',
    'dark:bg-green-400',
    'dark:bg-blue-400',
    'dark:bg-red-400',
    'dark:text-yellow-400',
    'dark:text-green-400',
    'dark:text-blue-400',
    'dark:text-red-400',
    'dark:bg-opacity-10'
  ],
  prefix: "",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,vue}",
    "./pages/**/*.{js,ts,jsx,tsx,vue}",
    "./app.vue",
    "./layouts/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        'display': ['Sorts Mill Goudy', 'serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },

  plugins: [animate, setupInspiraUI],
};
