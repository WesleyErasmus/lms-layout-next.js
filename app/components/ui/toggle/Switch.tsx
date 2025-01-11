import React from "react";
import styles from "./Switch.module.css";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  name?: string;
}

const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  label,
  name,
}: SwitchProps) => {
  const id = React.useId();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled) {
        onCheckedChange(!checked);
      }
    }
  };

  return (
    <div className={styles.switchContainer}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        name={name}
        onClick={() => !disabled && onCheckedChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`
          ${styles.switch}
          ${styles[size]}
          ${disabled ? styles.disabled : ""}
          ${checked ? styles.checked : ""}
        `}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={styles.track} />
        <span
          className={`${styles.thumb} ${checked ? styles.thumbChecked : ""}`}
        />
        <span className={styles.focusRing} />
      </button>
    </div>
  );
};

export default Switch;
