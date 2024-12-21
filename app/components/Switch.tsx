import React from "react";
import styles from "./Switch.module.css";

interface SliderProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Slider = ({
  checked,
  onCheckedChange,
  disabled = false,
}: SliderProps) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        ${styles.slider}
        ${disabled ? styles.disabled : ""}
        ${checked ? styles.checked : ""}
      `}
      disabled={disabled}
    >
      <span
        className={`${styles.thumb} ${checked ? styles.thumbChecked : ""}`}
      />
    </button>
  );
};

export default Slider;
