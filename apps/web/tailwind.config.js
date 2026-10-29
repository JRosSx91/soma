/** Space-separated RGB channels. Enables bg-soma-action/40 in Tailwind 3. */
const channel = (cssVariable) => `rgb(var(${cssVariable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        soma: {
          "bg-base": "var(--soma-bg-base)",
          "bg-surface": "var(--soma-bg-surface)",
          "bg-elevated": "var(--soma-bg-elevated)",
          "fg-primary": "var(--soma-fg-primary)",
          "fg-secondary": "var(--soma-fg-secondary)",
          "fg-muted": "var(--soma-fg-muted)",
          "border-subtle": "var(--soma-border-subtle)",
          "border-default": "var(--soma-border-default)",
          "organ-damaged": "var(--soma-organ-damaged)",
          "organ-mid": "var(--soma-organ-mid)",
          "organ-healthy": "var(--soma-organ-healthy)",
          accent: "var(--soma-accent-default)",
          "accent-hover": "var(--soma-accent-hover)",
          "accent-focus": "var(--soma-accent-focus)",
          "confidence-high": "var(--soma-confidence-high)",
          "confidence-medium": "var(--soma-confidence-medium)",
          "confidence-low": "var(--soma-confidence-low)",
          canvas: channel("--soma-canvas"),
          surface: channel("--soma-surface"),
          raised: channel("--soma-raised"),
          ink: channel("--soma-ink"),
          "ink-secondary": channel("--soma-ink-secondary"),
          "ink-muted": channel("--soma-ink-muted"),
          line: channel("--soma-line"),
          "line-strong": channel("--soma-line-strong"),
          action: channel("--soma-action"),
          "action-hover": channel("--soma-action-hover"),
          focus: channel("--soma-focus"),
          physiology: channel("--soma-physiology"),
          reward: channel("--soma-reward"),
          danger: channel("--soma-danger"),
          warning: channel("--soma-warning"),
          shell: channel("--soma-shell-canvas"),
          "shell-rail": channel("--soma-shell-rail"),
          "shell-accent": channel("--soma-shell-accent"),
        },
      },
      keyframes: {
        "trophy-toast-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(100%)",
          },
          "60%": {
            opacity: "1",
            transform: "translateX(-4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "trophy-toast-in":
          "trophy-toast-in 360ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
