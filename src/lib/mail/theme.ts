/** Genius Mart email design tokens — aligned with app globals.css */
export const emailTheme = {
  colors: {
    brandBlue: "#0076DF",
    brandGreen: "#00C367",
    brandBlueDark: "#005BB5",
    brandGreenDark: "#009B52",
    slate900: "#0f172a",
    slate700: "#334155",
    slate600: "#475569",
    slate500: "#64748b",
    slate400: "#94a3b8",
    slate200: "#e2e8f0",
    slate100: "#f1f5f9",
    slate50: "#f8fafc",
    white: "#ffffff",
    pageBg: "#eef4fb",
    cardBorder: "#dbe4f0",
    blueTint: "#f0f7ff",
    greenTint: "#ecfdf5",
  },
  fonts: {
    sans: "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, Helvetica, sans-serif",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    pill: "999px",
  },
  gradient: {
    header: "linear-gradient(135deg, #0076DF 0%, #005BB5 48%, #00C367 100%)",
    button: "linear-gradient(135deg, #0076DF 0%, #00C367 100%)",
    highlight: "linear-gradient(135deg, #0076DF12 0%, #00C36710 100%)",
  },
} as const;

export const { colors: emailColors, fonts: emailFonts } = emailTheme;
