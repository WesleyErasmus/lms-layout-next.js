import { useState, useEffect, type ReactNode } from "react";
import styles from "./Dialog.module.css";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  hasUnsavedChanges?: boolean;
}

export default function Dialog({
  isOpen,
  onClose,
  children,
  title,
  hasUnsavedChanges = false,
}: DialogProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    setShouldShow(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirm) return;
    }
    onClose();
  };

  if (!shouldShow) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
