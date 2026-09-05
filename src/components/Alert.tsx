import React from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
}

const alertStyles: Record<AlertType, { bg: string; text: string; border: string; icon: string }> = {
  success: {
    bg: "#d4edda",
    text: "#155724",
    border: "#c3e6cb",
    icon: "✓",
  },
  error: {
    bg: "#f8d7da",
    text: "#721c24",
    border: "#f5c6cb",
    icon: "✕",
  },
  warning: {
    bg: "#fff3cd",
    text: "#856404",
    border: "#ffeaa7",
    icon: "⚠",
  },
  info: {
    bg: "#d1ecf1",
    text: "#0c5460",
    border: "#bee5eb",
    icon: "ⓘ",
  },
};

export function Alert({ type, title, message, onClose }: AlertProps) {
  const style = alertStyles[type];

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: "0.5rem",
        border: `1px solid ${style.border}`,
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", marginBottom: title ? "0.5rem" : 0 }}>
          <span>{style.icon}</span>
          {title && <span>{title}</span>}
        </div>
        {message && <div style={{ marginLeft: "1.5rem" }}>{message}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
