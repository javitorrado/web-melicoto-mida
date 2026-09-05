// Design tokens — Estètica Melicotó
// Font única de colors per a tota l'aplicació

export const colors = {
  // Primaris — Identitat Melicotó
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // Azul principal (Melicotó)
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c3d66",
  },

  // Accents calents — Colors secundaris
  warning: {
    coral: "#ff6b6b", // Coral per destacats
    orange: "#ff9f43", // Taronja càlid
    amber: "#ffc107", // Ambar per avisos
  },

  // Turquesa (accent mallorquí)
  turquoise: {
    light: "#20c997",
    main: "#17a2b8",
    dark: "#138496",
  },

  // Neutrals — Whites, grays, blacks
  neutral: {
    white: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    black: "#000000",
  },

  // Verds — CTAs i success
  success: {
    light: "#c6f6d5",
    main: "#48bb78",
    dark: "#22543d",
  },

  // Status colors
  status: {
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    disabled: "#d1d5db",
  },
};

// CSS Variable helpers
export const getCSSVariables = () => `
  :root {
    /* Primaris */
    --color-primary: ${colors.primary[500]};
    --color-primary-light: ${colors.primary[100]};
    --color-primary-dark: ${colors.primary[700]};

    /* Accents */
    --color-accent-coral: ${colors.warning.coral};
    --color-accent-turquoise: ${colors.turquoise.main};

    /* Text */
    --color-text-primary: ${colors.neutral[900]};
    --color-text-secondary: ${colors.neutral[600]};
    --color-text-light: ${colors.neutral[500]};

    /* Backgrounds */
    --color-bg-primary: ${colors.neutral.white};
    --color-bg-secondary: ${colors.neutral[50]};
    --color-bg-tertiary: ${colors.neutral[100]};

    /* Borders */
    --color-border: ${colors.neutral[200]};
    --color-border-light: ${colors.neutral[100]};

    /* Status */
    --color-success: ${colors.success.main};
    --color-error: ${colors.status.error};
    --color-warning: ${colors.warning.amber};
    --color-info: ${colors.status.info};

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;
