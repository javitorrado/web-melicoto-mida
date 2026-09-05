import React from "react";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-primary)",
    color: "white",
  },
  secondary: {
    backgroundColor: "var(--color-bg-secondary)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
  },
  success: {
    backgroundColor: "var(--color-success)",
    color: "white",
  },
  danger: {
    backgroundColor: "var(--color-error)",
    color: "white",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--color-primary)",
    border: "2px solid var(--color-primary)",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
  },
  md: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
  },
  lg: {
    padding: "1rem 2rem",
    fontSize: "1.125rem",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      disabled={disabled}
      style={baseStyle}
      {...props}
    />
  );
}
